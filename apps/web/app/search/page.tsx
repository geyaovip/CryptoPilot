import { WebShell } from "../_components/web-shell";
import { SearchPanel } from "./search-panel";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; insight_id?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() ?? "";
  const insightId = params.insight_id?.trim() ?? "";

  return (
    <WebShell>
      <SearchPanel initialInsightId={insightId} initialQuery={initialQuery} />
    </WebShell>
  );
}
