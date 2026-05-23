import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { FeedQueryDto } from "./dto/feed-query.dto";
import { toFeedDetail, toFeedSummary } from "./feed.mapper";
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
    @Inject(UserInterestService) private readonly userInterest: UserInterestService
  ) {}

  async list(query: FeedQueryDto, userId?: string) {
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

    const interestContext = await this.userInterest.loadContext(userId);
    const fetchLimit = query.tab === "for_you" && interestContext ? Math.min(limit * 4, 80) : limit + 1;

    const items = await this.prisma.feedItem.findMany({
      where,
      include: feedInclude,
      orderBy: query.tab === "for_you" && interestContext ? undefined : this.orderBy(query.tab),
      take: fetchLimit,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {})
    });

    const ranked =
      query.tab === "for_you" && interestContext
        ? [...items].sort((a, b) => {
            const scoreA = a.rankScore + this.userInterest.scoreFeed(a, interestContext);
            const scoreB = b.rankScore + this.userInterest.scoreFeed(b, interestContext);
            if (scoreB !== scoreA) return scoreB - scoreA;
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return b.publishTime.getTime() - a.publishTime.getTime();
          })
        : items;

    const page = ranked.slice(0, limit);
    const next = ranked.length > limit ? ranked[limit] : null;
    const relatedCounts = await this.relatedSourceCounts(page.map((item) => item.id));

    return {
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
