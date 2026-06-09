import { describe, expect, it, vi } from "vitest";
import { AdminLogsService } from "./admin-logs.service";

function createPrismaMock() {
  return {
    apiErrorLog: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([])
    },
    ingestionLog: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([])
    },
    llmCallLog: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([])
    },
    pushDeliveryLog: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([])
    },
    auditLog: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([])
    }
  };
}

describe("AdminLogsService", () => {
  it("paginates a single log type with skip and take", async () => {
    const prisma = createPrismaMock();
    prisma.apiErrorLog.count.mockResolvedValue(42);
    const service = new AdminLogsService(prisma as never);

    const result = await service.list({ type: "api", page: 2, limit: 10 });

    expect(prisma.apiErrorLog.count).toHaveBeenCalledTimes(1);
    expect(prisma.apiErrorLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
    expect(result).toMatchObject({
      page: 2,
      limit: 10,
      total: 42,
      total_pages: 5,
      has_prev: true,
      has_next: true
    });
  });

  it("uses shortUid when rendering push log users without email", async () => {
    const prisma = createPrismaMock();
    prisma.pushDeliveryLog.count.mockResolvedValue(1);
    prisma.pushDeliveryLog.findMany.mockResolvedValue([
      {
        id: "push-log-1",
        channel: "TELEGRAM",
        status: "FAILED",
        pushMessageId: "push-1",
        errorMessage: "chat not found",
        createdAt: new Date("2026-06-05T08:00:00.000Z"),
        pushMessage: { title: "Daily Digest", type: "DAILY_DIGEST" },
        user: { email: null, shortUid: "cp123456789" }
      }
    ]);
    const service = new AdminLogsService(prisma as never);

    const result = await service.list({ type: "push" });

    expect(prisma.pushDeliveryLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          user: { select: { email: true, shortUid: true } }
        })
      })
    );
    expect(result.items[0].detail).toMatchObject({ user: "cp123456789" });
  });

  it("returns merged pagination metadata for all log types", async () => {
    const prisma = createPrismaMock();
    prisma.apiErrorLog.count.mockResolvedValue(3);
    prisma.ingestionLog.count.mockResolvedValue(2);
    prisma.llmCallLog.count.mockResolvedValue(1);
    prisma.pushDeliveryLog.count.mockResolvedValue(0);
    prisma.auditLog.count.mockResolvedValue(4);
    const service = new AdminLogsService(prisma as never);

    const result = await service.list({ page: 1, limit: 5 });

    expect(result.total).toBe(10);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(5);
    expect(result.total_pages).toBe(2);
    expect(result.has_next).toBe(true);
  });
});
