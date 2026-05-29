import { describe, expect, it, vi } from "vitest";
import { FearGreedService } from "./fear-greed.service";

describe("FearGreedService", () => {
  it("maps Alternative.me response", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ value: "72", value_classification: "Greed", timestamp: "1767225600", time_until_update: "3600" }]
      })
    }) as never;

    const result = await new FearGreedService().getIndex();

    expect(result?.value).toBe(72);
    expect(result?.classification).toBe("Greed");
    expect(result?.source_name).toBe("Alternative.me");
    globalThis.fetch = originalFetch;
  });
});
