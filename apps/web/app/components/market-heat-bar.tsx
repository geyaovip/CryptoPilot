import type { TokenSummary, TrendingResponse } from "@cryptopilot/types";

export function MarketHeatBar({
  tokens,
  fearGreedIndex
}: {
  tokens: TokenSummary[];
  fearGreedIndex: TrendingResponse["data"]["fear_greed_index"];
}) {
  const majors = tokens.filter((token) => token.symbol === "BTC" || token.symbol === "ETH");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-3 text-xs text-[#5F6868]">
        <div className="space-y-1.5 rounded-2xl bg-[#F7F5EE] px-3 py-2">
          {fearGreedIndex ? (
            <a
              className="inline-flex font-medium text-[#102A2C] hover:text-[#20808D]"
              href={fearGreedIndex.source_url}
              rel="noopener noreferrer"
              target="_blank"
            >
              恐惧贪婪指数：{fearGreedIndex.value} {toChineseClassification(fearGreedIndex.classification)}
            </a>
          ) : (
            <span className="inline-flex font-medium text-[#102A2C]">恐惧贪婪指数同步中</span>
          )}
          {fearGreedIndex ? (
            <p className="text-[11px] leading-5 text-[#8A918C]">
              来源：{fearGreedIndex.source_name}，该指数为市场情绪参考，不构成投资建议。
            </p>
          ) : null}
        </div>
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

function toChineseClassification(classification: string): string {
  const map: Record<string, string> = {
    "Extreme Fear": "极度恐惧",
    Fear: "恐惧",
    Neutral: "中性",
    Greed: "贪婪",
    "Extreme Greed": "极度贪婪"
  };
  return map[classification] ?? classification;
}
