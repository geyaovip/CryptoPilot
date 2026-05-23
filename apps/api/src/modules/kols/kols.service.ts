import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class KolsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list() {
    const kols = await this.prisma.kol.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ influenceScore: "desc" }, { name: "asc" }]
    });
    return {
      items: kols.map((kol) => ({
        id: kol.id,
        name: kol.name,
        handle: kol.handle,
        platform: kol.platform.toLowerCase(),
        profile_url: kol.profileUrl,
        influence_score: kol.influenceScore,
        is_active: kol.isActive
      }))
    };
  }
}
