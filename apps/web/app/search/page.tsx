import { WebShell } from "../_components/web-shell";
import { SearchPanel } from "./search-panel";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() ?? "";

  return (
    <WebShell>
      <SearchPanel initialQuery={initialQuery} />
    </WebShell>
  );
}
