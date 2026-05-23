import type { Narrative, NarrativeHeatSnapshot, Prisma, Sentiment, Token } from "@prisma/client";
import type { NarrativeDetail, NarrativeHeatPoint, NarrativeListItem } from "@cryptopilot/types";

type NarrativeWithTokens = Narrative & {
  topTokens?: Pick<Token, "id" | "symbol" | "name" | "priceUsd" | "priceChange24h">[];
};

export function toTokenSummary(token: Pick<Token, "id" | "symbol" | "name" | "priceUsd" | "priceChange24h">) {
  return {
    id: token.id,
    symbol: token.symbol,
    name: token.name,
    price_usd: token.priceUsd === null ? null : Number(token.priceUsd),
    price_change_24h: token.priceChange24h === null ? null : Number(token.priceChange24h)
  };
}

export function toNarrativeListItem(
  narrative: NarrativeWithTokens,
  followedIds: Set<string>,
  watchlistByNarrativeId?: Map<string, string>
): NarrativeListItem {
  return {
    id: narrative.id,
    name: narrative.name,
    slug: narrative.slug,
    heat_score: narrative.heatScore,
    trend_score_24h: narrative.trendScore24h,
    trend_score_7d: narrative.trendScore7d,
    feed_count_24h: narrative.feedCount24h,
    top_tokens: (narrative.topTokens ?? []).map(toTokenSummary),
    ai_summary: narrative.aiSummary,
    sentiment: narrative.sentiment.toLowerCase() as NarrativeListItem["sentiment"],
    is_followed: followedIds.has(narrative.id),
    watchlist_id: watchlistByNarrativeId?.get(narrative.id) ?? null
  };
}

export function buildWatchlistMap(
  rows: { targetId: string; id: string }[]
): Map<string, string> {
  return new Map(rows.map((row) => [row.targetId, row.id]));
}

export function toHeatPoints(snapshots: NarrativeHeatSnapshot[]): NarrativeHeatPoint[] {
  return snapshots.map((row) => ({
    captured_at: row.capturedAt.toISOString(),
    heat_score: row.heatScore,
    feed_count: row.feedCount
  }));
}

export function toNarrativeDetail(input: {
  narrative: Narrative;
  topTokens: Pick<Token, "id" | "symbol" | "name" | "priceUsd" | "priceChange24h">[];
  followedIds: Set<string>;
  watchlistMap?: Map<string, string>;
  heatChart: { h24: NarrativeHeatSnapshot[]; d7: NarrativeHeatSnapshot[]; d30: NarrativeHeatSnapshot[] };
  relatedFeed: NarrativeDetail["related_feed"];
  topSources: NarrativeDetail["top_sources"];
}): NarrativeDetail {
  const base = toNarrativeListItem(
    { ...input.narrative, topTokens: input.topTokens },
    input.followedIds,
    input.watchlistMap
  );
  return {
    ...base,
    description: input.narrative.description,
    heat_chart: {
      h24: toHeatPoints(input.heatChart.h24),
      d7: toHeatPoints(input.heatChart.d7),
      d30: toHeatPoints(input.heatChart.d30)
    },
    related_feed: input.relatedFeed,
    top_sources: input.topSources
  };
}

export function sentimentFromDb(value: Sentiment): "bullish" | "neutral" | "bearish" {
  return value.toLowerCase() as "bullish" | "neutral" | "bearish";
}

export type FeedWithRelations = Prisma.FeedItemGetPayload<{
  include: {
    source: true;
    feedItemTokens: { include: { token: true } };
    feedItemNarratives: { include: { narrative: true } };
  };
}>;
