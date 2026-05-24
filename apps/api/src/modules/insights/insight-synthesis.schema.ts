import type { FeedType, Sentiment } from "@cryptopilot/types";

export type InsightSynthesisOutput = {
  ai_insight: string;
  ai_summary: string;
  key_reasons: string[];
  market_impact: string;
  sentiment: Sentiment;
  type: FeedType;
};

const SENTIMENTS = new Set<Sentiment>(["bullish", "neutral", "bearish"]);

export function parseInsightSynthesisOutput(data: unknown): { success: true; data: InsightSynthesisOutput } | { success: false } {
  if (!data || typeof data !== "object") return { success: false };
  const row = data as Record<string, unknown>;
  const aiInsight = typeof row.ai_insight === "string" ? row.ai_insight.trim() : "";
  const aiSummary = typeof row.ai_summary === "string" ? row.ai_summary.trim() : "";
  const marketImpact = typeof row.market_impact === "string" ? row.market_impact.trim() : "";
  const sentiment = typeof row.sentiment === "string" ? row.sentiment.toLowerCase() : "";
  const type = typeof row.type === "string" ? row.type.toLowerCase() : "news";
  const keyReasons = Array.isArray(row.key_reasons)
    ? row.key_reasons.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  if (!aiInsight || !aiSummary || !SENTIMENTS.has(sentiment as Sentiment)) {
    return { success: false };
  }

  return {
    success: true,
    data: {
      ai_insight: aiInsight,
      ai_summary: aiSummary,
      key_reasons: keyReasons,
      market_impact: marketImpact,
      sentiment: sentiment as Sentiment,
      type: type as FeedType
    }
  };
}
