import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NarrativeAiService } from "../narratives/narrative-ai.service";
import { NarrativeMetricsService } from "../narratives/narrative-metrics.service";
import { CreateAdminNarrativeDto, MergeAdminNarrativeDto, UpdateAdminNarrativeDto } from "./dto/admin-narrative.dto";

@Injectable()
export class AdminNarrativeService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NarrativeMetricsService) private readonly metrics: NarrativeMetricsService,
    @Inject(NarrativeAiService) private readonly narrativeAi: NarrativeAiService
  ) {}

  async regenerateAi(id: string) {
    await this.findOrThrow(id);
    await this.narrativeAi.generateForNarrative(id);
    return { id, regenerated: true };
  }

  async list() {
    const items = await this.prisma.narrative.findMany({
      where: { deletedAt: null },
      orderBy: [{ isActive: "desc" }, { heatScore: "desc" }]
    });
    return {
      items: items.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        is_active: row.isActive,
        heat_score: row.heatScore,
        weight: row.weight,
        ai_summary: row.aiSummary,
        description: row.description,
        merged_into_id: row.mergedIntoId,
        updated_at: row.updatedAt.toISOString()
      }))
    };
  }

  async create(dto: CreateAdminNarrativeDto) {
    const narrative = await this.prisma.narrative.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        weight: dto.weight ?? 50,
        isActive: dto.is_active ?? true,
        aiSummary: dto.ai_summary
      }
    });
    await this.metrics.refreshOne(narrative.id).catch(() => undefined);
    return { id: narrative.id };
  }

  async update(id: string, dto: UpdateAdminNarrativeDto) {
    const existing = await this.findOrThrow(id);
    const narrative = await this.prisma.narrative.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        weight: dto.weight,
        isActive: dto.is_active,
        aiSummary: dto.ai_summary,
        sentiment: dto.sentiment
          ? (dto.sentiment.toUpperCase() as "BULLISH" | "NEUTRAL" | "BEARISH")
          : undefined
      }
    });
    await this.metrics.refreshOne(narrative.id).catch(() => undefined);
    return { id: existing.id, updated: true };
  }

  async merge(id: string, dto: MergeAdminNarrativeDto) {
    await this.findOrThrow(id);
    const target = await this.findOrThrow(dto.target_narrative_id);
    await this.prisma.feedItemNarrative.updateMany({
      where: { narrativeId: id },
      data: { narrativeId: target.id }
    });
    await this.prisma.narrative.update({
      where: { id },
      data: { mergedIntoId: target.id, isActive: false }
    });
    return { merged_into: target.id };
  }

  async relatedFeeds(id: string) {
    await this.findOrThrow(id);
    const feeds = await this.prisma.feedItem.findMany({
      where: { feedItemNarratives: { some: { narrativeId: id } }, deletedAt: null },
      orderBy: { publishTime: "desc" },
      take: 20,
      select: { id: true, title: true, publishTime: true, status: true }
    });
    return {
      items: feeds.map((feed) => ({
        id: feed.id,
        title: feed.title,
        publish_time: feed.publishTime.toISOString(),
        status: feed.status.toLowerCase()
      }))
    };
  }

  private async findOrThrow(id: string) {
    const row = await this.prisma.narrative.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw new NotFoundException("Narrative 不存在");
    return row;
  }
}
