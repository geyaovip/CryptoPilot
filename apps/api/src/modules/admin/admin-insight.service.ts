import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../common/audit.service";
import { toInsightDetail, toInsightSummary } from "../insights/insight.mapper";
import { InsightSynthesisService } from "../insights/insight-synthesis.service";

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
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(InsightSynthesisService) private readonly synthesis: InsightSynthesisService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  async list() {
    const rows = await this.prisma.marketInsight.findMany({
      where: { deletedAt: null },
      include,
      orderBy: [{ updatedAt: "desc" }],
      take: 50
    });
    return { items: rows.map((row) => toInsightSummary(row)) };
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
}
