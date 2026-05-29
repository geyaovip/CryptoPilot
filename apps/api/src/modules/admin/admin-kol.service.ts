import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../common/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAdminKolDto, UpdateAdminKolDto } from "./dto/admin-kol.dto";
import { AdminPaginationDto, normalizeAdminPagination, pageMeta } from "./dto/admin-pagination.dto";

@Injectable()
export class AdminKolService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  async list(query: AdminPaginationDto = {}) {
    const { page, limit, skip } = normalizeAdminPagination(query);
    const where = { deletedAt: null };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.kol.count({ where }),
      this.prisma.kol.findMany({
        where,
        orderBy: [{ influenceScore: "desc" }, { name: "asc" }],
        skip,
        take: limit
      })
    ]);
    return {
      ...pageMeta(total, page, limit),
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

  async create(dto: CreateAdminKolDto, adminUserId: string) {
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
      await this.audit.log({
        adminUserId,
        action: "kol.create",
        entityType: "kol",
        entityId: kol.id,
        after: kol
      });
      return { id: kol.id };
    } catch {
      throw new ConflictException("KOL 已存在");
    }
  }

  async update(id: string, dto: UpdateAdminKolDto, adminUserId: string) {
    const before = await this.findOrThrow(id);
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
    await this.audit.log({
      adminUserId,
      action: "kol.update",
      entityType: "kol",
      entityId: id,
      before,
      after: { id, ...dto }
    });
    return { id, updated: true };
  }

  private async findOrThrow(id: string) {
    const kol = await this.prisma.kol.findFirst({ where: { id, deletedAt: null } });
    if (!kol) throw new NotFoundException("KOL 不存在");
    return kol;
  }
}
