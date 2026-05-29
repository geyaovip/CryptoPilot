import { describe, expect, it, vi } from "vitest";
import { AdminLogsService } from "./admin-logs.service";

describe("AdminLogsService", () => {
  it("normalizes string limit before querying Prisma", async () => {
    const prisma = {
      apiErrorLog: { findMany: vi.fn().mockResolvedValue([]) },
      ingestionLog: { findMany: vi.fn().mockResolvedValue([]) },
      llmCallLog: { findMany: vi.fn().mockResolvedValue([]) },
      auditLog: { findMany: vi.fn().mockResolvedValue([]) }
    };
    const service = new AdminLogsService(prisma as never);

    await service.list({ limit: "20" as never });

    expect(prisma.apiErrorLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20 }));
  });
});
