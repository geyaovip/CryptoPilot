import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAdminKolDto, UpdateAdminKolDto } from "./dto/admin-kol.dto";

@Injectable()
export class AdminKolService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.kol.findMany({
      where: { deletedAt: null },
      orderBy: [{ influenceScore: "desc" }, { name: "asc" }]
    });
    return {
      items: items.map((kol) => ({
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

  async create(dto: CreateAdminKolDto) {
    try {
      const kol = await this.prisma.kol.create({
        data: {
          name: dto.name,
          handle: dto.handle,
          platform: dto.platform.toUpperCase() as "TWITTER" | "YOUTUBE" | "OTHER",
          profileUrl: dto.profile_url,
          influenceScore: dto.influence_score ?? 50,
          isActive: dto.is_active ?? true
        }
      });
      return { id: kol.id };
    } catch {
      throw new ConflictException("KOL 已存在");
    }
  }

  async update(id: string, dto: UpdateAdminKolDto) {
    await this.findOrThrow(id);
    await this.prisma.kol.update({
      where: { id },
      data: {
        name: dto.name,
        handle: dto.handle,
        platform: dto.platform?.toUpperCase() as "TWITTER" | "YOUTUBE" | "OTHER" | undefined,
        profileUrl: dto.profile_url,
        influenceScore: dto.influence_score,
        isActive: dto.is_active
      }
    });
    return { id, updated: true };
  }

  private async findOrThrow(id: string) {
    const kol = await this.prisma.kol.findFirst({ where: { id, deletedAt: null } });
    if (!kol) throw new NotFoundException("KOL 不存在");
    return kol;
  }
}
