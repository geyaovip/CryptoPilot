import { EmptyState } from "@cryptopilot/ui";
import { AdminShell } from "../_components/admin-shell";
import { getAdminPush, getAdminUsers } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";
import { PushPanel } from "./push-panel";

export const dynamic = "force-dynamic";

export default async function AdminPushPage() {
  await requireAdminSession();
  let data: { push: Awaited<ReturnType<typeof getAdminPush>>; users: Awaited<ReturnType<typeof getAdminUsers>> } | null = null;
  let loadError: string | null = null;

  try {
    const [push, users] = await Promise.all([getAdminPush(), getAdminUsers()]);
    data = { push, users };
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Push 管理数据加载失败";
  }

  return (
    <AdminShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#102A2C]">Push 管理</h1>
          <p className="mt-2 text-sm text-[#5F6868]">查看 Telegram Push 发送状态，手动测试发送链路和失败日志。</p>
        </div>
        {loadError ? (
          <EmptyState title="Push 管理加载失败" description={loadError} actionLabel="刷新页面" />
        ) : data ? (
          <PushPanel items={data.push.items} users={data.users.items} />
        ) : null}
      </div>
    </AdminShell>
  );
}
