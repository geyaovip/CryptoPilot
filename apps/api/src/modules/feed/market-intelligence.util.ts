export type MarketTokenInput = {
  id: string;
  symbol: string;
  name: string;
  priceUsd: unknown;
  priceChange24h: unknown;
};

export type MarketNarrativeInput = {
  id: string;
  name: string;
  slug: string;
  heatScore: number;
  trendScore24h: number;
};

export type RiskInsightInput = {
  sentiment: string;
  sourcesJson: unknown;
};

export function toMarketHeatLabel(velocity: number): "heating_up" | "cooling" | "stable" {
  if (velocity >= 12) return "heating_up";
  if (velocity <= -8) return "cooling";
  return "stable";
}

export function calculateMajorMove(tokens: Array<Pick<MarketTokenInput, "symbol" | "priceChange24h">>): "up" | "down" | "mixed" | "flat" {
  const majors = tokens
    .filter((token) => token.symbol === "BTC" || token.symbol === "ETH")
    .map((token) => Number(token.priceChange24h ?? 0));
  if (majors.length === 0 || majors.every((move) => Math.abs(move) < 0.5)) return "flat";
  if (majors.every((move) => move > 0)) return "up";
  if (majors.every((move) => move < 0)) return "down";
  return "mixed";
}

export function calculateMarketBreadth(tokens: Array<Pick<MarketTokenInput, "priceChange24h">>) {
  const moves = tokens.map((token) => Number(token.priceChange24h ?? 0)).filter(Number.isFinite);
  const advancing = moves.filter((move) => move > 0.5).length;
  const declining = moves.filter((move) => move < -0.5).length;
  const unchanged = Math.max(0, moves.length - advancing - declining);
  return {
    advancing,
    declining,
    unchanged,
    total: moves.length,
    advance_ratio: moves.length ? Math.round((advancing / moves.length) * 100) : 0
  };
}

export function calculateNarrativeRotation(narratives: MarketNarrativeInput[]) {
  const mapped = narratives.map((narrative) => ({
    id: narrative.id,
    name: narrative.name,
    slug: narrative.slug,
    heat_score: narrative.heatScore,
    trend_score_24h: narrative.trendScore24h
  }));
  return {
    heating: [...mapped].filter((item) => item.trend_score_24h > 0).sort((a, b) => b.trend_score_24h - a.trend_score_24h).slice(0, 3),
    cooling: [...mapped].filter((item) => item.trend_score_24h < 0).sort((a, b) => a.trend_score_24h - b.trend_score_24h).slice(0, 3)
  };
}

export function calculateUnusualMoves(tokens: MarketTokenInput[]) {
  return tokens
    .map((token) => {
      const move = Number(token.priceChange24h ?? 0);
      return {
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        price_usd: token.priceUsd === null ? null : Number(token.priceUsd),
        price_change_24h: Number.isFinite(move) ? move : null,
        move_abs: Number.isFinite(move) ? Math.abs(move) : 0
      };
    })
    .filter((token) => token.move_abs >= 3)
    .sort((a, b) => b.move_abs - a.move_abs)
    .slice(0, 4);
}

export function buildRiskSignals(tokens: Array<Pick<MarketTokenInput, "symbol" | "priceChange24h">>, velocity: number, insights: RiskInsightInput[]) {
  const signals: Array<{
    code: "bearish_insight" | "thin_sources" | "major_drawdown" | "high_velocity";
    label: string;
    level: "low" | "medium" | "high";
    detail: string;
  }> = [];
  const majorDrops = tokens.filter((token) => ["BTC", "ETH"].includes(token.symbol) && Number(token.priceChange24h ?? 0) <= -3);
  const bearishCount = insights.filter((insight) => insight.sentiment === "BEARISH").length;
  const thinSourceCount = insights.filter((insight) => parseSourceCount(insight.sourcesJson) < 3).length;
  if (majorDrops.length) {
    signals.push({ code: "major_drawdown", label: "主要资产承压", level: "high", detail: `${majorDrops.map((token) => token.symbol).join("、")} 24h 跌幅超过 3%` });
  }
  if (bearishCount >= 3) {
    signals.push({ code: "bearish_insight", label: "谨慎信号增加", level: "medium", detail: `最近 Insight 中有 ${bearishCount} 条偏谨慎结论` });
  }
  if (thinSourceCount >= 5) {
    signals.push({ code: "thin_sources", label: "来源厚度偏薄", level: "medium", detail: `${thinSourceCount} 条 Insight 来源少于 3 个，需继续核验` });
  }
  if (velocity >= 20) {
    signals.push({ code: "high_velocity", label: "热度快速上升", level: "low", detail: "市场热度变化较快，适合跟踪来源变化而非直接下结论" });
  }
  return signals.slice(0, 4);
}

function parseSourceCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}
