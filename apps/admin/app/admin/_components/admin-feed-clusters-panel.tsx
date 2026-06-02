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
  const [selectedCluster, setSelectedCluster] = useState<AdminFeedClusterSummary | null>(null);

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
            <h2 className="text-sm font-semibold text-slate-950">聚类操作</h2>
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
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-950">簇列表</h2>
            <p className="mt-1 text-xs text-slate-500">点击「查看详情」打开成员与代表条操作，不会离开当前列表。</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
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
                {items.map((cluster) => (
                  <tr className="border-b border-slate-100 align-top" key={cluster.cluster_id}>
                    <td className="px-4 py-3">
                      <button
                        className="font-mono text-xs text-[#20808D] hover:underline"
                        onClick={() => setSelectedCluster(cluster)}
                        type="button"
                      >
                        {cluster.cluster_id.slice(0, 8)}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{cluster.member_count}</td>
                    <td className="max-w-[320px] px-4 py-3 text-slate-700">
                      {cluster.narrative_names.length > 0 ? cluster.narrative_names.join("、") : "未打叙事标签"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{cluster.representative.source_name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{cluster.representative.heat_score}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {new Date(cluster.representative.publish_time).toLocaleString("zh-CN")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="text-[#20808D]" onClick={() => setSelectedCluster(cluster)} type="button">
                          查看详情
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
                ))}
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
      )}

      {selectedCluster ? (
        <ClusterDetailModal
          cluster={selectedCluster}
          onClose={() => setSelectedCluster(null)}
          onDissolve={() => dissolveAdminFeedCluster(selectedCluster.cluster_id)}
          pending={pending}
          run={run}
        />
      ) : null}
    </div>
  );
}

function ClusterDetailModal({
  cluster,
  pending,
  run,
  onDissolve,
  onClose
}: {
  cluster: AdminFeedClusterSummary;
  pending: boolean;
  run: (action: () => Promise<unknown>, success: string) => Promise<void>;
  onDissolve: () => Promise<unknown>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="max-h-[88vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">内容聚类详情</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-700">{cluster.cluster_id}</p>
          </div>
          <button
            aria-label="关闭详情弹窗"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#20808D]/30"
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-5">
          <AdminFeedClusterDetailCard cluster={cluster} onDissolve={onDissolve} pending={pending} run={run} />
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
