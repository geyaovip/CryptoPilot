import { Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { FeedAiService } from "../ai/feed-ai.service";
import { BackgroundJobsService } from "../common/background-jobs.service";
import { PrismaService } from "../prisma/prisma.service";
import { ingestSourceItems } from "./ingest-source.util";

const MAX_CONSECUTIVE_SOURCE_FAILURES = 5;

@Injectable()
export class IngestionService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FeedAiService) private readonly feedAiService: FeedAiService,
    @Inject(BackgroundJobsService) private readonly jobs: BackgroundJobsService
  ) {}

  @Cron("*/5 * * * *")
  async ingestActiveRssSources(): Promise<void> {
    if (!this.jobs.enabled) return;
    const sources = await this.prisma.source.findMany({
      where: { type: "RSS", status: "ACTIVE", deletedAt: null }
    });

    for (const source of sources) {
      await this.ingestRssSource(source.id);
    }
  }

  @Cron("* * * * *")
  async syncCoinGeckoPrices(): Promise<void> {
    if (!this.jobs.enabled) return;
    const tokens = await this.prisma.token.findMany({
      where: { coingeckoId: { not: null }, deletedAt: null }
    });
    if (tokens.length === 0) return;

    const ids = tokens.map((token) => token.coingeckoId).filter(Boolean).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    const response = await fetch(url);
    if (!response.ok) return;

    const data = (await response.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
    for (const token of tokens) {
      const market = token.coingeckoId ? data[token.coingeckoId] : undefined;
      if (!market) continue;
      await this.prisma.token.update({
        where: { id: token.id },
        data: { priceUsd: market.usd, priceChange24h: market.usd_24h_change }
      });
    }
  }

  async ingestRssSource(sourceId: string): Promise<{ items_found: number; items_created: number }> {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    if (!source?.url) return { items_found: 0, items_created: 0 };

    const startedAt = new Date();
    try {
      const result = await ingestSourceItems(this.prisma, source, 25, (feedItemId) => {
        this.feedAiService.queueGeneration(feedItemId);
      });

      await this.prisma.source.update({
        where: { id: source.id },
        data: {
          lastSuccessAt: new Date(),
          consecutiveFailures: 0,
          errorMessage: null,
          status: "ACTIVE"
        }
      });
      await this.prisma.ingestionLog.create({
        data: {
          sourceId: source.id,
          startedAt,
          finishedAt: new Date(),
          status: "SUCCESS",
          itemsFound: result.items_found,
          itemsCreated: result.items_created
        }
      });

      return result;
    } catch (error) {
      const nextFailures = source.consecutiveFailures + 1;
      const errorMessage = error instanceof Error ? error.message : "采集失败";
      await this.prisma.source.update({
        where: { id: source.id },
        data: {
          lastErrorAt: new Date(),
          consecutiveFailures: nextFailures,
          status: nextFailures >= MAX_CONSECUTIVE_SOURCE_FAILURES ? "ERROR" : source.status,
          errorMessage:
            nextFailures >= MAX_CONSECUTIVE_SOURCE_FAILURES
              ? `${errorMessage}（连续失败 ${nextFailures} 次，已自动标记为 error）`
              : errorMessage
        }
      });
      await this.prisma.ingestionLog.create({
        data: {
          sourceId: source.id,
          startedAt,
          finishedAt: new Date(),
          status: "FAILED",
          errorMessage
        }
      });
      throw error;
    }
  }
}
