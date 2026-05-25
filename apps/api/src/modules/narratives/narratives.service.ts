import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { NarrativeListItem } from "@cryptopilot/types";
import { PrismaService } from "../prisma/prisma.service";
import {
  buildClusterCards,
  clusterFeedInclude,
  sortClusterCards,
  toClusteredSummaries,
  type ClusterFeedRow
} from "../feed/feed-cluster.util";
import { NarrativeAiService } from "./narrative-ai.service";
import { NarrativeMetricsService } from "./narrative-metrics.service";
import { buildWatchlistMap, toNarrativeDetail, toNarrativeListItem } from "./narratives.mapper";
import { NarrativeListQueryDto } from "./dto/narrative-list-query.dto";

@Injectable()
export class NarrativesService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NarrativeMetricsService) private readonly metrics: NarrativeMetricsService,
    @Inject(NarrativeAiService) private readonly narrativeAi: NarrativeAiService
  ) {}

  async list(query: NarrativeListQueryDto, userId?: string) {
    await this.metrics.refreshAll().catch(() => undefined);

    const orderBy =
      query.sort === "rising"
        ? [{ trendScore24h: "desc" as const }, { heatScore: "desc" as const }]
        : query.sort === "discussed"
          ? [{ feedCount24h: "desc" as const }, { heatScore: "desc" as const }]
          : [{ heatScore: "desc" as const }, { trendScore24h: "desc" as const }];

    const narratives = await this.prisma.narrative.findMany({
      where: { deletedAt: null, isActive: true, mergedIntoId: null },
      orderBy,
      take: 50
    });

    const { followedIds, watchlistMap } = await this.narrativeWatchlistContext(userId);
    const items: NarrativeListItem[] = [];

    for (const narrative of narratives) {
      const topTokens = await this.topTokensForNarrative(narrative.id);
      items.push(toNarrativeListItem({ ...narrative, topTokens }, followedIds, watchlistMap));
    }

    return { items };
  }

  async getBySlug(slug: string, userId?: string) {
    const narrative = await this.prisma.narrative.findFirst({
      where: { slug, deletedAt: null, isActive: true, mergedIntoId: null }
    });
    if (!narrative) throw new NotFoundException("Narrative 不存在");

    await this.metrics.refreshOne(narrative.id).catch(() => undefined);
    let refreshed = await this.prisma.narrative.findUniqueOrThrow({ where: { id: narrative.id } });
    if (!refreshed.aiSummary?.trim()) {
      await this.narrativeAi.generateForNarrative(refreshed.id).catch(() => undefined);
      refreshed = await this.prisma.narrative.findUniqueOrThrow({ where: { id: narrative.id } });
    }
    const { followedIds, watchlistMap } = await this.narrativeWatchlistContext(userId);
    const topTokens = await this.topTokensForNarrative(refreshed.id);

    const now = Date.now();
    const [h24, d7, d30] = await Promise.all([
      this.snapshotsSince(refreshed.id, new Date(now - 24 * 60 * 60 * 1000)),
      this.snapshotsSince(refreshed.id, new Date(now - 7 * 24 * 60 * 60 * 1000)),
      this.snapshotsSince(refreshed.id, new Date(now - 30 * 24 * 60 * 60 * 1000))
    ]);

    const relatedRaw = (await this.prisma.feedItem.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        feedItemNarratives: { some: { narrativeId: refreshed.id } }
      },
      include: clusterFeedInclude,
      take: 80
    })) as ClusterFeedRow[];
    const cards = buildClusterCards(relatedRaw);
    const related = toClusteredSummaries(sortClusterCards(cards, refreshed.slug)).slice(0, 12);

    const sourceGroups = await this.prisma.feedItem.groupBy({
      by: ["sourceId"],
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        feedItemNarratives: { some: { narrativeId: refreshed.id } }
      },
      _count: { _all: true },
      orderBy: { _count: { sourceId: "desc" } },
      take: 5
    });
    const sources = await this.prisma.source.findMany({
      where: { id: { in: sourceGroups.map((row) => row.sourceId) } }
    });
    const sourceMap = new Map(sources.map((source) => [source.id, source.name]));
    const topSources = sourceGroups.map((row) => ({
      source_name: sourceMap.get(row.sourceId) ?? "Unknown",
      feed_count: row._count._all
    }));

    const detail = toNarrativeDetail({
      narrative: refreshed,
      topTokens,
      followedIds,
      watchlistMap,
      heatChart: { h24, d7, d30 },
      relatedFeed: related.map(toFeedSummary),
      topSources
    });
    return {
      ...detail,
      watchlist_id: watchlistMap.get(refreshed.id) ?? null
    };
  }

  private async narrativeWatchlistContext(userId?: string) {
    if (!userId) {
      return { followedIds: new Set<string>(), watchlistMap: new Map<string, string>() };
    }
    const rows = await this.prisma.watchlistItem.findMany({
      where: { userId, targetType: "NARRATIVE" },
      select: { targetId: true, id: true }
    });
    return {
      followedIds: new Set(rows.map((row) => row.targetId)),
      watchlistMap: buildWatchlistMap(rows)
    };
  }

  private async topTokensForNarrative(narrativeId: string) {
    const links = await this.prisma.feedItemToken.findMany({
      where: {
        feedItem: {
          deletedAt: null,
          status: "PUBLISHED",
          feedItemNarratives: { some: { narrativeId } }
        }
      },
      include: { token: true },
      take: 40
    });
    const seen = new Set<string>();
    const tokens = [];
    for (const link of links) {
      if (seen.has(link.tokenId)) continue;
      seen.add(link.tokenId);
      tokens.push(link.token);
      if (tokens.length >= 5) break;
    }
    return tokens;
  }

  private snapshotsSince(narrativeId: string, since: Date) {
    return this.prisma.narrativeHeatSnapshot.findMany({
      where: { narrativeId, capturedAt: { gte: since } },
      orderBy: { capturedAt: "asc" },
      take: 120
    });
  }
}
