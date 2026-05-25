import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdminLogsQueryDto } from "./dto/admin-logs-query.dto";

@Injectable()
export class AdminLogsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(query: AdminLogsQueryDto) {
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();
    const take = query.limit ?? 50;

    const [apiErrors, ingestionErrors, llmErrors, pushErrors, audits] = await Promise.all([
      query.type && query.type !== "api" ? [] : this.apiErrors(from, to, take),
      query.type && query.type !== "ingestion" ? [] : this.ingestionErrors(from, to, take),
      query.type && query.type !== "llm" ? [] : this.llmErrors(from, to, take),
      query.type && query.type !== "push" ? [] : this.pushErrors(from, to, take),
      query.type && query.type !== "audit" ? [] : this.auditLogs(from, to, take)
    ]);

    const items = [...apiErrors, ...ingestionErrors, ...llmErrors, ...pushErrors, ...audits]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, take);

    return { items, from: from.toISOString(), to: to.toISOString() };
  }

  private async apiErrors(from: Date, to: Date, take: number) {
    const rows = await this.prisma.apiErrorLog.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take
    });
    return rows.map((row) => ({
      id: row.id,
      type: "api" as const,
      title: `${row.method} ${row.path}`,
      message: row.message,
      error_code: row.errorCode,
      created_at: row.createdAt.toISOString(),
      detail: { status_code: row.statusCode, request_id: row.requestId }
    }));
  }

  private async ingestionErrors(from: Date, to: Date, take: number) {
    const rows = await this.prisma.ingestionLog.findMany({
      where: { status: "FAILED", createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take,
      include: { source: true }
    });
    return rows.map((row) => ({
      id: row.id,
      type: "ingestion" as const,
      title: row.source?.name ?? "采集",
      message: row.errorMessage ?? "采集失败",
      error_code: "SOURCE_UNAVAILABLE",
      created_at: row.createdAt.toISOString(),
      detail: { source_id: row.sourceId, items_found: row.itemsFound }
    }));
  }

  private async llmErrors(from: Date, to: Date, take: number) {
    const rows = await this.prisma.llmCallLog.findMany({
      where: { status: "FAILED", createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take
    });
    return rows.map((row) => ({
      id: row.id,
      type: "llm" as const,
      title: row.promptKey,
      message: row.errorMessage ?? "LLM 调用失败",
      error_code: "LLM_PROVIDER_ERROR",
      created_at: row.createdAt.toISOString(),
      detail: { provider: row.provider, model: row.model }
    }));
  }

  private async pushErrors(_from: Date, _to: Date, _take: number) {
    return [] as Array<{
      id: string;
      type: "push";
      title: string;
      message: string;
      error_code: string;
      created_at: string;
      detail: Record<string, unknown>;
    }>;
  }

  private async auditLogs(from: Date, to: Date, take: number) {
    const rows = await this.prisma.auditLog.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take
    });
    return rows.map((row) => ({
      id: row.id,
      type: "audit" as const,
      title: row.action,
      message: `${row.entityType}${row.entityId ? ` #${row.entityId}` : ""}`,
      error_code: "AUDIT",
      created_at: row.createdAt.toISOString(),
      detail: { admin_user_id: row.adminUserId }
    }));
  }
}
