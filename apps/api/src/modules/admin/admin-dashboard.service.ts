import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SystemConfigService } from "../system/system-config.service";
import { AdminAiMonitorService } from "./admin-ai-monitor.service";

function rolling24hStart(): Date {
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AdminAiMonitorService) private readonly aiMonitor: AdminAiMonitorService,
    @Inject(SystemConfigService) private readonly systemConfig: SystemConfigService
  ) {}

  async getOverview() {
    const since = rolling24hStart();
    const ai = await this.aiMonitor.getStats();

    const [
      feedsToday,
      insightsToday,
      aiSearchesToday,
      pushesToday,
      pushesFailedToday,
      sourceRows,
      topNarratives,
      ingestionFailedToday
    ] = await Promise.all([
      this.prisma.feedItem.count({
        where: { deletedAt: null, publishTime: { gte: since } }
      }),
      this.prisma.marketInsight.count({
        where: { deletedAt: null, publishedAt: { gte: since } }
      }),
      this.prisma.aiSearchHistory.count({
        where: { createdAt: { gte: since } }
      }),
      this.prisma.pushMessage.count({
        where: { status: "SENT", sentAt: { gte: since } }
      }),
      this.prisma.pushMessage.count({
        where: { status: "FAILED", failedAt: { gte: since } }
      }),
      this.prisma.source.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, status: true, lastSuccessAt: true, lastErrorAt: true }
      }),
      this.prisma.narrative.findMany({
        where: { deletedAt: null, isActive: true, mergedIntoId: null },
        orderBy: { heatScore: "desc" },
        take: 5,
        select: { id: true, name: true, slug: true, heatScore: true, feedCount24h: true }
      }),
      this.prisma.ingestionLog.count({
        where: { status: "FAILED", createdAt: { gte: since } }
      })
    ]);

    const sources = {
      active: sourceRows.filter((row) => row.status === "ACTIVE").length,
      paused: sourceRows.filter((row) => row.status === "PAUSED").length,
      error: sourceRows.filter((row) => row.status === "ERROR").length,
      items: sourceRows.map((row) => ({
        id: row.id,
        name: row.name,
        status: row.status.toLowerCase(),
        last_success_at: row.lastSuccessAt?.toISOString() ?? null,
        last_error_at: row.lastErrorAt?.toISOString() ?? null
      }))
    };

    return {
      feeds_today: feedsToday,
      insights_today: insightsToday,
      ai_searches_today: aiSearchesToday,
      pushes_today: pushesToday,
      pushes_failed_24h: pushesFailedToday,
      push_daily_limit_per_user: this.systemConfig.snapshot.telegram_push_daily_limit,
      llm_calls_today: ai.calls_today,
      llm_error_rate: ai.provider_error_rate,
      tokens_today: ai.tokens_today,
      cost_usd_today: ai.cost_usd_today,
      ingestion_failures_today: ingestionFailedToday,
      sources,
      top_narratives: topNarratives.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        heat_score: row.heatScore,
        feed_count_24h: row.feedCount24h
      }))
    };
  }
}
