import { AdminInsightsPanel } from "../_components/admin-insights-panel";
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
    loadError = error instanceof Error ? error.message : "Insight 管理数据加载失败";
  }

  return (
    <AdminShell>
      {loadError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</p> : null}
      <AdminInsightsPanel data={data} />
    </AdminShell>
  );
}
