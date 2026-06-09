import { EmptyState } from "@cryptopilot/ui";
import { AdminPageHeader } from "../_components/admin-page-header";
import { AdminPagination } from "../_components/admin-pagination";
import { AdminShell } from "../_components/admin-shell";
import { getAdminPush, getAdminUsers } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";
import { PushPanel } from "./push-panel";

export const dynamic = "force-dynamic";

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminPushPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const filters = {
    type: pickParam(params.type),
    status: pickParam(params.status),
    page: pickParam(params.page),
    limit: pickParam(params.limit) ?? "25"
  };
  const extraParams = {
    type: filters.type ?? "",
    status: filters.status ?? ""
  };

  let data: { push: Awaited<ReturnType<typeof getAdminPush>>; users: Awaited<ReturnType<typeof getAdminUsers>> } | null = null;
  let loadError: string | null = null;

  try {
    const [push, users] = await Promise.all([getAdminPush(filters), getAdminUsers()]);
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
          <>
            <PushPanel
              filters={{ type: filters.type, status: filters.status }}
              items={data.push.items}
              total={data.push.total}
              users={data.users.items}
            />
            <AdminPagination
              basePath="/admin/push"
              extraParams={extraParams}
              hasNext={data.push.has_next}
              hasPrev={data.push.has_prev}
              limit={data.push.limit}
              page={data.push.page}
              total={data.push.total}
              totalPages={data.push.total_pages}
            />
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
