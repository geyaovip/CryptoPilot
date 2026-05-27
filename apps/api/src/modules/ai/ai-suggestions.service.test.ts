import { describe, expect, it, vi } from "vitest";
import { AiSuggestionsService } from "./ai-suggestions.service";

describe("AiSuggestionsService", () => {
  it("builds six suggestions from hot feeds, narratives, tokens, and fallbacks", async () => {
    const prisma = {
      feedItem: {
        findMany: vi.fn().mockResolvedValue([
          {
            title: "ETH ETF 资金流出现明显改善",
            aiSummary: "ETH ETF 资金流改善，市场关注度升温。"
          }
        ])
      },
      narrative: {
        findMany: vi.fn().mockResolvedValue([{ name: "AI" }])
      },
      token: {
        findMany: vi.fn().mockResolvedValue([{ symbol: "SOL", priceChange24h: 12.4 }])
      }
    };

    const service = new AiSuggestionsService(prisma as never);
    const result = await service.list();

    expect(result.items).toHaveLength(6);
    expect(result.items[0]).toMatchObject({
      question: "「ETH ETF 资金流改善，市场关注度升温」这件事的背景和影响是什么？",
      source: "feed"
    });
    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ question: "AI 叙事最近为什么升温？", source: "narrative" }),
        expect.objectContaining({ question: "SOL 过去 24 小时的异动主要来自哪些事件？", source: "token" })
      ])
    );
  });
});
