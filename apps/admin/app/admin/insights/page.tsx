import { AdminInsightsPanel } from "../_components/admin-insights-panel";
import { AdminShell } from "../_components/admin-shell";
import { Card } from "@cryptopilot/ui";
import { getAdminInsights } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminInsightsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  let loadError: string | null = null;
  let data: Awaited<ReturnType<typeof getAdminInsights>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    total_pages: 1,
    has_prev: false,
    has_next: false
  };

  try {
    data = await getAdminInsights({ page: pickParam(params.page), limit: pickParam(params.limit) ?? "25" });
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Insight 管理数据加载失败";
  }

  return (
    <AdminShell>
      <Card className="mb-4 border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Market Intelligence</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-950">市场情报</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          这里管理首页优先展示的 Insight：它由多个原始内容或内容聚类合成，强调来源核验、关键原因和市场影响。
          运营重点是确认来源足够、结论清晰，并在需要时触发重新合成。
        </p>
      </Card>
      {loadError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</p> : null}
      <AdminInsightsPanel data={data} />
    </AdminShell>
  );
}
