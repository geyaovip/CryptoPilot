import { AdminShell } from "../_components/admin-shell";
import { EmptyTable } from "../_components/empty-table";

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <EmptyTable title="用户管理" columns={["邮箱", "名称", "角色", "禁用状态", "创建时间"]} />
    </AdminShell>
  );
}
