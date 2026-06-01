import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../common/audit.service";
import { UpdateAdminUserDto } from "./dto/admin-user.dto";

@Injectable()
export class AdminUserService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  async list() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return {
      items: users.map((user) => ({
        id: user.id,
        uid: user.shortUid,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as "user" | "admin",
        telegram_bound: Boolean(user.telegramChatId),
        telegram_bound_at: user.telegramBoundAt?.toISOString() ?? null,
        disabled_at: user.disabledAt?.toISOString() ?? null,
        daily_ai_search_count: user.dailyAiSearchCount,
        created_at: user.createdAt.toISOString()
      }))
    };
  }

  async update(id: string, dto: UpdateAdminUserDto, adminUserId: string) {
    if (id === adminUserId && (dto.disabled || dto.role === "user")) {
      throw new BadRequestException("不能降低或禁用当前管理员账号");
    }

    const before = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    const after = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.role ? { role: dto.role === "admin" ? "ADMIN" : "USER" } : {}),
        ...(typeof dto.disabled === "boolean" ? { disabledAt: dto.disabled ? new Date() : null } : {})
      }
    });

    await this.audit.log({
      adminUserId,
      action: "user.update",
      entityType: "user",
      entityId: id,
      before: { role: before.role, disabled_at: before.disabledAt?.toISOString() ?? null },
      after: { role: after.role, disabled_at: after.disabledAt?.toISOString() ?? null }
    });

    return {
      id: after.id,
      uid: after.shortUid,
      role: after.role.toLowerCase() as "user" | "admin",
      disabled_at: after.disabledAt?.toISOString() ?? null
    };
  }
}
