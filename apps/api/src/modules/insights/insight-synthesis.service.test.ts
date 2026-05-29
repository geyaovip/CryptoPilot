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
  it("publishes a fallback insight when LLM output is invalid", async () => {
    const update = vi.fn();
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
      { upsertEntityEmbedding: vi.fn().mockResolvedValue(undefined) } as never
    );

    await expect(service.synthesize("insight-1")).resolves.toBe(true);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "insight-1" },
        data: expect.objectContaining({
          status: "PUBLISHED",
          publishedAt: new Date("2026-05-29T07:02:00.000Z"),
          aiInsight: expect.stringContaining("XRP")
        })
      })
    );
  });
});
