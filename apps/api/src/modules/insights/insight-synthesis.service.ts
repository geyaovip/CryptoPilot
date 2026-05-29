import { Inject, Injectable, Logger } from "@nestjs/common";
import { FeedType } from "@prisma/client";
import { LlmService } from "../llm/llm.service";
import { PromptService } from "../prompt/prompt.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmbeddingService } from "../ai/embedding.service";
import { buildSourcesFromSignals, parseSourcesJson } from "./insight.mapper";
import { parseInsightSynthesisOutput } from "./insight-synthesis.schema";
import type { InsightSynthesisOutput } from "./insight-synthesis.schema";

const signalInclude = {
  source: true,
  feedItemTokens: { include: { token: true } },
  feedItemNarratives: { include: { narrative: true } }
} as const;

@Injectable()
export class InsightSynthesisService {
  private readonly logger = new Logger(InsightSynthesisService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PromptService) private readonly promptService: PromptService,
    @Inject(LlmService) private readonly llm: LlmService,
    @Inject(EmbeddingService) private readonly embeddingService: EmbeddingService
  ) {}

  async synthesize(insightId: string): Promise<boolean> {
    const insight = await this.prisma.marketInsight.findFirst({
      where: { id: insightId, deletedAt: null },
      include: {
        primaryNarrative: true,
        signals: { where: { deletedAt: null, status: "PUBLISHED" }, include: signalInclude }
      }
    });
    if (!insight || insight.signals.length < 2) return false;

    const sources = buildSourcesFromSignals(insight.signals);
    if (sources.length < 2) return false;
    const template = await this.promptService.getActiveContent("insight_synthesis_prompt");
    const prompt = this.promptService.renderTemplate(template, {
      primary_narrative: insight.primaryNarrative?.name ?? "综合市场",
      signals: insight.signals
        .map(
          (signal, index) =>
            `${index + 1}. ${signal.title} (${signal.source.name}, ${signal.publishTime.toISOString().slice(0, 10)})`
        )
        .join("\n"),
      source_list: sources.map((s) => `${s.source_name} ${s.source_url}`).join("\n")
    });

    try {
      const llm = await this.llm.generateJson({
        promptKey: "insight_synthesis_prompt",
        user: prompt
      });
      const parsed = parseInsightSynthesisOutput(llm.data);
      const output = parsed.success ? parsed.data : this.fallbackOutput(insight);
      await this.publishInsight(insightId, insight, sources, output);

      await this.embeddingService
        .upsertEntityEmbedding("insight", insightId, `${output.ai_insight}\n${output.ai_summary}`)
        .catch((error) => {
          this.logger.warn(error instanceof Error ? error.message : "embedding failed");
        });

      return true;
    } catch (error) {
      this.logger.warn(error instanceof Error ? error.message : "synthesis failed");
      const output = this.fallbackOutput(insight);
      await this.publishInsight(insightId, insight, sources, output);
      await this.embeddingService.upsertEntityEmbedding("insight", insightId, `${output.ai_insight}\n${output.ai_summary}`).catch(() => undefined);
      return true;
    }
  }

  private async publishInsight(
    insightId: string,
    insight: NonNullable<Awaited<ReturnType<InsightSynthesisService["loadInsight"]>>>,
    sources: ReturnType<typeof buildSourcesFromSignals>,
    output: InsightSynthesisOutput
  ) {
    const heatVelocity = insight.heatVelocity;
    await this.prisma.marketInsight.update({
      where: { id: insightId },
      data: {
        aiInsight: output.ai_insight,
        aiSummary: output.ai_summary,
        keyReasons: output.key_reasons,
        marketImpact: output.market_impact,
        sentiment: output.sentiment.toUpperCase() as "BULLISH" | "NEUTRAL" | "BEARISH",
        type: this.toPrismaFeedType(output.type),
        sourcesJson: sources,
        status: "PUBLISHED",
        publishedAt: insight.signals[0]?.publishTime ?? new Date(),
        rankScore: insight.heatScore + heatVelocity
      }
    });
  }

  private fallbackOutput(
    insight: NonNullable<Awaited<ReturnType<InsightSynthesisService["loadInsight"]>>>
  ): InsightSynthesisOutput {
    const primary = insight.primaryNarrative?.name ?? inferTopic(insight.signals.map((signal) => signal.title).join(" "));
    const titles = insight.signals.slice(0, 3).map((signal) => signal.title);
    const firstTitle = titles[0] ?? "多来源市场信号";
    const secondTitle = titles[1];
    return {
      ai_insight: `${primary} 雷达：${compactText(firstTitle, 42)}`,
      ai_summary: secondTitle
        ? `${insight.signals.length} 条已收录来源共同指向「${compactText(firstTitle, 36)}」等相关事件，另有「${compactText(secondTitle, 36)}」提供交叉背景。该解读仅用于研究跟踪，不构成投资建议。`
        : `已收录来源显示「${compactText(firstTitle, 54)}」值得继续跟踪。该解读仅用于研究参考，不构成投资建议。`,
      key_reasons: insight.signals.slice(0, 4).map((signal) => `${signal.source.name} 报道：${compactText(signal.title, 64)}`),
      market_impact: "该组信号可能影响相关叙事关注度与短期市场情绪，仍需结合更多来源和后续数据交叉验证。",
      sentiment: "neutral",
      type: insight.signals[0]?.type.toLowerCase().replace(/_/g, "-") as InsightSynthesisOutput["type"]
    };
  }

  private toPrismaFeedType(type: string): FeedType {
    const normalized = type.toUpperCase().replace(/-/g, "_");
    const values = Object.values(FeedType) as string[];
    return values.includes(normalized) ? (normalized as FeedType) : FeedType.NEWS;
  }

  async resynthesize(insightId: string): Promise<boolean> {
    await this.prisma.marketInsight.update({
      where: { id: insightId },
      data: { status: "HIDDEN" }
    });
    return this.synthesize(insightId);
  }

  private async loadInsight(insightId: string) {
    return this.prisma.marketInsight.findFirst({
      where: { id: insightId, deletedAt: null },
      include: {
        primaryNarrative: true,
        signals: { where: { deletedAt: null, status: "PUBLISHED" }, include: signalInclude }
      }
    });
  }
}

function compactText(value: string, maxLength: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}…` : compact;
}

function inferTopic(text: string): string {
  const rules: Array<[RegExp, string]> = [
    [/bitcoin|btc|比特币/i, "BTC"],
    [/ethereum|eth|以太坊/i, "Ethereum"],
    [/solana|sol\b/i, "Solana"],
    [/\bxrp\b|ripple/i, "XRP"],
    [/etf|资金流/i, "ETF 资金流"],
    [/ai|人工智能|agent|模型/i, "AI"],
    [/sec|监管|合规|牌照|法院/i, "监管"],
    [/黑客|攻击|漏洞|安全|私钥/i, "安全事件"],
    [/交易所|上线|下架|合约|永续/i, "交易所动态"]
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] ?? "市场";
}
