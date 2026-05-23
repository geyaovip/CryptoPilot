import { AdminAiMonitorPanel } from "../_components/admin-ai-monitor-panel";
import { AdminShell } from "../_components/admin-shell";
import { getAiMonitor } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function AdminAiMonitorPage() {
  const stats = await getAiMonitor();
  return (
    <AdminShell>
      <AdminAiMonitorPanel stats={stats} />
    </AdminShell>
  );
}
