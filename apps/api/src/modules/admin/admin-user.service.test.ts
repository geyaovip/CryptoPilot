import { describe, expect, it, vi } from "vitest";
import { AdminUserService } from "./admin-user.service";

describe("AdminUserService", () => {
  it("lists users with short UID", async () => {
    const prisma = {
      user: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            shortUid: "CP-7K2M9QX4",
            email: "user@cryptopilot.local",
            name: "User",
            role: "USER",
            disabledAt: null,
            dailyAiSearchCount: 2,
            createdAt: new Date("2026-05-28T00:00:00.000Z")
          }
        ])
      }
    };

    const result = await new AdminUserService(prisma as never, { log: vi.fn() } as never).list();

    expect(result.items[0]?.uid).toBe("CP-7K2M9QX4");
    expect(result.items[0]?.role).toBe("user");
  });

  it("updates role and writes audit log", async () => {
    const prisma = {
      user: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          id: "user-1",
          shortUid: "CP-7K2M9QX4",
          role: "USER",
          disabledAt: null
        }),
        update: vi.fn().mockResolvedValue({
          id: "user-1",
          shortUid: "CP-7K2M9QX4",
          role: "ADMIN",
          disabledAt: null
        })
      }
    };
    const audit = { log: vi.fn().mockResolvedValue(undefined) };

    const result = await new AdminUserService(prisma as never, audit as never).update(
      "user-1",
      { role: "admin" },
      "admin-1"
    );

    expect(result.role).toBe("admin");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: "ADMIN" }) })
    );
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: "user.update" }));
  });
});
