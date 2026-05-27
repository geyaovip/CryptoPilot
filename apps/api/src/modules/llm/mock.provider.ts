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
    const context = parseSearchContext(user);
    const sources = context.slice(0, 6).map((item) => ({
      source_name: item.sourceName,
      source_type: "news",
      url: item.sourceUrl,
      published_at: now
    }));
    const tokens = inferTokens(`${query}\n${context.map((item) => item.title).join("\n")}`);
    const narratives = inferNarratives(`${query}\n${context.map((item) => `${item.title}\n${item.summary}`).join("\n")}`);
    const keyReasons = context.slice(0, 4).map((item) => {
      const summary = item.summary || item.title;
      return `${item.sourceName} 报道：${trimSentence(summary, 72)}`;
    });
    const primary = context[0];
    const secondary = context[1];

    return {
      answer: primary
        ? `关于「${query.trim()}」：已检索到 ${context.length} 条相关来源。${primary.sourceName} 关注「${trimSentence(primary.title, 54)}」${secondary ? `，${secondary.sourceName} 则补充了「${trimSentence(secondary.title, 42)}」` : ""}。整体来看，当前信息更适合作为背景梳理，仍需要结合后续来源交叉确认。`
        : `关于「${query.trim()}」：当前检索上下文不足以形成高置信度结论。建议换一个更具体的问题，或稍后等待更多来源入库。`,
      key_reasons: keyReasons.length >= 2 ? keyReasons : ["检索到的来源数量有限", "回答仅基于已收录内容生成"],
      market_impact: buildMarketImpact(tokens, narratives),
      related_tokens: tokens,
      related_narratives: narratives,
      sentiment: "neutral",
      sources:
        sources.length >= 2
          ? sources
          : [
              {
                source_name: "CryptoPilot",
                source_type: "news",
                url: "https://cryptopilot.chat",
                published_at: now
              },
              {
                source_name: "CryptoPilot Archive",
                source_type: "news",
                url: "https://cryptopilot.chat/home",
                published_at: now
              }
            ]
    };
  }
}

type SearchContext = {
  title: string;
  sourceName: string;
  sourceUrl: string;
  summary: string;
};

function parseSearchContext(prompt: string): SearchContext[] {
  const context = extractBetween(prompt, "检索上下文:", "\n\n可用来源:") ?? "";
  return context
    .split(/\n(?=\[\d+\]\s)/)
    .map((block) => {
      const title = block.match(/^\[\d+\]\s*(.+)$/m)?.[1]?.trim();
      const sourceName = block.match(/^来源:\s*(.+)$/m)?.[1]?.trim();
      const sourceUrl = block.match(/^链接:\s*(.+)$/m)?.[1]?.trim();
      const summary = block.match(/^摘要:\s*([\s\S]+)$/m)?.[1]?.trim();
      if (!title || !sourceName || !sourceUrl) return null;
      return { title, sourceName, sourceUrl, summary: summary ?? "" };
    })
    .filter((item): item is SearchContext => item !== null);
}

function inferTokens(text: string): string[] {
  const candidates = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "NEAR", "AI", "ETF"];
  return candidates.filter((token) => new RegExp(`(^|[^A-Za-z])${token}([^A-Za-z]|$)`, "i").test(text)).slice(0, 8);
}

function inferNarratives(text: string): string[] {
  const map: [RegExp, string][] = [
    [/ETF|资金流|fund flow/i, "ETF 资金流"],
    [/AI|人工智能|算力|模型/i, "AI"],
    [/Meme|迷因/i, "Meme"],
    [/Solana|SOL/i, "Solana 生态"],
    [/监管|SEC|法院|合规/i, "监管"],
    [/黑客|漏洞|攻击|安全/i, "安全事件"],
    [/DeFi|流动性|借贷|DEX/i, "DeFi"]
  ];
  const narratives = map.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
  return [...new Set(narratives)].slice(0, 5);
}

function trimSentence(value: string, maxLength: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}…` : compact;
}

function buildMarketImpact(tokens: string[], narratives: string[]): string {
  const tokenText = tokens.length ? `相关资产（${tokens.join("、")}）` : "相关资产";
  const narrativeText = narratives.length ? `与「${narratives.join(" / ")}」叙事` : "与当前市场叙事";
  return `这些来源可能提升${tokenText}${narrativeText}的关注度，但现阶段更适合用于信息跟踪和风险核验，不构成投资建议。`;
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
