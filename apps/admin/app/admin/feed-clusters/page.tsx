import { AdminFeedClustersPanel } from "../_components/admin-feed-clusters-panel";
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
