import type { MarketInsightDetail, MarketInsightSummary } from "@cryptopilot/types";
import { adminApiFetch, type AdminListData, type AdminPaginationFilters, toQuery } from "./admin-api-core";

export type AdminInsightFilters = AdminPaginationFilters & {
  search?: string;
};

export async function getAdminInsights(filters: AdminInsightFilters = {}): Promise<AdminListData<MarketInsightSummary>> {
  const response = await adminApiFetch(`/api/admin/insights${toQuery(filters)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Insight 管理数据加载失败");
  const body = (await response.json()) as { data: AdminListData<MarketInsightSummary> };
  return body.data;
}

export async function getAdminInsightDetail(id: string): Promise<MarketInsightDetail> {
  const response = await adminApiFetch(`/api/admin/insights/${id}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Insight 详情加载失败");
  const body = (await response.json()) as { data: MarketInsightDetail };
  return body.data;
}

export async function resynthesizeAdminInsight(id: string) {
  const response = await adminApiFetch(`/api/admin/insights/${id}/resynthesize`, { method: "POST" });
  if (!response.ok) throw new Error("Insight 重新合成失败");
}

export async function updateAdminInsightTitle(id: string, aiInsight: string) {
  const response = await adminApiFetch(`/api/admin/insights/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aiInsight })
  });
  if (!response.ok) throw new Error("Insight 标题修改失败");
}
