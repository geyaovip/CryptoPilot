import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { describe, expect, it, vi } from "vitest";
import { AdminGuard } from "./admin.guard";
import { signAuthToken } from "./auth-token.util";

const adminId = "00000000-0000-0000-0000-000000000001";
const secret = "test-secret-at-least-16";

function createContext(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers })
    })
  } as unknown as ExecutionContext;
}

function createGuard(role: "ADMIN" | "USER" = "ADMIN") {
  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        where.id === adminId ? { id: adminId, role } : null
      )
    }
  };
  const config = { get: (key: string) => (key === "AUTH_SECRET" ? secret : undefined) } as ConfigService;
  return new AdminGuard(prisma as never, config);
}

describe("AdminGuard", () => {
  it("allows admin bearer token", async () => {
    const token = signAuthToken({ userId: adminId, role: "admin", secret });
    const guard = createGuard();
    await expect(guard.canActivate(createContext({ authorization: `Bearer ${token}` }))).resolves.toBe(true);
  });

  it("allows admin legacy x-user-id", async () => {
    const guard = createGuard();
    await expect(guard.canActivate(createContext({ "x-user-id": adminId }))).resolves.toBe(true);
  });

  it("rejects non-admin users", async () => {
    const guard = createGuard("USER");
    await expect(guard.canActivate(createContext({ "x-user-id": adminId }))).rejects.toThrow(ForbiddenException);
  });
});
