import { AdminPageHeader } from "../_components/admin-page-header";
import { AdminShell } from "../_components/admin-shell";
import { LogsPanel } from "./logs-panel";
import { getAdminLogs, type AdminLogItem } from "../../lib/api";

export const dynamic = "force-dynamic";

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminLogsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  let items: AdminLogItem[] = [];
  let loadError: string | null = null;

  try {
    const data = await getAdminLogs({
      type: pickParam(params.type),
      from: pickParam(params.from),
      to: pickParam(params.to),
      limit: 50
    });
    items = data.items;
  } catch (error) {
    loadError = error instanceof Error ? error.message : "日志加载失败";
  }

  return (
    <AdminShell>
      <div className="space-y-4">
        <AdminPageHeader title="日志中心" description="查看 API、采集、LLM、推送和后台审计日志，用于排障和追踪运营操作。" />
        {loadError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</p>
        ) : null}
        <LogsPanel items={items} />
      </div>
    </AdminShell>
  );
}
