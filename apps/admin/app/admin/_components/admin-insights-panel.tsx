"use client";

import type { MarketInsightDetail, MarketInsightSummary } from "@cryptopilot/types";
import { Card } from "@cryptopilot/ui";
import type { ReactNode } from "react";
import { useState } from "react";
import { getAdminInsightDetail, resynthesizeAdminInsight, updateAdminInsightTitle } from "../../lib/api";
import { AdminPagination } from "./admin-pagination";

function EditableTitle({ id, value, onSaved }: { id: string; value: string; onSaved: (text: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = text.trim();
    if (!trimmed || trimmed === value) {
      setText(value);
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateAdminInsightTitle(id, trimmed);
      onSaved(trimmed);
      setEditing(false);
    } catch {
      setText(value);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-950 focus:border-[#20808D] focus:outline-none focus:ring-1 focus:ring-[#20808D]/30"
        disabled={saving}
        onBlur={save}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") { setText(value); setEditing(false); }
        }}
        value={text}
      />
    );
  }

  return (
    <button
      className="w-full cursor-text text-left font-medium leading-6 text-slate-950 hover:text-[#20808D]"
      onClick={() => setEditing(true)}
      title="点击编辑标题"
      type="button"
    >
      {value}
    </button>
  );
}

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
  search: string;
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

export function AdminInsightsPanel({ data, search }: AdminInsightsPanelProps) {
  const [selected, setSelected] = useState<MarketInsightDetail | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState(data.items);
  const pagination = normalizePagination(data);

  function handleTitleSaved(id: string, text: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ai_insight: text } : item)));
  }

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
        <h2 className="text-sm font-semibold text-slate-950">情报操作</h2>
        <p className="mt-1 text-sm text-slate-500">
          用于核验市场情报的来源、关联信号和 AI 合成质量；发布前至少需要 2 个可点击来源。列表按更新时间倒序排列，重新合成后会自动排到顶部。
        </p>
        <form className="mt-3 flex items-center gap-2" action="/admin/insights" method="GET">
          <input
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#20808D] focus:outline-none focus:ring-1 focus:ring-[#20808D]/30"
            defaultValue={search}
            name="search"
            placeholder="搜索情报标题..."
            type="search"
          />
          <button
            className="inline-flex h-9 items-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            type="submit"
          >
            搜索
          </button>
          {search ? (
            <a
              className="inline-flex h-9 items-center text-sm text-slate-500 hover:text-slate-700"
              href="/admin/insights"
            >
              清除
            </a>
          ) : null}
        </form>
        {message ? <p className="mt-2 text-sm text-[#20808D]">{message}</p> : null}
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {["市场情报", "情绪", "热度", "叙事", "来源", "创建时间", "操作"].map((column) => (
                  <th className="border-b border-slate-200 px-4 py-3 font-medium" key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={7}>
                    暂无市场情报。
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr className="border-b border-slate-100 align-top" key={item.id}>
                    <td className="px-4 py-3">
                      <EditableTitle id={item.id} onSaved={(t) => handleTitleSaved(item.id, t)} value={item.ai_insight} />
                      <p className="mt-1 line-clamp-2 max-w-3xl text-xs leading-5 text-slate-500">{item.ai_summary}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{sentimentLabels[item.sentiment]}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {item.heat_score}
                      <span className="ml-2 text-xs text-slate-500">{heatLabels[item.heat_label]}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.primary_narrative?.name ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.source_count}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{new Date(item.created_at).toLocaleString("zh-CN")}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="text-[#20808D]" disabled={pendingId === item.id} onClick={() => loadDetail(item.id)} type="button">
                          查看详情
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

      <AdminPagination
        basePath="/admin/insights"
        extraParams={search ? { search } : undefined}
        hasNext={pagination.has_next}
        hasPrev={pagination.has_prev}
        limit={pagination.limit}
        page={pagination.page}
        total={pagination.total}
        totalPages={pagination.total_pages}
      />

      {selected ? <InsightDetailModal insight={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function InsightDetailModal({ insight, onClose }: { insight: MarketInsightDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#20808D]">市场情报详情</p>
            <h2 className="mt-1 text-lg font-semibold leading-7 text-slate-950">{insight.ai_insight}</h2>
          </div>
          <button
            aria-label="关闭详情弹窗"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#20808D]/30"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="space-y-5 px-5 py-4">
          <p className="text-sm leading-6 text-slate-600">{insight.ai_summary}</p>
          <DetailBlock title="关键原因">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {insight.key_reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </DetailBlock>
          {insight.market_impact ? (
            <DetailBlock title="市场影响">
              <p className="text-sm leading-6 text-slate-600">{insight.market_impact}</p>
            </DetailBlock>
          ) : null}
          <DetailBlock title="来源">
            <div className="space-y-2">
              {insight.sources.map((source) => (
                <a className="block rounded-lg border border-slate-200 p-3 text-sm text-[#20808D]" href={source.source_url} key={source.feed_item_id} rel="noopener noreferrer" target="_blank">
                  {source.source_name} · {source.title}
                </a>
              ))}
            </div>
          </DetailBlock>
          <DetailBlock title="关联信号">
            <p className="text-sm text-slate-500">{insight.signals.length} 条 Feed 信号参与合成。</p>
          </DetailBlock>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function normalizePagination(data: AdminInsightsPanelProps["data"]) {
  const total = Number.isFinite(data.total) ? data.total : data.items.length;
  const page = Number.isFinite(data.page) && data.page > 0 ? data.page : 1;
  const limit = Number.isFinite(data.limit) && data.limit > 0 ? data.limit : Math.max(data.items.length, 1);
  const totalPages = Number.isFinite(data.total_pages) && data.total_pages > 0 ? data.total_pages : Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    total_pages: totalPages,
    has_prev: data.has_prev ?? page > 1,
    has_next: data.has_next ?? page < totalPages
  };
}
