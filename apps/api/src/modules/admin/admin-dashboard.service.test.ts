import { describe, expect, it, vi } from "vitest";
import { AdminDashboardService } from "./admin-dashboard.service";

describe("AdminDashboardService", () => {
  it("aggregates dashboard metrics", async () => {
    const prisma = {
      feedItem: { count: vi.fn().mockResolvedValue(12) },
      marketInsight: { count: vi.fn().mockResolvedValue(3) },
      aiSearchHistory: { count: vi.fn().mockResolvedValue(5) },
      source: {
        findMany: vi.fn().mockResolvedValue([
          { id: "1", name: "CoinDesk", status: "ACTIVE", lastSuccessAt: new Date(), lastErrorAt: null }
        ])
      },
      narrative: { findMany: vi.fn().mockResolvedValue([]) },
      ingestionLog: { count: vi.fn().mockResolvedValue(1) }
    };
    const aiMonitor = {
      getStats: vi.fn().mockResolvedValue({
        calls_today: 8,
        tokens_today: 1000,
        cost_usd_today: 0.12,
        provider_error_rate: 0.125,
        prompt_distribution: [],
        avg_latency_ms: 200,
        recent_errors: []
      })
    };

    const service = new AdminDashboardService(prisma as never, aiMonitor as never);
    const result = await service.getOverview();

    expect(result.feeds_today).toBe(12);
    expect(result.insights_today).toBe(3);
    expect(result.ai_searches_today).toBe(5);
    expect(result.llm_error_rate).toBe(0.125);
    expect(result.sources.active).toBe(1);
  });
});
