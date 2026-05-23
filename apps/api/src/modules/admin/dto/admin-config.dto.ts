import { Allow, IsIn } from "class-validator";

const CONFIG_KEYS = [
  "ai_search_daily_limit",
  "feed_fetch_interval_seconds",
  "heat_score_source_weight",
  "heat_score_recency_weight",
  "telegram_push_daily_limit",
  "llm_provider",
  "feature_flags"
] as const;

export type AdminConfigKey = (typeof CONFIG_KEYS)[number];

export class PatchAdminConfigDto {
  @IsIn(CONFIG_KEYS)
  key!: AdminConfigKey;

  @Allow()
  value!: unknown;
}
