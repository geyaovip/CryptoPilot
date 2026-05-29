import { Card } from "@cryptopilot/ui";
import { AdminKolActions } from "../_components/admin-kol-actions";
import { AdminPagination } from "../_components/admin-pagination";
import { AdminShell } from "../_components/admin-shell";
import { getAdminKols } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminKolsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const data = await getAdminKols({ page: pickParam(params.page), limit: pickParam(params.limit) ?? "25" });
  return (
    <AdminShell>
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">KOL Source</p>
          <h1 className="text-2xl font-semibold text-slate-950">KOL 源管理</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            这里维护的是后续 KOL / 社交信号和用户 Watchlist 使用的账号画像，不参与当前 RSS/API Feed 采集。
            新闻、行情、RSS、快讯 API 的启停、重试和采集日志请在「数据源」中管理。
          </p>
        </div>
        <AdminKolActions items={data.items} />
        {data.items.map((item) => (
          <Card className="p-4" key={item.id}>
            <p className="font-medium text-slate-950">
              {item.name} @{item.handle}
            </p>
            <p className="text-sm text-slate-500">{item.is_active ? "启用" : "停用"}</p>
          </Card>
        ))}
        <AdminPagination
          basePath="/admin/kols"
          hasNext={data.has_next}
          hasPrev={data.has_prev}
          limit={data.limit}
          page={data.page}
          total={data.total}
          totalPages={data.total_pages}
        />
      </div>
    </AdminShell>
  );
}
