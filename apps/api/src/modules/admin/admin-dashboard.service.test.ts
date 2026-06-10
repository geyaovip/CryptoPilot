import { describe, expect, it, vi } from "vitest";
import { AdminDashboardService } from "./admin-dashboard.service";

describe("AdminDashboardService", () => {
  it("aggregates dashboard metrics", async () => {
    const prisma = {
      feedItem: { count: vi.fn().mockResolvedValue(12) },
      marketInsight: { count: vi.fn().mockResolvedValue(3) },
      aiSearchHistory: { count: vi.fn().mockResolvedValue(5) },
      pushMessage: {
        count: vi
          .fn()
          .mockResolvedValueOnce(7)
          .mockResolvedValueOnce(2)
      },
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

    const systemConfig = {
      snapshot: { telegram_push_daily_limit: 10 }
    };
    const service = new AdminDashboardService(prisma as never, aiMonitor as never, systemConfig as never);
    const result = await service.getOverview();

    expect(result.feeds_today).toBe(12);
    expect(result.insights_today).toBe(3);
    expect(result.ai_searches_today).toBe(5);
    expect(result.pushes_today).toBe(7);
    expect(result.pushes_failed_24h).toBe(2);
    expect(result.push_daily_limit_per_user).toBe(10);
    expect(prisma.pushMessage.count).toHaveBeenNthCalledWith(1, {
      where: { status: "SENT", sentAt: { gte: expect.any(Date) } }
    });
    expect(prisma.pushMessage.count).toHaveBeenNthCalledWith(2, {
      where: { status: "FAILED", failedAt: { gte: expect.any(Date) } }
    });
    expect(result.llm_error_rate).toBe(0.125);
    expect(result.sources.active).toBe(1);
  });
});
