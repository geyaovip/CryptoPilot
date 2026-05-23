import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { FeedType, Prisma } from "@prisma/client";
import { FeedAiService } from "../ai/feed-ai.service";
import { PrismaService } from "../prisma/prisma.service";
import { toFeedSummary } from "../feed/feed.mapper";
import { AdminFeedQueryDto, CreateAdminFeedDto, UpdateAdminFeedDto } from "./dto/admin-feed.dto";

@Injectable()
export class AdminFeedService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FeedAiService) private readonly feedAiService: FeedAiService
  ) {}

  async list(query: AdminFeedQueryDto = {}) {
    const where: Prisma.FeedItemWhereInput = { deletedAt: null };

    if (query.status) {
      where.status = query.status.toUpperCase() as "PUBLISHED" | "HIDDEN" | "DELETED";
    }
    if (query.type) {
      where.type = query.type.toUpperCase() as FeedType;
    }
    if (query.source_id) {
      where.sourceId = query.source_id;
    }
    if (query.published_from || query.published_to) {
      where.publishTime = {
        ...(query.published_from ? { gte: new Date(query.published_from) } : {}),
        ...(query.published_to ? { lte: new Date(query.published_to) } : {})
      };
    }

    const items = await this.prisma.feedItem.findMany({
      where,
      include: {
        source: true,
        feedItemTokens: { include: { token: true } },
        feedItemNarratives: { include: { narrative: true } }
      },
      orderBy: [{ isPinned: "desc" }, { publishTime: "desc" }],
      take: 50
    });
    return { items: items.map(toFeedSummary), next_cursor: null };
  }

  async create(dto: CreateAdminFeedDto) {
    const source = await this.ensureManualSource();
    const feed = await this.prisma.feedItem.create({
      data: {
        sourceId: source.id,
        title: dto.title,
        content: dto.content,
        aiSummary: dto.content.slice(0, 160),
        sourceUrl: dto.source_url,
        publishTime: new Date(),
        heatScore: 50,
        rankScore: 50
      }
    });
    await this.audit("create_feed", feed.id, null, feed);
    this.feedAiService.queueGeneration(feed.id);
    return { success: true, id: feed.id };
  }

  async regenerateAi(id: string) {
    await this.find(id);
    await this.prisma.feedItem.update({
      where: { id },
      data: { aiGeneratedAt: null, aiGenerationError: null }
    });
    this.feedAiService.queueGeneration(id);
    return { success: true };
  }

  async update(id: string, dto: UpdateAdminFeedDto) {
    const before = await this.find(id);
    const feed = await this.prisma.feedItem.update({
      where: { id },
      data: {
        title: dto.title,
        aiSummary: dto.ai_summary
      }
    });
    await this.audit("edit_feed", id, before, feed);
    return { success: true };
  }

  async pin(id: string) {
    const before = await this.find(id);
    const feed = await this.prisma.feedItem.update({ where: { id }, data: { isPinned: !before.isPinned } });
    await this.audit("pin_feed", id, before, feed);
    return { success: true };
  }

  async hide(id: string) {
    const before = await this.find(id);
    const status = before.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN";
    const feed = await this.prisma.feedItem.update({ where: { id }, data: { status } });
    await this.audit("hide_feed", id, before, feed);
    return { success: true };
  }

  async delete(id: string) {
    const before = await this.find(id);
    const feed = await this.prisma.feedItem.update({
      where: { id },
      data: { status: "DELETED", deletedAt: new Date() }
    });
    await this.audit("delete_feed", id, before, feed);
    return { success: true };
  }

  private async find(id: string) {
    const feed = await this.prisma.feedItem.findUnique({ where: { id } });
    if (!feed) throw new NotFoundException("Feed 不存在");
    return feed;
  }

  private async ensureManualSource() {
    return this.prisma.source.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: { id: "00000000-0000-0000-0000-000000000001", name: "Manual", type: "MANUAL", sourceWeight: 50 }
    });
  }

  private async audit(action: string, entityId: string, beforeJson: unknown, afterJson: unknown) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityType: "feed_item",
        entityId,
        beforeJson: toJson(beforeJson),
        afterJson: toJson(afterJson)
      }
    });
  }
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}
