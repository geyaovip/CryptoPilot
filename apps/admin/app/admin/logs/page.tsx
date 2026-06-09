import { AdminPageHeader } from "../_components/admin-page-header";
import { AdminPagination } from "../_components/admin-pagination";
import { AdminShell } from "../_components/admin-shell";
import { LogsPanel } from "./logs-panel";
import { getAdminLogs } from "../../lib/api";

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
  const filters = {
    type: pickParam(params.type),
    from: pickParam(params.from),
    to: pickParam(params.to),
    page: pickParam(params.page),
    limit: pickParam(params.limit) ?? "25"
  };

  let data = null;
  let loadError: string | null = null;

  try {
    data = await getAdminLogs(filters);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "日志加载失败";
  }

  const extraParams = {
    type: filters.type ?? "",
    from: filters.from ?? "",
    to: filters.to ?? ""
  };

  return (
    <AdminShell>
      <div className="space-y-4">
        <AdminPageHeader title="日志中心" description="查看 API、采集、LLM、推送和后台审计日志，用于排障和追踪运营操作。" />
        {loadError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</p>
        ) : null}
        {data ? (
          <>
            <LogsPanel
              filters={{ type: filters.type, from: filters.from, to: filters.to }}
              items={data.items}
            />
            <AdminPagination
              basePath="/admin/logs"
              extraParams={extraParams}
              hasNext={data.has_next}
              hasPrev={data.has_prev}
              limit={data.limit}
              page={data.page}
              total={data.total}
              totalPages={data.total_pages}
            />
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
