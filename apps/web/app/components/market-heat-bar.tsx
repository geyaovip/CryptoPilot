import type { TokenSummary } from "@cryptopilot/types";

export function MarketHeatBar({ tokens }: { tokens: TokenSummary[] }) {
  const majors = tokens.filter((token) => token.symbol === "BTC" || token.symbol === "ETH");
  const updatedLabel = majors.length > 0 ? "行情快照已更新" : "等待行情数据更新";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-xs text-[#5F6868]">
        <span className="rounded-full bg-[#F7F5EE] px-3 py-1">市场温度：中性观察</span>
        <span className="rounded-full bg-[#F7F5EE] px-3 py-1">{updatedLabel}</span>
      </div>
      <div className="grid gap-3 rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] p-3 sm:grid-cols-2">
        {majors.length > 0 ? (
          majors.map((token) => (
            <div className="text-sm text-[#5F6868]" key={token.id}>
              <span className="font-medium text-[#102A2C]">{token.symbol}</span>
              <span className="ml-2">{token.price_usd ? `$${token.price_usd.toLocaleString()}` : "价格更新中"}</span>
              <span className={`ml-2 ${(token.price_change_24h ?? 0) >= 0 ? "text-[#20808D]" : "text-red-600"}`}>
                {token.price_change_24h?.toFixed(2) ?? "0.00"}%
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#5F6868]">行情数据正在同步，稍后会展示重点资产表现。</p>
        )}
      </div>
    </div>
  );
}
