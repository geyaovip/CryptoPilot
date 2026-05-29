import { AdminShell } from "../_components/admin-shell";
import { DataTable } from "../_components/data-table";
import { getAdminUsers } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const data = await getAdminUsers();
  return (
    <AdminShell>
      <DataTable
        title="用户管理"
        columns={["UID", "邮箱", "名称", "角色", "状态", "今日 AI 搜索", "创建时间"]}
        rows={data.items.map((user) => [
          user.uid,
          user.email ?? "-",
          user.name ?? "-",
          user.role === "admin" ? "管理员" : "用户",
          user.disabled_at ? "已禁用" : "正常",
          String(user.daily_ai_search_count),
          new Date(user.created_at).toLocaleString("zh-CN", { hour12: false })
        ])}
      />
    </AdminShell>
  );
}
