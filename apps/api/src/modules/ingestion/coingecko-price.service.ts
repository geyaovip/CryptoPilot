import { Injectable } from "@nestjs/common";

export type CoinGeckoPrice = {
  usd?: number;
  usd_24h_change?: number;
};

@Injectable()
export class CoinGeckoPriceService {
  async fetchPrices(ids: string[]): Promise<Record<string, CoinGeckoPrice>> {
    const uniqueIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
    if (uniqueIds.length === 0) return {};

    const url = new URL("https://api.coingecko.com/api/v3/simple/price");
    url.searchParams.set("ids", uniqueIds.join(","));
    url.searchParams.set("vs_currencies", "usd");
    url.searchParams.set("include_24hr_change", "true");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`CoinGecko 请求失败：${response.status}`);

    return (await response.json()) as Record<string, CoinGeckoPrice>;
  }
}
