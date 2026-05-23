import type { MvpPromptKey } from "./index";

export const PROMPT_VARIABLES: Record<MvpPromptKey, string[]> = {
  feed_summary_prompt: ["title", "content", "source_name", "source_url", "related_tokens", "narrative_candidates"],
  narrative_summary_prompt: ["narrative_name", "narrative_slug", "related_feed"],
  sentiment_prompt: ["title", "content", "source_name"],
  ai_search_prompt: ["query", "context", "sources"],
  push_prompt: ["title", "summary", "source_url"]
};

export const DEFAULT_PROMPT_CONTENT: Record<MvpPromptKey, string> = {
  feed_summary_prompt: `你是 CryptoPilot 的市场研究助手。根据以下信息生成结构化 JSON，不要给出买卖建议。

标题: {{title}}
正文: {{content}}
来源: {{source_name}}
链接: {{source_url}}
相关代币: {{related_tokens}}
候选叙事: {{narrative_candidates}}

输出 JSON 字段: summary, key_reasons, market_impact, related_tokens, narrative_tags, sentiment。
sentiment 只能是 bullish、neutral、bearish。summary 不超过 160 个中文字符。必须基于来源，不可编造。`,
  narrative_summary_prompt: `总结叙事 {{narrative_name}} ({{narrative_slug}}) 的近期动态。
相关 Feed: {{related_feed}}
输出 JSON: summary, key_points, sentiment。
sentiment 只能是 bullish、neutral、bearish。不要给出投资建议。`,
  sentiment_prompt: `分析以下内容情绪，仅输出 JSON: {"sentiment":"bullish|neutral|bearish"}
标题: {{title}}
内容: {{content}}
来源: {{source_name}}`,
  ai_search_prompt: `你是 CryptoPilot AI 搜索助手。基于检索上下文回答问题，区分事实与推测，禁止投资建议。

用户问题: {{query}}
检索上下文:
{{context}}

可用来源:
{{sources}}

输出 JSON: answer, key_reasons, market_impact, related_tokens, related_narratives, sentiment。
sentiment 只能是 bullish、neutral、bearish 之一。不要输出 sources 字段。`,
  push_prompt: `为推送消息生成简短摘要，不要投资建议。
标题: {{title}}
摘要: {{summary}}
链接: {{source_url}}`
};
