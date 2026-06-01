import { AdminShell } from "../_components/admin-shell";
import { getAdminPush, getAdminUsers } from "../../lib/api";
import { PushPanel } from "./push-panel";

export const dynamic = "force-dynamic";

export default async function AdminPushPage() {
  const [push, users] = await Promise.all([getAdminPush(), getAdminUsers()]);
  return (
    <AdminShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#102A2C]">Push 管理</h1>
          <p className="mt-2 text-sm text-[#5F6868]">查看 Telegram Push 发送状态，手动测试发送链路和失败日志。</p>
        </div>
        <PushPanel items={push.items} users={users.items} />
      </div>
    </AdminShell>
  );
}
