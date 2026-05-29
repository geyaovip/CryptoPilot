import { AdminShell } from "../_components/admin-shell";
import { AdminNarrativesPanel } from "../_components/admin-narratives-panel";
import { getAdminNarratives } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminNarrativesPage() {
  await requireAdminSession();
  const data = await getAdminNarratives();
  return (
    <AdminShell>
      <AdminNarrativesPanel items={data.items} />
    </AdminShell>
  );
}
