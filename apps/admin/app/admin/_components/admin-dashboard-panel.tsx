import { Card } from "@cryptopilot/ui";
import Link from "next/link";
import type { AdminDashboardData } from "../../lib/api";
import { AdminPageHeader } from "./admin-page-header";

type AdminDashboardPanelProps = {
  data: AdminDashboardData;
};

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </Card>
  );
}

export function AdminDashboardPanel({ data }: AdminDashboardPanelProps) {
  const llmErrorPct = `${(data.llm_error_rate * 100).toFixed(1)}%`;

  return (
    <section className="space-y-4">
      <AdminPageHeader title="仪表盘" description="今日运营概览（按服务器本地日切统计）。" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="今日 Feed（信号）" value={data.feeds_today} />
        <MetricCard label="今日 Insight" value={data.insights_today} />
        <MetricCard label="今日 AI 搜索" value={data.ai_searches_today} />
        <MetricCard label="今日 Push" value={data.pushes_today} hint={data.pushes_note} />
        <MetricCard label="今日 LLM 调用" value={data.llm_calls_today} />
        <MetricCard label="LLM 错误率" value={llmErrorPct} />
        <MetricCard label="今日 Token" value={data.tokens_today.toLocaleString()} />
        <MetricCard label="今日 LLM 成本 (USD)" value={data.cost_usd_today} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-950">数据源状态</h2>
          <p className="mt-1 text-xs text-slate-500">
            正常 {data.sources.active} · 暂停 {data.sources.paused} · 异常 {data.sources.error} · 今日采集失败{" "}
            {data.ingestion_failures_today} 次
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {data.sources.items.map((source) => (
              <li className="flex items-center justify-between gap-2" key={source.id}>
                <span>{source.name}</span>
                <span className="text-slate-500">{source.status}</span>
              </li>
            ))}
          </ul>
          <Link className="mt-3 inline-block text-sm text-[#20808D] hover:underline" href="/admin/sources">
            管理数据源 →
          </Link>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-950">热门叙事 Top 5</h2>
          {data.top_narratives.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">暂无叙事数据</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {data.top_narratives.map((narrative) => (
                <li className="flex items-center justify-between gap-2" key={narrative.id}>
                  <span>{narrative.name}</span>
                  <span className="text-slate-500">
                    热度 {narrative.heat_score} · 24h {narrative.feed_count_24h} 条
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link className="mt-3 inline-block text-sm text-[#20808D] hover:underline" href="/admin/narratives">
            管理叙事 →
          </Link>
        </Card>
      </div>

      <Card className="p-4">
        <p className="text-sm text-slate-600">
          更详细的 LLM 调用与错误列表请查看{" "}
          <Link className="text-[#20808D] hover:underline" href="/admin/ai-monitor">
            AI 监控
          </Link>
          ；系统日志请查看{" "}
          <Link className="text-[#20808D] hover:underline" href="/admin/logs">
            日志中心
          </Link>
          。
        </p>
      </Card>
    </section>
  );
}
