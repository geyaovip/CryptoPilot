import { Card } from "@cryptopilot/ui";
import { AdminKolActions } from "../_components/admin-kol-actions";
import { AdminShell } from "../_components/admin-shell";
import { getAdminKols } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function AdminKolsPage() {
  const data = await getAdminKols();
  return (
    <AdminShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-950">观点源管理</h1>
        <AdminKolActions items={data.items} />
        {data.items.map((item) => (
          <Card className="p-4" key={item.id}>
            <p className="font-medium text-slate-950">
              {item.name} @{item.handle}
            </p>
            <p className="text-sm text-slate-500">{item.is_active ? "启用" : "停用"}</p>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
