import { AdminPromptsPanel } from "../_components/admin-prompts-panel";
import { AdminShell } from "../_components/admin-shell";
import { getAdminPrompts } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminPromptsPage() {
  await requireAdminSession();
  const items = await getAdminPrompts();
  return (
    <AdminShell>
      <AdminPromptsPanel items={items} />
    </AdminShell>
  );
}
