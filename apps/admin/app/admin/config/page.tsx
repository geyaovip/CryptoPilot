import { AdminShell } from "../_components/admin-shell";
import { ConfigPanel } from "./config-panel";
import { getAdminConfig } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  let items: Array<{ key: string; value: unknown }> = [];
  let loadError: string | null = null;

  try {
    const data = await getAdminConfig();
    items = data.items;
  } catch (error) {
    loadError = error instanceof Error ? error.message : "配置加载失败";
  }

  return (
    <AdminShell>
      <ConfigPanel items={items} loadError={loadError} />
    </AdminShell>
  );
}
