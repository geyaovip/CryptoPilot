import { EmptyState } from "@cryptopilot/ui";
import { AdminDashboardPanel } from "../_components/admin-dashboard-panel";
import { AdminShell } from "../_components/admin-shell";
import { getAdminDashboard } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let data: Awaited<ReturnType<typeof getAdminDashboard>> | null = null;
  let loadError: string | null = null;

  try {
    data = await getAdminDashboard();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "仪表盘加载失败";
  }

  return (
    <AdminShell>
      {loadError ? (
        <EmptyState title="仪表盘加载失败" description={loadError} actionLabel="刷新页面" />
      ) : data ? (
        <AdminDashboardPanel data={data} />
      ) : null}
    </AdminShell>
  );
}
