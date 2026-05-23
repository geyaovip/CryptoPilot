import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type FeedInterestContext = {
  tokenIds: Set<string>;
  narrativeIds: Set<string>;
  kolHandles: Set<string>;
};

@Injectable()
export class UserInterestService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async loadContext(userId: string | undefined): Promise<FeedInterestContext | null> {
    if (!userId) return null;

    const items = await this.prisma.watchlistItem.findMany({
      where: { userId },
      select: { targetType: true, targetId: true }
    });
    if (items.length === 0) {
      return { tokenIds: new Set(), narrativeIds: new Set(), kolHandles: new Set() };
    }

    const tokenIds = new Set(
      items.filter((item) => item.targetType === "TOKEN").map((item) => item.targetId)
    );
    const narrativeIds = new Set(
      items.filter((item) => item.targetType === "NARRATIVE").map((item) => item.targetId)
    );
    const kolIds = items.filter((item) => item.targetType === "KOL").map((item) => item.targetId);
    const kols =
      kolIds.length > 0
        ? await this.prisma.kol.findMany({
            where: { id: { in: kolIds }, deletedAt: null, isActive: true },
            select: { handle: true, name: true }
          })
        : [];
    const kolHandles = new Set(kols.flatMap((kol) => [kol.handle.toLowerCase(), kol.name.toLowerCase()]));

    return { tokenIds, narrativeIds, kolHandles };
  }

  scoreFeed(
    feed: Prisma.FeedItemGetPayload<{
      include: {
        source: true;
        feedItemTokens: { include: { token: true } };
        feedItemNarratives: { include: { narrative: true } };
      };
    }>,
    context: FeedInterestContext | null
  ): number {
    if (!context) return 0;

    const tokenMatch = feed.feedItemTokens.some((row) => context.tokenIds.has(row.tokenId)) ? 100 : 0;
    const narrativeMatch = feed.feedItemNarratives.some((row) => context.narrativeIds.has(row.narrativeId))
      ? 100
      : 0;
    const sourceName = feed.source.name.toLowerCase();
    const kolMatch = [...context.kolHandles].some(
      (handle) => handle.length >= 2 && sourceName.includes(handle)
    )
      ? 100
      : 0;

    return Math.round(tokenMatch * 0.45 + narrativeMatch * 0.45 + kolMatch * 0.1);
  }
}
