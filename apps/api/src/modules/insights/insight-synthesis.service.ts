import { Inject, Injectable, Logger } from "@nestjs/common";
import { FeedType } from "@prisma/client";
import { LlmService } from "../llm/llm.service";
import { PromptService } from "../prompt/prompt.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmbeddingService } from "../ai/embedding.service";
import { chineseTextRatio, pickChineseDisplayText, stripTrailingPunctuation } from "../ingestion/chinese-content.util";
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
        .slice(0, 4)
        .map(
          (signal, index) =>
            `${index + 1}. ${compactText(signal.title, 140)} (${signal.source.name}, ${signal.publishTime.toISOString().slice(0, 10)})`
        )
        .join("\n"),
      source_list: sources.slice(0, 4).map((s) => `${s.source_name} ${s.source_url}`).join("\n")
    });

    try {
      const llm = await this.llm.generateJson({
        promptKey: "insight_synthesis_prompt",
        user: prompt,
        requireReal: true
      });
      const parsed = parseInsightSynthesisOutput(llm.data);
      if (!parsed.success) return false;
      const output = parsed.data;

      // Validate Chinese output — LLM may ignore the "中文为主" instruction
      const insightIsChinese = chineseTextRatio(output.ai_insight) >= 0.08;
      const summaryIsChinese = chineseTextRatio(output.ai_summary) >= 0.08;
      if (!insightIsChinese || !summaryIsChinese) {
        const signalText = insight.signals.map((s) => s.title).join(" ");
        const fallback = pickChineseDisplayText([signalText, ...insight.signals.map((s) => s.content)]);
        if (fallback) {
          if (!insightIsChinese) output.ai_insight = fallback.slice(0, 80);
          if (!summaryIsChinese) output.ai_summary = fallback.slice(0, 160);
        }
      }

      output.ai_insight = stripTrailingPunctuation(output.ai_insight);

      await this.publishInsight(insightId, insight, sources, output);

      await this.embeddingService
        .upsertEntityEmbedding("insight", insightId, `${output.ai_insight}\n${output.ai_summary}`)
        .catch((error) => {
          this.logger.warn(error instanceof Error ? error.message : "embedding failed");
        });

      return true;
    } catch (error) {
      this.logger.warn(error instanceof Error ? error.message : "synthesis failed");
      return false;
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

function compactText(text: string, limit: number): string {
  return text.replace(/\s+/g, " ").trim().slice(0, limit);
}
