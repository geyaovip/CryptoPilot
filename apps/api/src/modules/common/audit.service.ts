import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async log(input: {
    adminUserId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    before?: unknown;
    after?: unknown;
  }) {
    await this.prisma.auditLog.create({
      data: {
        adminUserId: input.adminUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        beforeJson: input.before ?? undefined,
        afterJson: input.after ?? undefined
      }
    });
  }
}
