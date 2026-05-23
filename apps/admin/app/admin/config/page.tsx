import { AdminShell } from "../_components/admin-shell";
import { ConfigPanel } from "./config-panel";

export default function AdminConfigPage() {
  return (
    <AdminShell>
      <ConfigPanel />
    </AdminShell>
  );
}
