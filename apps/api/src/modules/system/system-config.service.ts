import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type FeatureFlags = {
  ai_search: boolean;
  watchlist: boolean;
  pwa_install: boolean;
  telegram_push: boolean;
};

export type SystemConfigSnapshot = {
  ai_search_daily_limit: number;
  feed_fetch_interval_seconds: number;
  heat_score_source_weight: number;
  heat_score_recency_weight: number;
  telegram_push_daily_limit: number;
  llm_provider: string;
  feature_flags: FeatureFlags;
};

const DEFAULTS: SystemConfigSnapshot = {
  ai_search_daily_limit: 30,
  feed_fetch_interval_seconds: 300,
  heat_score_source_weight: 0.4,
  heat_score_recency_weight: 0.6,
  telegram_push_daily_limit: 10,
  llm_provider: "moonshot",
  feature_flags: {
    ai_search: true,
    watchlist: true,
    pwa_install: true,
    telegram_push: false
  }
};

@Injectable()
export class SystemConfigService implements OnModuleInit {
  private cache: SystemConfigSnapshot = { ...DEFAULTS };

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.reload();
  }

  get snapshot(): SystemConfigSnapshot {
    return this.cache;
  }

  async reload() {
    const rows = await this.prisma.systemSetting.findMany();
    const next = { ...DEFAULTS };
    for (const row of rows) {
      const value = row.valueJson as Record<string, unknown>;
      if (row.key === "ai_search_daily_limit") next.ai_search_daily_limit = Number(value);
      if (row.key === "feed_fetch_interval_seconds") next.feed_fetch_interval_seconds = Number(value);
      if (row.key === "heat_score_source_weight") next.heat_score_source_weight = Number(value);
      if (row.key === "heat_score_recency_weight") next.heat_score_recency_weight = Number(value);
      if (row.key === "telegram_push_daily_limit") next.telegram_push_daily_limit = Number(value);
      if (row.key === "llm_provider") next.llm_provider = String(value);
      if (row.key === "feature_flags") next.feature_flags = value as FeatureFlags;
    }
    this.cache = next;
  }

  async listForAdmin() {
    return Object.entries(this.cache).map(([key, value]) => ({
      key,
      value
    }));
  }

  async update(key: string, value: unknown, adminUserId?: string) {
    const valueJson = value as import("@prisma/client").Prisma.InputJsonValue;
    await this.prisma.systemSetting.upsert({
      where: { key },
      update: { valueJson, updatedBy: adminUserId },
      create: { key, valueJson, updatedBy: adminUserId }
    });
    await this.reload();
  }
}
