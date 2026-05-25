"use client";

import type { AdminFeedClusterSummary } from "@cryptopilot/types";
import { Button, Card } from "@cryptopilot/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminFeedClusterFilters } from "../../lib/api";
import {
  dissolveAdminFeedCluster,
  reassignAdminFeedClusters,
  removeFeedFromCluster,
  setClusterRepresentative
} from "../../lib/api";

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
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.cluster_id ?? null);

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
              查看多来源聚合簇、指定代表条（首页卡片主文案来源）、解散簇或移出成员。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="text-sm text-[#20808D] hover:underline" href="/admin/feed">
              ← Feed 列表
            </Link>
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
          className="flex flex-wrap gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const clusterId = String(form.get("cluster_id") ?? "").trim();
            router.push(clusterId ? `/admin/feed-clusters?cluster_id=${clusterId}` : "/admin/feed-clusters");
          }}
        >
          <input
            className="min-w-[280px] flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            defaultValue={filters.cluster_id ?? ""}
            name="cluster_id"
            placeholder="按 cluster_id (UUID) 筛选"
          />
          <Button disabled={pending} type="submit">
            筛选
          </Button>
        </form>
      </Card>

      {items.length === 0 ? (
        <Card className="p-6 text-sm text-slate-500">暂无 ≥2 条的 Feed 簇。可点击「重新自动聚类」或执行根目录 `pnpm db:cluster-assign`。</Card>
      ) : (
        items.map((cluster) => (
          <Card className="overflow-hidden p-0" key={cluster.cluster_id}>
            <button
              className="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-left"
              onClick={() =>
                setExpandedId(expandedId === cluster.cluster_id ? null : cluster.cluster_id)
              }
              type="button"
            >
              <div>
                <p className="font-mono text-xs text-slate-500">{cluster.cluster_id}</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {cluster.member_count} 条来源 · {cluster.narrative_names.join("、") || "未打叙事标签"}
                </p>
              </div>
              <span className="text-xs text-slate-500">{expandedId === cluster.cluster_id ? "收起" : "展开"}</span>
            </button>
            {expandedId === cluster.cluster_id ? (
              <div className="space-y-4 p-4">
                <div className="rounded-lg border border-[#20808D]/20 bg-[#20808D]/5 p-3">
                  <p className="text-xs font-medium text-[#20808D]">当前代表条（列表主文案）</p>
                  <p className="mt-1 text-sm text-slate-800">
                    {cluster.representative.narrative_hook || cluster.representative.ai_summary}
                  </p>
                </div>
                <ul>
                  {cluster.members.map((member) => (
                    <li
                      className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 py-2 last:border-0"
                      key={member.id}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-800 line-clamp-2">
                          {member.narrative_hook || member.ai_summary}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {member.source_name} · {new Date(member.publish_time).toLocaleString("zh-CN")}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {member.is_cluster_lead || member.id === cluster.representative.id ? (
                          <span className="rounded-full bg-[#20808D]/10 px-2 py-0.5 text-xs font-medium text-[#20808D]">
                            代表条
                          </span>
                        ) : (
                          <button
                            className="text-xs text-[#20808D]"
                            disabled={pending}
                            onClick={() =>
                              run(
                                () => setClusterRepresentative(cluster.cluster_id, member.id),
                                "已更新代表条"
                              )
                            }
                            type="button"
                          >
                            设为代表
                          </button>
                        )}
                        <button
                          className="text-xs text-slate-600"
                          disabled={pending}
                          onClick={() =>
                            run(() => removeFeedFromCluster(member.id), "已移出簇")
                          }
                          type="button"
                        >
                          移出
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={pending}
                  onClick={() =>
                    run(() => dissolveAdminFeedCluster(cluster.cluster_id), "簇已解散")
                  }
                  type="button"
                >
                  解散此簇
                </Button>
              </div>
            ) : null}
          </Card>
        ))
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
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
    </div>
  );
}
