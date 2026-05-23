import type { AiSearchOutput, FeedSummaryOutput } from "../ai/schemas";
import type { LlmEmbedResult, LlmJsonInput, LlmJsonResult, LlmProvider, LlmTextInput, LlmTextResult } from "./types";

export class MockLlmProvider implements LlmProvider {
  readonly name = "mock";

  async generateJson(input: LlmJsonInput): Promise<LlmJsonResult> {
    const started = Date.now();
    const data =
      input.promptKey === "ai_search_prompt"
        ? this.mockSearchJson(input.user)
        : this.mockFeedSummary(input.user);
    return {
      data,
      provider: this.name,
      model: "mock-json",
      inputTokens: 120,
      outputTokens: 180,
      latencyMs: Date.now() - started
    };
  }

  async generateText(input: LlmTextInput): Promise<LlmTextResult> {
    const result = await this.generateJson(input);
    return { ...result, text: JSON.stringify(result.data) };
  }

  async embed(texts: string[]): Promise<LlmEmbedResult> {
    const started = Date.now();
    return {
      vectors: texts.map((text) => pseudoVector(text)),
      provider: this.name,
      model: "mock-embedding",
      inputTokens: texts.join(" ").length,
      latencyMs: Date.now() - started
    };
  }

  private mockFeedSummary(user: string): FeedSummaryOutput {
    const title = extractBetween(user, "标题:", "\n") ?? "市场动态";
    return {
      summary: `${title}：基于已收录来源的简要摘要，供研究参考，不构成投资建议。`,
      key_reasons: ["来源已收录并可追溯", "叙事与代币关联已在上下文中列出", "情绪判断仅反映报道语气"],
      market_impact: "可能提升相关叙事关注度，需结合更多来源交叉验证。",
      related_tokens: [],
      narrative_tags: [],
      sentiment: "neutral"
    };
  }

  private mockSearchJson(user: string): AiSearchOutput {
    const query = extractBetween(user, "用户问题:", "\n") ?? user.slice(0, 80);
    const now = new Date().toISOString();
    return {
      answer: `关于「${query.trim()}」：根据检索到的 Feed 来源，市场叙事仍在演化。以下为基于已收录来源的研究摘要，不构成投资建议。`,
      key_reasons: ["检索到多条可引用来源", "回答仅基于上下文中的报道", "未覆盖链上实时数据"],
      market_impact: "短期可能影响相关代币关注度，需继续跟踪后续报道。",
      related_tokens: ["BTC", "ETH"],
      related_narratives: ["ETF 资金流"],
      sentiment: "neutral",
      sources: [
        {
          source_name: "CoinDesk",
          source_type: "news",
          url: "https://example.com/feed/mock-1",
          published_at: now
        },
        {
          source_name: "Decrypt",
          source_type: "news",
          url: "https://example.com/feed/mock-2",
          published_at: now
        }
      ]
    };
  }
}

function extractBetween(text: string, start: string, end: string): string | null {
  const index = text.indexOf(start);
  if (index < 0) return null;
  const slice = text.slice(index + start.length);
  const stop = slice.indexOf(end);
  return (stop >= 0 ? slice.slice(0, stop) : slice).trim();
}

function pseudoVector(text: string, dims = 1536): number[] {
  const vector = new Array<number>(dims).fill(0);
  for (let i = 0; i < text.length; i += 1) {
    vector[i % dims] += text.charCodeAt(i) / 255;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}
