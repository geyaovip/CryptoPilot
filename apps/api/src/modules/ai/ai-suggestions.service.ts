import { Inject, Injectable } from "@nestjs/common";
import type { AiSearchSuggestion } from "@cryptopilot/types";
import { PrismaService } from "../prisma/prisma.service";

const FALLBACK_QUESTIONS: AiSearchSuggestion[] = [
  { question: "BTC 今天的波动主要受哪些事件影响？", source: "fallback" },
  { question: "过去 24 小时，哪些 Token 出现明显异动？", source: "fallback" },
  { question: "最近升温最快的 Crypto 叙事是什么？", source: "fallback" },
  { question: "ETH 近期有哪些值得关注的事件或风险？", source: "fallback" },
  { question: "Meme 板块现在是情绪升温，还是短线噪音？", source: "fallback" },
  { question: "今天市场里最需要留意的风险信号是什么？", source: "fallback" }
];

@Injectable()
export class AiSuggestionsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(): Promise<{ items: AiSearchSuggestion[] }> {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const [feeds, narratives, tokens] = await Promise.all([
      this.prisma.feedItem.findMany({
        where: { deletedAt: null, status: "PUBLISHED", publishTime: { gte: since } },
        orderBy: [{ heatScore: "desc" }, { rankScore: "desc" }, { publishTime: "desc" }],
        take: 4,
        select: { title: true, aiSummary: true }
      }),
      this.prisma.narrative.findMany({
        where: { deletedAt: null, isActive: true, mergedIntoId: null },
        orderBy: [{ heatScore: "desc" }, { updatedAt: "desc" }],
        take: 3,
        select: { name: true }
      }),
      this.prisma.token.findMany({
        where: { deletedAt: null },
        orderBy: [{ priceChange24h: "desc" }, { symbol: "asc" }],
        take: 3,
        select: { symbol: true, priceChange24h: true }
      })
    ]);

    const dynamic: AiSearchSuggestion[] = [
      ...feeds.map((feed) => ({
        question: `「${compactTopic(feed.aiSummary || feed.title)}」这件事的背景和影响是什么？`,
        source: "feed" as const
      })),
      ...narratives.map((narrative) => ({
        question: `${narrative.name} 叙事最近为什么升温？`,
        source: "narrative" as const
      })),
      ...tokens.map((token) => ({
        question: `${token.symbol} 过去 24 小时的异动主要来自哪些事件？`,
        source: "token" as const
      }))
    ];

    return { items: dedupeQuestions([...dynamic, ...FALLBACK_QUESTIONS]).slice(0, 6) };
  }
}

function compactTopic(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[。！？.!?].*$/, "").slice(0, 42);
}

function dedupeQuestions(items: AiSearchSuggestion[]): AiSearchSuggestion[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
