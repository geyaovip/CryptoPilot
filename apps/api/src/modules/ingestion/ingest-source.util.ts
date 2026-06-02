import type { PrismaClient, Source } from "@prisma/client";
import Parser from "rss-parser";
import { isChineseContent } from "./chinese-content.util";
import { fetchBlockBeatsFlashItems, isBlockBeatsSourceUrl } from "./blockbeats-ingest.util";
import { calculateHeatScore } from "./heat-score";
import { evaluateFeedQuality } from "./feed-quality.util";
import { fetchRedditSignals, type RedditCredentials } from "./reddit-provider";
import { cleanRssItems, type CleanRssItem } from "./rss-cleaner";

const parser = new Parser();

export type IngestSourceResult = { items_found: number; items_created: number };

export async function fetchItemsForSource(
  source: Pick<Source, "url" | "contentLocale">,
  maxPerSource: number
): Promise<CleanRssItem[]> {
  if (!source.url) return [];

  if (isBlockBeatsSourceUrl(source.url)) {
    return (await fetchBlockBeatsFlashItems(maxPerSource)).slice(0, maxPerSource);
  }

  const feed = await parser.parseURL(source.url);
  return cleanRssItems(feed.items ?? [], new Date()).slice(0, maxPerSource);
}

export async function fetchRedditItemsForSource(
  source: Pick<Source, "url" | "sourceWeight">,
  credentials: RedditCredentials,
  maxPerSource: number
): Promise<CleanRssItem[]> {
  const signals = await fetchRedditSignals(source, credentials, maxPerSource);
  return signals.map((signal) => ({
    title: signal.title,
    sourceUrl: signal.sourceUrl,
    content: `${signal.content}\n\nReddit author: u/${signal.author}; score: ${signal.score}; comments: ${signal.comments}`,
    publishTime: signal.publishTime
  }));
}

export function initialAiFields(
  item: CleanRssItem,
  source: Pick<Source, "contentLocale">
): { aiSummary: string; narrativeHook: string | null } {
  const summary = item.content.replace(/\s+/g, " ").trim().slice(0, 220) || item.title;
  const hook =
    source.contentLocale === "ZH" && isChineseContent(item.title)
      ? item.title.slice(0, 120)
      : null;
  return { aiSummary: summary, narrativeHook: hook };
}

export async function ingestSourceItems(
  prisma: PrismaClient,
  source: Source,
  maxPerSource: number,
  onCreated?: (feedItemId: string, item: CleanRssItem) => void | Promise<void>,
  itemsOverride?: CleanRssItem[]
): Promise<IngestSourceResult> {
  const items = itemsOverride ?? (await fetchItemsForSource(source, maxPerSource));
  let created = 0;

  for (const item of items) {
    const existing = await prisma.feedItem.findUnique({ where: { sourceUrl: item.sourceUrl } });
    if (existing) continue;

    const quality = evaluateFeedQuality(item);
    if (!quality.shouldPublish) continue;

    const heatScore = calculateHeatScore({
      publishTime: item.publishTime,
      sourceWeight: source.sourceWeight,
      tokenMoves: []
    });
    const { aiSummary, narrativeHook } = initialAiFields(item, source);

    const row = await prisma.feedItem.create({
      data: {
        sourceId: source.id,
        title: item.title,
        content: item.content,
        aiSummary,
        narrativeHook,
        sourceUrl: item.sourceUrl,
        type: source.type === "REDDIT" ? "SOCIAL_TREND" : "NEWS",
        publishTime: item.publishTime,
        heatScore,
        rankScore: heatScore + (source.contentLocale === "ZH" ? 8 : 0),
        status: "PUBLISHED"
      }
    });

    await onCreated?.(row.id, item);
    created += 1;
  }

  return { items_found: items.length, items_created: created };
}
