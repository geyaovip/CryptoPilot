import type {
  AdminFeedClusterListData,
  AdminFeedClusterSummary,
  AiMonitorResponse,
  FeedItemSummary,
  IngestionLogListResponse,
  MvpPromptKey,
  PromptListResponse,
  SourceListResponse
} from "@cryptopilot/types";

import { apiFetch } from "./api-fetch";
import { adminHeaders } from "./admin-headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3002";

export type AdminFeedFilters = {
  status?: string;
  source_id?: string;
  type?: string;
  published_from?: string;
  published_to?: string;
  page?: string;
  limit?: string;
};

function toQuery(filters: AdminFeedFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export type AdminFeedListData = {
  items: FeedItemSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
};

export async function getAdminFeed(filters: AdminFeedFilters = {}): Promise<AdminFeedListData> {
  const response = await apiFetch(`${apiUrl}/api/admin/feed${toQuery(filters)}`, {
    cache: "no-store",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("Feed 管理数据加载失败");
  const body = (await response.json()) as { data: AdminFeedListData };
  return body.data;
}

export async function getAdminSources(): Promise<SourceListResponse["data"]> {
  const response = await apiFetch(`${apiUrl}/api/admin/sources`, {
    cache: "no-store",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("Source 数据加载失败");
  const body = (await response.json()) as SourceListResponse;
  return body.data;
}

export async function getSourceLogs(sourceId: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/sources/${sourceId}/logs`, {
    cache: "no-store",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("采集日志加载失败");
  const body = (await response.json()) as IngestionLogListResponse;
  return body.data;
}

export async function createAdminFeed(input: { title: string; content: string; source_url: string }) {
  const response = await apiFetch(`${apiUrl}/api/admin/feed`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error("创建 Feed 失败");
}

export async function updateAdminFeed(id: string, input: { title?: string; ai_summary?: string }) {
  const response = await apiFetch(`${apiUrl}/api/admin/feed/${id}`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error("更新 Feed 失败");
}

export async function pinAdminFeed(id: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/feed/${id}/pin`, { method: "POST", headers: await adminHeaders() });
  if (!response.ok) throw new Error("置顶操作失败");
}

export async function hideAdminFeed(id: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/feed/${id}/hide`, { method: "POST", headers: await adminHeaders() });
  if (!response.ok) throw new Error("隐藏操作失败");
}

export async function deleteAdminFeed(id: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/feed/${id}`, { method: "DELETE", headers: await adminHeaders() });
  if (!response.ok) throw new Error("删除 Feed 失败");
}

export type AdminFeedClusterFilters = { page?: string; limit?: string; cluster_id?: string };

export async function getAdminFeedClusters(
  filters: AdminFeedClusterFilters = {}
): Promise<AdminFeedClusterListData> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  const response = await apiFetch(`${apiUrl}/api/admin/feed/clusters${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("Feed 簇列表加载失败");
  const body = (await response.json()) as { data: AdminFeedClusterListData };
  return body.data;
}

export async function reassignAdminFeedClusters() {
  const response = await apiFetch(`${apiUrl}/api/admin/feed/clusters/reassign`, {
    method: "POST",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("重新聚类失败");
  return (await response.json()) as { data: { clusters: number; linked: number } };
}

export async function setClusterRepresentative(clusterId: string, feedItemId: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/feed/clusters/${clusterId}/representative`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify({ feed_item_id: feedItemId })
  });
  if (!response.ok) throw new Error("设置代表条失败");
  return (await response.json()) as { data: AdminFeedClusterSummary };
}

export async function dissolveAdminFeedCluster(clusterId: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/feed/clusters/${clusterId}/dissolve`, {
    method: "POST",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("解散簇失败");
}

export async function removeFeedFromCluster(feedItemId: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/feed/${feedItemId}/cluster`, {
    method: "DELETE",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("移出簇失败");
}

export async function updateAdminSource(id: string, status: "active" | "paused") {
  const response = await apiFetch(`${apiUrl}/api/admin/sources/${id}`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error("更新数据源失败");
}

export async function retryAdminSource(id: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/sources/${id}/retry`, { method: "POST", headers: await adminHeaders() });
  if (!response.ok) throw new Error("手动重试失败");
}

export async function getAdminPrompts(): Promise<PromptListResponse["data"]["items"]> {
  const response = await apiFetch(`${apiUrl}/api/admin/prompts`, { cache: "no-store", headers: await adminHeaders() });
  if (!response.ok) throw new Error("Prompt 列表加载失败");
  const body = (await response.json()) as PromptListResponse;
  return body.data.items;
}

export async function createPrompt(input: { prompt_key: MvpPromptKey; content: string }) {
  const response = await apiFetch(`${apiUrl}/api/admin/prompts`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error("创建 Prompt 失败");
}

export async function updatePrompt(id: string, content: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/prompts/${id}`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify({ content })
  });
  if (!response.ok) throw new Error("更新 Prompt 失败");
}

export async function activatePrompt(id: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/prompts/${id}/activate`, {
    method: "PATCH",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("激活 Prompt 失败");
}

export async function archivePrompt(id: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/prompts/${id}/archive`, {
    method: "PATCH",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("归档 Prompt 失败");
}

export async function testPrompt(id: string, variables: Record<string, string>) {
  const response = await apiFetch(`${apiUrl}/api/admin/prompts/${id}/test`, {
    method: "POST",
    headers: await adminHeaders(),
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
  pushes_note: string;
  llm_calls_today: number;
  llm_error_rate: number;
  tokens_today: number;
  cost_usd_today: number;
  ingestion_failures_today: number;
  sources: {
    active: number;
    paused: number;
    error: number;
    items: Array<{
      id: string;
      name: string;
      status: string;
      last_success_at: string | null;
      last_error_at: string | null;
    }>;
  };
  top_narratives: Array<{
    id: string;
    name: string;
    slug: string;
    heat_score: number;
    feed_count_24h: number;
  }>;
};

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response = await apiFetch(`${apiUrl}/api/admin/dashboard`, { cache: "no-store", headers: await adminHeaders() });
  if (!response.ok) throw new Error("仪表盘数据加载失败");
  const body = (await response.json()) as { data: AdminDashboardData };
  return body.data;
}

export async function getAiMonitor() {
  const response = await apiFetch(`${apiUrl}/api/admin/ai-monitor`, { cache: "no-store", headers: await adminHeaders() });
  if (!response.ok) throw new Error("AI 监控数据加载失败");
  const body = (await response.json()) as AiMonitorResponse;
  return body.data;
}

export async function getAdminNarratives() {
  const response = await apiFetch(`${apiUrl}/api/admin/narratives`, { cache: "no-store", headers: await adminHeaders() });
  if (!response.ok) throw new Error("Narrative 管理数据加载失败");
  const body = (await response.json()) as {
    data: {
      items: {
        id: string;
        name: string;
        slug: string;
        is_active: boolean;
        heat_score: number;
        weight: number;
        ai_summary: string | null;
      }[];
    };
  };
  return body.data;
}

export async function getAdminTokens() {
  const response = await apiFetch(`${apiUrl}/api/admin/tokens`, { cache: "no-store", headers: await adminHeaders() });
  if (!response.ok) throw new Error("资产管理数据加载失败");
  const body = (await response.json()) as {
    data: { items: { id: string; symbol: string; name: string; is_active: boolean }[] };
  };
  return body.data;
}

export async function getAdminKols() {
  const response = await apiFetch(`${apiUrl}/api/admin/kols`, { cache: "no-store", headers: await adminHeaders() });
  if (!response.ok) throw new Error("观点源管理数据加载失败");
  const body = (await response.json()) as {
    data: { items: { id: string; name: string; handle: string; is_active: boolean }[] };
  };
  return body.data;
}

export type AdminUserItem = {
  id: string;
  uid: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin";
  disabled_at: string | null;
  daily_ai_search_count: number;
  created_at: string;
};

export async function getAdminUsers() {
  const response = await apiFetch(`${apiUrl}/api/admin/users`, { cache: "no-store", headers: await adminHeaders() });
  if (!response.ok) throw new Error("用户列表加载失败");
  const body = (await response.json()) as { data: { items: AdminUserItem[] } };
  return body.data;
}

export async function createAdminNarrative(input: {
  name: string;
  slug: string;
  is_active?: boolean;
}) {
  const response = await apiFetch(`${apiUrl}/api/admin/narratives`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error("创建 Narrative 失败");
}

export async function updateAdminNarrative(
  id: string,
  input: { is_active?: boolean; ai_summary?: string; weight?: number; name?: string; slug?: string }
) {
  const response = await apiFetch(`${apiUrl}/api/admin/narratives/${id}`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error("更新 Narrative 失败");
}

export async function mergeAdminNarratives(sourceId: string, targetId: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/narratives/${sourceId}/merge`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify({ target_narrative_id: targetId })
  });
  if (!response.ok) throw new Error("合并 Narrative 失败");
}

export async function regenerateAdminNarrativeAi(id: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/narratives/${id}/regenerate-ai`, {
    method: "POST",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("重生 Narrative AI 失败");
}

export async function updateAdminToken(id: string, input: { symbol?: string; is_active?: boolean }) {
  const response = await apiFetch(`${apiUrl}/api/admin/tokens/${id}`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error("更新 Token 失败");
}

export async function refreshAdminToken(id: string) {
  const response = await apiFetch(`${apiUrl}/api/admin/tokens/${id}/refresh`, {
    method: "POST",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("刷新 Token 失败");
}

export async function createAdminKol(input: {
  name: string;
  handle: string;
  platform: "twitter" | "youtube" | "other";
  is_active?: boolean;
}) {
  const response = await apiFetch(`${apiUrl}/api/admin/kols`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error("创建 KOL 失败");
}

export async function updateAdminKol(id: string, input: { is_active?: boolean; influence_score?: number }) {
  const response = await apiFetch(`${apiUrl}/api/admin/kols/${id}`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify(input)
  });
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

export async function getAdminLogs(filters: { type?: string; from?: string; to?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.limit) params.set("limit", String(filters.limit));
  const query = params.toString();
  const response = await apiFetch(`${apiUrl}/api/admin/logs${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: await adminHeaders()
  });
  if (!response.ok) throw new Error("日志加载失败");
  const body = (await response.json()) as { data: { items: AdminLogItem[] } };
  return body.data;
}

export async function getAdminConfig() {
  const response = await apiFetch(`${apiUrl}/api/admin/config`, { cache: "no-store", headers: await adminHeaders() });
  if (!response.ok) throw new Error("系统配置加载失败");
  const body = (await response.json()) as { data: { items: { key: string; value: unknown }[] } };
  return body.data;
}

export async function patchAdminConfig(key: string, value: unknown) {
  const response = await apiFetch(`${apiUrl}/api/admin/config`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify({ key, value })
  });
  if (!response.ok) throw new Error("更新配置失败");
  const body = (await response.json()) as { data: { items: { key: string; value: unknown }[] } };
  return body.data;
}

export type { FeedItemSummary };
