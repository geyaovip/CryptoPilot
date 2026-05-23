import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { toFeedSummary } from "../feed/feed.mapper";

const include = {
  feedItem: {
    include: {
      source: true,
      feedItemTokens: { include: { token: true } },
      feedItemNarratives: { include: { narrative: true } }
    }
  }
} satisfies Prisma.BookmarkInclude;

@Injectable()
export class BookmarksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(userId: string | undefined) {
    const id = this.requireUser(userId);
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: id },
      include,
      orderBy: { createdAt: "desc" }
    });

    return {
      items: bookmarks.map((bookmark) => toFeedSummary(bookmark.feedItem)),
      next_cursor: null
    };
  }

  async create(userId: string | undefined, feedItemId: string) {
    const id = this.requireUser(userId);
    const feed = await this.prisma.feedItem.findUnique({ where: { id: feedItemId } });
    if (!feed) throw new NotFoundException("Feed 不存在");

    try {
      const bookmark = await this.prisma.bookmark.create({ data: { userId: id, feedItemId } });
      return { success: true, id: bookmark.id };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("已经收藏过该 Feed");
      }
      throw error;
    }
  }

  async delete(userId: string | undefined, bookmarkId: string) {
    const id = this.requireUser(userId);
    await this.prisma.bookmark.deleteMany({
      where: {
        userId: id,
        OR: [{ id: bookmarkId }, { feedItemId: bookmarkId }]
      }
    });
    return { success: true };
  }

  private requireUser(userId: string | undefined): string {
    if (!userId) throw new UnauthorizedException("需要登录");
    return userId;
  }
}
