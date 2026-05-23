import { describe, expect, it } from "vitest";
import { ConfigService } from "@nestjs/config";
import { featureFromPromptKey, resolveRoutedProviderId } from "./llm-routing";

describe("llm-routing", () => {
  it("maps prompt keys to features", () => {
    expect(featureFromPromptKey("ai_search_prompt")).toBe("ai_search");
    expect(featureFromPromptKey("feed_summary_prompt")).toBe("feed_summary");
    expect(featureFromPromptKey("unknown")).toBe("default");
  });

  it("uses per-feature route env when set", () => {
    const config = new ConfigService({
      LLM_DEFAULT: "moonshot",
      LLM_ROUTE_FEED_SUMMARY: "deepseek"
    });
    expect(resolveRoutedProviderId(config, "ai_search")).toBe("moonshot");
    expect(resolveRoutedProviderId(config, "feed_summary")).toBe("deepseek");
  });
});
