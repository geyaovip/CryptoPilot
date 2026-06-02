import type { TokenSummary, TrendingResponse } from "@cryptopilot/types";
import type { ReactNode } from "react";

export function MarketHeatBar({
  tokens,
  fearGreedIndex,
  marketHeat,
  compact = false,
  showTokenSnapshot = true
}: {
  tokens: TokenSummary[];
  fearGreedIndex: TrendingResponse["data"]["fear_greed_index"];
  marketHeat?: TrendingResponse["data"]["market_heat"];
  compact?: boolean;
  showTokenSnapshot?: boolean;
}) {
  const majors = tokens.filter((token) => token.symbol === "BTC" || token.symbol === "ETH");

  return (
    <div className="space-y-3">
      {marketHeat ? (
        <MarketIntelligencePanel compact={compact} marketHeat={marketHeat} />
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
      {showTokenSnapshot ? (
        <div className={compact ? "space-y-2 rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] p-3" : "grid gap-3 rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] p-3 sm:grid-cols-2"}>
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
      ) : null}
    </div>
  );
}

function MarketIntelligencePanel({
  compact,
  marketHeat
}: {
  compact: boolean;
  marketHeat: TrendingResponse["data"]["market_heat"];
}) {
  return (
    <div className="rounded-2xl border border-[#D9D5C9] bg-white/85 p-3">
      <div className={compact ? "grid grid-cols-2 gap-3" : "grid gap-3 sm:grid-cols-4"}>
        <Metric label="市场热度" value={`${marketHeat.score}`} hint={toHeatLabel(marketHeat.label)} />
        <Metric label="动态速度" value={formatVelocity(marketHeat.velocity)} hint="基于 Insight 热度变化" />
        <Metric label="市场宽度" value={`${marketHeat.breadth.advance_ratio}%`} hint={`${marketHeat.breadth.advancing} 涨 / ${marketHeat.breadth.declining} 跌`} />
        <Metric label="主要资产" value={toMajorMoveLabel(marketHeat.major_move)} hint="BTC / ETH 24h" />
      </div>
      <div className={compact ? "mt-3 space-y-3 border-t border-[#EDE8DA] pt-3" : "mt-3 grid gap-3 border-t border-[#EDE8DA] pt-3 lg:grid-cols-3"}>
        <SignalGroup title="叙事轮动" empty="暂无明显升温叙事">
          {marketHeat.narrative_rotation.heating.slice(0, 2).map((item) => (
            <span className="rounded-full bg-[#E8F4F6] px-2 py-1 text-[#20808D]" key={item.id}>
              {item.name} +{item.trend_score_24h}
            </span>
          ))}
        </SignalGroup>
        <SignalGroup title="异动资产" empty="暂无明显异动">
          {marketHeat.unusual_moves.slice(0, 2).map((item) => (
            <span className="rounded-full bg-[#F7F5EE] px-2 py-1 text-[#5F6868]" key={item.id}>
              {item.symbol} {item.price_change_24h && item.price_change_24h > 0 ? "+" : ""}
              {item.price_change_24h?.toFixed(2) ?? "0.00"}%
            </span>
          ))}
        </SignalGroup>
        <SignalGroup title="风险提示" empty="暂无突出风险">
          {marketHeat.risk_signals.slice(0, 2).map((item) => (
            <span className={riskClass(item.level)} title={item.detail} key={item.code}>
              {item.label}
            </span>
          ))}
        </SignalGroup>
      </div>
    </div>
  );
}

function SignalGroup({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <div>
      <p className="text-[11px] font-medium text-[#8A918C]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">{items.length ? items : <span className="text-[#8A918C]">{empty}</span>}</div>
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

function riskClass(level: TrendingResponse["data"]["market_heat"]["risk_signals"][number]["level"]): string {
  const base = "rounded-full px-2 py-1";
  if (level === "high") return `${base} bg-red-50 text-red-700`;
  if (level === "medium") return `${base} bg-amber-50 text-amber-700`;
  return `${base} bg-[#F7F5EE] text-[#5F6868]`;
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
