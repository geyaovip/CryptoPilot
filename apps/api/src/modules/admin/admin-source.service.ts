import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../common/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { IngestionService } from "../ingestion/ingestion.service";
import { UpdateSourceDto } from "./dto/admin-source.dto";

@Injectable()
export class AdminSourceService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(IngestionService) private readonly ingestionService: IngestionService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  async list() {
    const sources = await this.prisma.source.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      take: 50
    });

    return {
      items: sources.map((source) => ({
        id: source.id,
        name: source.name,
        type: source.type.toLowerCase(),
        status: source.status.toLowerCase(),
        last_success_at: source.lastSuccessAt?.toISOString() ?? null,
        last_error_at: source.lastErrorAt?.toISOString() ?? null,
        fetch_interval_seconds: source.fetchIntervalSeconds
      })),
      next_cursor: null
    };
  }

  async update(id: string, dto: UpdateSourceDto, adminUserId: string) {
    const before = await this.ensureSource(id);
    await this.prisma.source.update({
      where: { id },
      data: { status: dto.status?.toUpperCase() as "ACTIVE" | "PAUSED" | "ERROR" | undefined }
    });
    await this.audit.log({
      adminUserId,
      action: "source.update",
      entityType: "source",
      entityId: id,
      before,
      after: dto
    });
    return { success: true };
  }

  async retry(id: string, adminUserId: string) {
    await this.ensureSource(id);
    await this.ingestionService.ingestRssSource(id);
    await this.audit.log({
      adminUserId,
      action: "source.retry",
      entityType: "source",
      entityId: id
    });
    return { success: true };
  }

  async logs(id: string) {
    await this.ensureSource(id);
    const logs = await this.prisma.ingestionLog.findMany({
      where: { sourceId: id },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return {
      items: logs.map((log) => ({
        id: log.id,
        status: log.status.toLowerCase(),
        items_found: log.itemsFound,
        items_created: log.itemsCreated,
        error_message: log.errorMessage,
        started_at: log.startedAt.toISOString(),
        finished_at: log.finishedAt?.toISOString() ?? null
      }))
    };
  }

  private async ensureSource(id: string) {
    const source = await this.prisma.source.findUnique({ where: { id } });
    if (!source) throw new NotFoundException("Source 不存在");
    return source;
  }

}
