import { AdminShell } from "../_components/admin-shell";
import { AdminSourcesPanel } from "../_components/admin-sources-panel";
import { getAdminSources } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminSourcesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const sources = await getAdminSources({ page: pickParam(params.page), limit: pickParam(params.limit) ?? "100" });

  return (
    <AdminShell>
      <AdminSourcesPanel data={sources} />
    </AdminShell>
  );
}
