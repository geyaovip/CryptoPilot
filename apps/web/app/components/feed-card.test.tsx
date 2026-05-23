import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeedCard } from "./feed-card";

const baseFeed = {
  id: "feed-1",
  title: "媒体原标题不应出现在列表主文案",
  ai_summary: "AI 已总结：BTC ETF 资金流支撑风险偏好",
  source_name: "CoinDesk",
  source_url: "https://example.com/article",
  publish_time: new Date().toISOString(),
  related_source_count: 3,
  related_tokens: [],
  narrative_tags: [],
  sentiment: "neutral" as const,
  heat_score: 86,
  type: "news" as const,
  status: "published" as const,
  is_pinned: false
};

describe("FeedCard", () => {
  it("shows ai_summary as primary text, not title", () => {
    render(<FeedCard feed={baseFeed} />);
    expect(screen.getByTestId("feed-card-summary").textContent).toContain("AI 已总结");
    expect(screen.queryByText("媒体原标题不应出现在列表主文案")).toBeNull();
  });

  it("shows related source count", () => {
    render(<FeedCard feed={baseFeed} />);
    expect(screen.getByText("3 个相关来源")).toBeTruthy();
  });

  it("links Ask AI to search with query", () => {
    render(<FeedCard feed={baseFeed} />);
    const ask = screen.getByRole("link", { name: "问 AI" });
    expect(ask.getAttribute("href")).toContain("/search?q=");
  });
});
