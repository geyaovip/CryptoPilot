import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../common/audit.service";
import { toInsightDetail, toInsightSummary } from "../insights/insight.mapper";
import { InsightSynthesisService } from "../insights/insight-synthesis.service";
import { normalizeAdminPagination, pageMeta } from "./dto/admin-pagination.dto";
import { AdminInsightQueryDto } from "./dto/admin-insight.dto";

const include = {
  primaryNarrative: true,
  signals: {
    where: { deletedAt: null, status: "PUBLISHED" as const },
    include: {
      source: true,
      feedItemTokens: { include: { token: true } },
      feedItemNarratives: { include: { narrative: true } }
    }
  }
} as const;

@Injectable()
export class AdminInsightService {
  private readonly logger = new Logger(AdminInsightService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(InsightSynthesisService) private readonly synthesis: InsightSynthesisService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  async list(query: AdminInsightQueryDto = {}) {
    const { page, limit, skip } = normalizeAdminPagination(query);
    const search = query.search?.trim();
    this.logger.log(`search="${search}" page=${page} limit=${limit}`);

    // Use raw SQL for search to guarantee ILIKE works regardless of Prisma type inference
    if (search) {
      return this.searchWithRawSql(search, page, limit, skip);
    }

    const where = { deletedAt: null };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.marketInsight.count({ where }),
      this.prisma.marketInsight.findMany({
        where,
        include,
        orderBy: [{ updatedAt: "desc" }],
        skip,
        take: limit
      })
    ]);
    return {
      ...pageMeta(total, page, limit),
      items: rows.map((row) => toInsightSummary(row))
    };
  }

  private async searchWithRawSql(searchTerm: string, page: number, limit: number, skip: number) {
    const pattern = `%${searchTerm}%`;
    const [countRow, idRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<Array<{ cnt: bigint }>>(
        `SELECT COUNT(DISTINCT mi.id) as cnt
         FROM market_insights mi
         LEFT JOIN narratives n ON n.id = mi.primary_narrative_id
         WHERE mi.deleted_at IS NULL
           AND (mi.ai_insight ILIKE $1 OR mi.ai_summary ILIKE $1
                OR n.name ILIKE $1 OR n.slug ILIKE $1
                OR mi.sources_json::text ILIKE $1)`,
        pattern
      ),
      this.prisma.$queryRawUnsafe<Array<{ id: string; updated_at: Date }>>(
        `SELECT DISTINCT mi.id, mi.updated_at
         FROM market_insights mi
         LEFT JOIN narratives n ON n.id = mi.primary_narrative_id
         WHERE mi.deleted_at IS NULL
           AND (mi.ai_insight ILIKE $1 OR mi.ai_summary ILIKE $1
                OR n.name ILIKE $1 OR n.slug ILIKE $1
                OR mi.sources_json::text ILIKE $1)
         ORDER BY mi.updated_at DESC
         LIMIT $2 OFFSET $3`,
        pattern, limit, skip
      )
    ]);
    const total = Number(countRow[0]?.cnt ?? 0);
    const ids = idRows.map((r) => r.id);
    this.logger.log(`Raw SQL search matched ${total} results, fetching ${ids.length} with relations`);

    if (ids.length === 0) {
      return { ...pageMeta(total, page, limit), items: [] };
    }

    const rows = await this.prisma.marketInsight.findMany({
      where: { id: { in: ids } },
      include,
      orderBy: [{ updatedAt: "desc" }]
    });
    const ordered = ids
      .map((id) => rows.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);

    return {
      ...pageMeta(total, page, limit),
      items: ordered.map((row) => toInsightSummary(row))
    };
  }

  async getById(id: string) {
    const row = await this.prisma.marketInsight.findFirst({
      where: { id, deletedAt: null },
      include
    });
    if (!row) throw new NotFoundException("Insight 不存在");
    return toInsightDetail(row);
  }

  async resynthesize(id: string, adminId: string) {
    const ok = await this.synthesis.resynthesize(id);
    if (!ok) throw new NotFoundException("Insight 合成失败");
    await this.audit.log({
      adminUserId: adminId,
      action: "insight.resynthesize",
      entityType: "insight",
      entityId: id
    });
    return { success: true };
  }

  async updateTitle(id: string, aiInsight: string, adminId: string) {
    const before = await this.prisma.marketInsight.findFirst({
      where: { id, deletedAt: null },
      select: { aiInsight: true }
    });
    if (!before) throw new NotFoundException("Insight 不存在");
    await this.prisma.marketInsight.update({
      where: { id },
      data: { aiInsight }
    });
    await this.audit.log({
      adminUserId: adminId,
      action: "insight.update_title",
      entityType: "insight",
      entityId: id,
      before: { aiInsight: before.aiInsight },
      after: { aiInsight }
    });
    return { success: true };
  }
}
