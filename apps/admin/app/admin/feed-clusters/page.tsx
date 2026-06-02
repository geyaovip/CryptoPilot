import { AdminFeedClustersPanel } from "../_components/admin-feed-clusters-panel";
import { AdminPageHeader } from "../_components/admin-page-header";
import { AdminShell } from "../_components/admin-shell";
import { getAdminFeedClusters, type AdminFeedClusterFilters } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminFeedClustersPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const filters: AdminFeedClusterFilters = {
    page: pickParam(params.page),
    limit: pickParam(params.limit) ?? "15",
    cluster_id: pickParam(params.cluster_id)
  };

  const data = await getAdminFeedClusters(filters);

  return (
    <AdminShell>
      <div className="mb-4">
        <AdminPageHeader
          title="内容聚类"
          description="这里检查多条相似内容是否被正确聚成同一事件，用于选择代表条、移出误聚内容或解散不合理簇。聚类是市场情报合成前的中间层，不直接等同于用户看到的市场判断。"
        />
      </div>
      <AdminFeedClustersPanel
        filters={filters}
        hasNext={data.has_next}
        hasPrev={data.has_prev}
        items={data.items}
        page={data.page}
        pageLimit={data.limit}
        total={data.total}
        totalPages={data.total_pages}
      />
    </AdminShell>
  );
}
