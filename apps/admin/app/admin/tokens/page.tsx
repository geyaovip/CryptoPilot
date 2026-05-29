import { Card } from "@cryptopilot/ui";
import { AdminPagination } from "../_components/admin-pagination";
import { AdminShell } from "../_components/admin-shell";
import { AdminTokenActions } from "../_components/admin-token-actions";
import { getAdminTokens } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminTokensPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const data = await getAdminTokens({ page: pickParam(params.page), limit: pickParam(params.limit) ?? "25" });
  return (
    <AdminShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-950">资产管理</h1>
        <AdminTokenActions items={data.items} />
        {data.items.map((item) => (
          <Card className="p-4" key={item.id}>
            <p className="font-medium text-slate-950">
              {item.symbol} · {item.name}
            </p>
            <p className="text-sm text-slate-500">{item.is_active ? "展示中" : "已隐藏"}</p>
          </Card>
        ))}
        <AdminPagination
          basePath="/admin/tokens"
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
