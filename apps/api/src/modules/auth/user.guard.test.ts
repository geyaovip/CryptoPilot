import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { describe, expect, it, vi } from "vitest";
import { signAuthToken } from "./auth-token.util";
import { UserGuard } from "./user.guard";

const userId = "00000000-0000-0000-0000-000000000002";
const secret = "test-secret-at-least-16";

function createContext(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers, user: undefined })
    })
  } as unknown as ExecutionContext;
}

function createGuard(disabled = false, configValues: Record<string, string | undefined> = {}) {
  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        where.id === userId
          ? { id: userId, role: "USER", email: "user@cryptopilot.local", disabledAt: disabled ? new Date() : null }
          : null
      )
    }
  };
  const config = { get: (key: string) => (key === "AUTH_SECRET" ? secret : configValues[key]) } as ConfigService;
  return new UserGuard(prisma as never, config);
}

describe("UserGuard", () => {
  it("allows valid bearer token", async () => {
    const token = signAuthToken({ userId, role: "user", secret });
    const guard = createGuard();
    const ctx = createContext({ authorization: `Bearer ${token}` });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it("rejects missing auth", async () => {
    const guard = createGuard();
    await expect(guard.canActivate(createContext({}))).rejects.toThrow(UnauthorizedException);
  });

  it("rejects legacy user header in production", async () => {
    const guard = createGuard(false, { NODE_ENV: "production" });
    await expect(guard.canActivate(createContext({ "x-user-id": userId }))).rejects.toThrow(UnauthorizedException);
  });

  it("allows legacy user header outside production for local development", async () => {
    const guard = createGuard(false, { NODE_ENV: "development" });
    await expect(guard.canActivate(createContext({ "x-user-id": userId }))).resolves.toBe(true);
  });
});
