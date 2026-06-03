import type { FeedItemDetail, FeedItemSummary } from "@cryptopilot/types";
import { buildNarrativeHook, cleanFeedDisplayText, pickPrimaryNarrative, toApiFeedType } from "./feed-narrative.util";
import { pickChineseDisplayText, isChineseContent } from "../ingestion/chinese-content.util";

type FeedRecord = {
  id: string;
  clusterId?: string | null;
  title: string;
  content: string;
  aiSummary: string;
  narrativeHook?: string | null;
  aiKeyReasons?: unknown;
  aiMarketImpact?: string | null;
  sourceUrl: string;
  publishTime: Date;
  sentiment: string;
  heatScore: number;
  type: string;
  status: string;
  isPinned: boolean;
  isClusterLead?: boolean;
  source: { name: string };
  feedItemTokens: { token: { id: string; symbol: string; name: string; priceUsd: unknown; priceChange24h: unknown } }[];
  feedItemNarratives: {
    narrative: { id: string; name: string; slug: string; heatScore: number; weight: number };
  }[];
};

export function toFeedSummary(feed: FeedRecord, relatedSourceCount = 1): FeedItemSummary {
  const primary = pickPrimaryNarrative(feed);
  const feedType = toApiFeedType(feed.type);

  return {
    id: feed.id,
    title: feed.title,
    ai_summary: displaySummary(feed.aiSummary, feed.title),
    narrative_hook: buildNarrativeHook(feed),
    primary_narrative: primary
      ? { id: primary.id, name: primary.name, slug: primary.slug }
      : null,
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
    type: feedType,
    feed_type: feedType,
    status: feed.status.toLowerCase() as FeedItemSummary["status"],
    is_pinned: feed.isPinned,
    cluster_id: feed.clusterId ?? null,
    is_cluster_lead: feed.isClusterLead ?? false
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

function displaySummary(aiSummary: string, title: string): string {
  const cleaned = cleanFeedDisplayText(aiSummary);
  if (isChineseContent(cleaned)) return cleaned;
  const chinese = pickChineseDisplayText([title]);
  if (chinese) return `来源: ${chinese.slice(0, 200)}`;
  return cleaned || "AI 摘要生成中，请稍后刷新。";
}

function parseKeyReasons(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}
