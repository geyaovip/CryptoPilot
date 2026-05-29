import { UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const mailService = { sendMagicLink: vi.fn().mockResolvedValue(undefined) };

  it("throws for unauthenticated current user", async () => {
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue(null) } };
    const config = { get: vi.fn().mockReturnValue("test-secret-at-least-16") };
    const service = new AuthService(prisma as never, config as never, mailService as never);

    await expect(service.getCurrentUser()).rejects.toThrow(UnauthorizedException);
  });

  it("returns login payload for known email", async () => {
    const prisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: "u1",
          shortUid: "CP-7K2M9QX4",
          email: "user@example.com",
          name: "User",
          role: "USER"
        })
      }
    };
    const config = { get: vi.fn().mockReturnValue("test-secret-at-least-16") };
    const service = new AuthService(prisma as never, config as never, mailService as never);

    const result = await service.loginWithEmail("user@example.com");
    expect(result.access_token).toBeTruthy();
    expect(result.user.email).toBe("user@example.com");
  });

  it("blocks demo email login in production", async () => {
    const prisma = { user: { findFirst: vi.fn() } };
    const config = {
      get: (key: string) => (key === "NODE_ENV" ? "production" : undefined)
    };
    const service = new AuthService(prisma as never, config as never, mailService as never);

    await expect(service.loginWithEmail("user@example.com")).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });
});
