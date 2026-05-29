import { AdminShell } from "../_components/admin-shell";
import { AdminUserActions } from "../_components/admin-user-actions";
import { getAdminUsers } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminSession();
  const data = await getAdminUsers();
  return (
    <AdminShell>
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h1 className="text-lg font-semibold text-slate-950">用户管理</h1>
          <p className="mt-1 text-sm text-slate-500">共 {data.items.length} 条记录。可调整角色或禁用异常账号。</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {["UID", "邮箱", "名称", "角色", "状态", "今日 AI 搜索", "创建时间", "操作"].map((column) => (
                  <th className="border-b border-slate-200 px-4 py-3 font-medium" key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((user) => (
                <tr className="border-b border-slate-100" key={user.id}>
                  <td className="px-4 py-3 text-slate-700">{user.uid}</td>
                  <td className="px-4 py-3 text-slate-700">{user.email ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{user.name ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{user.role === "admin" ? "管理员" : "用户"}</td>
                  <td className="px-4 py-3 text-slate-700">{user.disabled_at ? "已禁用" : "正常"}</td>
                  <td className="px-4 py-3 text-slate-700">{user.daily_ai_search_count}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(user.created_at).toLocaleString("zh-CN", { hour12: false })}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <AdminUserActions user={user} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
