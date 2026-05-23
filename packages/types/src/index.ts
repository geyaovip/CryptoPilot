export type UserRole = "user" | "admin";
export type AuthProvider = "google" | "email";
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
  | "INTERNAL_ERROR";

export type PromptStatus = "draft" | "active" | "archived";
export type MvpPromptKey =
  | "feed_summary_prompt"
  | "narrative_summary_prompt"
  | "sentiment_prompt"
  | "ai_search_prompt"
  | "push_prompt";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  request_id: string;
};

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
};

export type AuthMeResponse = ApiSuccess<{
  user: CurrentUser;
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

export type FeedItemSummary = {
  id: string;
  title: string;
  ai_summary: string;
  source_name: string;
  source_url: string;
  publish_time: string;
  /** Primary source + similar_feed count (Phase 1 list). */
  related_source_count: number;
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

export type FeedListResponse = CursorList<FeedItemSummary>;
export type FeedDetailResponse = ApiSuccess<FeedItemDetail>;

export type TrendingResponse = ApiSuccess<{
  tokens: TokenSummary[];
  narratives: NarrativeSummary[];
}>;

export type SourceSummary = {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  last_success_at: string | null;
  last_error_at: string | null;
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
