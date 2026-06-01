import { describe, expect, it, vi } from "vitest";
import { InsightSynthesisService } from "./insight-synthesis.service";

const baseInsight = {
  id: "insight-1",
  deletedAt: null,
  heatScore: 70,
  heatVelocity: 3,
  aiInsight: "市场信号聚合中...",
  aiSummary: "正在合成多来源 Insight...",
  primaryNarrative: null,
  signals: [
    {
      id: "feed-1",
      title: "美国XRP现货ETF单日总净流入177.30万美元",
      type: "NEWS",
      publishTime: new Date("2026-05-29T07:02:00.000Z"),
      source: { name: "PANews" },
      sourceUrl: "https://example.com/1",
      feedItemTokens: [],
      feedItemNarratives: []
    },
    {
      id: "feed-2",
      title: "XRP rebounds above $1.30 after volume surge",
      type: "NEWS",
      publishTime: new Date("2026-05-29T05:01:02.000Z"),
      source: { name: "CoinDesk" },
      sourceUrl: "https://example.com/2",
      feedItemTokens: [],
      feedItemNarratives: []
    }
  ]
};

describe("InsightSynthesisService", () => {
  it("does not publish fallback insight when LLM output is invalid", async () => {
    const update = vi.fn();
    const embed = vi.fn();
    const service = new InsightSynthesisService(
      {
        marketInsight: {
          findFirst: vi.fn().mockResolvedValue(baseInsight),
          update
        }
      } as never,
      {
        getActiveContent: vi.fn().mockResolvedValue("signals: {{signals}}"),
        renderTemplate: vi.fn().mockReturnValue("rendered prompt")
      } as never,
      { generateJson: vi.fn().mockResolvedValue({ data: { bad: true } }) } as never,
      { upsertEntityEmbedding: embed } as never
    );

    await expect(service.synthesize("insight-1")).resolves.toBe(false);
    expect(update).not.toHaveBeenCalled();
    expect(embed).not.toHaveBeenCalled();
  });

  it("requires a real LLM provider for insight synthesis", async () => {
    const generateJson = vi.fn().mockResolvedValue({ data: { bad: true } });
    const service = new InsightSynthesisService(
      {
        marketInsight: {
          findFirst: vi.fn().mockResolvedValue(baseInsight),
          update: vi.fn()
        }
      } as never,
      {
        getActiveContent: vi.fn().mockResolvedValue("signals: {{signals}}"),
        renderTemplate: vi.fn().mockReturnValue("rendered prompt")
      } as never,
      { generateJson } as never,
      { upsertEntityEmbedding: vi.fn() } as never
    );

    await service.synthesize("insight-1");
    expect(generateJson).toHaveBeenCalledWith(
      expect.objectContaining({
        promptKey: "insight_synthesis_prompt",
        requireReal: true
      })
    );
  });
});
