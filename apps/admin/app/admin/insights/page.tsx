import { AdminInsightsPanel } from "../_components/admin-insights-panel";
import { AdminPageHeader } from "../_components/admin-page-header";
import { AdminShell } from "../_components/admin-shell";
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
    loadError = error instanceof Error ? error.message : "市场情报数据加载失败";
  }

  return (
    <AdminShell>
      <div className="mb-4">
        <AdminPageHeader
          title="市场情报"
          description="这里管理首页优先展示的市场判断：它由多个原始内容或内容聚类合成，强调来源核验、关键原因和市场影响。运营重点是确认来源足够、结论清晰，并在需要时触发重新合成。"
        />
      </div>
      {loadError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</p> : null}
      <AdminInsightsPanel data={data} />
    </AdminShell>
  );
}
