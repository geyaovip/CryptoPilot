import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FeedDetailPage from "./page";

vi.mock("../../lib/api", () => ({
  getFeedDetail: async () => ({
    id: "feed-1",
    title: "ETH Layer 2 活跃度回升",
    ai_summary: "详情摘要",
    narrative_hook: "Layer2 叙事再度升温",
    primary_narrative: { id: "n1", name: "Layer2", slug: "layer2" },
    feed_type: "narrative_shift",
    content:
      "详情正文第一段，包含原始来源信息。第二句继续补充背景。\n\n这是一段更长的原始内容，用来验证详情页不会把全文直接作为主阅读内容展示。",
    source_name: "Cointelegraph",
    source_url: "https://example.com",
    publish_time: new Date().toISOString(),
    related_tokens: [],
    narrative_tags: [],
    sentiment: "neutral",
    heat_score: 74,
    type: "news",
    status: "published",
    related_source_count: 1,
    is_pinned: false,
    similar_feed: [
      {
        id: "feed-2",
        title: "相关标题",
        ai_summary: "相关摘要",
        narrative_hook: "相关 hook",
        primary_narrative: null,
        feed_type: "news",
        source_name: "The Block",
        source_url: "https://example.com/2",
        publish_time: new Date().toISOString(),
        related_source_count: 1,
        related_tokens: [],
        narrative_tags: [],
        sentiment: "neutral",
        heat_score: 60,
        type: "news",
        status: "published",
        is_pinned: false
      }
    ],
    key_reasons: ["Layer2 费用下降", "生态 TVL 回升"],
    market_impact: "中性偏多"
  })
}));

describe("FeedDetailPage", () => {
  it("renders summary-first detail with related sources", async () => {
    render(await FeedDetailPage({ params: Promise.resolve({ id: "feed-1" }) }));

    expect(screen.getByTestId("feed-detail-hook").textContent).toContain("Layer2");
    expect(screen.getByText("AI 已为你提炼")).toBeTruthy();
    expect(screen.getByText("来源摘录")).toBeTruthy();
    expect(screen.getByText("相关来源")).toBeTruthy();
    expect(screen.getByText("The Block")).toBeTruthy();
    expect(screen.getByText("关键原因")).toBeTruthy();
  });
});
