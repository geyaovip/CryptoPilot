import { Card, EmptyState, LoadingState } from "@cryptopilot/ui";
import { AdminShell } from "../_components/admin-shell";

const metrics = ["今日 Feed", "今日 AI 搜索", "今日 Push", "LLM 错误率"];

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">仪表盘</h1>
          <p className="mt-1 text-sm text-slate-500">V0.1 管理端运营指标占位。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric}>
              <p className="text-sm text-slate-500">{metric}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">0</p>
            </Card>
          ))}
        </div>
        <LoadingState title="仪表盘加载占位" />
        <EmptyState title="暂无运营数据" description="真实运营指标将在后续版本接入。" actionLabel="重试" />
      </section>
    </AdminShell>
  );
}
