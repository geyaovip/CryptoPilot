import { EmptyState } from "@cryptopilot/ui";
import { AdminPageHeader } from "../_components/admin-page-header";
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
        <AdminPageHeader title="推送管理" description="查看 Telegram 推送发送状态，手动测试发送链路和失败日志。" />
        {loadError ? (
          <EmptyState title="Push 管理加载失败" description={loadError} actionLabel="刷新页面" />
        ) : data ? (
          <PushPanel items={data.push.items} users={data.users.items} />
        ) : null}
      </div>
    </AdminShell>
  );
}
