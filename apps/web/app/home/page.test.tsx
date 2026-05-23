import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("../_components/web-user-menu", () => ({
  WebUserMenu: () => <div data-testid="web-user-menu" />
}));

vi.mock("../lib/api", () => ({
  getFeed: async () => ({
    items: [
      {
        id: "feed-1",
        title: "BTC ETF 资金流继续支撑市场风险偏好",
        ai_summary: "示例摘要",
        source_name: "CoinDesk",
        source_url: "https://example.com",
        publish_time: new Date().toISOString(),
        related_tokens: [],
        narrative_tags: [],
        sentiment: "neutral",
        heat_score: 86,
        type: "news",
        status: "published",
        related_source_count: 2,
        is_pinned: false
      }
    ],
    next_cursor: null
  }),
  getTrending: async () => ({
    tokens: [],
    narratives: [{ id: "n1", name: "AI", slug: "ai" }]
  })
}));

describe("HomePage", () => {
  it("renders AI curated feed with summary-first cards", async () => {
    render(await HomePage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("AI 精选市场简报")).toBeTruthy();
    expect(screen.getByTestId("home-search-entry")).toBeTruthy();
    expect(screen.getByTestId("feed-card-summary").textContent).toContain("示例摘要");
    expect(screen.queryByText("BTC ETF 资金流继续支撑市场风险偏好")).toBeNull();
  });
});
