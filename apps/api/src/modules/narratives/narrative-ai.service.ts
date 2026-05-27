import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { BackgroundJobsService } from "../common/background-jobs.service";
import { LlmService } from "../llm/llm.service";
import { PromptService } from "../prompt/prompt.service";
import { PrismaService } from "../prisma/prisma.service";
import { parseNarrativeSummaryOutput } from "./narrative-summary.schema";

@Injectable()
export class NarrativeAiService {
  private readonly logger = new Logger(NarrativeAiService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PromptService) private readonly promptService: PromptService,
    @Inject(LlmService) private readonly llm: LlmService,
    @Inject(BackgroundJobsService) private readonly jobs: BackgroundJobsService
  ) {}

  @Cron("*/15 * * * *")
  async processStaleSummaries(): Promise<void> {
    if (!this.jobs.enabled) return;
    const staleBefore = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const narratives = await this.prisma.narrative.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        mergedIntoId: null,
        OR: [{ aiSummary: null }, { updatedAt: { lt: staleBefore } }]
      },
      orderBy: { updatedAt: "asc" },
      take: 3,
      select: { id: true }
    });
    for (const narrative of narratives) {
      await this.generateForNarrative(narrative.id).catch((error) => {
        this.logger.warn(
          `Narrative AI 失败 ${narrative.id}: ${error instanceof Error ? error.message : "unknown"}`
        );
      });
    }
  }

  async generateForNarrative(narrativeId: string): Promise<void> {
    const narrative = await this.prisma.narrative.findFirst({
      where: { id: narrativeId, deletedAt: null, mergedIntoId: null }
    });
    if (!narrative) return;

    const feeds = await this.prisma.feedItem.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        feedItemNarratives: { some: { narrativeId } }
      },
      include: { source: true },
      orderBy: { publishTime: "desc" },
      take: 8
    });

    const relatedFeed =
      feeds.length > 0
        ? feeds
            .map(
              (feed) =>
                `- ${feed.title} (${feed.source.name}, ${feed.publishTime.toISOString().slice(0, 10)})`
            )
            .join("\n")
        : "暂无相关 Feed";

    const template = await this.promptService.getActiveContent("narrative_summary_prompt");
    const prompt = this.promptService.renderTemplate(template, {
      narrative_name: narrative.name,
      narrative_slug: narrative.slug,
      related_feed: relatedFeed
    });

    const llm = await this.llm.generateJson({
      promptKey: "narrative_summary_prompt",
      user: prompt
    });
    const parsed = parseNarrativeSummaryOutput(llm.data);
    if (!parsed.success) return;

    await this.prisma.narrative.update({
      where: { id: narrativeId },
      data: {
        aiSummary: parsed.data.summary,
        sentiment: parsed.data.sentiment.toUpperCase() as "BULLISH" | "NEUTRAL" | "BEARISH"
      }
    });
  }
}
