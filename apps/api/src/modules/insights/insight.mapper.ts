import type { InsightSourceRef, MarketInsightDetail, MarketInsightSummary } from "@cryptopilot/types";
import type { FeedType } from "@cryptopilot/types";
import { toFeedSummary } from "../feed/feed.mapper";
import { toApiFeedType } from "../feed/feed-narrative.util";

type InsightRecord = {
  id: string;
  aiInsight: string;
  aiSummary: string;
  type: string;
  sentiment: string;
  heatScore: number;
  heatVelocity: number;
  heatLabel: string;
  rankScore: number;
  sourcesJson: unknown;
  keyReasons: unknown;
  marketImpact: string | null;
  primaryNarrative: { id: string; name: string; slug: string } | null;
  signals?: SignalFeed[];
};

type SignalFeed = Parameters<typeof toFeedSummary>[0];

export function parseSourcesJson(value: unknown): InsightSourceRef[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      if (
        typeof item.feed_item_id !== "string" ||
        typeof item.source_url !== "string" ||
        typeof item.source_name !== "string"
      ) {
        return null;
      }
      const key = item.source_url.trim();
      if (!key || seen.has(key)) return null;
      seen.add(key);
      return {
        feed_item_id: item.feed_item_id,
        title: typeof item.title === "string" ? item.title : "",
        source_name: item.source_name,
        source_url: key,
        published_at: typeof item.published_at === "string" ? item.published_at : new Date().toISOString()
      };
    })
    .filter((item): item is InsightSourceRef => item !== null);
}

export function toInsightSummary(insight: InsightRecord): MarketInsightSummary {
  const sources = parseSourcesJson(insight.sourcesJson);
  const feedType = toApiFeedType(insight.type);
  const tokens = collectTokens(insight.signals ?? []);
  const narratives = collectNarratives(insight.signals ?? [], insight.primaryNarrative);

  return {
    id: insight.id,
    ai_insight: insight.aiInsight,
    ai_summary: normalizeInsightSummary(insight, sources),
    type: feedType,
    feed_type: feedType,
    sentiment: insight.sentiment.toLowerCase() as MarketInsightSummary["sentiment"],
    heat_score: insight.heatScore,
    heat_velocity: insight.heatVelocity,
    heat_label: insight.heatLabel.toLowerCase() as MarketInsightSummary["heat_label"],
    primary_narrative: insight.primaryNarrative
      ? {
          id: insight.primaryNarrative.id,
          name: insight.primaryNarrative.name,
          slug: insight.primaryNarrative.slug
        }
      : null,
    related_tokens: tokens,
    narrative_tags: narratives,
    source_count: sources.length,
    sources
  };
}

export function toInsightDetail(insight: InsightRecord): MarketInsightDetail {
  const summary = toInsightSummary(insight);
  return {
    ...summary,
    key_reasons: parseStringArray(insight.keyReasons),
    market_impact: insight.marketImpact,
    signals: (insight.signals ?? []).map((feed) => toFeedSummary(feed, 1))
  };
}

export function buildSourcesFromSignals(
  signals: Array<{
    id: string;
    title: string;
    sourceUrl: string;
    publishTime: Date;
    source: { name: string };
  }>
): InsightSourceRef[] {
  const seen = new Set<string>();
  const sources: InsightSourceRef[] = [];
  for (const signal of signals) {
    const sourceUrl = signal.sourceUrl.trim();
    if (!sourceUrl || seen.has(sourceUrl)) continue;
    seen.add(sourceUrl);
    sources.push({
      feed_item_id: signal.id,
      title: signal.title,
      source_name: signal.source.name,
      source_url: sourceUrl,
      published_at: signal.publishTime.toISOString()
    });
  }
  return sources;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function collectTokens(signals: SignalFeed[]) {
  const seen = new Set<string>();
  const tokens: MarketInsightSummary["related_tokens"] = [];
  for (const signal of signals) {
    for (const row of signal.feedItemTokens) {
      if (seen.has(row.token.id)) continue;
      seen.add(row.token.id);
      tokens.push({
        id: row.token.id,
        symbol: row.token.symbol,
        name: row.token.name,
        price_usd: row.token.priceUsd === null ? null : Number(row.token.priceUsd),
        price_change_24h: row.token.priceChange24h === null ? null : Number(row.token.priceChange24h)
      });
      if (tokens.length >= 6) return tokens;
    }
  }
  return tokens;
}

function collectNarratives(
  signals: SignalFeed[],
  primary: InsightRecord["primaryNarrative"]
): MarketInsightSummary["narrative_tags"] {
  const seen = new Set<string>();
  const tags: MarketInsightSummary["narrative_tags"] = [];
  if (primary && !seen.has(primary.id)) {
    seen.add(primary.id);
    tags.push({ id: primary.id, name: primary.name, slug: primary.slug });
  }
  for (const signal of signals) {
    for (const row of signal.feedItemNarratives) {
      if (seen.has(row.narrative.id)) continue;
      seen.add(row.narrative.id);
      tags.push({ id: row.narrative.id, name: row.narrative.name, slug: row.narrative.slug });
      if (tags.length >= 6) return tags;
    }
  }
  return tags;
}

function normalizeInsightSummary(insight: InsightRecord, sources: InsightSourceRef[]): string {
  const summary = insight.aiSummary.replace(/\s+/g, " ").trim();
  const signals = insight.signals ?? [];
  if (summary.length <= 190 || signals.length < 2) return summary;

  const signalSummaries = signals
    .map((signal) => signal.aiSummary?.replace(/\s+/g, " ").trim())
    .filter((value): value is string => Boolean(value));
  const looksConcatenated = signalSummaries.length >= 2 && signalSummaries.every((value) => summary.includes(value.slice(0, 24)));
  if (!looksConcatenated && summary.length <= 260) return summary;

  const topic = insight.primaryNarrative?.name ?? collectNarratives(signals, insight.primaryNarrative)[0]?.name ?? "市场";
  const sourceNames = [...new Set(sources.map((source) => source.source_name).filter(Boolean))].slice(0, 3).join("、");
  const firstTitle = compactText(sources[0]?.title || signals[0]?.title || "多来源市场信号", 44);
  const secondTitle = sources[1]?.title || signals[1]?.title;
  const secondClause = secondTitle ? `，并由「${compactText(secondTitle, 38)}」提供交叉背景` : "";
  return `${sources.length || signals.length} 个来源${sourceNames ? `（${sourceNames}）` : ""}正在共同指向 ${topic} 相关动态：「${firstTitle}」${secondClause}。该总结用于快速理解多来源信号，不构成投资建议。`;
}

function compactText(value: string, maxLength: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}…` : compact;
}
