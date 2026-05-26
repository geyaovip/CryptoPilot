import { WebShell } from "../_components/web-shell";
import { WatchlistPanel } from "../components/watchlist-panel";
import { getWatchlist } from "../lib/api";
import { noIndexMetadata } from "../lib/seo";

export const dynamic = "force-dynamic";
export const metadata = noIndexMetadata;

export default async function WatchlistPage() {
  const data = await getWatchlist();

  return (
    <WebShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-[#102A2C]">关注列表</h1>
        <p className="text-sm text-[#5F6868]">管理你关注的资产与市场叙事，让首页推荐更贴近你的研究方向。</p>
        <WatchlistPanel initialItems={data.items} />
      </div>
    </WebShell>
  );
}
