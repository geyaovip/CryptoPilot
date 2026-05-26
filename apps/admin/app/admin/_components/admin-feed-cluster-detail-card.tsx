"use client";

import type { AdminFeedClusterSummary } from "@cryptopilot/types";
import { Button, Card } from "@cryptopilot/ui";
import { removeFeedFromCluster, setClusterRepresentative } from "../../lib/api";

type Props = {
  cluster: AdminFeedClusterSummary;
  pending: boolean;
  run: (action: () => Promise<unknown>, success: string) => Promise<void>;
  onDissolve: () => Promise<unknown>;
};

export function AdminFeedClusterDetailCard({ cluster, pending, run, onDissolve }: Props) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">当前簇详情</p>
        <p className="mt-1 break-all font-mono text-xs text-slate-700">{cluster.cluster_id}</p>
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-[#20808D]/20 bg-[#20808D]/5 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#20808D]">代表条（首页卡片主文案）</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">{cluster.member_count} 条成员</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-800">
            {cluster.representative.narrative_hook || cluster.representative.ai_summary}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {["成员", "来源", "时间", "操作"].map((column) => (
                  <th className="border-b border-slate-200 px-3 py-2 font-medium" key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cluster.members.map((member) => {
                const isLead = member.is_cluster_lead || member.id === cluster.representative.id;
                return (
                  <tr className="border-b border-slate-100 align-top last:border-0" key={member.id}>
                    <td className="max-w-[240px] px-3 py-2">
                      <p className="line-clamp-2 text-slate-800">{member.narrative_hook || member.ai_summary}</p>
                      {isLead ? (
                        <span className="mt-1 inline-flex rounded-full bg-[#20808D]/10 px-2 py-0.5 text-xs font-medium text-[#20808D]">
                          代表条
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{member.source_name}</td>
                    <td className="px-3 py-2 text-slate-600">{new Date(member.publish_time).toLocaleString("zh-CN")}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        {!isLead ? (
                          <button
                            className="text-left text-xs text-[#20808D]"
                            disabled={pending}
                            onClick={() => run(() => setClusterRepresentative(cluster.cluster_id, member.id), "已更新代表条")}
                            type="button"
                          >
                            设为代表
                          </button>
                        ) : null}
                        <button
                          className="text-left text-xs text-slate-600"
                          disabled={pending}
                          onClick={() => run(() => removeFeedFromCluster(member.id), "已移出簇")}
                          type="button"
                        >
                          移出簇
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Button className="w-full border-red-200 text-red-600 hover:bg-red-50" disabled={pending} onClick={() => run(onDissolve, "簇已解散")} type="button">
          解散此簇
        </Button>
      </div>
    </Card>
  );
}
