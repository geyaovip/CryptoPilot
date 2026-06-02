import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { FeedType, Prisma } from "@prisma/client";
import { InsightService } from "../insights/insight.service";
import { PrismaService } from "../prisma/prisma.service";
import { FeedQueryDto } from "./dto/feed-query.dto";
import {
  buildClusterCards,
  clusterFeedInclude,
  paginateClusterSummaries,
  sortClusterCards,
  toClusteredSummaries,
  type ClusterFeedRow
} from "./feed-cluster.util";
import { toFeedDetail, toFeedSummary } from "./feed.mapper";
import { FearGreedService } from "./fear-greed.service";
import {
  buildRiskSignals,
  calculateMajorMove,
  calculateMarketBreadth,
  calculateNarrativeRotation,
  calculateUnusualMoves,
  toMarketHeatLabel
} from "./market-intelligence.util";
import { UserInterestService } from "./user-interest.service";

@Injectable()
export class FeedService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(UserInterestService) private readonly userInterest: UserInterestService,
    @Inject(InsightService) private readonly insightService: InsightService,
    @Inject(FearGreedService) private readonly fearGreed: FearGreedService
  ) {}

  async list(query: FeedQueryDto, userId?: string) {
    if (query.entity !== "feed_item") {
      return this.insightService.list(query, userId);
    }

    const limit = query.limit ? Number(query.limit) : 20;
    const where = this.buildWhere(query);
    const interestContext = await this.userInterest.loadContext(userId);
    const usePersonalizedRank = query.tab === "for_you" || Boolean(query.narrative);
    const fetchLimit = Math.min(limit * 8, 160);

    const rows = (await this.prisma.feedItem.findMany({
      where,
      include: clusterFeedInclude,
      orderBy: usePersonalizedRank ? undefined : this.orderBy(query.tab),
      take: fetchLimit
    })) as ClusterFeedRow[];

    const cards = buildClusterCards(rows);
    const sorted = sortClusterCards(
      cards,
      query.narrative,
      interestContext ? (feed) => this.userInterest.scoreFeed(feed, interestContext) : undefined
    );
    const summaries = toClusteredSummaries(sorted);
    const page = paginateClusterSummaries(summaries, limit, query.cursor);

    return {
      entity: "feed_item" as const,
      aggregation: "cluster" as const,
      items: page.items,
      next_cursor: page.next_cursor
    };
  }

  async getById(id: string) {
    const feed = (await this.prisma.feedItem.findFirst({
      where: { id, deletedAt: null, status: { not: "DELETED" } },
      include: clusterFeedInclude
    })) as ClusterFeedRow | null;

    if (!feed) throw new NotFoundException("Feed 不存在");

    const similar = feed.clusterId
      ? ((await this.prisma.feedItem.findMany({
          where: {
            clusterId: feed.clusterId,
            id: { not: id },
            deletedAt: null,
            status: "PUBLISHED"
          },
          include: clusterFeedInclude,
          orderBy: [{ rankScore: "desc" }, { publishTime: "desc" }],
          take: 4
        })) as ClusterFeedRow[])
      : await this.findSimilarFeeds(id);

    const members = feed.clusterId
      ? ([feed, ...similar] as ClusterFeedRow[])
      : [feed, ...similar];
    const detail = toFeedDetail(feed, similar);
    if (feed.clusterId && members.length >= 2) {
      detail.cluster_id = feed.clusterId;
      detail.related_source_count = members.length;
      detail.related_sources = members.map((row) => ({
        feed_item_id: row.id,
        title: row.title,
        source_name: row.source.name,
        source_url: row.sourceUrl,
        published_at: row.publishTime.toISOString()
      }));
      detail.similar_feed = similar.map((row) => toFeedSummary(row, 1));
    }
    return detail;
  }

  async trending() {
    const [tokens, narratives, insightStats, leadingInsight, riskInsightStats, fearGreedIndex] = await Promise.all([
      this.prisma.token.findMany({
        where: { deletedAt: null },
        orderBy: [{ priceChange24h: "desc" }, { symbol: "asc" }],
        take: 10
      }),
      this.prisma.narrative.findMany({
        where: { deletedAt: null, isActive: true, mergedIntoId: null },
        orderBy: [{ heatScore: "desc" }, { updatedAt: "desc" }],
        take: 8
      }),
      this.prisma.marketInsight.aggregate({
        where: { deletedAt: null, status: "PUBLISHED" },
        _avg: { heatScore: true, heatVelocity: true },
        _count: { id: true }
      }),
      this.prisma.marketInsight.findFirst({
        where: { deletedAt: null, status: "PUBLISHED", primaryNarrativeId: { not: null } },
        include: { primaryNarrative: true },
        orderBy: [{ heatVelocity: "desc" }, { heatScore: "desc" }, { updatedAt: "desc" }]
      }),
      this.prisma.marketInsight.findMany({
        where: { deletedAt: null, status: "PUBLISHED" },
        select: { sentiment: true, heatVelocity: true, sourcesJson: true },
        orderBy: [{ updatedAt: "desc" }],
        take: 30
      }),
      this.fearGreed.getIndex()
    ]);
    const majorMove = calculateMajorMove(tokens);
    const marketBreadth = calculateMarketBreadth(tokens);
    const rotation = calculateNarrativeRotation(narratives);

    return {
      tokens: tokens.map((token) => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        price_usd: token.priceUsd === null ? null : Number(token.priceUsd),
        price_change_24h: token.priceChange24h === null ? null : Number(token.priceChange24h)
      })),
      narratives: narratives.map((narrative) => ({
        id: narrative.id,
        name: narrative.name,
        slug: narrative.slug
      })),
      market_heat: {
        score: Math.round(insightStats._avg.heatScore ?? 0),
        velocity: Math.round(insightStats._avg.heatVelocity ?? 0),
        label: toMarketHeatLabel(insightStats._avg.heatVelocity ?? 0),
        active_narrative_count: insightStats._count.id,
        leading_narrative: leadingInsight?.primaryNarrative
          ? {
              id: leadingInsight.primaryNarrative.id,
              name: leadingInsight.primaryNarrative.name,
              slug: leadingInsight.primaryNarrative.slug
            }
          : null,
        major_move: majorMove,
        breadth: marketBreadth,
        narrative_rotation: rotation,
        unusual_moves: calculateUnusualMoves(tokens),
        risk_signals: buildRiskSignals(tokens, insightStats._avg.heatVelocity ?? 0, riskInsightStats),
        updated_at: new Date().toISOString()
      },
      fear_greed_index: fearGreedIndex
    };
  }

  private buildWhere(query: FeedQueryDto): Prisma.FeedItemWhereInput {
    const where: Prisma.FeedItemWhereInput = { deletedAt: null, status: "PUBLISHED" };
    if (query.tab === "breaking") where.OR = [{ type: "BREAKING" }, { heatScore: { gte: 90 } }];
    if (query.narrative) {
      where.feedItemNarratives = {
        some: { narrative: { slug: query.narrative, deletedAt: null, isActive: true } }
      };
    }
    if (query.type) where.type = query.type.toUpperCase() as FeedType;
    return where;
  }

  private orderBy(tab?: string): Prisma.FeedItemOrderByWithRelationInput[] {
    if (tab === "latest") return [{ publishTime: "desc" }];
    return [{ isPinned: "desc" }, { rankScore: "desc" }, { publishTime: "desc" }];
  }

  private async findSimilarFeeds(excludeId: string) {
    return (await this.prisma.feedItem.findMany({
      where: { id: { not: excludeId }, deletedAt: null, status: "PUBLISHED" },
      include: clusterFeedInclude,
      orderBy: [{ heatScore: "desc" }, { publishTime: "desc" }],
      take: 3
    })) as ClusterFeedRow[];
  }
}
