import type {
  FeedDetailResponse,
  FeedListResponse,
  FeedTab,
  InsightDetailResponse,
  KolListResponse,
  NarrativeDetailResponse,
  NarrativeListResponse,
  TokenListResponse,
  TrendingResponse,
  WatchlistListResponse,
  WatchlistTargetType
} from "@cryptopilot/types";
import { apiFetch } from "./api-fetch";
import { buildUserHeaders } from "./api-headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3002";

export async function getFeed(
  tab: FeedTab = "for_you",
  cursor?: string,
  narrative?: string,
  entity: "insight" | "feed_item" = "insight"
): Promise<FeedListResponse["data"]> {
  const params = new URLSearchParams({ tab });
  if (cursor) params.set("cursor", cursor);
  if (narrative) params.set("narrative", narrative);
  if (entity === "feed_item") {
    params.set("entity", "feed_item");
    params.set("locale", "zh");
  }
  const response = await apiFetch(`${apiUrl}/api/feed?${params.toString()}`, {
    cache: "no-store",
    headers: buildUserHeaders()
  });
  if (!response.ok) throw new Error("Feed 加载失败");
  const body = (await response.json()) as FeedListResponse;
  return body.data;
}

export async function getInsightDetail(id: string): Promise<InsightDetailResponse["data"]> {
  const response = await apiFetch(`${apiUrl}/api/insights/${id}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Insight 详情加载失败");
  const body = (await response.json()) as InsightDetailResponse;
  return body.data;
}

export async function getFeedDetail(id: string): Promise<FeedDetailResponse["data"]> {
  const response = await apiFetch(`${apiUrl}/api/feed/${id}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Feed 详情加载失败");
  const body = (await response.json()) as FeedDetailResponse;
  return body.data;
}

export async function getTrending(): Promise<TrendingResponse["data"]> {
  const response = await apiFetch(`${apiUrl}/api/trending`, { cache: "no-store" });
  if (!response.ok) throw new Error("趋势数据加载失败");
  const body = (await response.json()) as TrendingResponse;
  return body.data;
}

export async function createBookmark(feedItemId: string) {
  const response = await apiFetch(`${apiUrl}/api/bookmarks`, {
    method: "POST",
    headers: buildUserHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ feed_item_id: feedItemId })
  });
  if (!response.ok) throw new Error("收藏失败");
}

export async function createInsightBookmark(insightId: string) {
  const response = await apiFetch(`${apiUrl}/api/bookmarks`, {
    method: "POST",
    headers: buildUserHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ insight_id: insightId })
  });
  if (!response.ok) throw new Error("收藏失败");
}

export async function deleteBookmark(feedItemId: string) {
  const response = await apiFetch(`${apiUrl}/api/bookmarks/${feedItemId}`, {
    method: "DELETE",
    headers: buildUserHeaders()
  });
  if (!response.ok) throw new Error("取消收藏失败");
}

export async function getNarratives(sort: "hottest" | "rising" | "discussed" = "hottest") {
  const response = await apiFetch(`${apiUrl}/api/narratives?sort=${sort}`, {
    cache: "no-store",
    headers: buildUserHeaders()
  });
  if (!response.ok) throw new Error("Narrative 列表加载失败");
  const body = (await response.json()) as NarrativeListResponse;
  return body.data;
}

export async function getNarrativeDetail(slug: string) {
  const response = await apiFetch(`${apiUrl}/api/narratives/${slug}`, {
    cache: "no-store",
    headers: buildUserHeaders()
  });
  if (!response.ok) throw new Error("Narrative 详情加载失败");
  const body = (await response.json()) as NarrativeDetailResponse;
  return body.data;
}

export async function getWatchlist() {
  const response = await apiFetch(`${apiUrl}/api/watchlist`, {
    cache: "no-store",
    headers: buildUserHeaders()
  });
  if (!response.ok) throw new Error("关注列表加载失败");
  const body = (await response.json()) as WatchlistListResponse;
  return body.data;
}

export async function addWatchlist(targetType: WatchlistTargetType, targetId: string) {
  const response = await apiFetch(`${apiUrl}/api/watchlist`, {
    method: "POST",
    headers: buildUserHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ target_type: targetType, target_id: targetId })
  });
  if (!response.ok) throw new Error("关注失败");
  const body = (await response.json()) as { data: { id: string } };
  return body.data;
}

export async function patchWatchlistNotification(id: string, enabled: boolean) {
  const response = await apiFetch(`${apiUrl}/api/watchlist/${id}/notification`, {
    method: "PATCH",
    headers: buildUserHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ notifications_enabled: enabled })
  });
  if (!response.ok) throw new Error("更新通知设置失败");
  const body = (await response.json()) as { data: WatchlistListResponse["data"]["items"][number] };
  return body.data;
}

export async function removeWatchlist(id: string) {
  const response = await apiFetch(`${apiUrl}/api/watchlist/${id}`, {
    method: "DELETE",
    headers: buildUserHeaders()
  });
  if (!response.ok) throw new Error("取消关注失败");
}

export async function getTokens() {
  const response = await apiFetch(`${apiUrl}/api/tokens`, { cache: "no-store" });
  if (!response.ok) throw new Error("Token 列表加载失败");
  const body = (await response.json()) as TokenListResponse;
  return body.data;
}

export async function getKols() {
  const response = await apiFetch(`${apiUrl}/api/kols`, { cache: "no-store" });
  if (!response.ok) throw new Error("KOL 列表加载失败");
  const body = (await response.json()) as KolListResponse;
  return body.data;
}
