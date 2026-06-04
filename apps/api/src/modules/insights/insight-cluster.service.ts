import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { BackgroundJobsService } from "../common/background-jobs.service";
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
    @Inject(InsightSynthesisService) private readonly synthesis: InsightSynthesisService,
    @Inject(BackgroundJobsService) private readonly jobs: BackgroundJobsService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  @Cron("*/20 * * * *")
  async clusterScheduled(): Promise<void> {
    if (!this.jobs.enabled) return;
    const limit = Number(this.config.get<string>("LLM_INSIGHT_BATCH_SIZE") ?? "3");
    await this.clusterPending(limit).catch((error) => {
      this.logger.warn(error instanceof Error ? error.message : "cluster failed");
    });
  }

  async clusterPending(limit = 10): Promise<number> {
    const minRank = Number(this.config.get<string>("LLM_INSIGHT_MIN_RANK_SCORE") ?? "60");
    const feeds = await this.prisma.feedItem.findMany({
      where: {
        insightId: null,
        deletedAt: null,
        status: "PUBLISHED",
        rankScore: { gte: minRank },
        aiGenerationError: null
      },
      include: signalInclude,
      orderBy: { publishTime: "desc" },
      take: 120
    });

    const groups = new Map<string, typeof feeds>();
    for (const feed of feeds) {
      const primary = pickPrimaryNarrative(feed);
      const key = `${primary?.slug ?? fallbackGroupKey(feed.title)}:${timeWindowKey(feed.publishTime)}`;
      const bucket = groups.get(key) ?? [];
      bucket.push(feed);
      groups.set(key, bucket);
    }

    let created = 0;
    for (const group of groups.values()) {
      if (created >= limit) break;
      const qualified = qualifySignals(group, {
        minSignals: Number(this.config.get<string>("LLM_INSIGHT_MIN_SIGNALS") ?? "3"),
        minSources: Number(this.config.get<string>("LLM_INSIGHT_MIN_UNIQUE_SOURCES") ?? "2")
      });
      if (!qualified) continue;

      const batch = qualified.slice(0, 5);
      const primary = pickPrimaryNarrative(batch[0]);
      const existingInsightId = await this.findRecentInsightId(primary?.id ?? null, batch[0].publishTime);
      if (existingInsightId) {
        await this.attachToInsight(existingInsightId, batch);
        continue;
      }
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

  private async findRecentInsightId(primaryNarrativeId: string | null, publishTime: Date): Promise<string | null> {
    if (!primaryNarrativeId) return null;
    const since = new Date(publishTime.getTime() - 6 * 60 * 60 * 1000);
    const insight = await this.prisma.marketInsight.findFirst({
      where: {
        primaryNarrativeId,
        deletedAt: null,
        status: "PUBLISHED",
        publishedAt: { gte: since }
      },
      orderBy: { publishedAt: "desc" },
      select: { id: true }
    });
    return insight?.id ?? null;
  }

  private async attachToInsight(insightId: string, batch: Array<{ id: string }>) {
    await this.prisma.feedItem.updateMany({
      where: { id: { in: batch.map((item) => item.id) } },
      data: { insightId }
    });
  }
}

function qualifySignals<T extends { sourceId: string; publishTime: Date }>(
  group: T[],
  options: { minSignals: number; minSources: number }
): T[] | null {
  const sorted = [...group].sort((a, b) => b.publishTime.getTime() - a.publishTime.getTime());
  const uniqueSourceIds = new Set(sorted.map((item) => item.sourceId));
  if (sorted.length < options.minSignals || uniqueSourceIds.size < options.minSources) return null;
  return sorted;
}

function timeWindowKey(publishTime: Date): number {
  return Math.floor(publishTime.getTime() / (6 * 60 * 60 * 1000));
}

function fallbackGroupKey(title: string): string {
  const normalized = title.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/bitcoin|btc|比特币/, "btc"],
    [/ethereum|eth|以太坊/, "eth"],
    [/solana|sol\b/, "solana"],
    [/\bxrp\b|ripple/, "xrp"],
    [/\bbnb\b|币安|binance/, "bnb"],
    [/etf|现货|资金流/, "etf"],
    [/ai|人工智能|agent|模型/, "ai"],
    [/sec|监管|合规|法院|牌照|批准/, "regulation"],
    [/黑客|攻击|漏洞|安全|私钥/, "security"],
    [/defi|借贷|dex|流动性/, "defi"],
    [/stablecoin|稳定币|usdt|usdc/, "stablecoin"],
    [/交易所|上线|下架|合约|永续/, "exchange"]
  ];
  const match = rules.find(([pattern]) => pattern.test(normalized));
  return match?.[1] ?? "market";
}
