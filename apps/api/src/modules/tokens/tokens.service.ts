import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TokensService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list() {
    const tokens = await this.prisma.token.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ displayOrder: "asc" }, { symbol: "asc" }]
    });
    return {
      items: tokens.map((token) => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        price_usd: token.priceUsd === null ? null : Number(token.priceUsd),
        price_change_24h: token.priceChange24h === null ? null : Number(token.priceChange24h),
        is_active: token.isActive,
        display_order: token.displayOrder
      }))
    };
  }
}
