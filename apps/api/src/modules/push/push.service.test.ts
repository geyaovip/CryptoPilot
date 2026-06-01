import { describe, expect, it, vi } from "vitest";
import { AppHttpException } from "../common/app-http.exception";
import { PushService } from "./push.service";

describe("PushService", () => {
  it("fails delivery when user has not bound Telegram", async () => {
    const createLog = vi.fn();
    const updateMessage = vi.fn().mockResolvedValue({
      id: "push-1",
      userId: "u1",
      type: "MANUAL",
      status: "FAILED",
      title: "t",
      body: "b",
      detailUrl: null,
      relatedFeedItemId: null,
      scheduledAt: null,
      sentAt: null,
      failedAt: new Date(),
      errorMessage: "用户未绑定 Telegram 或已关闭 Telegram Push",
      createdAt: new Date()
    });
    const service = new PushService(
      {
        pushMessage: {
          findUnique: vi.fn().mockResolvedValue({
            id: "push-1",
            userId: "u1",
            title: "t",
            body: "b",
            detailUrl: null,
            user: { telegramChatId: null, notificationPreference: { telegramPushEnabled: true } }
          }),
          update: updateMessage
        },
        pushDeliveryLog: { create: createLog }
      } as never,
      { sendMessage: vi.fn() } as never,
      { enabled: false } as never
    );

    await expect(service.send("push-1")).resolves.toMatchObject({ status: "failed" });
    expect(createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILED" })
      })
    );
  });

  it("sends Telegram pushes with the localized risk note", async () => {
    const sendMessage = vi.fn().mockResolvedValue({ message_id: 1001 });
    const createLog = vi.fn();
    const updateMessage = vi.fn().mockResolvedValue({
      id: "push-1",
      userId: "u1",
      type: "MANUAL",
      status: "SENT",
      title: "市场提醒",
      body: "BTC 出现大幅波动。",
      detailUrl: null,
      relatedFeedItemId: null,
      scheduledAt: null,
      sentAt: new Date(),
      failedAt: null,
      errorMessage: null,
      createdAt: new Date()
    });
    const service = new PushService(
      {
        pushMessage: {
          findUnique: vi.fn().mockResolvedValue({
            id: "push-1",
            userId: "u1",
            title: "市场提醒",
            body: "BTC 出现大幅波动。",
            detailUrl: "https://cryptopilot.chat/feed/1",
            user: { telegramChatId: "42", notificationPreference: { telegramPushEnabled: true } }
          }),
          update: updateMessage
        },
        pushDeliveryLog: { create: createLog }
      } as never,
      { sendMessage } as never,
      { enabled: false } as never
    );

    await expect(service.send("push-1")).resolves.toMatchObject({ status: "sent" });
    const [, text] = sendMessage.mock.calls[0] as [string, string];
    expect(text).toContain("仅供研究参考，不构成投资建议。");
    expect(text).not.toContain("Not financial advice");
  });

  it("blocks duplicate feed push for the same user and type", async () => {
    const service = new PushService(
      {
        user: {
          findFirst: vi.fn().mockResolvedValue({
            id: "u1",
            telegramChatId: "42",
            notificationPreference: { telegramPushEnabled: true }
          })
        },
        pushMessage: {
          count: vi.fn().mockResolvedValue(0),
          findFirst: vi.fn().mockResolvedValue({ id: "push-existing" })
        }
      } as never,
      { sendMessage: vi.fn() } as never,
      { enabled: false } as never
    );

    await expect(
      service.createAndSend({
        userId: "u1",
        type: "market_alert",
        title: "t",
        body: "b",
        relatedFeedItemId: "feed-1"
      })
    ).rejects.toMatchObject({ message: "同一 Feed 已推送给该用户" });
  });

  it("blocks push when user disabled telegram notifications", async () => {
    const service = new PushService(
      {
        user: {
          findFirst: vi.fn().mockResolvedValue({
            id: "u1",
            telegramChatId: "42",
            notificationPreference: { telegramPushEnabled: false }
          })
        }
      } as never,
      { sendMessage: vi.fn() } as never,
      { enabled: false } as never
    );

    await expect(
      service.createAndSend({
        userId: "u1",
        type: "manual",
        title: "t",
        body: "b"
      })
    ).rejects.toBeInstanceOf(AppHttpException);
  });

  it("enforces daily push limit", async () => {
    const service = new PushService(
      {
        user: {
          findFirst: vi.fn().mockResolvedValue({
            id: "u1",
            telegramChatId: "42",
            notificationPreference: { telegramPushEnabled: true }
          })
        },
        pushMessage: { count: vi.fn().mockResolvedValue(20) }
      } as never,
      { sendMessage: vi.fn() } as never,
      { enabled: false } as never
    );

    await expect(
      service.createAndSend({
        userId: "u1",
        type: "manual",
        title: "t",
        body: "b"
      })
    ).rejects.toMatchObject({ errorCode: "RATE_LIMITED" });
  });
});
