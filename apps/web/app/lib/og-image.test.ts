import { describe, expect, it } from "vitest";
import { buildDynamicOgImageUrl } from "./og-image";

describe("buildDynamicOgImageUrl", () => {
  it("builds query params for title and tag", () => {
    const url = buildDynamicOgImageUrl({ title: "比特币 ETF 资金流入加速", tag: "市场动态" });
    expect(url).toMatch(/^\/og\?/);
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("title")).toBe("比特币 ETF 资金流入加速");
    expect(params.get("tag")).toBe("市场动态");
  });

  it("omits tag when not provided", () => {
    const url = buildDynamicOgImageUrl({ title: "叙事热度上升" });
    expect(url).toBe("/og?title=%E5%8F%99%E4%BA%8B%E7%83%AD%E5%BA%A6%E4%B8%8A%E5%8D%87");
  });
});
