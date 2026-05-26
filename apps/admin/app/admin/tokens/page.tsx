import { Card } from "@cryptopilot/ui";
import { AdminShell } from "../_components/admin-shell";
import { AdminTokenActions } from "../_components/admin-token-actions";
import { getAdminTokens } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function AdminTokensPage() {
  const data = await getAdminTokens();
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
      </div>
    </AdminShell>
  );
}
