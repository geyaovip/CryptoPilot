import { AdminAiMonitorPanel } from "../_components/admin-ai-monitor-panel";
import { AdminShell } from "../_components/admin-shell";
import { getAiMonitor } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminAiMonitorPage() {
  await requireAdminSession();
  const stats = await getAiMonitor();
  return (
    <AdminShell>
      <AdminAiMonitorPanel stats={stats} />
    </AdminShell>
  );
}
