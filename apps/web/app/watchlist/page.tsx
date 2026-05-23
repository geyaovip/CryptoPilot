import { WebShell } from "../_components/web-shell";
import { WatchlistPanel } from "../components/watchlist-panel";
import { getWatchlist } from "../lib/api";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const data = await getWatchlist();

  return (
    <WebShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-[#102A2C]">关注列表</h1>
        <p className="text-sm text-[#5F6868]">管理 Token、叙事与 KOL 关注，并影响首页 For You 排序。</p>
        <WatchlistPanel initialItems={data.items} />
      </div>
    </WebShell>
  );
}
