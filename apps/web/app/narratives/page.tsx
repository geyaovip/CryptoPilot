import { Card, EmptyState } from "@cryptopilot/ui";
import { WebShell } from "../_components/web-shell";
import { NarrativeListCard } from "../components/narrative-list-card";
import { NarrativeSortTabs } from "../components/narrative-sort-tabs";
import { getNarratives } from "../lib/api";
import { publicPageMetadata } from "../lib/seo";

export const metadata = publicPageMetadata({
  title: "市场叙事 | CryptoPilot",
  description: "追踪加密市场正在升温的叙事主题、相关资产、热度趋势和多来源动态。",
  path: "/narratives"
});

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
          <p className="mt-2 text-sm text-[#5F6868]">追踪正在被市场反复讨论的主题，按热度、升温速度与讨论量排序。</p>
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
