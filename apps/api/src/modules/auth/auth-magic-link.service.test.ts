import { describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";
import { hashMagicLinkToken } from "./magic-link.util";

describe("AuthService magic link", () => {
  const mailService = { sendMagicLink: vi.fn().mockResolvedValue(undefined) };

  it("returns magic link url in non-production", async () => {
    const prisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: "u1",
          shortUid: "CP-7K2M9QX4",
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
    const service = new AuthService(prisma as never, config as never, mailService as never);
    const result = await service.requestMagicLink({ email: "user@cryptopilot.local" });
    expect(result.magic_link_url).toContain("/login?token=");
    expect(prisma.magicLinkToken.create).toHaveBeenCalled();
    expect(mailService.sendMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ to: "user@cryptopilot.local" })
    );
  });

  it("supports admin login redirect path", async () => {
    const prisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: "admin1",
          shortUid: "CP-A7K9Q2M4",
          email: "admin@cryptopilot.local",
          name: "Admin",
          role: "ADMIN"
        })
      },
      magicLinkToken: { create: vi.fn().mockResolvedValue({}) }
    };
    const config = {
      get: (key: string) => {
        if (key === "APP_URL") return "https://cryptopilot.chat";
        if (key === "ADMIN_APP_URL") return "https://admin.cryptopilot.chat";
        if (key === "MAGIC_LINK_EXPOSE") return "true";
        if (key === "NODE_ENV") return "production";
        return undefined;
      }
    };
    const service = new AuthService(prisma as never, config as never, mailService as never);
    const result = await service.requestMagicLink({
      email: "admin@cryptopilot.local",
      redirect_path: "/admin/login"
    });
    expect(result.magic_link_url).toContain("https://admin.cryptopilot.chat/admin/login?token=");
    expect(mailService.sendMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ magicLinkUrl: expect.stringContaining("/admin/login?token=") })
    );
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
          shortUid: "CP-7K2M9QX4",
          email: "user@cryptopilot.local",
          name: "User",
          role: "USER"
        })
      }
    };
    const config = { get: (key: string) => (key === "AUTH_SECRET" ? "test-secret-at-least-16" : undefined) };
    const service = new AuthService(prisma as never, config as never, mailService as never);
    const result = await service.consumeMagicLink(raw);
    expect(result.access_token).toBeTruthy();
    expect(prisma.magicLinkToken.update).toHaveBeenCalled();
  });
});
