import { describe, expect, it } from "vitest";
import { parseAiSearchLlmOutput, parseAiSearchOutput, parseFeedSummaryOutput } from "./schemas";

describe("AI schemas", () => {
  it("accepts valid feed summary", () => {
    const result = parseFeedSummaryOutput({
      summary: "BTC ETF 资金流继续支撑市场风险偏好。",
      key_reasons: ["ETF 净流入"],
      market_impact: "风险偏好上升",
      related_tokens: ["BTC"],
      narrative_tags: ["etf-flow"],
      sentiment: "bullish"
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid sentiment", () => {
    const result = parseFeedSummaryOutput({
      summary: "test",
      key_reasons: ["a"],
      market_impact: "b",
      related_tokens: [],
      narrative_tags: [],
      sentiment: "moon"
    });
    expect(result.success).toBe(false);
  });

  it("accepts ai search llm output without sources", () => {
    const result = parseAiSearchLlmOutput({
      answer: "test",
      key_reasons: ["a"],
      market_impact: "b",
      related_tokens: ["BTC"],
      related_narratives: ["ETF"],
      sentiment: "看涨"
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sentiment).toBe("bullish");
  });

  it("requires at least two sources for ai search", () => {
    const result = parseAiSearchOutput({
      answer: "test",
      key_reasons: ["a"],
      market_impact: "b",
      related_tokens: ["BTC"],
      related_narratives: ["ETF"],
      sentiment: "neutral",
      sources: [
        {
          source_name: "CoinDesk",
          source_type: "news",
          url: "https://example.com/1",
          published_at: new Date().toISOString()
        }
      ]
    });
    expect(result.success).toBe(false);
  });
});
