import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeedCard } from "./feed-card";

const baseFeed = {
  id: "feed-1",
  title: "媒体原标题不应出现在列表主文案",
  ai_summary: "AI 已总结：BTC ETF 资金流支撑风险偏好",
  narrative_hook: "AI infrastructure narrative heating up again.",
  primary_narrative: { id: "n-ai", name: "AI", slug: "ai" },
  source_name: "CoinDesk",
  source_url: "https://example.com/article",
  publish_time: new Date().toISOString(),
  related_source_count: 3,
  related_tokens: [],
  narrative_tags: [{ id: "n-ai", name: "AI", slug: "ai" }],
  sentiment: "neutral" as const,
  heat_score: 86,
  type: "narrative_shift" as const,
  feed_type: "narrative_shift" as const,
  status: "published" as const,
  is_pinned: false
};

describe("FeedCard", () => {
  it("shows narrative hook as headline, not title", () => {
    render(<FeedCard feed={baseFeed} />);
    expect(screen.getByTestId("feed-card-hook").textContent).toContain("heating up");
    expect(screen.queryByText("媒体原标题不应出现在列表主文案")).toBeNull();
  });

  it("shows feed type badge and primary narrative", () => {
    render(<FeedCard feed={baseFeed} />);
    expect(screen.getByText("叙事变化")).toBeTruthy();
    expect(screen.getByRole("link", { name: /🔥 AI/ })).toBeTruthy();
  });
});
