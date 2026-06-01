import { describe, expect, it } from "vitest";
import { ConfigService } from "@nestjs/config";
import { featureFromPromptKey, resolveRoutedProviderId } from "./llm-routing";

describe("llm-routing", () => {
  it("maps prompt keys to features", () => {
    expect(featureFromPromptKey("ai_search_prompt")).toBe("ai_search");
    expect(featureFromPromptKey("feed_summary_prompt")).toBe("feed_summary");
    expect(featureFromPromptKey("narrative_summary_prompt")).toBe("narrative_summary");
    expect(featureFromPromptKey("insight_synthesis_prompt")).toBe("insight_synthesis");
    expect(featureFromPromptKey("unknown")).toBe("default");
  });

  it("uses per-feature route env when set", () => {
    const config = new ConfigService({
      LLM_DEFAULT: "moonshot",
      LLM_ROUTE_FEED_SUMMARY: "deepseek",
      LLM_ROUTE_NARRATIVE_SUMMARY: "moonshot",
      LLM_ROUTE_INSIGHT_SYNTHESIS: "deepseek"
    });
    expect(resolveRoutedProviderId(config, "ai_search")).toBe("moonshot");
    expect(resolveRoutedProviderId(config, "feed_summary")).toBe("deepseek");
    expect(resolveRoutedProviderId(config, "narrative_summary")).toBe("moonshot");
    expect(resolveRoutedProviderId(config, "insight_synthesis")).toBe("deepseek");
  });
});
