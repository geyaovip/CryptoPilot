import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NarrativeMetricsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async refreshAll(): Promise<void> {
    const narratives = await this.prisma.narrative.findMany({
      where: { deletedAt: null, mergedIntoId: null },
      select: { id: true }
    });
    for (const narrative of narratives) {
      await this.refreshOne(narrative.id);
    }
  }

  async refreshOne(narrativeId: string): Promise<void> {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const feeds24h = await this.prisma.feedItem.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        publishTime: { gte: since24h },
        feedItemNarratives: { some: { narrativeId } }
      },
      include: {
        feedItemTokens: { include: { token: true } }
      }
    });

    const feedCount24h = feeds24h.length;
    const avgHeat =
      feeds24h.length > 0
        ? Math.round(feeds24h.reduce((sum, feed) => sum + feed.heatScore, 0) / feeds24h.length)
        : 0;
    const heatScore = Math.min(100, Math.round(avgHeat * 0.7 + feedCount24h * 3));

    const prevSnapshot = await this.prisma.narrativeHeatSnapshot.findFirst({
      where: { narrativeId, capturedAt: { lt: since24h } },
      orderBy: { capturedAt: "desc" }
    });
    const trendScore24h = Math.max(0, heatScore - (prevSnapshot?.heatScore ?? heatScore));

    const weekFeeds = await this.prisma.feedItem.count({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        publishTime: { gte: since7d },
        feedItemNarratives: { some: { narrativeId } }
      }
    });
    const trendScore7d = Math.min(100, weekFeeds * 2);

    await this.prisma.narrative.update({
      where: { id: narrativeId },
      data: { heatScore, trendScore24h, trendScore7d, feedCount24h }
    });

    await this.prisma.narrativeHeatSnapshot.create({
      data: {
        narrativeId,
        heatScore,
        feedCount: feedCount24h,
        twitterMentions: Math.round(feedCount24h * 1.2),
        capturedAt: new Date()
      }
    });
  }
}
