"use client";

import type { AiMonitorStats } from "@cryptopilot/types";
import { Card } from "@cryptopilot/ui";

export function AdminAiMonitorPanel({ stats }: { stats: AiMonitorStats }) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h1 className="text-lg font-semibold text-slate-900">AI Monitor</h1>
        <p className="mt-1 text-sm text-slate-600">今日 LLM 调用与成本概览。</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="今日调用" value={String(stats.calls_today)} />
        <MetricCard label="今日 Token" value={String(stats.tokens_today)} />
        <MetricCard label="今日成本 (USD)" value={stats.cost_usd_today.toFixed(4)} />
        <MetricCard label="平均延迟 (ms)" value={String(stats.avg_latency_ms)} />
      </div>

      <Card className="p-4">
        <p className="text-sm text-slate-700">Provider 错误率：{(stats.provider_error_rate * 100).toFixed(1)}%</p>
        <h2 className="mt-4 text-sm font-semibold text-slate-900">Prompt 调用分布</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {stats.prompt_distribution.map((item) => (
            <li key={item.prompt_key}>
              {item.prompt_key}: {item.count}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-900">最近错误（最多 50 条）</h2>
        <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto text-sm text-slate-700">
          {stats.recent_errors.length === 0 ? (
            <li className="text-slate-500">暂无错误记录</li>
          ) : (
            stats.recent_errors.map((log) => (
              <li className="rounded-lg bg-slate-50 p-3" key={log.id}>
                <p>
                  {log.prompt_key} · {log.provider}/{log.model}
                </p>
                <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString("zh-CN")}</p>
                <p className="mt-1 text-red-700">{log.error_message ?? "未知错误"}</p>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </Card>
  );
}
