import { describe, expect, it } from "vitest";
import { MockLlmProvider } from "./mock.provider";

describe("MockLlmProvider AI search fallback", () => {
  it("builds a dynamic research brief from RAG context", async () => {
    const provider = new MockLlmProvider();
    const result = await provider.generateJson({
      promptKey: "ai_search_prompt",
      user: `用户问题: ETH 今天为什么波动？
检索上下文:
[1] ETH ETF 资金流出现单日净流入
来源: PANews
链接: https://www.panewslab.com/article-a
摘要: ETH ETF 资金流改善，市场关注度升温。

[2] SEC 延后某加密 ETF 审批
来源: CoinDesk
链接: https://www.coindesk.com/article-b
摘要: 监管时间线变化影响市场预期。

可用来源:
PANews https://www.panewslab.com/article-a
CoinDesk https://www.coindesk.com/article-b`
    });

    expect(result.data).toMatchObject({
      related_tokens: expect.arrayContaining(["ETH", "ETF"]),
      related_narratives: expect.arrayContaining(["ETF 资金流", "监管"]),
      sources: [
        expect.objectContaining({ source_name: "PANews", url: "https://www.panewslab.com/article-a" }),
        expect.objectContaining({ source_name: "CoinDesk", url: "https://www.coindesk.com/article-b" })
      ]
    });
    expect(JSON.stringify(result.data)).not.toContain("example.com");
    expect(JSON.stringify(result.data)).toContain("ETH ETF 资金流出现单日净流入");
  });
});
