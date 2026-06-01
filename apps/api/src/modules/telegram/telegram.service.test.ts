import { describe, expect, it, vi } from "vitest";
import { ConfigService } from "@nestjs/config";
import { TelegramService } from "./telegram.service";

describe("TelegramService", () => {
  it("rejects webhook with invalid secret", async () => {
    const service = new TelegramService(
      {} as never,
      new ConfigService({ TELEGRAM_WEBHOOK_SECRET: "secret" }),
      {} as never,
      { sendMessage: vi.fn(), botUsername: "cryptopilot_bot" } as never
    );

    await expect(service.handleWebhook({ secret: "bad", text: "/help", chatId: "1" })).rejects.toMatchObject({
      errorCode: "TELEGRAM_WEBHOOK_INVALID"
    });
  });

  it("does not consume expired bind code", async () => {
    const sendMessage = vi.fn();
    const update = vi.fn();
    const service = new TelegramService(
      {
        telegramBindCode: {
          findUnique: vi.fn().mockResolvedValue({
            id: "code-1",
            userId: "u1",
            code: "ABC123",
            consumedAt: null,
            expiresAt: new Date(Date.now() - 1000)
          }),
          update
        },
        user: { update: vi.fn() }
      } as never,
      new ConfigService({ TELEGRAM_WEBHOOK_SECRET: "secret" }),
      { ensurePreference: vi.fn() } as never,
      { sendMessage, botUsername: "cryptopilot_bot" } as never
    );

    await expect(service.handleWebhook({ secret: "secret", text: "/bind ABC123", chatId: "42" })).resolves.toEqual({
      ok: true
    });
    expect(update).not.toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith("42", expect.stringContaining("无效或已过期"));
  });

  it("does not consume reused bind code", async () => {
    const sendMessage = vi.fn();
    const update = vi.fn();
    const service = new TelegramService(
      {
        telegramBindCode: {
          findUnique: vi.fn().mockResolvedValue({
            id: "code-1",
            userId: "u1",
            code: "ABC123",
            consumedAt: new Date(),
            expiresAt: new Date(Date.now() + 1000)
          }),
          update
        },
        user: { update: vi.fn() }
      } as never,
      new ConfigService({ TELEGRAM_WEBHOOK_SECRET: "secret" }),
      { ensurePreference: vi.fn() } as never,
      { sendMessage, botUsername: "cryptopilot_bot" } as never
    );

    await expect(service.handleWebhook({ secret: "secret", text: "/bind ABC123", chatId: "42" })).resolves.toEqual({
      ok: true
    });
    expect(update).not.toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith("42", expect.stringContaining("无效或已过期"));
  });

  it("pauses and resumes telegram push for bound users", async () => {
    const sendMessage = vi.fn();
    const updateNotifications = vi.fn();
    const service = new TelegramService(
      {
        user: { findFirst: vi.fn().mockResolvedValue({ id: "u1" }) }
      } as never,
      new ConfigService({ TELEGRAM_WEBHOOK_SECRET: "secret" }),
      { updateNotifications, ensurePreference: vi.fn() } as never,
      { sendMessage, botUsername: "cryptopilot_bot" } as never
    );

    await service.handleWebhook({ secret: "secret", text: "/pause", chatId: "42" });
    await service.handleWebhook({ secret: "secret", text: "/resume", chatId: "42" });

    expect(updateNotifications).toHaveBeenNthCalledWith(1, "u1", { telegram_push_enabled: false });
    expect(updateNotifications).toHaveBeenNthCalledWith(2, "u1", { telegram_push_enabled: true });
  });
});
