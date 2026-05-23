import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { WatchlistItemView, WatchlistTargetType } from "@cryptopilot/types";
import { AppHttpException } from "../common/app-http.exception";
import { PrismaService } from "../prisma/prisma.service";
import { SystemConfigService } from "../system/system-config.service";
import type { WatchlistTargetType as PrismaWatchlistTargetType } from "@prisma/client";

@Injectable()
export class WatchlistService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(SystemConfigService) private readonly systemConfig: SystemConfigService
  ) {}

  async list(userId: string | undefined) {
    this.assertWatchlistEnabled();
    const id = this.requireUser(userId);
    const items = await this.prisma.watchlistItem.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" }
    });
    const views: WatchlistItemView[] = [];
    for (const item of items) {
      const view = await this.toView(item);
      if (view) views.push(view);
    }
    return { items: views };
  }

  async create(userId: string | undefined, targetType: WatchlistTargetType, targetId: string) {
    this.assertWatchlistEnabled();
    const id = this.requireUser(userId);
    await this.assertTargetExists(targetType, targetId);

    try {
      const item = await this.prisma.watchlistItem.create({
        data: {
          userId: id,
          targetType: targetType.toUpperCase() as PrismaWatchlistTargetType,
          targetId
        }
      });
      const view = await this.toView(item);
      return view ?? { id: item.id };
    } catch {
      throw new ConflictException("已在关注列表中");
    }
  }

  async delete(userId: string | undefined, watchlistId: string) {
    this.assertWatchlistEnabled();
    const id = this.requireUser(userId);
    const item = await this.prisma.watchlistItem.findFirst({ where: { id: watchlistId, userId: id } });
    if (!item) throw new NotFoundException("关注项不存在");
    await this.prisma.watchlistItem.delete({ where: { id: watchlistId } });
    return { deleted: true };
  }

  async updateNotification(userId: string | undefined, watchlistId: string, enabled: boolean) {
    this.assertWatchlistEnabled();
    const id = this.requireUser(userId);
    const item = await this.prisma.watchlistItem.findFirst({ where: { id: watchlistId, userId: id } });
    if (!item) throw new NotFoundException("关注项不存在");
    const updated = await this.prisma.watchlistItem.update({
      where: { id: watchlistId },
      data: { notificationsEnabled: enabled }
    });
    const view = await this.toView(updated);
    return view ?? { id: updated.id, notifications_enabled: enabled };
  }

  private requireUser(userId: string | undefined) {
    if (!userId) throw new UnauthorizedException("需要登录");
    return userId;
  }

  private assertWatchlistEnabled() {
    if (!this.systemConfig.snapshot.feature_flags.watchlist) {
      throw new AppHttpException("VALIDATION_ERROR", "关注列表功能暂未开放");
    }
  }

  private async assertTargetExists(targetType: WatchlistTargetType, targetId: string) {
    if (targetType === "token") {
      const token = await this.prisma.token.findFirst({ where: { id: targetId, deletedAt: null, isActive: true } });
      if (!token) throw new NotFoundException("Token 不存在");
      return;
    }
    if (targetType === "narrative") {
      const narrative = await this.prisma.narrative.findFirst({
        where: { id: targetId, deletedAt: null, isActive: true, mergedIntoId: null }
      });
      if (!narrative) throw new NotFoundException("Narrative 不存在");
      return;
    }
    const kol = await this.prisma.kol.findFirst({ where: { id: targetId, deletedAt: null, isActive: true } });
    if (!kol) throw new NotFoundException("KOL 不存在");
  }

  private async toView(item: {
    id: string;
    targetType: PrismaWatchlistTargetType;
    targetId: string;
    notificationsEnabled: boolean;
  }): Promise<WatchlistItemView | null> {
    const type = item.targetType.toLowerCase() as WatchlistTargetType;

    if (type === "token") {
      const token = await this.prisma.token.findUnique({ where: { id: item.targetId } });
      if (!token || token.deletedAt) return null;
      const latest = await this.latestFeedForToken(token.id);
      return {
        id: item.id,
        target_type: type,
        target_id: item.targetId,
        name: token.symbol,
        subtitle: token.name,
        change_24h: token.priceChange24h === null ? null : Number(token.priceChange24h),
        latest_update: latest?.title ?? null,
        ai_summary: latest?.aiSummary ?? null,
        notifications_enabled: item.notificationsEnabled
      };
    }

    if (type === "narrative") {
      const narrative = await this.prisma.narrative.findUnique({ where: { id: item.targetId } });
      if (!narrative || narrative.deletedAt) return null;
      const latest = await this.latestFeedForNarrative(narrative.id);
      return {
        id: item.id,
        target_type: type,
        target_id: item.targetId,
        name: narrative.name,
        subtitle: narrative.slug,
        change_24h: narrative.trendScore24h,
        latest_update: latest?.title ?? null,
        ai_summary: narrative.aiSummary ?? latest?.aiSummary ?? null,
        notifications_enabled: item.notificationsEnabled
      };
    }

    const kol = await this.prisma.kol.findUnique({ where: { id: item.targetId } });
    if (!kol || kol.deletedAt) return null;
    const latest = await this.latestFeedForKol(kol.name, kol.handle);
    return {
      id: item.id,
      target_type: type,
      target_id: item.targetId,
      name: kol.name,
      subtitle: `@${kol.handle}`,
      change_24h: kol.influenceScore,
      latest_update: latest?.title ?? null,
      ai_summary: latest?.aiSummary ?? null,
      notifications_enabled: item.notificationsEnabled
    };
  }

  private latestFeedForToken(tokenId: string) {
    return this.prisma.feedItem.findFirst({
      where: { deletedAt: null, status: "PUBLISHED", feedItemTokens: { some: { tokenId } } },
      orderBy: { publishTime: "desc" }
    });
  }

  private latestFeedForNarrative(narrativeId: string) {
    return this.prisma.feedItem.findFirst({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        feedItemNarratives: { some: { narrativeId } }
      },
      orderBy: { publishTime: "desc" }
    });
  }

  private latestFeedForKol(name: string, handle: string) {
    return this.prisma.feedItem.findFirst({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        source: {
          OR: [
            { name: { contains: handle, mode: "insensitive" } },
            { name: { contains: name, mode: "insensitive" } }
          ]
        }
      },
      orderBy: { publishTime: "desc" }
    });
  }
}
