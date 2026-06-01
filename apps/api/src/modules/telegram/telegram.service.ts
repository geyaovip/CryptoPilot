import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppHttpException } from "../common/app-http.exception";
import { PrismaService } from "../prisma/prisma.service";
import { SettingsService } from "../settings/settings.service";
import { TelegramProviderService } from "./telegram-provider.service";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

@Injectable()
export class TelegramService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SettingsService) private readonly settings: SettingsService,
    @Inject(TelegramProviderService) private readonly provider: TelegramProviderService
  ) {}

  async createBindCode(userId: string) {
    const code = await this.createUniqueCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.telegramBindCode.create({ data: { userId, code, expiresAt } });
    const botUsername = this.provider.botUsername;
    return {
      code,
      expires_at: expiresAt.toISOString(),
      bot_username: botUsername,
      bot_link: botUsername ? `https://t.me/${botUsername}?start=bind_${code}` : null
    };
  }

  async unbind(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { telegramChatId: null, telegramBoundAt: null }
    });
    await this.settings.updateNotifications(userId, { telegram_push_enabled: false });
    return { success: true };
  }

  async handleWebhook(input: { secret?: string; text?: string; chatId?: string }) {
    this.assertWebhookSecret(input.secret);
    const text = input.text?.trim() ?? "";
    const chatId = input.chatId;
    if (!chatId) return { ok: true };

    if (text.startsWith("/bind")) {
      const code = text.split(/\s+/)[1] ?? text.match(/bind_([A-Z0-9]+)/i)?.[1] ?? "";
      return this.bindWithCode(chatId, code.toUpperCase());
    }
    if (text.startsWith("/start")) {
      const code = text.match(/bind_([A-Z0-9]+)/i)?.[1];
      if (code) return this.bindWithCode(chatId, code.toUpperCase());
      await this.provider.sendMessage(chatId, "欢迎使用 CryptoPilot。请从网页端点击“一键绑定 Telegram”，或发送 /bind <code> 完成绑定。");
      return { ok: true };
    }
    if (text.startsWith("/summary")) return this.sendSummary(chatId);
    if (text.startsWith("/watchlist")) return this.sendWatchlist(chatId);
    if (text.startsWith("/pause")) return this.setPushPaused(chatId, true);
    if (text.startsWith("/resume")) return this.setPushPaused(chatId, false);
    if (text.startsWith("/help")) {
      await this.provider.sendMessage(chatId, this.helpText());
      return { ok: true };
    }
    await this.provider.sendMessage(chatId, this.helpText());
    return { ok: true };
  }

  private async bindWithCode(chatId: string, code: string) {
    if (!code) {
      await this.provider.sendMessage(chatId, "请从 CryptoPilot 个人中心点击“一键绑定 Telegram”，或发送 /bind <code> 完成绑定。");
      return { ok: true };
    }
    const bindCode = await this.prisma.telegramBindCode.findUnique({ where: { code } });
    if (!bindCode || bindCode.consumedAt || bindCode.expiresAt < new Date()) {
      await this.provider.sendMessage(chatId, "绑定码无效或已过期，请回到网页端重新生成。");
      return { ok: true };
    }
    await this.prisma.user.update({
      where: { id: bindCode.userId },
      data: { telegramChatId: chatId, telegramBoundAt: new Date() }
    });
    await this.prisma.telegramBindCode.update({
      where: { id: bindCode.id },
      data: { consumedAt: new Date(), chatId }
    });
    await this.settings.ensurePreference(bindCode.userId);
    await this.provider.sendMessage(chatId, "绑定成功。你可以在 CryptoPilot 通知设置中管理 Telegram Push。");
    return { ok: true };
  }

  private async sendSummary(chatId: string) {
    const user = await this.boundUser(chatId);
    if (!user) return this.sendBindFirst(chatId);
    const items = await this.prisma.feedItem.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      orderBy: [{ isPinned: "desc" }, { rankScore: "desc" }, { publishTime: "desc" }],
      take: 3,
      select: { title: true, aiSummary: true, sourceUrl: true }
    });
    if (items.length === 0) {
      await this.provider.sendMessage(chatId, "暂时还没有可推送的市场摘要。");
      return { ok: true };
    }
    const lines = items.map((item, index) =>
      [`${index + 1}. ${item.title}`, item.aiSummary ? `   ${item.aiSummary}` : null, `   ${item.sourceUrl}`].filter(Boolean).join("\n")
    );
    await this.provider.sendMessage(chatId, ["CryptoPilot 最近市场摘要：", ...lines, "仅供研究参考，不构成投资建议。"].join("\n\n"));
    return { ok: true };
  }

  private async sendWatchlist(chatId: string) {
    const user = await this.boundUser(chatId);
    if (!user) return this.sendBindFirst(chatId);
    const items = await this.prisma.watchlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    if (items.length === 0) {
      await this.provider.sendMessage(chatId, "你的关注列表还是空的。可以在 CryptoPilot 网页端关注 Token、叙事或观点源。");
      return { ok: true };
    }
    const labels = await Promise.all(items.map((item) => this.watchlistLabel(item.targetType, item.targetId, item.notificationsEnabled)));
    await this.provider.sendMessage(chatId, ["你的 CryptoPilot 关注列表：", ...labels.map((label, index) => `${index + 1}. ${label}`)].join("\n"));
    return { ok: true };
  }

  private async setPushPaused(chatId: string, paused: boolean) {
    const user = await this.boundUser(chatId);
    if (!user) return this.sendBindFirst(chatId);
    await this.settings.updateNotifications(user.id, { telegram_push_enabled: !paused });
    await this.provider.sendMessage(chatId, paused ? "已暂停 Telegram Push。发送 /resume 可恢复。" : "已恢复 Telegram Push。");
    return { ok: true };
  }

  private async boundUser(chatId: string) {
    return this.prisma.user.findFirst({
      where: { telegramChatId: chatId, deletedAt: null, disabledAt: null },
      select: { id: true }
    });
  }

  private async sendBindFirst(chatId: string) {
    await this.provider.sendMessage(chatId, "请先在 CryptoPilot 个人中心点击“一键绑定 Telegram”，或发送 /bind <code> 完成绑定。");
    return { ok: true };
  }

  private async watchlistLabel(targetType: "TOKEN" | "NARRATIVE" | "KOL", targetId: string, enabled: boolean) {
    const suffix = enabled ? "推送开启" : "推送关闭";
    if (targetType === "TOKEN") {
      const token = await this.prisma.token.findUnique({ where: { id: targetId }, select: { symbol: true, name: true } });
      return `${token ? `${token.symbol} ${token.name}` : "Token 已失效"} · ${suffix}`;
    }
    if (targetType === "NARRATIVE") {
      const narrative = await this.prisma.narrative.findUnique({ where: { id: targetId }, select: { name: true } });
      return `${narrative?.name ?? "叙事已失效"} · ${suffix}`;
    }
    const kol = await this.prisma.kol.findUnique({ where: { id: targetId }, select: { name: true, handle: true } });
    return `${kol ? `${kol.name} @${kol.handle}` : "观点源已失效"} · ${suffix}`;
  }

  private assertWebhookSecret(secret: string | undefined) {
    const expected = this.config.get<string>("TELEGRAM_WEBHOOK_SECRET")?.trim();
    if (!expected || secret !== expected) {
      throw new AppHttpException("TELEGRAM_WEBHOOK_INVALID", "Telegram webhook 校验失败", 401);
    }
  }

  private async createUniqueCode() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");
      const existing = await this.prisma.telegramBindCode.findUnique({ where: { code } });
      if (!existing) return code;
    }
    throw new AppHttpException("INTERNAL_ERROR", "绑定码生成失败", 500);
  }

  private helpText() {
    return [
      "CryptoPilot Telegram 命令：",
      "/bind <code> 手动绑定账号",
      "/summary 查看最近市场摘要",
      "/watchlist 查看关注列表",
      "/pause 暂停推送",
      "/resume 恢复推送",
      "/help 查看帮助"
    ].join("\n");
  }
}
