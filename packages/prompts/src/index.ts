export const MVP_PROMPT_KEYS = [
  "feed_summary_prompt",
  "narrative_summary_prompt",
  "sentiment_prompt",
  "ai_search_prompt",
  "push_prompt"
] as const;

export type MvpPromptKey = (typeof MVP_PROMPT_KEYS)[number];

export type PromptStatus = "draft" | "active" | "archived";

export { DEFAULT_PROMPT_CONTENT, PROMPT_VARIABLES } from "./templates";
