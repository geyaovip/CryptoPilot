"use client";

import type { MarketInsightDetail, MarketInsightSummary } from "@cryptopilot/types";
import { Button, Card } from "@cryptopilot/ui";
import { useState } from "react";
import { getAdminInsightDetail, resynthesizeAdminInsight } from "../../lib/api";
import { AdminPagination } from "./admin-pagination";

type AdminInsightsPanelProps = {
  data: {
    items: MarketInsightSummary[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_prev: boolean;
    has_next: boolean;
  };
};

const heatLabels: Record<MarketInsightSummary["heat_label"], string> = {
  heating_up: "升温中",
  cooling: "降温中",
  stable: "平稳"
};

const sentimentLabels: Record<MarketInsightSummary["sentiment"], string> = {
  bullish: "偏积极",
  neutral: "中性",
  bearish: "偏谨慎"
};

export function AdminInsightsPanel({ data }: AdminInsightsPanelProps) {
  const [selected, setSelected] = useState<MarketInsightDetail | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadDetail(id: string) {
    setPendingId(id);
    setMessage("");
    try {
      setSelected(await getAdminInsightDetail(id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Insight 详情加载失败");
    } finally {
      setPendingId(null);
    }
  }

  async function resynthesize(id: string) {
    setPendingId(id);
    setMessage("");
    try {
      await resynthesizeAdminInsight(id);
      setMessage("已触发重新合成，稍后刷新查看最新结果。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "重新合成失败");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h1 className="text-lg font-semibold text-slate-950">Insight 管理</h1>
        <p className="mt-1 text-sm text-slate-500">
          用于核验 Market Intelligence 的来源、关联信号和 AI 合成质量；发布前至少需要 2 个可点击来源。
        </p>
        {message ? <p className="mt-2 text-sm text-[#20808D]">{message}</p> : null}
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {["Insight", "情绪", "热度", "叙事", "来源", "操作"].map((column) => (
                    <th className="border-b border-slate-200 px-4 py-3 font-medium" key={column}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-slate-500" colSpan={6}>
                      暂无 Insight。
                    </td>
                  </tr>
                ) : (
                  data.items.map((item) => (
                    <tr className="border-b border-slate-100 align-top" key={item.id}>
                      <td className="max-w-[360px] px-4 py-3">
                        <p className="font-medium leading-6 text-slate-950">{item.ai_insight}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.ai_summary}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{sentimentLabels[item.sentiment]}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.heat_score}
                        <span className="ml-2 text-xs text-slate-500">{heatLabels[item.heat_label]}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.primary_narrative?.name ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.source_count}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button className="text-[#20808D]" disabled={pendingId === item.id} onClick={() => loadDetail(item.id)} type="button">
                            查看
                          </button>
                          <button className="text-slate-700" disabled={pendingId === item.id} onClick={() => resynthesize(item.id)} type="button">
                            重新合成
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-[#20808D]">Insight 详情</p>
                <h2 className="mt-1 text-base font-semibold leading-7 text-slate-950">{selected.ai_insight}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selected.ai_summary}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">关键原因</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {selected.key_reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
              {selected.market_impact ? (
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">市场影响</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selected.market_impact}</p>
                </div>
              ) : null}
              <div>
                <h3 className="text-sm font-semibold text-slate-950">来源</h3>
                <div className="mt-2 space-y-2">
                  {selected.sources.map((source) => (
                    <a className="block rounded-lg border border-slate-200 p-3 text-sm text-[#20808D]" href={source.source_url} key={source.feed_item_id} rel="noopener noreferrer" target="_blank">
                      {source.source_name} · {source.title}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">关联信号</h3>
                <p className="mt-2 text-sm text-slate-500">{selected.signals.length} 条 Feed 信号参与合成。</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm leading-6 text-slate-500">
              选择左侧 Insight 后，可在这里查看来源、关键原因和关联信号。
            </div>
          )}
        </Card>
      </div>

      <AdminPagination
        basePath="/admin/insights"
        hasNext={data.has_next}
        hasPrev={data.has_prev}
        limit={data.limit}
        page={data.page}
        total={data.total}
        totalPages={data.total_pages}
      />
    </div>
  );
}
