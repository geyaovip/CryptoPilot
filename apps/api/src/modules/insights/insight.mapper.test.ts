import { describe, expect, it } from "vitest";
import { toInsightSummary } from "./insight.mapper";

const baseSignal = {
  id: "feed-1",
  title: "币安将移除APT/ETH、CTSI/BTC等多个现货交易对",
  aiSummary: "币安将移除多个现货交易对，市场关注交易流动性变化。",
  content: "source content",
  type: "NEWS",
  sentiment: "NEUTRAL",
  sourceUrl: "https://example.com/1",
  source: { name: "PANews" },
  publishTime: new Date("2026-05-26T08:01:00.000Z"),
  heatScore: 61,
  status: "PUBLISHED",
  isPinned: false,
  feedItemTokens: [],
  feedItemNarratives: []
};

describe("insight mapper", () => {
  it("normalizes long multi-source summaries into a task summary", () => {
    const summary = toInsightSummary({
      id: "insight-1",
      aiInsight: "Ethereum 雷达：币安将移除多个现货交易对",
      aiSummary:
        "PANews 5月26日消息，据官方公告，根据近期审核结果，币安将于2026年05月29日11:00移除多个现货交易对并停止交易。以太坊收购公司BitMine在罗素指数更新后迎来流动性改善，Fundstrat分析师Tom Lee指出其持币规模达供应量的3.8%。Buterin透露其90%净资产持有以太坊，正推动基金会向更小规模、更高效率的组织架构转型。",
      type: "NEWS",
      sentiment: "NEUTRAL",
      heatScore: 61,
      heatVelocity: 19,
      heatLabel: "HEATING_UP",
      rankScore: 80,
      primaryNarrative: { id: "n1", name: "Ethereum", slug: "ethereum" },
      sourcesJson: [
        {
          feed_item_id: "feed-1",
          title: "币安将移除APT/ETH、CTSI/BTC等多个现货交易对",
          source_name: "PANews",
          source_url: "https://example.com/1",
          published_at: "2026-05-26T08:01:00.000Z"
        },
        {
          feed_item_id: "feed-2",
          title: "Tom Lee Outlines Liquidity Catalyst for Ethereum Firm BitMine",
          source_name: "Decrypt",
          source_url: "https://example.com/2",
          published_at: "2026-05-25T20:06:04.000Z"
        }
      ],
      keyReasons: [],
      marketImpact: null,
      signals: [
        baseSignal,
        {
          ...baseSignal,
          id: "feed-2",
          title: "Tom Lee Outlines Liquidity Catalyst for Ethereum Firm BitMine",
          aiSummary: "BitMine在罗素指数更新后迎来流动性改善。",
          sourceUrl: "https://example.com/2",
          source: { name: "Decrypt" },
          publishTime: new Date("2026-05-25T20:06:04.000Z")
        }
      ]
    });

    expect(summary.ai_summary).toContain("2 个来源");
    expect(summary.ai_summary).toContain("快速理解多来源信号");
    expect(summary.ai_summary.length).toBeLessThan(190);
  });
});
