import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdminLogsQueryDto } from "./dto/admin-logs-query.dto";
import { normalizeAdminPagination, pageMeta } from "./dto/admin-pagination.dto";

type AdminLogType = "api" | "ingestion" | "llm" | "push" | "audit";

type AdminLogRecord = {
  id: string;
  type: AdminLogType;
  title: string;
  message: string;
  error_code: string;
  created_at: string;
  detail?: Record<string, unknown>;
};

@Injectable()
export class AdminLogsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(query: AdminLogsQueryDto) {
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();
    const { page, limit, skip } = normalizeAdminPagination(query, 25);

    if (query.type) {
      const { items, total } = await this.listByType(query.type, from, to, skip, limit);
      return {
        items,
        from: from.toISOString(),
        to: to.toISOString(),
        ...pageMeta(total, page, limit)
      };
    }

    const total = await this.countAll(from, to);
    const fetchLimit = Math.min(skip + limit, 500);
    const [apiErrors, ingestionErrors, llmErrors, pushErrors, audits] = await Promise.all([
      this.apiErrors(from, to, fetchLimit),
      this.ingestionErrors(from, to, fetchLimit),
      this.llmErrors(from, to, fetchLimit),
      this.pushErrors(from, to, fetchLimit),
      this.auditLogs(from, to, fetchLimit)
    ]);

    const items = [...apiErrors, ...ingestionErrors, ...llmErrors, ...pushErrors, ...audits]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(skip, skip + limit);

    return {
      items,
      from: from.toISOString(),
      to: to.toISOString(),
      ...pageMeta(total, page, limit)
    };
  }

  private async listByType(type: AdminLogType, from: Date, to: Date, skip: number, limit: number) {
    switch (type) {
      case "api":
        return this.paginatedApi(from, to, skip, limit);
      case "ingestion":
        return this.paginatedIngestion(from, to, skip, limit);
      case "llm":
        return this.paginatedLlm(from, to, skip, limit);
      case "push":
        return this.paginatedPush(from, to, skip, limit);
      case "audit":
        return this.paginatedAudit(from, to, skip, limit);
    }
  }

  private async countAll(from: Date, to: Date) {
    const [api, ingestion, llm, push, audit] = await Promise.all([
      this.prisma.apiErrorLog.count({ where: this.apiErrorWhere(from, to) }),
      this.prisma.ingestionLog.count({ where: this.ingestionErrorWhere(from, to) }),
      this.prisma.llmCallLog.count({ where: this.llmErrorWhere(from, to) }),
      this.prisma.pushDeliveryLog.count({ where: this.pushErrorWhere(from, to) }),
      this.prisma.auditLog.count({ where: this.auditWhere(from, to) })
    ]);
    return api + ingestion + llm + push + audit;
  }

  private async paginatedApi(from: Date, to: Date, skip: number, limit: number) {
    const where = this.apiErrorWhere(from, to);
    const [total, rows] = await Promise.all([
      this.prisma.apiErrorLog.count({ where }),
      this.prisma.apiErrorLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit })
    ]);
    return { total, items: rows.map((row) => this.mapApiError(row)) };
  }

  private async paginatedLlm(from: Date, to: Date, skip: number, limit: number) {
    const where = this.llmErrorWhere(from, to);
    const [total, rows] = await Promise.all([
      this.prisma.llmCallLog.count({ where }),
      this.prisma.llmCallLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit })
    ]);
    return { total, items: rows.map((row) => this.mapLlmError(row)) };
  }

  private async paginatedAudit(from: Date, to: Date, skip: number, limit: number) {
    const where = this.auditWhere(from, to);
    const [total, rows] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit })
    ]);
    return { total, items: rows.map((row) => this.mapAudit(row)) };
  }

  private async paginatedIngestion(from: Date, to: Date, skip: number, limit: number) {
    const where = this.ingestionErrorWhere(from, to);
    const [total, rows] = await Promise.all([
      this.prisma.ingestionLog.count({ where }),
      this.prisma.ingestionLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { source: true }
      })
    ]);
    return { total, items: rows.map((row) => this.mapIngestionError(row)) };
  }

  private async paginatedPush(from: Date, to: Date, skip: number, limit: number) {
    const where = this.pushErrorWhere(from, to);
    const [total, rows] = await Promise.all([
      this.prisma.pushDeliveryLog.count({ where }),
      this.prisma.pushDeliveryLog.findMany({
        where,
        include: {
          pushMessage: { select: { title: true, type: true } },
          user: { select: { email: true, shortUid: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
    ]);
    return { total, items: rows.map((row) => this.mapPushError(row)) };
  }

  private apiErrorWhere(from: Date, to: Date) {
    return { createdAt: { gte: from, lte: to } };
  }

  private ingestionErrorWhere(from: Date, to: Date) {
    return { status: "FAILED" as const, createdAt: { gte: from, lte: to } };
  }

  private llmErrorWhere(from: Date, to: Date) {
    return { status: "FAILED" as const, createdAt: { gte: from, lte: to } };
  }

  private pushErrorWhere(from: Date, to: Date) {
    return { status: "FAILED" as const, createdAt: { gte: from, lte: to } };
  }

  private auditWhere(from: Date, to: Date) {
    return { createdAt: { gte: from, lte: to } };
  }

  private async apiErrors(from: Date, to: Date, take: number) {
    const rows = await this.prisma.apiErrorLog.findMany({
      where: this.apiErrorWhere(from, to),
      orderBy: { createdAt: "desc" },
      take
    });
    return rows.map((row) => this.mapApiError(row));
  }

  private async ingestionErrors(from: Date, to: Date, take: number) {
    const rows = await this.prisma.ingestionLog.findMany({
      where: this.ingestionErrorWhere(from, to),
      orderBy: { createdAt: "desc" },
      take,
      include: { source: true }
    });
    return rows.map((row) => this.mapIngestionError(row));
  }

  private async llmErrors(from: Date, to: Date, take: number) {
    const rows = await this.prisma.llmCallLog.findMany({
      where: this.llmErrorWhere(from, to),
      orderBy: { createdAt: "desc" },
      take
    });
    return rows.map((row) => this.mapLlmError(row));
  }

  private async pushErrors(from: Date, to: Date, take: number) {
    const rows = await this.prisma.pushDeliveryLog.findMany({
      where: this.pushErrorWhere(from, to),
      include: {
        pushMessage: { select: { title: true, type: true } },
        user: { select: { email: true, shortUid: true } }
      },
      orderBy: { createdAt: "desc" },
      take
    });
    return rows.map((row) => this.mapPushError(row));
  }

  private async auditLogs(from: Date, to: Date, take: number) {
    const rows = await this.prisma.auditLog.findMany({
      where: this.auditWhere(from, to),
      orderBy: { createdAt: "desc" },
      take
    });
    return rows.map((row) => this.mapAudit(row));
  }

  private mapApiError(row: {
    id: string;
    method: string;
    path: string;
    message: string;
    errorCode: string;
    createdAt: Date;
    statusCode: number;
    requestId: string;
  }): AdminLogRecord {
    return {
      id: row.id,
      type: "api",
      title: `${row.method} ${row.path}`,
      message: row.message,
      error_code: row.errorCode,
      created_at: row.createdAt.toISOString(),
      detail: { status_code: row.statusCode, request_id: row.requestId }
    };
  }

  private mapIngestionError(row: {
    id: string;
    sourceId: string | null;
    errorMessage: string | null;
    createdAt: Date;
    itemsFound: number;
    source?: { name: string } | null;
  }): AdminLogRecord {
    return {
      id: row.id,
      type: "ingestion",
      title: row.source?.name ?? "采集",
      message: row.errorMessage ?? "采集失败",
      error_code: "SOURCE_UNAVAILABLE",
      created_at: row.createdAt.toISOString(),
      detail: { source_id: row.sourceId, items_found: row.itemsFound }
    };
  }

  private mapLlmError(row: {
    id: string;
    promptKey: string;
    errorMessage: string | null;
    createdAt: Date;
    provider: string;
    model: string;
  }): AdminLogRecord {
    return {
      id: row.id,
      type: "llm",
      title: row.promptKey,
      message: row.errorMessage ?? "LLM 调用失败",
      error_code: "LLM_PROVIDER_ERROR",
      created_at: row.createdAt.toISOString(),
      detail: { provider: row.provider, model: row.model }
    };
  }

  private mapPushError(row: {
    id: string;
    channel: string;
    status: string;
    pushMessageId: string;
    errorMessage: string | null;
    createdAt: Date;
    pushMessage?: { title: string; type: string } | null;
    user: { email: string | null; shortUid: string };
  }): AdminLogRecord {
    return {
      id: row.id,
      type: "push",
      title: row.pushMessage?.title ?? "Push 发送失败",
      message: row.errorMessage ?? "Telegram Push 发送失败",
      error_code: row.status,
      created_at: row.createdAt.toISOString(),
      detail: {
        channel: row.channel,
        push_message_id: row.pushMessageId,
        push_type: row.pushMessage?.type ?? null,
        user: row.user.email ?? row.user.shortUid
      }
    };
  }

  private mapAudit(row: {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    createdAt: Date;
    adminUserId: string | null;
  }): AdminLogRecord {
    return {
      id: row.id,
      type: "audit",
      title: row.action,
      message: `${row.entityType}${row.entityId ? ` #${row.entityId}` : ""}`,
      error_code: "AUDIT",
      created_at: row.createdAt.toISOString(),
      detail: { admin_user_id: row.adminUserId }
    };
  }
}
