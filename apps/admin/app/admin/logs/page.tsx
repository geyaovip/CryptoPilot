import { AdminPageHeader } from "../_components/admin-page-header";
import { AdminShell } from "../_components/admin-shell";
import { LogsPanel } from "./logs-panel";

export default function AdminLogsPage() {
  return (
    <AdminShell>
      <div className="space-y-4">
        <AdminPageHeader title="日志中心" description="查看 API、采集、LLM、推送和后台审计日志，用于排障和追踪运营操作。" />
        <LogsPanel />
      </div>
    </AdminShell>
  );
}
