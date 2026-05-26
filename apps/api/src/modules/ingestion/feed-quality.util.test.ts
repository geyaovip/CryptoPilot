import { describe, expect, it } from "vitest";
import { evaluateFeedQuality } from "./feed-quality.util";
import type { CleanRssItem } from "./rss-cleaner";

function item(title: string, content = title): CleanRssItem {
  return {
    title,
    content,
    sourceUrl: `https://example.com/${encodeURIComponent(title)}`,
    publishTime: new Date("2026-05-26T00:00:00.000Z")
  };
}

describe("evaluateFeedQuality", () => {
  it("filters daily roundup style posts", () => {
    expect(evaluateFeedQuality(item("今日加密市场要闻汇总")).shouldPublish).toBe(false);
    expect(evaluateFeedQuality(item("Crypto daily news roundup")).shouldPublish).toBe(false);
    expect(evaluateFeedQuality(item("Price predictions 5/25: BTC, ETH, XRP, SOL")).shouldPublish).toBe(false);
    expect(evaluateFeedQuality(item("PCE and housing data test Fed cut hopes: Crypto Week Ahead")).shouldPublish).toBe(false);
  });

  it("filters list digests even when title is less explicit", () => {
    const digest = item(
      "市场动态",
      "1. BTC 小幅上涨；2. ETH 生态更新；3. 某项目宣布合作；4. 今日快讯汇总。"
    );

    expect(evaluateFeedQuality(digest).shouldPublish).toBe(false);
  });

  it("keeps high-value single-event stories", () => {
    expect(evaluateFeedQuality(item("SEC 批准新的现货 ETF 申请")).shouldPublish).toBe(true);
    expect(evaluateFeedQuality(item("DeFi 协议遭攻击损失 1200 万美元")).shouldPublish).toBe(true);
  });
});
