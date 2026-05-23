import { AdminFeedPanel } from "../_components/admin-feed-panel";
import { AdminShell } from "../_components/admin-shell";
import { getAdminFeed, getAdminSources, type AdminFeedFilters } from "../../lib/api";

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
    published_to: read("published_to")
  };
}

export default async function AdminFeedPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = readFilters(params);
  let loadError: string | null = null;
  let feed: Awaited<ReturnType<typeof getAdminFeed>> = { items: [], next_cursor: null };
  let sources: Awaited<ReturnType<typeof getAdminSources>> = { items: [], next_cursor: null };
  try {
    [feed, sources] = await Promise.all([getAdminFeed(filters), getAdminSources()]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "管理数据加载失败";
  }

  return (
    <AdminShell>
      {loadError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</p> : null}
      <AdminFeedPanel filters={filters} items={feed.items} sources={sources.items.map((item) => ({ id: item.id, name: item.name }))} />
    </AdminShell>
  );
}
