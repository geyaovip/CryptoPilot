import { describe, expect, it, vi } from "vitest";
import { AdminTokenService } from "./admin-token.service";

describe("AdminTokenService", () => {
  it("refreshes token price from CoinGecko", async () => {
    const token = {
      id: "token-1",
      coingeckoId: "bitcoin",
      priceUsd: 70000,
      priceChange24h: 1,
      deletedAt: null
    };
    const prisma = {
      token: {
        findFirst: vi.fn().mockResolvedValue(token),
        update: vi.fn()
      }
    };
    const audit = { log: vi.fn() };
    const coinGecko = {
      fetchPrices: vi.fn().mockResolvedValue({ bitcoin: { usd: 69883, usd_24h_change: -3.87 } })
    };
    const service = new AdminTokenService(prisma as never, audit as never, coinGecko as never);

    await expect(service.refresh("token-1", "admin-1")).resolves.toEqual({ id: "token-1", refreshed: true });

    expect(coinGecko.fetchPrices).toHaveBeenCalledWith(["bitcoin"]);
    expect(prisma.token.update).toHaveBeenCalledWith({
      where: { id: "token-1" },
      data: { priceChange24h: -3.87, priceUsd: 69883 }
    });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: "token.refresh_price" }));
  });
});
