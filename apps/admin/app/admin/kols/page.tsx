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
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {["名称", "平台", "Profile", "影响力", "状态"].map((column) => (
                    <th className="border-b border-slate-200 px-4 py-3 font-medium" key={column}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr className="border-b border-slate-100" key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-950">{item.name}</p>
                      <p className="text-xs text-slate-500">@{item.handle}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{platformLabel(item.platform)}</td>
                    <td className="px-4 py-3">
                      {item.profile_url ? (
                        <a className="text-[#20808D]" href={item.profile_url} rel="noopener noreferrer" target="_blank">
                          打开
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.influence_score}</td>
                    <td className="px-4 py-3 text-slate-700">{item.is_active ? "启用" : "停用"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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

function platformLabel(platform: string) {
  const map: Record<string, string> = {
    twitter: "Twitter/X",
    youtube: "YouTube",
    other: "其他"
  };
  return map[platform] ?? platform;
}
