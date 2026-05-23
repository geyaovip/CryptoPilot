import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateAdminTokenDto } from "./dto/admin-token.dto";

@Injectable()
export class AdminTokenService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.token.findMany({
      where: { deletedAt: null },
      orderBy: [{ displayOrder: "asc" }, { symbol: "asc" }]
    });
    return {
      items: items.map((token) => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        coingecko_id: token.coingeckoId,
        price_usd: token.priceUsd === null ? null : Number(token.priceUsd),
        price_change_24h: token.priceChange24h === null ? null : Number(token.priceChange24h),
        is_active: token.isActive,
        display_order: token.displayOrder
      }))
    };
  }

  async update(id: string, dto: UpdateAdminTokenDto) {
    await this.findOrThrow(id);
    await this.prisma.token.update({
      where: { id },
      data: {
        symbol: dto.symbol,
        name: dto.name,
        coingeckoId: dto.coingecko_id,
        isActive: dto.is_active,
        displayOrder: dto.display_order
      }
    });
    return { id, updated: true };
  }

  async refresh(id: string) {
    const token = await this.findOrThrow(id);
    const jitter = (Math.random() - 0.5) * 2;
    const nextChange =
      token.priceChange24h === null ? jitter : Number(token.priceChange24h) + jitter * 0.2;
    const nextPrice =
      token.priceUsd === null ? null : Number(token.priceUsd) * (1 + nextChange / 100);
    await this.prisma.token.update({
      where: { id },
      data: { priceChange24h: nextChange, priceUsd: nextPrice }
    });
    return { id, refreshed: true };
  }

  private async findOrThrow(id: string) {
    const token = await this.prisma.token.findFirst({ where: { id, deletedAt: null } });
    if (!token) throw new NotFoundException("Token 不存在");
    return token;
  }
}
