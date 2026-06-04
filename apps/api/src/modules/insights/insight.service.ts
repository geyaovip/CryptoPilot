import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { FeedType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { FeedQueryDto } from "../feed/dto/feed-query.dto";
import { compareFeedsForTab, effectiveFeedSortScore } from "../feed/feed-ranking.util";
import { UserInterestService } from "../feed/user-interest.service";
import { parseSourcesJson, toInsightDetail, toInsightSummary } from "./insight.mapper";

const insightInclude = {
  primaryNarrative: true,
  signals: {
    where: { deletedAt: null, status: "PUBLISHED" as const },
    include: {
      source: true,
      feedItemTokens: { include: { token: true } },
      feedItemNarratives: { include: { narrative: true } }
    }
  }
} satisfies Prisma.MarketInsightInclude;

@Injectable()
export class InsightService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(UserInterestService) private readonly userInterest: UserInterestService
  ) {}

  async list(query: FeedQueryDto, userId?: string) {
    const limit = query.limit ? Number(query.limit) : 20;
    const where: Prisma.MarketInsightWhereInput = {
      deletedAt: null,
      status: "PUBLISHED"
    };

    if (query.type) {
      where.type = query.type.toUpperCase() as FeedType;
    }

    if (query.narrative) {
      where.OR = [
        { primaryNarrative: { slug: query.narrative, deletedAt: null, isActive: true } },
        {
          signals: {
            some: {
              feedItemNarratives: {
                some: { narrative: { slug: query.narrative, deletedAt: null, isActive: true } }
              }
            }
          }
        }
      ];
    }

    if (query.tab === "breaking") {
      where.OR = [{ type: "BREAKING" }, { heatScore: { gte: 90 } }];
    }

    const interestContext = await this.userInterest.loadContext(userId);
    const usePersonalizedRank = query.tab === "for_you" || Boolean(query.narrative);
    const fetchLimit = usePersonalizedRank ? Math.min(limit * 4, 80) : limit + 1;

    const rows = await this.prisma.marketInsight.findMany({
      where,
      include: insightInclude,
      orderBy: usePersonalizedRank ? undefined : this.orderBy(query.tab),
      take: fetchLimit,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {})
    });

    const published = rows.filter((row) => parseSourcesJson(row.sourcesJson).length >= 2);

    const rankedRows =
      usePersonalizedRank && interestContext
        ? [...published].sort((a, b) => {
            const scoreA = this.scoreInsight(a, interestContext, query.narrative);
            const scoreB = this.scoreInsight(b, interestContext, query.narrative);
            if (scoreB !== scoreA) return scoreB - scoreA;
            return b.publishedAt.getTime() - a.publishedAt.getTime();
          })
        : published;
    const ranked = query.tab === "latest" || query.narrative ? rankedRows : diversifyInsights(rankedRows);

    const page = ranked.slice(0, limit);
    const next = ranked.length > limit ? ranked[limit] : null;

    return {
      entity: "insight" as const,
      items: page.map((row) => toInsightSummary(row)),
      next_cursor: next?.id ?? null
    };
  }

  async getById(id: string) {
    const insight = await this.prisma.marketInsight.findFirst({
      where: { id, deletedAt: null, status: { not: "DELETED" } },
      include: insightInclude
    });
    if (!insight) throw new NotFoundException("Insight 不存在");
    const sources = parseSourcesJson(insight.sourcesJson);
    if (sources.length < 2) {
      throw new NotFoundException("Insight 来源不足");
    }
    return toInsightDetail(insight);
  }

  private orderBy(tab?: string): Prisma.MarketInsightOrderByWithRelationInput[] {
    if (tab === "latest") return [{ updatedAt: "desc" }];
    return [{ rankScore: "desc" }, { publishedAt: "desc" }];
  }

  private scoreInsight(
    insight: Prisma.MarketInsightGetPayload<{ include: typeof insightInclude }>,
    context: NonNullable<Awaited<ReturnType<UserInterestService["loadContext"]>>>,
    narrativeSlug?: string
  ): number {
    let bonus = 0;
    for (const signal of insight.signals) {
      bonus = Math.max(bonus, effectiveFeedSortScore(signal, 0, narrativeSlug));
      bonus = Math.max(bonus, this.userInterest.scoreFeed(signal, context));
    }
    return insight.rankScore + insight.heatVelocity + bonus;
  }
}

type InsightListRow = Prisma.MarketInsightGetPayload<{ include: typeof insightInclude }>;

function diversifyInsights(rows: InsightListRow[]): InsightListRow[] {
  const output: InsightListRow[] = [];
  const pending = [...rows];
  const seenTopics = new Map<string, number>();
  let lastTopic: string | null = null;

  while (pending.length > 0) {
    const nextIndex = pickDiverseIndex(pending, lastTopic, seenTopics);
    const [next] = pending.splice(nextIndex, 1);
    output.push(next);
    const topic = insightTopicKey(next);
    lastTopic = topic;
    seenTopics.set(topic, (seenTopics.get(topic) ?? 0) + 1);
  }

  return output;
}

function pickDiverseIndex(rows: InsightListRow[], lastTopic: string | null, seenTopics: Map<string, number>): number {
  let bestIndex = 0;
  let bestScore = Number.NEGATIVE_INFINITY;
  rows.forEach((row, index) => {
    const topic = insightTopicKey(row);
    const penalty = topic === lastTopic ? 120 : (seenTopics.get(topic) ?? 0) * 35;
    const score = row.rankScore + row.heatVelocity - penalty;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function insightTopicKey(insight: InsightListRow): string {
  if (insight.primaryNarrative?.slug) return `narrative:${insight.primaryNarrative.slug}`;
  const token = insight.signals.flatMap((signal) => signal.feedItemTokens).at(0)?.token.symbol;
  if (token) return `token:${token.toLowerCase()}`;
  return `type:${insight.type.toLowerCase()}`;
}
