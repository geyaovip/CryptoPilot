import { Card, EmptyState } from "@cryptopilot/ui";
import { WebShell } from "../_components/web-shell";
import { NarrativeListCard } from "../components/narrative-list-card";
import { NarrativeSortTabs } from "../components/narrative-sort-tabs";
import { getNarratives } from "../lib/api";

export const dynamic = "force-dynamic";

export default async function NarrativesPage({
  searchParams
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sort = params.sort === "rising" || params.sort === "discussed" ? params.sort : "hottest";
  const data = await getNarratives(sort);

  return (
    <WebShell>
      <div className="space-y-5">
        <Card className="border-[#D9D5C9] bg-white/90 p-6">
          <h1 className="text-2xl font-semibold text-[#102A2C]">市场叙事</h1>
          <p className="mt-2 text-sm text-[#5F6868]">按热度、增速与讨论量浏览叙事线索（非投资建议）。</p>
          <div className="mt-4">
            <NarrativeSortTabs active={sort} />
          </div>
        </Card>
        {data.items.length === 0 ? (
          <EmptyState description="暂无激活的市场叙事，请稍后再试。" title="暂无叙事" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.items.map((item) => (
              <NarrativeListCard item={item} key={item.id} />
            ))}
          </div>
        )}
      </div>
    </WebShell>
  );
}
