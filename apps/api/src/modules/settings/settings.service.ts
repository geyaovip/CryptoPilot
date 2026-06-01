import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateNotificationSettingsDto } from "./dto/notification-settings.dto";

@Injectable()
export class SettingsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getNotifications(userId: string) {
    const preference = await this.ensurePreference(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true, telegramBoundAt: true }
    });
    return {
      telegram_bound: Boolean(user?.telegramChatId),
      telegram_bound_at: user?.telegramBoundAt?.toISOString() ?? null,
      telegram_push_enabled: preference.telegramPushEnabled,
      daily_digest_enabled: preference.dailyDigestEnabled,
      market_alert_enabled: preference.marketAlertEnabled,
      watchlist_alert_enabled: preference.watchlistAlertEnabled,
      timezone: preference.timezone
    };
  }

  async updateNotifications(userId: string, dto: UpdateNotificationSettingsDto) {
    const updated = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        telegramPushEnabled: dto.telegram_push_enabled ?? true,
        dailyDigestEnabled: dto.daily_digest_enabled ?? true,
        marketAlertEnabled: dto.market_alert_enabled ?? true,
        watchlistAlertEnabled: dto.watchlist_alert_enabled ?? true,
        timezone: dto.timezone ?? "Asia/Shanghai"
      },
      update: {
        telegramPushEnabled: dto.telegram_push_enabled,
        dailyDigestEnabled: dto.daily_digest_enabled,
        marketAlertEnabled: dto.market_alert_enabled,
        watchlistAlertEnabled: dto.watchlist_alert_enabled,
        timezone: dto.timezone
      }
    });
    return this.getNotifications(updated.userId);
  }

  async ensurePreference(userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId },
      update: {}
    });
  }
}
