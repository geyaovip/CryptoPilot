import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { AiSearchResult } from "@cryptopilot/types";
import { AppHttpException } from "../common/app-http.exception";
import { LlmService } from "../llm/llm.service";
import { PromptService } from "../prompt/prompt.service";
import { PrismaService } from "../prisma/prisma.service";
import { SystemConfigService } from "../system/system-config.service";
import { RagService } from "./rag.service";
import { parseAiSearchLlmOutput } from "./schemas";

@Injectable()
export class AiSearchService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PromptService) private readonly promptService: PromptService,
    @Inject(LlmService) private readonly llm: LlmService,
    @Inject(RagService) private readonly rag: RagService,
    @Inject(SystemConfigService) private readonly systemConfig: SystemConfigService
  ) {}

  async search(userId: string | undefined, query: string, insightId?: string): Promise<AiSearchResult> {
    if (!this.systemConfig.snapshot.feature_flags.ai_search) {
      throw new AppHttpException("VALIDATION_ERROR", "AI 搜索功能暂未开放");
    }
    const id = this.requireUser(userId);
    const trimmed = query.trim();
    if (!trimmed) throw new AppHttpException("QUERY_EMPTY", "请输入搜索问题");
    if (trimmed.length > 500) throw new AppHttpException("QUERY_TOO_LONG", "问题长度不能超过 500 字符");

    await this.ensureDailyQuota(id);
    const cached = insightId ? null : await this.findRecentAnswer(id, trimmed);
    if (cached) return cached;
    const providerName = this.llm.getProviderName("ai_search");

    const contextItems = await this.buildContext(trimmed, insightId);
    if (contextItems.length < 2) {
      throw new AppHttpException("INSUFFICIENT_SOURCES", "来源不足，无法生成可靠回答，请换个问题或稍后再试");
    }

    const sources = this.rag.toSources(contextItems);
    const template = await this.promptService.getActiveContent("ai_search_prompt");
    const prompt = this.promptService.renderTemplate(template, {
      query: trimmed,
      context: contextItems
        .slice(0, 6)
        .map(
          (item, index) =>
            `[${index + 1}] ${compactText(item.title, 120)}\n来源: ${item.source_name}\n链接: ${item.source_url}\n摘要: ${compactText(item.ai_summary, 220)}`
        )
        .join("\n\n"),
      sources: sources.slice(0, 6).map((s) => `${s.source_name} ${s.url}`).join("\n")
    });

    let output = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const llm = await this.llm.generateJson({
        promptKey: "ai_search_prompt",
        user: prompt,
        userId: id,
        requireReal: true
      });
      const parsed = parseAiSearchLlmOutput(llm.data);
      if (parsed.success) {
        output = parsed.data;
        break;
      }
      if (attempt === 1) throw new AppHttpException("LLM_OUTPUT_INVALID", "AI 搜索输出不符合 Schema");
    }
    if (!output) throw new AppHttpException("LLM_OUTPUT_INVALID", "AI 搜索输出无效");

    const resolvedSources = sources;
    const updatedAt = new Date().toISOString();
    await this.prisma.aiSearchHistory.create({
      data: {
        userId: id,
        query: trimmed,
        answer: output.answer,
        sourcesJson: resolvedSources,
        tokensUsed: resolvedSources.length * 50,
        provider: providerName,
        model: "chat"
      }
    });
    await this.prisma.user.update({
      where: { id },
      data: { dailyAiSearchCount: { increment: 1 } }
    });

    return {
      answer: output.answer,
      key_reasons: output.key_reasons,
      market_impact: output.market_impact,
      related_tokens: output.related_tokens,
      related_narratives: output.related_narratives,
      sentiment: output.sentiment,
      sources: resolvedSources,
      updated_at: updatedAt
    };
  }

  private async buildContext(query: string, insightId?: string) {
    const ragItems = await this.rag.retrieve(query);
    const insightItems = insightId ? await this.loadInsightContext(insightId) : [];
    const merged = new Map<string, (typeof ragItems)[number]>();
    for (const item of [...insightItems, ...ragItems]) {
      merged.set(item.id, item);
    }
    return [...merged.values()].slice(0, 12);
  }

  private async loadInsightContext(insightId: string) {
    const insight = await this.prisma.marketInsight.findFirst({
      where: { id: insightId, deletedAt: null, status: "PUBLISHED" },
      include: {
        signals: {
          where: { deletedAt: null, status: "PUBLISHED" },
          include: { source: true }
        }
      }
    });
    if (!insight || insight.signals.length < 2) return [];
    return insight.signals.map((signal) => ({
      id: signal.id,
      title: signal.title,
      content: signal.content.slice(0, 600),
      ai_summary: signal.aiSummary,
      source_name: signal.source.name,
      source_url: signal.sourceUrl,
      publish_time: signal.publishTime.toISOString()
    }));
  }

  private requireUser(userId: string | undefined): string {
    if (!userId) throw new UnauthorizedException("需要登录");
    return userId;
  }

  private async findRecentAnswer(userId: string, query: string): Promise<AiSearchResult | null> {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const cached = await this.prisma.aiSearchHistory.findFirst({
      where: { userId, query, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" }
    });
    if (!cached) return null;
    return {
      answer: cached.answer,
      key_reasons: [],
      market_impact: "",
      related_tokens: [],
      related_narratives: [],
      sentiment: "neutral",
      sources: Array.isArray(cached.sourcesJson) ? (cached.sourcesJson as AiSearchResult["sources"]) : [],
      updated_at: cached.createdAt.toISOString()
    };
  }

  private async ensureDailyQuota(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("需要登录");

    const now = new Date();
    const resetAt = user.lastAiSearchResetAt;
    const needsReset = !resetAt || resetAt.toDateString() !== now.toDateString();
    if (needsReset) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { dailyAiSearchCount: 0, lastAiSearchResetAt: now }
      });
      return;
    }
    const dailyLimit = this.systemConfig.snapshot.ai_search_daily_limit;
    if (user.dailyAiSearchCount >= dailyLimit) {
      throw new AppHttpException("DAILY_LIMIT_EXCEEDED", `今日 AI 搜索次数已用完（${dailyLimit} 次/天）`);
    }
  }
}

function compactText(text: string, limit: number): string {
  return text.replace(/\s+/g, " ").trim().slice(0, limit);
}
