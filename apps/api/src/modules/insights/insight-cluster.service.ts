import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { pickPrimaryNarrative } from "../feed/feed-narrative.util";
import { buildSourcesFromSignals } from "./insight.mapper";
import { InsightSynthesisService } from "./insight-synthesis.service";

const signalInclude = {
  source: true,
  feedItemTokens: { include: { token: true } },
  feedItemNarratives: { include: { narrative: true } }
} as const;

@Injectable()
export class InsightClusterService {
  private readonly logger = new Logger(InsightClusterService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(InsightSynthesisService) private readonly synthesis: InsightSynthesisService
  ) {}

  @Cron("*/20 * * * *")
  async clusterScheduled(): Promise<void> {
    await this.clusterPending(8).catch((error) => {
      this.logger.warn(error instanceof Error ? error.message : "cluster failed");
    });
  }

  async clusterPending(limit = 10): Promise<number> {
    const feeds = await this.prisma.feedItem.findMany({
      where: { insightId: null, deletedAt: null, status: "PUBLISHED" },
      include: signalInclude,
      orderBy: { publishTime: "desc" },
      take: 120
    });

    const groups = new Map<string, typeof feeds>();
    for (const feed of feeds) {
      const primary = pickPrimaryNarrative(feed);
      const key = primary?.slug ?? "general";
      const bucket = groups.get(key) ?? [];
      bucket.push(feed);
      groups.set(key, bucket);
    }

    let created = 0;
    for (const group of groups.values()) {
      if (created >= limit) break;
      if (group.length < 2) continue;

      const batch = group.slice(0, 5);
      const primary = pickPrimaryNarrative(batch[0]);
      const heatScore = Math.max(...batch.map((item) => item.heatScore));
      const narrativeRow = primary
        ? batch[0].feedItemNarratives.find((row) => row.narrative.id === primary.id)?.narrative
        : undefined;
      const velocity = narrativeRow ? Math.max(-20, Math.min(30, narrativeRow.heatScore - 50)) : 3;

      const insight = await this.prisma.marketInsight.create({
        data: {
          aiInsight: "市场信号聚合中…",
          aiSummary: "正在合成多来源 Insight…",
          type: batch[0].type,
          heatScore,
          heatVelocity: velocity,
          heatLabel: velocity >= 6 ? "HEATING_UP" : velocity <= -2 ? "COOLING" : "STABLE",
          primaryNarrativeId: primary?.id ?? null,
          rankScore: heatScore + velocity,
          sourcesJson: buildSourcesFromSignals(batch),
          status: "HIDDEN",
          publishedAt: batch[0].publishTime
        }
      });

      await this.prisma.feedItem.updateMany({
        where: { id: { in: batch.map((item) => item.id) } },
        data: { insightId: insight.id }
      });

      const ok = await this.synthesis.synthesize(insight.id);
      if (ok) created += 1;
      else {
        await this.prisma.feedItem.updateMany({
          where: { insightId: insight.id },
          data: { insightId: null }
        });
        await this.prisma.marketInsight.delete({ where: { id: insight.id } });
      }
    }

    return created;
  }
}
