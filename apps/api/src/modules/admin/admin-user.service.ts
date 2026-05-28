import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminUserService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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
        disabled_at: user.disabledAt?.toISOString() ?? null,
        daily_ai_search_count: user.dailyAiSearchCount,
        created_at: user.createdAt.toISOString()
      }))
    };
  }
}
