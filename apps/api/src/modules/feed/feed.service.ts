import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { FeedType, Prisma } from "@prisma/client";
import { InsightService } from "../insights/insight.service";
import { PrismaService } from "../prisma/prisma.service";
import { FeedQueryDto } from "./dto/feed-query.dto";
import { toFeedDetail, toFeedSummary } from "./feed.mapper";
import { compareFeedsForTab, effectiveFeedSortScore } from "./feed-ranking.util";
import { UserInterestService } from "./user-interest.service";

const feedInclude = {
  source: true,
  feedItemTokens: { include: { token: true } },
  feedItemNarratives: { include: { narrative: true } }
} satisfies Prisma.FeedItemInclude;

@Injectable()
export class FeedService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(UserInterestService) private readonly userInterest: UserInterestService,
    @Inject(InsightService) private readonly insightService: InsightService
  ) {}

  async list(query: FeedQueryDto, userId?: string) {
    if (query.entity !== "feed_item") {
      return this.insightService.list(query, userId);
    }

    const limit = query.limit ? Number(query.limit) : 20;
    const where: Prisma.FeedItemWhereInput = {
      deletedAt: null,
      status: "PUBLISHED"
    };

    if (query.tab === "breaking") {
      where.OR = [{ type: "BREAKING" }, { heatScore: { gte: 90 } }];
    }

    if (query.narrative) {
      where.feedItemNarratives = {
        some: { narrative: { slug: query.narrative, deletedAt: null, isActive: true } }
      };
    }

    if (query.type) {
      where.type = query.type.toUpperCase() as FeedType;
    }

    const interestContext = await this.userInterest.loadContext(userId);
    const usePersonalizedRank = query.tab === "for_you" || Boolean(query.narrative);
    const fetchLimit = usePersonalizedRank && (interestContext || query.narrative) ? Math.min(limit * 4, 80) : limit + 1;

    const items = await this.prisma.feedItem.findMany({
      where,
      include: feedInclude,
      orderBy: usePersonalizedRank && (interestContext || query.narrative) ? undefined : this.orderBy(query.tab),
      take: fetchLimit,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {})
    });

    const ranked =
      usePersonalizedRank && (interestContext || query.narrative)
        ? [...items].sort((a, b) => {
            const interestA = interestContext ? this.userInterest.scoreFeed(a, interestContext) : 0;
            const interestB = interestContext ? this.userInterest.scoreFeed(b, interestContext) : 0;
            const scoreA = effectiveFeedSortScore(a, interestA, query.narrative);
            const scoreB = effectiveFeedSortScore(b, interestB, query.narrative);
            return compareFeedsForTab(a, b, scoreA, scoreB);
          })
        : items;

    const page = ranked.slice(0, limit);
    const next = ranked.length > limit ? ranked[limit] : null;
    const relatedCounts = await this.relatedSourceCounts(page.map((item) => item.id));

    return {
      entity: "feed_item" as const,
      items: page.map((item, index) => toFeedSummary(item, relatedCounts[index] ?? 1)),
      next_cursor: next?.id ?? null
    };
  }

  async getById(id: string) {
    const feed = await this.prisma.feedItem.findFirst({
      where: { id, deletedAt: null, status: { not: "DELETED" } },
      include: feedInclude
    });

    if (!feed) {
      throw new NotFoundException("Feed 不存在");
    }

    const similar = await this.findSimilarFeeds(id);
    return toFeedDetail(feed, similar);
  }

  async trending() {
    const [tokens, narratives] = await Promise.all([
      this.prisma.token.findMany({
        where: { deletedAt: null },
        orderBy: [{ priceChange24h: "desc" }, { symbol: "asc" }],
        take: 10
      }),
      this.prisma.narrative.findMany({
        where: { deletedAt: null, isActive: true, mergedIntoId: null },
        orderBy: [{ heatScore: "desc" }, { updatedAt: "desc" }],
        take: 8
      })
    ]);

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
      }))
    };
  }

  private orderBy(tab?: string): Prisma.FeedItemOrderByWithRelationInput[] {
    if (tab === "latest") return [{ publishTime: "desc" }];
    return [{ isPinned: "desc" }, { rankScore: "desc" }, { publishTime: "desc" }];
  }

  private findSimilarFeeds(excludeId: string) {
    return this.prisma.feedItem.findMany({
      where: { id: { not: excludeId }, deletedAt: null, status: "PUBLISHED" },
      include: feedInclude,
      orderBy: [{ heatScore: "desc" }, { publishTime: "desc" }],
      take: 3
    });
  }

  private async relatedSourceCounts(feedIds: string[]): Promise<number[]> {
    if (feedIds.length === 0) return [];
    const counts = await Promise.all(
      feedIds.map(async (feedId) => {
        const similar = await this.findSimilarFeeds(feedId);
        return 1 + similar.length;
      })
    );
    return counts;
  }
}
