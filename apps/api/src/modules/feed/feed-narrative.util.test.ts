import { describe, expect, it } from "vitest";
import { buildNarrativeHook, cleanFeedDisplayText, narrativeImportanceScore, pickPrimaryNarrative } from "./feed-narrative.util";

const baseFeed = {
  type: "NARRATIVE_SHIFT",
  narrativeHook: null,
  feedItemNarratives: [
    { narrative: { id: "1", name: "AI", slug: "ai", heatScore: 90, weight: 60 } },
    { narrative: { id: "2", name: "Meme", slug: "meme", heatScore: 40, weight: 50 } }
  ]
};

describe("feed-narrative.util", () => {
  it("picks highest heat narrative as primary", () => {
    expect(pickPrimaryNarrative(baseFeed)?.slug).toBe("ai");
  });

  it("builds type-specific hook when stored hook is empty", () => {
    expect(buildNarrativeHook(baseFeed)).toContain("AI");
    expect(buildNarrativeHook(baseFeed)).toContain("叙事");
  });

  it("scores narrative importance from heat and weight", () => {
    expect(narrativeImportanceScore(baseFeed)).toBeGreaterThan(10);
  });

  it("removes mock disclaimer from feed display text", () => {
    expect(cleanFeedDisplayText("BTC ETF 资金流入：基于已收录来源的简要摘要，供研究参考，不构成投资建议。")).toBe(
      "BTC ETF 资金流入"
    );
  });
});
