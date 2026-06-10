import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PushStatus, PushType } from "@prisma/client";
import { AppHttpException } from "../common/app-http.exception";
import { BackgroundJobsService } from "../common/background-jobs.service";
import { PrismaService } from "../prisma/prisma.service";
import { SystemConfigService } from "../system/system-config.service";
import { TelegramProviderService } from "../telegram/telegram-provider.service";
import { normalizeAdminPagination, pageMeta } from "../admin/dto/admin-pagination.dto";
import { AdminPushListQueryDto } from "./dto/admin-push-list-query.dto";
import { mapPushMessage } from "./push.mapper";

const PUSH_RISK_NOTE = "仅供研究参考，不构成投资建议。";
const RISK_NOTE_PATTERN = /(Not financial advice\.?|仅供研究参考|不构成投资建议)/i;
const HOURLY_LIMITS: Partial<Record<PushType, number>> = {
  MARKET_ALERT: 3,
  WATCHLIST_ALERT: 5
};

@Injectable()
export class PushService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TelegramProviderService) private readonly telegram: TelegramProviderService,
    @Inject(BackgroundJobsService) private readonly jobs: BackgroundJobsService,
    @Inject(SystemConfigService) private readonly systemConfig: SystemConfigService
  ) {}

  @Cron("0 9 * * *")
  async sendDailyDigestScheduled(): Promise<void> {
    if (!this.jobs.enabled) return;
    const users = await this.pushableUsers("DAILY_DIGEST");
    for (const user of users) {
      await this.sendDailyDigest(user.id);
    }
  }

  @Cron("*/15 * * * *")
  async sendMarketAlertsScheduled(): Promise<void> {
    if (!this.jobs.enabled) return;
    const feedAlerts = await this.prisma.feedItem.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        OR: [{ type: "BREAKING" }, { heatScore: { gte: 80 } }],
        publishTime: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      },
      orderBy: [{ rankScore: "desc" }, { publishTime: "desc" }],
      take: 5
    });
    const tokenAlerts = await this.prisma.token.findMany({
      where: { deletedAt: null, isActive: true, priceChange24h: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: 20
    });
    const users = await this.pushableUsers("MARKET_ALERT");
    for (const user of users) {
      for (const feed of feedAlerts) {
        await this.createAndSendSafe({
          userId: user.id,
          type: "market_alert",
          title: feed.title.slice(0, 60),
          body: feed.aiSummary,
          detailUrl: feed.sourceUrl,
          relatedFeedItemId: feed.id
        });
      }
      const mover = tokenAlerts.find((token) => Math.abs(Number(token.priceChange24h)) >= 8);
      if (mover) {
        await this.createAndSendSafe({
          userId: user.id,
          type: "market_alert",
          title: `${mover.symbol} 24h 波动提醒`,
          body: `${mover.symbol} 24h 变动 ${Number(mover.priceChange24h).toFixed(2)}%，建议结合来源信息继续研究。`
        });
      }
    }
  }

  @Cron("*/20 * * * *")
  async sendWatchlistAlertsScheduled(): Promise<void> {
    if (!this.jobs.enabled) return;
    const watchlistItems = await this.prisma.watchlistItem.findMany({
      where: { notificationsEnabled: true, user: { telegramChatId: { not: null }, disabledAt: null, deletedAt: null } },
      include: { user: { include: { notificationPreference: true } } },
      take: 100
    });
    for (const item of watchlistItems) {
      const pref = item.user.notificationPreference;
      if (pref?.telegramPushEnabled === false || pref?.watchlistAlertEnabled === false) continue;
      const feed = await this.latestWatchlistFeed(item.targetType, item.targetId);
      if (!feed) continue;
      await this.createAndSendSafe({
        userId: item.userId,
        type: "watchlist_alert",
        title: `关注项更新：${feed.title}`.slice(0, 60),
        body: feed.aiSummary,
        detailUrl: feed.sourceUrl,
        relatedFeedItemId: feed.id
      });
    }
  }

  async adminList(query: AdminPushListQueryDto = {}) {
    const { page, limit, skip } = normalizeAdminPagination(query, 25);
    const where = {
      ...(query.type ? { type: query.type.toUpperCase() as PushType } : {}),
      ...(query.status ? { status: query.status.toUpperCase() as PushStatus } : {})
    };
    const [total, rows] = await Promise.all([
      this.prisma.pushMessage.count({ where }),
      this.prisma.pushMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
    ]);
    return {
      items: rows.map(mapPushMessage),
      ...pageMeta(total, page, limit)
    };
  }

  async createAndSend(input: {
    userId: string;
    type: "manual" | "daily_digest" | "market_alert" | "watchlist_alert";
    title: string;
    body: string;
    detailUrl?: string;
    relatedFeedItemId?: string;
  }) {
    const type = input.type.toUpperCase() as PushType;
    await this.assertCanSend(input.userId, type, input.relatedFeedItemId);
    const message = await this.prisma.pushMessage
      .create({
        data: {
          userId: input.userId,
          type,
          title: input.title,
          body: input.body,
          detailUrl: input.detailUrl,
          relatedFeedItemId: input.relatedFeedItemId
        }
      })
      .catch((error: unknown) => {
        if (String(error).includes("Unique constraint")) {
          throw new ConflictException("同一 Feed 已推送给该用户");
        }
        throw error;
      });
    return this.send(message.id);
  }

  async sendDailyDigest(userId: string) {
    const feeds = await this.prisma.feedItem.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      orderBy: [{ isPinned: "desc" }, { rankScore: "desc" }, { publishTime: "desc" }],
      take: 3
    });
    if (feeds.length === 0) return null;
    return this.createAndSend({
      userId,
      type: "daily_digest",
      title: "CryptoPilot 每日市场摘要",
      body: [
        "今日重点：",
        ...feeds.map((feed, index) => `${index + 1}. ${feed.title}：${feed.aiSummary}`)
      ].join("\n"),
      relatedFeedItemId: feeds[0]?.id,
      detailUrl: feeds[0]?.sourceUrl
    });
  }

  async send(pushMessageId: string) {
    const message = await this.prisma.pushMessage.findUnique({
      where: { id: pushMessageId },
      include: { user: { include: { notificationPreference: true } } }
    });
    if (!message) throw new AppHttpException("NOT_FOUND", "Push 不存在", 404);
    const chatId = message.user.telegramChatId;
    if (!chatId || message.user.notificationPreference?.telegramPushEnabled === false) {
      return this.markFailed(message.id, message.userId, "用户未绑定 Telegram 或已关闭 Telegram Push");
    }
    try {
      const result = await this.telegram.sendMessage(chatId, this.formatMessage(message.title, message.body, message.detailUrl));
      await this.prisma.pushDeliveryLog.create({
        data: {
          pushMessageId: message.id,
          userId: message.userId,
          status: "SENT",
          providerMessageId: result.message_id === undefined ? null : String(result.message_id)
        }
      });
      const updated = await this.prisma.pushMessage.update({
        where: { id: message.id },
        data: { status: "SENT", sentAt: new Date(), errorMessage: null }
      });
      return mapPushMessage(updated);
    } catch (error) {
      return this.markFailed(message.id, message.userId, error instanceof Error ? error.message : "Telegram 发送失败");
    }
  }

  private async markFailed(messageId: string, userId: string, reason: string) {
    await this.prisma.pushDeliveryLog.create({
      data: { pushMessageId: messageId, userId, status: "FAILED", errorMessage: reason }
    });
    const updated = await this.prisma.pushMessage.update({
      where: { id: messageId },
      data: { status: "FAILED", failedAt: new Date(), errorMessage: reason }
    });
    return mapPushMessage(updated);
  }

  private async assertCanSend(userId: string, type: PushType, relatedFeedItemId?: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, disabledAt: null },
      include: { notificationPreference: true }
    });
    if (!user) throw new AppHttpException("NOT_FOUND", "用户不存在", 404);
    if (!user.telegramChatId) throw new AppHttpException("VALIDATION_ERROR", "用户尚未绑定 Telegram", 400);
    const pref = user.notificationPreference;
    if (pref?.telegramPushEnabled === false) throw new AppHttpException("VALIDATION_ERROR", "用户已关闭 Telegram Push", 400);
    if (type === "DAILY_DIGEST" && pref?.dailyDigestEnabled === false) throw new AppHttpException("VALIDATION_ERROR", "用户已关闭 Daily Digest", 400);
    if (type === "MARKET_ALERT" && pref?.marketAlertEnabled === false) throw new AppHttpException("VALIDATION_ERROR", "用户已关闭 Market Alert", 400);
    if (type === "WATCHLIST_ALERT" && pref?.watchlistAlertEnabled === false) throw new AppHttpException("VALIDATION_ERROR", "用户已关闭 Watchlist Alert", 400);
    const dayStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyCount = await this.prisma.pushMessage.count({
      where: { userId, status: "SENT", sentAt: { gte: dayStart } }
    });
    const dailyLimit = this.systemConfig.snapshot.telegram_push_daily_limit;
    if (dailyCount >= dailyLimit) throw new AppHttpException("RATE_LIMITED", "今日 Push 已达上限", 429);
    const hourlyLimit = HOURLY_LIMITS[type];
    if (hourlyLimit) {
      const hourStart = new Date(Date.now() - 60 * 60 * 1000);
      const count = await this.prisma.pushMessage.count({
        where: { userId, type, status: "SENT", sentAt: { gte: hourStart } }
      });
      if (count >= hourlyLimit) throw new AppHttpException("RATE_LIMITED", "该类型 Push 小时上限已达", 429);
    }
    if (relatedFeedItemId) {
      const existing = await this.prisma.pushMessage.findFirst({
        where: { userId, relatedFeedItemId, type, status: { not: "CANCELLED" } }
      });
      if (existing) throw new ConflictException("同一 Feed 已推送给该用户");
    }
  }

  private async createAndSendSafe(input: Parameters<PushService["createAndSend"]>[0]) {
    try {
      return await this.createAndSend(input);
    } catch {
      return null;
    }
  }

  private async pushableUsers(type: PushType) {
    return this.prisma.user.findMany({
      where: {
        telegramChatId: { not: null },
        disabledAt: null,
        deletedAt: null,
        notificationPreference: {
          telegramPushEnabled: true,
          ...(type === "DAILY_DIGEST" ? { dailyDigestEnabled: true } : {}),
          ...(type === "MARKET_ALERT" ? { marketAlertEnabled: true } : {}),
          ...(type === "WATCHLIST_ALERT" ? { watchlistAlertEnabled: true } : {})
        }
      },
      select: { id: true }
    });
  }

  private async latestWatchlistFeed(targetType: "TOKEN" | "NARRATIVE" | "KOL", targetId: string) {
    const baseWhere = {
      deletedAt: null,
      status: "PUBLISHED" as const,
      publishTime: { gte: new Date(Date.now() - 60 * 60 * 1000) }
    };
    if (targetType === "TOKEN") {
      return this.prisma.feedItem.findFirst({
        where: { ...baseWhere, feedItemTokens: { some: { tokenId: targetId } } },
        orderBy: [{ rankScore: "desc" }, { publishTime: "desc" }]
      });
    }
    if (targetType === "NARRATIVE") {
      return this.prisma.feedItem.findFirst({
        where: { ...baseWhere, feedItemNarratives: { some: { narrativeId: targetId } } },
        orderBy: [{ rankScore: "desc" }, { publishTime: "desc" }]
      });
    }
    const kol = await this.prisma.kol.findUnique({ where: { id: targetId } });
    if (!kol) return null;
    return this.prisma.feedItem.findFirst({
      where: {
        ...baseWhere,
        source: {
          OR: [
            { name: { contains: kol.handle, mode: "insensitive" } },
            { name: { contains: kol.name, mode: "insensitive" } }
          ]
        }
      },
      orderBy: [{ rankScore: "desc" }, { publishTime: "desc" }]
    });
  }

  private formatMessage(title: string, body: string, detailUrl?: string | null) {
    const parts = [title.trim(), body.trim(), detailUrl ? detailUrl.trim() : ""].filter(Boolean);
    const content = parts.join("\n\n");
    return RISK_NOTE_PATTERN.test(content) ? content : [content, PUSH_RISK_NOTE].join("\n\n");
  }
}
