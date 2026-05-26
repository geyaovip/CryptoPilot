"use client";

import type { AdminFeedClusterSummary } from "@cryptopilot/types";
import { Button, Card } from "@cryptopilot/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminFeedClusterFilters } from "../../lib/api";
import {
  dissolveAdminFeedCluster,
  reassignAdminFeedClusters
} from "../../lib/api";
import { AdminFeedClusterDetailCard } from "./admin-feed-cluster-detail-card";

type Props = {
  items: AdminFeedClusterSummary[];
  filters: AdminFeedClusterFilters;
  total: number;
  page: number;
  pageLimit: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
};

function buildQuery(filters: AdminFeedClusterFilters, page?: number) {
  const params = new URLSearchParams();
  if (filters.cluster_id) params.set("cluster_id", filters.cluster_id);
  if (filters.limit) params.set("limit", filters.limit);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function AdminFeedClustersPanel({
  items,
  filters,
  total,
  page,
  pageLimit,
  totalPages,
  hasPrev,
  hasNext
}: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.cluster_id ?? null);
  const selectedCluster = items.find((cluster) => cluster.cluster_id === selectedId) ?? items[0] ?? null;

  const run = async (action: () => Promise<unknown>, success: string) => {
    setPending(true);
    setMessage("");
    try {
      await action();
      setMessage(success);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-950">Feed 簇管理</h1>
            <p className="mt-1 text-sm text-slate-500">
              管理多来源聚合结果：检查簇是否合理、选择首页代表条、移出误归类成员或解散整簇。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={pending}
              onClick={() => run(async () => { await reassignAdminFeedClusters(); }, "已重新自动聚类")}
              type="button"
            >
              重新自动聚类
            </Button>
          </div>
        </div>
        {message ? <p className="mt-2 text-sm text-[#20808D]">{message}</p> : null}
      </Card>

      <Card className="p-4">
        <form
          className="grid gap-3 md:grid-cols-[1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const clusterId = String(form.get("cluster_id") ?? "").trim();
            router.push(clusterId ? `/admin/feed-clusters?cluster_id=${clusterId}` : "/admin/feed-clusters");
          }}
        >
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            defaultValue={filters.cluster_id ?? ""}
            name="cluster_id"
            placeholder="按 cluster_id (UUID) 筛选"
          />
          <Button disabled={pending} type="submit">
            筛选
          </Button>
          <Button disabled={pending} onClick={() => router.push("/admin/feed-clusters")} type="button">
            重置
          </Button>
        </form>
      </Card>

      {items.length === 0 ? (
        <Card className="p-6 text-sm text-slate-500">
          暂无满足多来源聚合条件的 Feed 簇。可点击「重新自动聚类」刷新聚合结果。
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    {["簇", "成员", "叙事", "代表来源", "热度", "发布时间", "操作"].map((column) => (
                      <th className="border-b border-slate-200 px-4 py-3 font-medium" key={column}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((cluster) => {
                    const active = selectedCluster?.cluster_id === cluster.cluster_id;
                    return (
                      <tr
                        className={active ? "border-b border-slate-100 bg-[#20808D]/5 align-top" : "border-b border-slate-100 align-top"}
                        key={cluster.cluster_id}
                      >
                        <td className="px-4 py-3">
                          <button
                            className="font-mono text-xs text-[#20808D] hover:underline"
                            onClick={() => setSelectedId(cluster.cluster_id)}
                            type="button"
                          >
                            {cluster.cluster_id.slice(0, 8)}
                          </button>
                          {active ? <p className="mt-1 text-[11px] text-[#20808D]">当前查看</p> : null}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{cluster.member_count}</td>
                        <td className="max-w-[180px] px-4 py-3 text-slate-700">
                          {cluster.narrative_names.length > 0 ? cluster.narrative_names.join("、") : "未打叙事标签"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{cluster.representative.source_name}</td>
                        <td className="px-4 py-3 text-slate-700">{cluster.representative.heat_score}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {new Date(cluster.representative.publish_time).toLocaleString("zh-CN")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button className="text-[#20808D]" onClick={() => setSelectedId(cluster.cluster_id)} type="button">
                              查看
                            </button>
                            <button
                              className="text-red-600"
                              disabled={pending}
                              onClick={() => run(() => dissolveAdminFeedCluster(cluster.cluster_id), "簇已解散")}
                              type="button"
                            >
                              解散
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-sm text-slate-600">
                共 {total} 个簇 · 第 {page}/{totalPages || 1} 页
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={pending || !hasPrev}
                  onClick={() => router.push(`/admin/feed-clusters${buildQuery(filters, page - 1)}`)}
                  type="button"
                >
                  上一页
                </Button>
                <Button
                  disabled={pending || !hasNext}
                  onClick={() => router.push(`/admin/feed-clusters${buildQuery(filters, page + 1)}`)}
                  type="button"
                >
                  下一页
                </Button>
              </div>
            </div>
          </Card>

          {selectedCluster ? (
            <AdminFeedClusterDetailCard
              cluster={selectedCluster}
              onDissolve={() => dissolveAdminFeedCluster(selectedCluster.cluster_id)}
              pending={pending}
              run={run}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
