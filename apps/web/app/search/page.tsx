import { WebShell } from "../_components/web-shell";
import { publicPageMetadata } from "../lib/seo";
import { SearchPanel } from "./search-panel";

export const metadata = publicPageMetadata({
  title: "AI 市场研究搜索 | CryptoPilot",
  description: "用 CryptoPilot 搜索加密市场问题、代币、叙事与多来源背景，快速获得带来源的研究结果。",
  path: "/search"
});

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
