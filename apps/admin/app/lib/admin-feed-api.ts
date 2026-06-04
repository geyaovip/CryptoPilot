import type {
  AdminFeedClusterListData,
  AdminFeedClusterSummary,
  FeedItemSummary,
  IngestionLogListResponse,
  SourceListResponse
} from "@cryptopilot/types";
import { adminApiFetch, type AdminListData, type AdminPaginationFilters, toQuery } from "./admin-api-core";

export type AdminFeedFilters = {
  status?: string;
  source_id?: string;
  type?: string;
  published_from?: string;
  published_to?: string;
  page?: string;
  limit?: string;
};

export type AdminFeedListData = AdminListData<FeedItemSummary>;

export async function getAdminFeed(filters: AdminFeedFilters = {}): Promise<AdminFeedListData> {
  const response = await adminApiFetch(`/api/admin/feed${toQuery(filters)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Feed 管理数据加载失败");
  const body = (await response.json()) as { data: AdminFeedListData };
  return body.data;
}

export async function createAdminFeed(input: { title: string; content: string; source_url: string }) {
  const response = await adminApiFetch("/api/admin/feed", { method: "POST", body: JSON.stringify(input) });
  if (!response.ok) throw new Error("创建 Feed 失败");
}

export async function updateAdminFeed(id: string, input: { title?: string; ai_summary?: string }) {
  const response = await adminApiFetch(`/api/admin/feed/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!response.ok) throw new Error("更新 Feed 失败");
}

export async function pinAdminFeed(id: string) {
  const response = await adminApiFetch(`/api/admin/feed/${id}/pin`, { method: "POST" });
  if (!response.ok) throw new Error("置顶操作失败");
}

export async function hideAdminFeed(id: string) {
  const response = await adminApiFetch(`/api/admin/feed/${id}/hide`, { method: "POST" });
  if (!response.ok) throw new Error("隐藏操作失败");
}

export async function deleteAdminFeed(id: string) {
  const response = await adminApiFetch(`/api/admin/feed/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("删除 Feed 失败");
}

export type AdminFeedClusterFilters = { page?: string; limit?: string; cluster_id?: string };

export async function getAdminFeedClusters(filters: AdminFeedClusterFilters = {}): Promise<AdminFeedClusterListData> {
  const response = await adminApiFetch(`/api/admin/feed/clusters${toQuery(filters)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Feed 簇列表加载失败");
  const body = (await response.json()) as { data: AdminFeedClusterListData };
  return body.data;
}

export async function reassignAdminFeedClusters() {
  const response = await adminApiFetch("/api/admin/feed/clusters/reassign", { method: "POST" });
  if (!response.ok) throw new Error("重新聚类失败");
  return (await response.json()) as { data: { clusters: number; linked: number } };
}

export async function setClusterRepresentative(clusterId: string, feedItemId: string) {
  const response = await adminApiFetch(`/api/admin/feed/clusters/${clusterId}/representative`, {
    method: "PATCH",
    body: JSON.stringify({ feed_item_id: feedItemId })
  });
  if (!response.ok) throw new Error("设置代表条失败");
  return (await response.json()) as { data: AdminFeedClusterSummary };
}

export async function dissolveAdminFeedCluster(clusterId: string) {
  const response = await adminApiFetch(`/api/admin/feed/clusters/${clusterId}/dissolve`, { method: "POST" });
  if (!response.ok) throw new Error("解散簇失败");
}

export async function removeFeedFromCluster(feedItemId: string) {
  const response = await adminApiFetch(`/api/admin/feed/${feedItemId}/cluster`, { method: "DELETE" });
  if (!response.ok) throw new Error("移出簇失败");
}

export async function getAdminSources(
  filters: AdminPaginationFilters = {}
): Promise<AdminListData<SourceListResponse["data"]["items"][number]>> {
  const response = await adminApiFetch(`/api/admin/sources${toQuery(filters)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Source 数据加载失败");
  const body = (await response.json()) as { data: AdminListData<SourceListResponse["data"]["items"][number]> };
  return body.data;
}

export async function getSourceLogs(sourceId: string) {
  const response = await adminApiFetch(`/api/admin/sources/${sourceId}/logs`, { cache: "no-store" });
  if (!response.ok) throw new Error("采集日志加载失败");
  const body = (await response.json()) as IngestionLogListResponse;
  return body.data;
}

export async function updateAdminSource(id: string, status: "active" | "paused" | "error") {
  const response = await adminApiFetch(`/api/admin/sources/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error("更新数据源失败");
}

export async function retryAdminSource(id: string) {
  const response = await adminApiFetch(`/api/admin/sources/${id}/retry`, { method: "POST" });
  if (!response.ok) throw new Error("手动重试失败");
}

export type { FeedItemSummary };
