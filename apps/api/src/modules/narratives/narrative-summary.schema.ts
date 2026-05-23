import { z } from "zod";

const sentimentSchema = z.enum(["bullish", "neutral", "bearish"]);

export const narrativeSummarySchema = z.object({
  summary: z.string().min(1).max(500),
  key_points: z.array(z.string().min(1)).min(1).max(6),
  sentiment: sentimentSchema
});

export function parseNarrativeSummaryOutput(raw: unknown) {
  return narrativeSummarySchema.safeParse(raw);
}
