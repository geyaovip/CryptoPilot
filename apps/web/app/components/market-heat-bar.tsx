import type { TokenSummary } from "@cryptopilot/types";

export function MarketHeatBar({ tokens }: { tokens: TokenSummary[] }) {
  const majors = tokens.filter((token) => token.symbol === "BTC" || token.symbol === "ETH");

  return (
    <div className="grid gap-3 rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] p-3 sm:grid-cols-2">
      {majors.map((token) => (
        <div className="text-sm text-[#5F6868]" key={token.id}>
          <span className="font-medium text-[#102A2C]">{token.symbol}</span>
          <span className="ml-2">{token.price_usd ? `$${token.price_usd.toLocaleString()}` : "暂无价格"}</span>
          <span className={`ml-2 ${(token.price_change_24h ?? 0) >= 0 ? "text-[#20808D]" : "text-red-600"}`}>
            {token.price_change_24h?.toFixed(2) ?? "0.00"}%
          </span>
        </div>
      ))}
    </div>
  );
}
