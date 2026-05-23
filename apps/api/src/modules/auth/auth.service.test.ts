import { UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  it("throws for unauthenticated current user", async () => {
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue(null) } };
    const config = { get: vi.fn().mockReturnValue("test-secret-at-least-16") };
    const service = new AuthService(prisma as never, config as never);

    await expect(service.getCurrentUser()).rejects.toThrow(UnauthorizedException);
  });

  it("returns login payload for known email", async () => {
    const prisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: "u1",
          email: "user@example.com",
          name: "User",
          role: "USER"
        })
      }
    };
    const config = { get: vi.fn().mockReturnValue("test-secret-at-least-16") };
    const service = new AuthService(prisma as never, config as never);

    const result = await service.loginWithEmail("user@example.com");
    expect(result.access_token).toBeTruthy();
    expect(result.user.email).toBe("user@example.com");
  });
});
