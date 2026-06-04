import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { BackgroundJobsService } from "../common/background-jobs.service";
import { AppHttpException } from "../common/app-http.exception";
import { LlmService } from "../llm/llm.service";
import { PromptService } from "../prompt/prompt.service";
import { PrismaService } from "../prisma/prisma.service";
import { classifyFeedContentType } from "../feed/feed-content-type.util";
import { pickChineseDisplayText, chineseTextRatio } from "../ingestion/chinese-content.util";
import { EmbeddingService } from "./embedding.service";
import { parseFeedSummaryOutput } from "./schemas";

@Injectable()
export class FeedAiService {
  private readonly logger = new Logger(FeedAiService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PromptService) private readonly promptService: PromptService,
    @Inject(LlmService) private readonly llm: LlmService,
    @Inject(EmbeddingService) private readonly embeddingService: EmbeddingService,
    @Inject(BackgroundJobsService) private readonly jobs: BackgroundJobsService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  queueGeneration(feedItemId: string): void {
    if (!this.jobs.enabled) return;
    void this.generateForFeed(feedItemId).catch((error) => {
      this.logger.warn(`Feed AI 生成失败 ${feedItemId}: ${error instanceof Error ? error.message : "unknown"}`);
    });
  }

  @Cron("*/2 * * * *")
  async processPending(): Promise<void> {
    if (!this.jobs.enabled) return;
    const pending = await this.prisma.feedItem.findMany({
      where: { aiGeneratedAt: null, deletedAt: null, status: "PUBLISHED" },
      orderBy: { createdAt: "asc" },
      take: Number(this.config.get<string>("LLM_FEED_AI_BATCH_SIZE") ?? "2"),
      select: { id: true }
    });
    for (const item of pending) {
      await this.generateForFeed(item.id);
    }
  }

  async generateForFeed(feedItemId: string): Promise<void> {
    const feed = await this.prisma.feedItem.findUnique({
      where: { id: feedItemId },
      include: {
        source: true,
        feedItemTokens: { include: { token: true } },
        feedItemNarratives: { include: { narrative: true } }
      }
    });
    if (!feed || feed.deletedAt) return;
    if (!feed.sourceUrl) {
      await this.markError(feedItemId, "缺少来源链接，无法生成 AI 摘要");
      return;
    }

    const template = await this.promptService.getActiveContent("feed_summary_prompt");
    const variables = {
      title: feed.title,
      content: compactText(feed.content, Number(this.config.get<string>("LLM_FEED_CONTENT_CHARS") ?? "1200")),
      source_name: feed.source.name,
      source_url: feed.sourceUrl,
      related_tokens: feed.feedItemTokens.map(({ token }) => token.symbol).join(", "),
      narrative_candidates: feed.feedItemNarratives.map(({ narrative }) => narrative.slug).join(", ")
    };
    const prompt = this.promptService.renderTemplate(template, variables);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const llm = await this.llm.generateJson({
          promptKey: "feed_summary_prompt",
          user: prompt,
          requireReal: true
        });
        const parsed = parseFeedSummaryOutput(llm.data);
        if (!parsed.success) throw new AppHttpException("LLM_OUTPUT_INVALID", "Feed AI 输出不符合 Schema");
        const output = parsed.data;
        let headline = output.headline?.trim() || output.summary.trim().slice(0, 50);
        let summary = output.summary.trim();

        // Fallback: if LLM didn't produce Chinese, use source Chinese text
        const headlineIsChinese = chineseTextRatio(headline) >= 0.08;
        const summaryIsChinese = chineseTextRatio(summary) >= 0.08;

        if (!headlineIsChinese || !summaryIsChinese) {
          const fallbackFromSource = pickChineseDisplayText([feed.title, feed.content]);
          if (fallbackFromSource) {
            if (!headlineIsChinese) headline = fallbackFromSource.slice(0, 50);
            if (!summaryIsChinese) summary = fallbackFromSource.slice(0, 500);
          }
        }

        const reclassifiedType = classifyFeedContentType({
          title: feed.title,
          content: feed.content,
          source: { name: feed.source.name },
          sentiment: output.sentiment.toUpperCase(),
          feedItemNarratives: output.narrative_tags.map((slug) => ({ narrativeId: slug })),
          feedItemTokens: output.related_tokens.map((symbol) => ({ tokenId: symbol }))
        });
        await this.prisma.feedItem.update({
          where: { id: feedItemId },
          data: {
            type: reclassifiedType,
            aiSummary: summary,
            narrativeHook: headline,
            aiKeyReasons: output.key_reasons,
            aiMarketImpact: output.market_impact,
            sentiment: output.sentiment.toUpperCase() as "BULLISH" | "NEUTRAL" | "BEARISH",
            aiGeneratedAt: new Date(),
            aiGenerationError: null
          }
        });
        await this.syncRelations(feedItemId, output.related_tokens, output.narrative_tags);
        await this.embeddingService
          .upsertFeedEmbedding(feedItemId, `${feed.title}\n${feed.content}\n${output.summary}`)
          .catch((error) => {
            this.logger.warn(error instanceof Error ? error.message : "feed embedding failed");
          });
        return;
      } catch (error) {
        if (attempt === 1) {
          await this.markError(feedItemId, error instanceof Error ? error.message : "AI 生成失败");
        }
      }
    }
  }

  private async syncRelations(feedItemId: string, tokenSymbols: string[], narrativeSlugs: string[]) {
    for (const symbol of tokenSymbols.slice(0, 5)) {
      const token = await this.prisma.token.findUnique({ where: { symbol: symbol.toUpperCase() } });
      if (!token) continue;
      await this.prisma.feedItemToken.upsert({
        where: { feedItemId_tokenId: { feedItemId, tokenId: token.id } },
        update: {},
        create: { feedItemId, tokenId: token.id }
      });
    }
    for (const slug of narrativeSlugs.slice(0, 5)) {
      const narrative = await this.prisma.narrative.findFirst({
        where: { OR: [{ slug }, { name: slug }], deletedAt: null }
      });
      if (!narrative) continue;
      await this.prisma.feedItemNarrative.upsert({
        where: { feedItemId_narrativeId: { feedItemId, narrativeId: narrative.id } },
        update: {},
        create: { feedItemId, narrativeId: narrative.id }
      });
    }
  }

  private async markError(feedItemId: string, message: string) {
    await this.prisma.feedItem.update({
      where: { id: feedItemId },
      data: { aiGenerationError: message }
    });
  }
}

function compactText(text: string, limit: number): string {
  return text.replace(/\s+/g, " ").trim().slice(0, Math.max(200, limit));
}
