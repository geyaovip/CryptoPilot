import { Inject, Injectable, Logger } from "@nestjs/common";
import { FeedType } from "@prisma/client";
import { LlmService } from "../llm/llm.service";
import { PromptService } from "../prompt/prompt.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmbeddingService } from "../ai/embedding.service";
import { buildSourcesFromSignals, parseSourcesJson } from "./insight.mapper";
import { parseInsightSynthesisOutput } from "./insight-synthesis.schema";

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
      if (!parsed.success) return false;

      const heatVelocity = insight.heatVelocity;
      await this.prisma.marketInsight.update({
        where: { id: insightId },
        data: {
          aiInsight: parsed.data.ai_insight,
          aiSummary: parsed.data.ai_summary,
          keyReasons: parsed.data.key_reasons,
          marketImpact: parsed.data.market_impact,
          sentiment: parsed.data.sentiment.toUpperCase() as "BULLISH" | "NEUTRAL" | "BEARISH",
          type: this.toPrismaFeedType(parsed.data.type),
          sourcesJson: sources,
          status: "PUBLISHED",
          publishedAt: insight.signals[0]?.publishTime ?? new Date(),
          rankScore: insight.heatScore + heatVelocity
        }
      });

      await this.embeddingService
        .upsertEntityEmbedding("insight", insightId, `${parsed.data.ai_insight}\n${parsed.data.ai_summary}`)
        .catch((error) => {
          this.logger.warn(error instanceof Error ? error.message : "embedding failed");
        });

      return true;
    } catch (error) {
      this.logger.warn(error instanceof Error ? error.message : "synthesis failed");
      return false;
    }
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
}
