import { describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";
import { hashMagicLinkToken } from "./magic-link.util";

describe("AuthService magic link", () => {
  it("returns magic link url in non-production", async () => {
    const prisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: "u1",
          email: "user@cryptopilot.local",
          name: "User",
          role: "USER"
        })
      },
      magicLinkToken: { create: vi.fn().mockResolvedValue({}) }
    };
    const config = {
      get: (key: string) => {
        if (key === "APP_URL") return "http://localhost:3000";
        if (key === "NODE_ENV") return "development";
        return undefined;
      }
    };
    const service = new AuthService(prisma as never, config as never);
    const result = await service.requestMagicLink({ email: "user@cryptopilot.local" });
    expect(result.magic_link_url).toContain("/login?token=");
    expect(prisma.magicLinkToken.create).toHaveBeenCalled();
  });

  it("consumes valid token and issues session", async () => {
    const raw = "abc123validtoken456";
    const prisma = {
      magicLinkToken: {
        findUnique: vi.fn().mockResolvedValue({
          email: "user@cryptopilot.local",
          tokenHash: hashMagicLinkToken(raw),
          consumedAt: null,
          expiresAt: new Date(Date.now() + 60_000)
        }),
        update: vi.fn().mockResolvedValue({})
      },
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: "u1",
          email: "user@cryptopilot.local",
          name: "User",
          role: "USER"
        })
      }
    };
    const config = { get: (key: string) => (key === "AUTH_SECRET" ? "test-secret-at-least-16" : undefined) };
    const service = new AuthService(prisma as never, config as never);
    const result = await service.consumeMagicLink(raw);
    expect(result.access_token).toBeTruthy();
    expect(prisma.magicLinkToken.update).toHaveBeenCalled();
  });
});
