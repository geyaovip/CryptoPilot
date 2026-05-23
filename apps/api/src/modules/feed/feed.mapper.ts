import type { FeedItemDetail, FeedItemSummary } from "@cryptopilot/types";

type FeedRecord = {
  id: string;
  title: string;
  content: string;
  aiSummary: string;
  aiKeyReasons?: unknown;
  aiMarketImpact?: string | null;
  sourceUrl: string;
  publishTime: Date;
  sentiment: string;
  heatScore: number;
  type: string;
  status: string;
  isPinned: boolean;
  source: { name: string };
  feedItemTokens: { token: { id: string; symbol: string; name: string; priceUsd: unknown; priceChange24h: unknown } }[];
  feedItemNarratives: { narrative: { id: string; name: string; slug: string } }[];
};

export function toFeedSummary(feed: FeedRecord, relatedSourceCount = 1): FeedItemSummary {
  return {
    id: feed.id,
    title: feed.title,
    ai_summary: feed.aiSummary,
    source_name: feed.source.name,
    source_url: feed.sourceUrl,
    publish_time: feed.publishTime.toISOString(),
    related_source_count: Math.max(0, relatedSourceCount),
    related_tokens: feed.feedItemTokens.map(({ token }) => ({
      id: token.id,
      symbol: token.symbol,
      name: token.name,
      price_usd: toNullableNumber(token.priceUsd),
      price_change_24h: toNullableNumber(token.priceChange24h)
    })),
    narrative_tags: feed.feedItemNarratives.map(({ narrative }) => ({
      id: narrative.id,
      name: narrative.name,
      slug: narrative.slug
    })),
    sentiment: feed.sentiment.toLowerCase() as FeedItemSummary["sentiment"],
    heat_score: feed.heatScore,
    type: feed.type.toLowerCase() as FeedItemSummary["type"],
    status: feed.status.toLowerCase() as FeedItemSummary["status"],
    is_pinned: feed.isPinned
  };
}

export function toFeedDetail(feed: FeedRecord, similar: FeedRecord[]): FeedItemDetail {
  const relatedCount = 1 + similar.length;
  return {
    ...toFeedSummary(feed, relatedCount),
    content: feed.content,
    key_reasons: parseKeyReasons(feed.aiKeyReasons),
    market_impact: feed.aiMarketImpact ?? null,
    similar_feed: similar.map((item) => toFeedSummary(item, 1))
  };
}

function parseKeyReasons(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}
