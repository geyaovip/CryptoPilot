export type UserRole = "user" | "admin";
export type AuthProvider = "google" | "email";

export function formatShortUid(id: string): string {
  if (/^CP-[0-9A-Z]{8}$/.test(id)) return id;
  const source = id.trim() || "cryptopilot";
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `CP-${(hash >>> 0).toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
export type SourceType = "rss" | "twitter" | "reddit" | "coingecko" | "manual";
export type SourceStatus = "active" | "paused" | "error";
export type FeedType =
  | "news"
  | "narrative"
  | "market_move"
  | "social_trend"
  | "breaking"
  | "narrative_shift"
  | "sentiment_spike"
  | "market_rotation"
  | "kol_signal";
export type FeedStatus = "published" | "hidden" | "deleted";
export type Sentiment = "bullish" | "neutral" | "bearish";
export type PushType = "daily_digest" | "market_alert" | "watchlist_alert" | "manual";
export type PushStatus = "pending" | "sent" | "failed" | "cancelled";

export type ApiSuccess<T> = {
  data: T;
  request_id: string;
};

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "ADMIN_REQUIRED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "DAILY_LIMIT_EXCEEDED"
  | "QUERY_EMPTY"
  | "QUERY_TOO_LONG"
  | "INSUFFICIENT_SOURCES"
  | "LLM_OUTPUT_INVALID"
  | "LLM_PROVIDER_ERROR"
  | "SOURCE_UNAVAILABLE"
  | "TELEGRAM_WEBHOOK_INVALID"
  | "INTERNAL_ERROR";

export type PromptStatus = "draft" | "active" | "archived";
export type MvpPromptKey =
  | "feed_summary_prompt"
  | "narrative_summary_prompt"
  | "sentiment_prompt"
  | "ai_search_prompt"
  | "push_prompt"
  | "insight_synthesis_prompt";

export type HeatLabel = "heating_up" | "cooling" | "stable";

export type InsightSourceRef = {
  feed_item_id: string;
  title: string;
  source_name: string;
  source_url: string;
  published_at: string;
};

export type MarketInsightSummary = {
  id: string;
  ai_insight: string;
  ai_summary: string;
  type: FeedType;
  feed_type: FeedType;
  sentiment: Sentiment;
  heat_score: number;
  heat_velocity: number;
  heat_label: HeatLabel;
  primary_narrative: NarrativeSummary | null;
  related_tokens: TokenSummary[];
  narrative_tags: NarrativeSummary[];
  source_count: number;
  sources: InsightSourceRef[];
};

export type MarketInsightDetail = MarketInsightSummary & {
  key_reasons: string[];
  market_impact: string | null;
  signals: FeedItemSummary[];
};

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  request_id: string;
};

export type CurrentUser = {
  id: string;
  uid: string;
  email: string | null;
  name: string | null;
  role: UserRole;
};

export type AuthMeResponse = ApiSuccess<{
  user: CurrentUser;
}>;

export type NotificationSettings = {
  telegram_bound: boolean;
  telegram_bound_at: string | null;
  telegram_push_enabled: boolean;
  daily_digest_enabled: boolean;
  market_alert_enabled: boolean;
  watchlist_alert_enabled: boolean;
  timezone: string;
};

export type NotificationSettingsResponse = ApiSuccess<NotificationSettings>;

export type TelegramBindCodeResponse = ApiSuccess<{
  code: string;
  expires_at: string;
  bot_username: string | null;
  bot_link: string | null;
}>;

export type PushMessageSummary = {
  id: string;
  user_id: string;
  type: PushType;
  status: PushStatus;
  title: string;
  body: string;
  detail_url: string | null;
  related_feed_item_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  created_at: string;
};

export type AdminPushListResponse = ApiSuccess<{
  items: PushMessageSummary[];
}>;

export type HealthResponse = ApiSuccess<{
  status: "ok";
  postgres: "ok" | "error";
  redis: "ok" | "error";
}>;

export type TokenSummary = {
  id: string;
  symbol: string;
  name: string;
  price_usd: number | null;
  price_change_24h: number | null;
};

export type NarrativeSummary = {
  id: string;
  name: string;
  slug: string;
};

export type NarrativeListItem = {
  id: string;
  name: string;
  slug: string;
  heat_score: number;
  trend_score_24h: number;
  trend_score_7d: number;
  feed_count_24h: number;
  top_tokens: TokenSummary[];
  ai_summary: string | null;
  sentiment: Sentiment;
  is_followed: boolean;
  watchlist_id: string | null;
};

export type NarrativeHeatPoint = {
  captured_at: string;
  heat_score: number;
  feed_count: number;
};

export type NarrativeDetail = NarrativeListItem & {
  description: string | null;
  heat_chart: { h24: NarrativeHeatPoint[]; d7: NarrativeHeatPoint[]; d30: NarrativeHeatPoint[] };
  related_feed: FeedItemSummary[];
  top_sources: { source_name: string; feed_count: number }[];
};

export type WatchlistTargetType = "token" | "narrative" | "kol";

export type WatchlistItemView = {
  id: string;
  target_type: WatchlistTargetType;
  target_id: string;
  name: string;
  subtitle: string | null;
  change_24h: number | null;
  latest_update: string | null;
  ai_summary: string | null;
  notifications_enabled: boolean;
};

export type KolSummary = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  profile_url: string | null;
  influence_score: number;
  is_active: boolean;
};

export type TokenListItem = TokenSummary & {
  is_active: boolean;
  display_order: number;
};

export type NarrativeListResponse = ApiSuccess<{ items: NarrativeListItem[] }>;
export type NarrativeDetailResponse = ApiSuccess<NarrativeDetail>;
export type WatchlistListResponse = ApiSuccess<{ items: WatchlistItemView[] }>;
export type TokenListResponse = ApiSuccess<{ items: TokenListItem[] }>;
export type KolListResponse = ApiSuccess<{ items: KolSummary[] }>;
export type BookmarkListItem =
  | { kind: "insight"; item: MarketInsightSummary }
  | { kind: "feed_item"; item: FeedItemSummary };
export type BookmarkListResponse = ApiSuccess<{
  entity: "mixed";
  items: BookmarkListItem[];
  next_cursor: string | null;
}>;

export type FeedRelatedSourceRef = {
  feed_item_id: string;
  title: string;
  source_name: string;
  source_url: string;
  published_at: string;
};

export type FeedItemSummary = {
  id: string;
  title: string;
  ai_summary: string;
  source_name: string;
  source_url: string;
  publish_time: string;
  /** Primary source + cluster/similar count (V0.8 方案 B). */
  related_source_count: number;
  /** V0.8 方案 B：同簇多来源（≥2 时填充）。 */
  cluster_id?: string | null;
  is_cluster_lead?: boolean;
  related_sources?: FeedRelatedSourceRef[];
  related_tokens: TokenSummary[];
  narrative_tags: NarrativeSummary[];
  /** Phase 2: dominant narrative for card tag and ranking. */
  primary_narrative: NarrativeSummary | null;
  /** Phase 2: one-line narrative hook (list headline). */
  narrative_hook: string;
  sentiment: Sentiment;
  heat_score: number;
  type: FeedType;
  /** Same as `type`; explicit for V0.8 API consumers. */
  feed_type: FeedType;
  status: FeedStatus;
  is_pinned: boolean;
};

export type AdminFeedClusterSummary = {
  cluster_id: string;
  member_count: number;
  narrative_names: string[];
  representative: FeedItemSummary;
  members: FeedItemSummary[];
};

export type AdminFeedClusterListData = {
  items: AdminFeedClusterSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
};

export type FeedItemDetail = FeedItemSummary & {
  content: string;
  key_reasons: string[];
  market_impact: string | null;
  similar_feed: FeedItemSummary[];
};

export type AiSourceRef = {
  source_name: string;
  source_type: string;
  url: string;
  published_at: string;
};

export type AiSearchResult = {
  answer: string;
  key_reasons: string[];
  market_impact: string;
  related_tokens: string[];
  related_narratives: string[];
  sentiment: Sentiment;
  sources: AiSourceRef[];
  updated_at: string;
};

export type AiSearchResponse = ApiSuccess<AiSearchResult>;

export type AiSearchSuggestion = {
  question: string;
  source: "feed" | "narrative" | "token" | "fallback";
};

export type AiSearchSuggestionsResponse = ApiSuccess<{
  items: AiSearchSuggestion[];
}>;

export type PromptSummary = {
  id: string;
  prompt_key: MvpPromptKey;
  version: number;
  status: PromptStatus;
  content: string;
  updated_at: string;
};

export type PromptListResponse = ApiSuccess<{
  items: PromptSummary[];
}>;

export type AiMonitorStats = {
  calls_today: number;
  tokens_today: number;
  cost_usd_today: number;
  prompt_distribution: { prompt_key: string; count: number }[];
  provider_error_rate: number;
  avg_latency_ms: number;
  recent_errors: {
    id: string;
    prompt_key: string;
    provider: string;
    model: string;
    error_message: string | null;
    created_at: string;
  }[];
};

export type AiMonitorResponse = ApiSuccess<AiMonitorStats>;

export type CursorList<T> = ApiSuccess<{
  items: T[];
  next_cursor: string | null;
}>;

export type FeedListEntity = "insight" | "feed_item";

export type FeedListResponse = ApiSuccess<{
  entity: FeedListEntity;
  /** Present when entity=feed_item and V0.8 cluster aggregation is active. */
  aggregation?: "cluster";
  items: MarketInsightSummary[] | FeedItemSummary[];
  next_cursor: string | null;
}>;

export type FeedDetailResponse = ApiSuccess<FeedItemDetail>;
export type InsightDetailResponse = ApiSuccess<MarketInsightDetail>;

export type TrendingResponse = ApiSuccess<{
  tokens: TokenSummary[];
  narratives: NarrativeSummary[];
  fear_greed_index: {
    value: number;
    classification: string;
    updated_at: string;
    next_update_seconds: number | null;
    source_name: "Alternative.me";
    source_url: string;
  } | null;
}>;

export type ContentLocale = "zh" | "en";

export type SourceSummary = {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  content_locale: ContentLocale;
  last_success_at: string | null;
  last_error_at: string | null;
  error_message: string | null;
  consecutive_failures: number;
  fetch_interval_seconds: number;
};

export type SourceListResponse = CursorList<SourceSummary>;

export type IngestionLogSummary = {
  id: string;
  status: "success" | "failed";
  items_found: number;
  items_created: number;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
};

export type IngestionLogListResponse = ApiSuccess<{
  items: IngestionLogSummary[];
}>;

export type FeedTab = "for_you" | "latest" | "breaking";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000002";
