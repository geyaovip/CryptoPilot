import { describe, expect, it } from "vitest";
import { SystemPublicController } from "./system-public.controller";

describe("SystemPublicController", () => {
  it("returns feature flags snapshot", () => {
    const controller = new SystemPublicController({
      snapshot: {
        feature_flags: { ai_search: true, watchlist: true, pwa_install: true, telegram_push: false }
      }
    } as never);
    const result = controller.getPublicConfig();
    expect(result.data.feature_flags.pwa_install).toBe(true);
  });
});
