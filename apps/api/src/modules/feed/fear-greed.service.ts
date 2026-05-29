import { Injectable } from "@nestjs/common";

type AlternativeFearGreedResponse = {
  data?: Array<{
    value?: string;
    value_classification?: string;
    timestamp?: string;
    time_until_update?: string;
  }>;
};

export type FearGreedIndex = {
  value: number;
  classification: string;
  updated_at: string;
  next_update_seconds: number | null;
  source_name: "Alternative.me";
  source_url: string;
};

@Injectable()
export class FearGreedService {
  private cached:
    | {
        expiresAt: number;
        data: FearGreedIndex;
      }
    | null = null;

  async getIndex(): Promise<FearGreedIndex | null> {
    if (this.cached && this.cached.expiresAt > Date.now()) return this.cached.data;

    try {
      const response = await fetch("https://api.alternative.me/fng/?limit=1&format=json", {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(2500)
      });
      if (!response.ok) return null;

      const body = (await response.json()) as AlternativeFearGreedResponse;
      const item = body.data?.[0];
      const value = Number(item?.value);
      const timestamp = Number(item?.timestamp);
      if (!Number.isFinite(value) || !Number.isFinite(timestamp)) return null;

      const data = {
        value,
        classification: item?.value_classification ?? "Unknown",
        updated_at: new Date(timestamp * 1000).toISOString(),
        next_update_seconds: item?.time_until_update ? Number(item.time_until_update) : null,
        source_name: "Alternative.me" as const,
        source_url: "https://alternative.me/crypto/fear-and-greed-index/"
      };
      this.cached = { data, expiresAt: Date.now() + 30 * 60 * 1000 };
      return data;
    } catch {
      return null;
    }
  }
}
