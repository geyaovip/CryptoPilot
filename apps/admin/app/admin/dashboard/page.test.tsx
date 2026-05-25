import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "./page";

vi.mock("../_components/admin-shell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock("../../lib/api", () => ({
  getAdminDashboard: vi.fn().mockResolvedValue({
    feeds_today: 12,
    insights_today: 3,
    ai_searches_today: 2,
    pushes_today: 0,
    pushes_note: "Telegram 推送将在 V0.5 接入",
    llm_calls_today: 5,
    llm_error_rate: 0.1,
    tokens_today: 800,
    cost_usd_today: 0.05,
    ingestion_failures_today: 0,
    sources: { active: 4, paused: 0, error: 0, items: [] },
    top_narratives: [{ id: "1", name: "AI", slug: "ai", heat_score: 80, feed_count_24h: 3 }]
  })
}));

describe("AdminDashboardPage", () => {
  it("renders dashboard metrics from API", async () => {
    render(await AdminDashboardPage());
    expect(screen.getByRole("heading", { name: "仪表盘", level: 1 })).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("今日 Insight")).toBeTruthy();
  });
});
