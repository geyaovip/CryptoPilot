import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { toFeedSummary } from "../feed/feed.mapper";
import { toInsightSummary } from "../insights/insight.mapper";

const feedInclude = {
  source: true,
  feedItemTokens: { include: { token: true } },
  feedItemNarratives: { include: { narrative: true } }
} as const;

const insightInclude = {
  primaryNarrative: true,
  signals: {
    where: { deletedAt: null, status: "PUBLISHED" as const },
    include: feedInclude
  }
} as const;

@Injectable()
export class BookmarksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(userId: string | undefined) {
    const id = this.requireUser(userId);
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: id },
      include: { feedItem: { include: feedInclude } },
      orderBy: { createdAt: "desc" }
    });

    const insightIds = bookmarks.filter((row) => row.entityType === "insight").map((row) => row.entityId);
    const insights =
      insightIds.length > 0
        ? await this.prisma.marketInsight.findMany({
            where: { id: { in: insightIds }, deletedAt: null, status: "PUBLISHED" },
            include: insightInclude
          })
        : [];
    const insightMap = new Map(insights.map((row) => [row.id, row]));

    const items = bookmarks
      .map((bookmark) => {
        if (bookmark.entityType === "insight") {
          const insight = insightMap.get(bookmark.entityId);
          return insight ? { kind: "insight" as const, item: toInsightSummary(insight) } : null;
        }
        if (bookmark.feedItem) {
          return { kind: "feed_item" as const, item: toFeedSummary(bookmark.feedItem) };
        }
        return null;
      })
      .filter((row) => row !== null);

    return { entity: "mixed" as const, items, next_cursor: null };
  }

  async create(userId: string | undefined, input: { feed_item_id?: string; insight_id?: string }) {
    const id = this.requireUser(userId);
    if (input.insight_id) return this.createInsightBookmark(id, input.insight_id);
    if (input.feed_item_id) return this.createFeedBookmark(id, input.feed_item_id);
    throw new NotFoundException("请提供 feed_item_id 或 insight_id");
  }

  async delete(userId: string | undefined, bookmarkId: string) {
    const id = this.requireUser(userId);
    await this.prisma.bookmark.deleteMany({
      where: {
        userId: id,
        OR: [{ id: bookmarkId }, { entityId: bookmarkId }, { feedItemId: bookmarkId }]
      }
    });
    return { success: true };
  }

  private async createFeedBookmark(userId: string, feedItemId: string) {
    const feed = await this.prisma.feedItem.findUnique({ where: { id: feedItemId } });
    if (!feed) throw new NotFoundException("Feed 不存在");

    try {
      const bookmark = await this.prisma.bookmark.create({
        data: { userId, entityType: "feed_item", entityId: feedItemId, feedItemId }
      });
      return { success: true, id: bookmark.id };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("已经收藏过该内容");
      }
      throw error;
    }
  }

  private async createInsightBookmark(userId: string, insightId: string) {
    const insight = await this.prisma.marketInsight.findFirst({
      where: { id: insightId, deletedAt: null, status: "PUBLISHED" }
    });
    if (!insight) throw new NotFoundException("Insight 不存在");

    try {
      const bookmark = await this.prisma.bookmark.create({
        data: { userId, entityType: "insight", entityId: insightId }
      });
      return { success: true, id: bookmark.id };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("已经收藏过该 Insight");
      }
      throw error;
    }
  }

  private requireUser(userId: string | undefined): string {
    if (!userId) throw new UnauthorizedException("需要登录");
    return userId;
  }
}
