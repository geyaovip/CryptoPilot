import { describe, expect, it } from "vitest";
import { chineseTextRatio, isChineseContent, pickChineseDisplayText } from "./chinese-content.util";

describe("chinese-content.util", () => {
  it("detects Chinese copy", () => {
    expect(isChineseContent("比特币 ETF 净流入创新高")).toBe(true);
    expect(isChineseContent("Bitcoin ETF inflows hit record")).toBe(false);
  });

  it("prefers Chinese display text", () => {
    expect(pickChineseDisplayText(["Bitcoin rises", "以太坊突破 4000 美元"])).toBe("以太坊突破 4000 美元");
  });

  it("scores mixed text ratio", () => {
    expect(chineseTextRatio("BTC 上涨 5%")).toBeGreaterThan(0.1);
  });
});
