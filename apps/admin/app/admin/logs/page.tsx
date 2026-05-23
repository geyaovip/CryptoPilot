import { AdminShell } from "../_components/admin-shell";
import { LogsPanel } from "./logs-panel";

export default function AdminLogsPage() {
  return (
    <AdminShell>
      <LogsPanel />
    </AdminShell>
  );
}
