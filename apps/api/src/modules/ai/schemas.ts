import { z } from "zod";

const sentimentSchema = z.enum(["bullish", "neutral", "bearish"]);

export const feedSummarySchema = z.object({
  summary: z.string().min(1).max(500),
  key_reasons: z.array(z.string().min(1)).min(1).max(6),
  market_impact: z.string().min(1).max(500),
  related_tokens: z.array(z.string().min(1)).max(10),
  narrative_tags: z.array(z.string().min(1)).max(8),
  sentiment: sentimentSchema
});

const aiSearchSourceSchema = z.object({
  source_name: z.string().min(1),
  source_type: z.string().min(1),
  url: z.string().url(),
  published_at: z.string().min(1)
});

/** LLM output only — sources come from RAG, not the model. */
export const aiSearchLlmSchema = z.object({
  answer: z.string().min(1),
  key_reasons: z.array(z.string().min(1)).min(1).max(6),
  market_impact: z.string().min(1),
  related_tokens: z.array(z.string().min(1)),
  related_narratives: z.array(z.string().min(1)),
  sentiment: z.preprocess(normalizeSentiment, sentimentSchema)
});

export const aiSearchSchema = aiSearchLlmSchema.extend({
  sources: z.array(aiSearchSourceSchema).min(2)
});

function normalizeSentiment(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const key = value.trim().toLowerCase();
  const map: Record<string, z.infer<typeof sentimentSchema>> = {
    bullish: "bullish",
    neutral: "neutral",
    bearish: "bearish",
    看涨: "bullish",
    中性: "neutral",
    看跌: "bearish",
    positive: "bullish",
    negative: "bearish"
  };
  return map[key] ?? value;
}

export type FeedSummaryOutput = z.infer<typeof feedSummarySchema>;
export type AiSearchOutput = z.infer<typeof aiSearchSchema>;

export function parseFeedSummaryOutput(raw: unknown) {
  return feedSummarySchema.safeParse(raw);
}

export function parseAiSearchLlmOutput(raw: unknown) {
  return aiSearchLlmSchema.safeParse(raw);
}

export function parseAiSearchOutput(raw: unknown) {
  return aiSearchSchema.safeParse(raw);
}
