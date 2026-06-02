import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../common/audit.service";
import { CoinGeckoPriceService } from "../ingestion/coingecko-price.service";
import { PrismaService } from "../prisma/prisma.service";
import { AdminPaginationDto, normalizeAdminPagination, pageMeta } from "./dto/admin-pagination.dto";
import { UpdateAdminTokenDto } from "./dto/admin-token.dto";

@Injectable()
export class AdminTokenService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(CoinGeckoPriceService) private readonly coinGecko: CoinGeckoPriceService
  ) {}

  async list(query: AdminPaginationDto = {}) {
    const { page, limit, skip } = normalizeAdminPagination(query);
    const where = { deletedAt: null };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.token.count({ where }),
      this.prisma.token.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { symbol: "asc" }],
        skip,
        take: limit
      })
    ]);
    return {
      ...pageMeta(total, page, limit),
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

  async update(id: string, dto: UpdateAdminTokenDto, adminUserId: string) {
    const before = await this.findOrThrow(id);
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
    await this.audit.log({
      adminUserId,
      action: "token.update",
      entityType: "token",
      entityId: id,
      before,
      after: dto
    });
    return { id, updated: true };
  }

  async refresh(id: string, adminUserId: string) {
    const token = await this.findOrThrow(id);
    if (!token.coingeckoId) throw new NotFoundException("Token 未配置 CoinGecko ID");
    const prices = await this.coinGecko.fetchPrices([token.coingeckoId]);
    const market = prices[token.coingeckoId];
    if (!market || typeof market.usd !== "number") throw new NotFoundException("CoinGecko 未返回该 Token 价格");
    await this.prisma.token.update({
      where: { id },
      data: { priceChange24h: market.usd_24h_change, priceUsd: market.usd }
    });
    await this.audit.log({
      adminUserId,
      action: "token.refresh_price",
      entityType: "token",
      entityId: id
    });
    return { id, refreshed: true };
  }

  private async findOrThrow(id: string) {
    const token = await this.prisma.token.findFirst({ where: { id, deletedAt: null } });
    if (!token) throw new NotFoundException("Token 不存在");
    return token;
  }
}
