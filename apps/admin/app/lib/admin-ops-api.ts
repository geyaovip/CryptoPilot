import type {
  AdminPushListResponse,
  AiMonitorResponse,
  MvpPromptKey,
  PromptListResponse,
  PushMessageSummary
} from "@cryptopilot/types";
import { adminApiFetch, type AdminListData, type AdminPaginationFilters, toQuery } from "./admin-api-core";

export async function getAdminPrompts(): Promise<PromptListResponse["data"]["items"]> {
  const response = await adminApiFetch("/api/admin/prompts", { cache: "no-store" });
  if (!response.ok) throw new Error("Prompt 列表加载失败");
  const body = (await response.json()) as PromptListResponse;
  return body.data.items;
}

export async function createPrompt(input: { prompt_key: MvpPromptKey; content: string }) {
  const response = await adminApiFetch("/api/admin/prompts", { method: "POST", body: JSON.stringify(input) });
  if (!response.ok) throw new Error("创建 Prompt 失败");
}

export async function updatePrompt(id: string, content: string) {
  const response = await adminApiFetch(`/api/admin/prompts/${id}`, { method: "PATCH", body: JSON.stringify({ content }) });
  if (!response.ok) throw new Error("更新 Prompt 失败");
}

export async function activatePrompt(id: string) {
  const response = await adminApiFetch(`/api/admin/prompts/${id}/activate`, { method: "PATCH" });
  if (!response.ok) throw new Error("激活 Prompt 失败");
}

export async function archivePrompt(id: string) {
  const response = await adminApiFetch(`/api/admin/prompts/${id}/archive`, { method: "PATCH" });
  if (!response.ok) throw new Error("归档 Prompt 失败");
}

export async function testPrompt(id: string, variables: Record<string, string>) {
  const response = await adminApiFetch(`/api/admin/prompts/${id}/test`, {
    method: "POST",
    body: JSON.stringify({ variables })
  });
  if (!response.ok) throw new Error("测试 Prompt 失败");
  const body = (await response.json()) as { data: { rendered: string } };
  return body.data;
}

export type AdminDashboardData = {
  feeds_today: number;
  insights_today: number;
  ai_searches_today: number;
  pushes_today: number;
  llm_calls_today: number;
  llm_error_rate: number;
  tokens_today: number;
  cost_usd_today: number;
  ingestion_failures_today: number;
  sources: {
    active: number;
    paused: number;
    error: number;
    items: Array<{ id: string; name: string; status: string; last_success_at: string | null; last_error_at: string | null }>;
  };
  top_narratives: Array<{ id: string; name: string; slug: string; heat_score: number; feed_count_24h: number }>;
};

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response = await adminApiFetch("/api/admin/dashboard", { cache: "no-store" });
  if (!response.ok) throw new Error("仪表盘数据加载失败");
  const body = (await response.json()) as { data: AdminDashboardData };
  return body.data;
}

export async function getAiMonitor() {
  const response = await adminApiFetch("/api/admin/ai-monitor", { cache: "no-store" });
  if (!response.ok) throw new Error("AI 监控数据加载失败");
  const body = (await response.json()) as AiMonitorResponse;
  return body.data;
}

export async function getAdminNarratives() {
  const response = await adminApiFetch("/api/admin/narratives", { cache: "no-store" });
  if (!response.ok) throw new Error("Narrative 管理数据加载失败");
  const body = (await response.json()) as {
    data: { items: Array<{ id: string; name: string; slug: string; is_active: boolean; heat_score: number; weight: number; ai_summary: string | null }> };
  };
  return body.data;
}

export type AdminTokenItem = {
  id: string;
  symbol: string;
  name: string;
  is_active: boolean;
  price_usd: number | null;
  price_change_24h: number | null;
  display_order: number;
};

export async function getAdminTokens(filters: AdminPaginationFilters = {}): Promise<AdminListData<AdminTokenItem>> {
  const response = await adminApiFetch(`/api/admin/tokens${toQuery(filters)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("资产管理数据加载失败");
  const body = (await response.json()) as { data: AdminListData<AdminTokenItem> };
  return body.data;
}

export type AdminKolItem = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  profile_url: string | null;
  influence_score: number;
  is_active: boolean;
};

export async function getAdminKols(filters: AdminPaginationFilters = {}): Promise<AdminListData<AdminKolItem>> {
  const response = await adminApiFetch(`/api/admin/kols${toQuery(filters)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("KOL 源管理数据加载失败");
  const body = (await response.json()) as { data: AdminListData<AdminKolItem> };
  return body.data;
}

export type AdminUserItem = {
  id: string;
  uid: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin";
  telegram_bound: boolean;
  telegram_bound_at: string | null;
  disabled_at: string | null;
  daily_ai_search_count: number;
  created_at: string;
};

export async function getAdminUsers() {
  const response = await adminApiFetch("/api/admin/users", { cache: "no-store" });
  if (!response.ok) throw new Error("用户列表加载失败");
  const body = (await response.json()) as { data: { items: AdminUserItem[] } };
  return body.data;
}

export async function updateAdminUser(id: string, input: { role?: "user" | "admin"; disabled?: boolean }) {
  const response = await adminApiFetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!response.ok) throw new Error("更新用户失败");
}

export type AdminPushFilters = AdminPaginationFilters & {
  type?: string;
  status?: string;
};

export async function getAdminPush(filters: AdminPushFilters = {}): Promise<AdminListData<PushMessageSummary>> {
  const response = await adminApiFetch(`/api/admin/push${toQuery(filters)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Push 列表加载失败");
  const body = (await response.json()) as AdminPushListResponse;
  return body.data;
}

export async function sendAdminPush(input: {
  user_id: string;
  type: "manual" | "daily_digest" | "market_alert" | "watchlist_alert";
  title: string;
  body: string;
  detail_url?: string;
}) {
  const response = await adminApiFetch("/api/admin/push/send", { method: "POST", body: JSON.stringify(input) });
  const body = (await response.json()) as { data?: PushMessageSummary; message?: string };
  if (!response.ok) throw new Error(body.message ?? "发送 Push 失败");
  if (!body.data) throw new Error("发送 Push 失败");
  return body.data;
}

export async function createAdminNarrative(input: { name: string; slug: string; is_active?: boolean }) {
  const response = await adminApiFetch("/api/admin/narratives", { method: "POST", body: JSON.stringify(input) });
  if (!response.ok) throw new Error("创建 Narrative 失败");
}

export async function updateAdminNarrative(
  id: string,
  input: { is_active?: boolean; ai_summary?: string; weight?: number; name?: string; slug?: string }
) {
  const response = await adminApiFetch(`/api/admin/narratives/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!response.ok) throw new Error("更新 Narrative 失败");
}

export async function mergeAdminNarratives(sourceId: string, targetId: string) {
  const response = await adminApiFetch(`/api/admin/narratives/${sourceId}/merge`, {
    method: "POST",
    body: JSON.stringify({ target_narrative_id: targetId })
  });
  if (!response.ok) throw new Error("合并 Narrative 失败");
}

export async function regenerateAdminNarrativeAi(id: string) {
  const response = await adminApiFetch(`/api/admin/narratives/${id}/regenerate-ai`, { method: "POST" });
  if (!response.ok) throw new Error("重生 Narrative AI 失败");
}

export async function updateAdminToken(id: string, input: { symbol?: string; is_active?: boolean }) {
  const response = await adminApiFetch(`/api/admin/tokens/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!response.ok) throw new Error("更新 Token 失败");
}

export async function refreshAdminToken(id: string) {
  const response = await adminApiFetch(`/api/admin/tokens/${id}/refresh`, { method: "POST" });
  if (!response.ok) throw new Error("刷新 Token 失败");
}

export async function createAdminKol(input: {
  name: string;
  handle: string;
  platform: "twitter" | "youtube" | "other";
  is_active?: boolean;
}) {
  const response = await adminApiFetch("/api/admin/kols", { method: "POST", body: JSON.stringify(input) });
  if (!response.ok) throw new Error("创建 KOL 失败");
}

export async function updateAdminKol(id: string, input: { is_active?: boolean; influence_score?: number }) {
  const response = await adminApiFetch(`/api/admin/kols/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!response.ok) throw new Error("更新 KOL 失败");
}

export type AdminLogItem = {
  id: string;
  type: "api" | "ingestion" | "llm" | "audit" | "push";
  title: string;
  message: string;
  error_code: string;
  created_at: string;
  detail?: Record<string, unknown>;
};

export type AdminLogFilters = AdminPaginationFilters & {
  type?: string;
  from?: string;
  to?: string;
};

export type AdminLogsData = AdminListData<AdminLogItem> & {
  from: string;
  to: string;
};

export async function getAdminLogs(filters: AdminLogFilters = {}): Promise<AdminLogsData> {
  const response = await adminApiFetch(`/api/admin/logs${toQuery(filters)}`, { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ? `日志加载失败：${body.message}` : "日志加载失败");
  }
  const body = (await response.json()) as { data: AdminLogsData };
  return body.data;
}

export async function getAdminConfig() {
  const response = await adminApiFetch("/api/admin/config", { cache: "no-store" });
  if (!response.ok) throw new Error("系统配置加载失败");
  const body = (await response.json()) as { data: { items: { key: string; value: unknown }[] } };
  return body.data;
}

export async function patchAdminConfig(key: string, value: unknown) {
  const response = await adminApiFetch("/api/admin/config", { method: "PATCH", body: JSON.stringify({ key, value }) });
  if (!response.ok) throw new Error("更新配置失败");
  const body = (await response.json()) as { data: { items: { key: string; value: unknown }[] } };
  return body.data;
}
