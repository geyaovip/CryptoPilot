import { AdminFeedPanel } from "../_components/admin-feed-panel";
import { AdminShell } from "../_components/admin-shell";
import { getAdminFeed, getAdminSources, type AdminFeedFilters } from "../../lib/api";
import { requireAdminSession } from "../../lib/admin-session";

export const dynamic = "force-dynamic";

function readFilters(searchParams: Record<string, string | string[] | undefined>): AdminFeedFilters {
  const read = (key: string) => {
    const value = searchParams[key];
    return typeof value === "string" ? value : undefined;
  };

  return {
    status: read("status"),
    source_id: read("source_id"),
    type: read("type"),
    published_from: read("published_from"),
    published_to: read("published_to"),
    page: read("page"),
    limit: read("limit")
  };
}

export default async function AdminFeedPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const filters = readFilters(params);
  let loadError: string | null = null;
  let feed: Awaited<ReturnType<typeof getAdminFeed>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    total_pages: 0,
    has_prev: false,
    has_next: false
  };
  let sources: Awaited<ReturnType<typeof getAdminSources>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    total_pages: 1,
    has_prev: false,
    has_next: false
  };
  try {
    [feed, sources] = await Promise.all([getAdminFeed(filters), getAdminSources()]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "管理数据加载失败";
  }

  return (
    <AdminShell>
      {loadError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</p> : null}
      <AdminFeedPanel
        filters={filters}
        items={feed.items}
        hasNext={feed.has_next}
        hasPrev={feed.has_prev}
        page={feed.page}
        pageLimit={feed.limit}
        total={feed.total}
        totalPages={feed.total_pages}
        sources={sources.items.map((item) => ({ id: item.id, name: item.name }))}
      />
    </AdminShell>
  );
}
