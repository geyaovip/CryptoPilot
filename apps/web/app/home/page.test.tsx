import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("../_components/web-user-menu", () => ({
  WebUserMenu: () => <div data-testid="web-user-menu" />
}));

vi.mock("../lib/api", () => ({
  getFeed: async () => ({
    entity: "insight",
    items: [
      {
        id: "insight-1",
        ai_insight: "AI 市场雷达：叙事升温",
        ai_summary: "综合多来源信号",
        type: "narrative_shift",
        feed_type: "narrative_shift",
        sentiment: "neutral",
        heat_score: 90,
        heat_velocity: 8,
        heat_label: "heating_up",
        primary_narrative: { id: "n1", name: "AI", slug: "ai" },
        related_tokens: [],
        narrative_tags: [],
        source_count: 2,
        sources: [
          {
            feed_item_id: "f1",
            title: "t1",
            source_name: "CoinDesk",
            source_url: "https://example.com/1",
            published_at: new Date().toISOString()
          },
          {
            feed_item_id: "f2",
            title: "t2",
            source_name: "The Block",
            source_url: "https://example.com/2",
            published_at: new Date().toISOString()
          }
        ]
      }
    ],
    next_cursor: null
  }),
  getTrending: async () => ({
    tokens: [],
    narratives: [{ id: "n1", name: "AI", slug: "ai" }],
    fear_greed_index: {
      value: 72,
      classification: "Greed",
      updated_at: new Date().toISOString(),
      next_update_seconds: 3600,
      source_name: "Alternative.me",
      source_url: "https://alternative.me/crypto/fear-and-greed-index/"
    }
  })
}));

describe("HomePage", () => {
  it("renders insight-first market radar", async () => {
    render(await HomePage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("AI 市场雷达")).toBeTruthy();
    expect(screen.getByText(/恐惧贪婪指数：72 贪婪/)).toBeTruthy();
    expect(screen.getByTestId("insight-card-headline").textContent).toContain("叙事升温");
    expect(screen.getByText("2 个可点击来源")).toBeTruthy();
  });
});
