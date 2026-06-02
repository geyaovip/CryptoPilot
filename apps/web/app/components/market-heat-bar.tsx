import type { TokenSummary, TrendingResponse } from "@cryptopilot/types";

export function MarketHeatBar({
  tokens,
  fearGreedIndex,
  marketHeat
}: {
  tokens: TokenSummary[];
  fearGreedIndex: TrendingResponse["data"]["fear_greed_index"];
  marketHeat?: TrendingResponse["data"]["market_heat"];
}) {
  const majors = tokens.filter((token) => token.symbol === "BTC" || token.symbol === "ETH");

  return (
    <div className="space-y-3">
      {marketHeat ? (
        <div className="grid gap-3 rounded-2xl border border-[#D9D5C9] bg-white/85 p-3 sm:grid-cols-4">
          <Metric label="市场热度" value={`${marketHeat.score}`} hint={toHeatLabel(marketHeat.label)} />
          <Metric label="动态速度" value={formatVelocity(marketHeat.velocity)} hint="基于 Insight 热度变化" />
          <Metric label="活跃叙事" value={`${marketHeat.active_narrative_count}`} hint={marketHeat.leading_narrative?.name ?? "等待更多信号"} />
          <Metric label="主要资产" value={toMajorMoveLabel(marketHeat.major_move)} hint="BTC / ETH 24h" />
        </div>
      ) : null}
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

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-[#8A918C]">{label}</p>
      <p className="mt-1 truncate text-base font-semibold text-[#102A2C]">{value}</p>
      <p className="mt-1 truncate text-[11px] text-[#5F6868]">{hint}</p>
    </div>
  );
}

function toHeatLabel(label: TrendingResponse["data"]["market_heat"]["label"]): string {
  const map = {
    heating_up: "升温中",
    cooling: "降温中",
    stable: "平稳"
  } as const;
  return map[label];
}

function formatVelocity(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function toMajorMoveLabel(value: TrendingResponse["data"]["market_heat"]["major_move"]): string {
  const map = {
    up: "同步走强",
    down: "同步走弱",
    mixed: "分化",
    flat: "窄幅"
  } as const;
  return map[value];
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
