import { AdminShell } from "../_components/admin-shell";
import { AdminSourcesPanel } from "../_components/admin-sources-panel";
import { getAdminSources } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const sources = await getAdminSources();

  return (
    <AdminShell>
      <AdminSourcesPanel items={sources.items} />
    </AdminShell>
  );
}
