import { describe, expect, it, vi } from "vitest";
import { AdminLogsService } from "./admin-logs.service";

describe("AdminLogsService", () => {
  it("normalizes string limit before querying Prisma", async () => {
    const prisma = {
      apiErrorLog: { findMany: vi.fn().mockResolvedValue([]) },
      ingestionLog: { findMany: vi.fn().mockResolvedValue([]) },
      llmCallLog: { findMany: vi.fn().mockResolvedValue([]) },
      pushDeliveryLog: { findMany: vi.fn().mockResolvedValue([]) },
      auditLog: { findMany: vi.fn().mockResolvedValue([]) }
    };
    const service = new AdminLogsService(prisma as never);

    await service.list({ limit: "20" as never });

    expect(prisma.apiErrorLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20 }));
    expect(prisma.pushDeliveryLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20 }));
  });

  it("uses shortUid when rendering push log users without email", async () => {
    const prisma = {
      apiErrorLog: { findMany: vi.fn().mockResolvedValue([]) },
      ingestionLog: { findMany: vi.fn().mockResolvedValue([]) },
      llmCallLog: { findMany: vi.fn().mockResolvedValue([]) },
      pushDeliveryLog: {
        findMany: vi.fn().mockResolvedValue([
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
        ])
      },
      auditLog: { findMany: vi.fn().mockResolvedValue([]) }
    };
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
});
