import { Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import Parser from "rss-parser";
import { FeedAiService } from "../ai/feed-ai.service";
import { PrismaService } from "../prisma/prisma.service";
import { calculateHeatScore } from "./heat-score";
import { cleanRssItems } from "./rss-cleaner";

@Injectable()
export class IngestionService {
  private readonly parser = new Parser();

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FeedAiService) private readonly feedAiService: FeedAiService
  ) {}

  @Cron("*/5 * * * *")
  async ingestActiveRssSources(): Promise<void> {
    const sources = await this.prisma.source.findMany({
      where: { type: "RSS", status: "ACTIVE", deletedAt: null }
    });

    for (const source of sources) {
      await this.ingestRssSource(source.id);
    }
  }

  @Cron("* * * * *")
  async syncCoinGeckoPrices(): Promise<void> {
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
      const feed = await this.parser.parseURL(source.url);
      const items = cleanRssItems(feed.items, startedAt);
      let created = 0;

      for (const item of items) {
        const result = await this.createFeedFromRssItem(source.id, source.sourceWeight, item);
        if (result) created += 1;
      }

      await this.prisma.source.update({
        where: { id: source.id },
        data: { lastSuccessAt: new Date(), errorMessage: null, status: "ACTIVE" }
      });
      await this.prisma.ingestionLog.create({
        data: { sourceId: source.id, startedAt, finishedAt: new Date(), status: "SUCCESS", itemsFound: items.length, itemsCreated: created }
      });

      return { items_found: items.length, items_created: created };
    } catch (error) {
      await this.prisma.source.update({
        where: { id: source.id },
        data: { lastErrorAt: new Date(), errorMessage: error instanceof Error ? error.message : "RSS 采集失败" }
      });
      await this.prisma.ingestionLog.create({
        data: { sourceId: source.id, startedAt, finishedAt: new Date(), status: "FAILED", errorMessage: error instanceof Error ? error.message : "RSS 采集失败" }
      });
      throw error;
    }
  }

  private async createFeedFromRssItem(sourceId: string, sourceWeight: number, item: { title: string; sourceUrl: string; content: string; publishTime: Date }) {
    const existing = await this.prisma.feedItem.findUnique({ where: { sourceUrl: item.sourceUrl } });
    if (existing) return null;

    const heatScore = calculateHeatScore({ publishTime: item.publishTime, sourceWeight, tokenMoves: [] });
    const feed = await this.prisma.feedItem.create({
      data: {
        sourceId,
        title: item.title,
        content: item.content,
        aiSummary: item.content.slice(0, 160),
        sourceUrl: item.sourceUrl,
        publishTime: item.publishTime,
        heatScore,
        rankScore: heatScore
      }
    });
    this.feedAiService.queueGeneration(feed.id);
    return feed;
  }
}
