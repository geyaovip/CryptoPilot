"use client";

import { Button, Card } from "@cryptopilot/ui";
import type { AiSearchResponse, AiSearchSuggestionsResponse, ApiError } from "@cryptopilot/types";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../lib/auth-store";
import { getApiUrl } from "../lib/api-url";

const fallbackSuggestions = [
  "BTC 今天的波动主要受哪些事件影响？",
  "过去 24 小时，哪些 Token 出现明显异动？",
  "最近升温最快的 Crypto 叙事是什么？",
  "ETH 近期有哪些值得关注的事件或风险？",
  "Meme 板块现在是情绪升温，还是短线噪音？",
  "今天市场里最需要留意的风险信号是什么？"
];

const sentimentLabels = {
  bullish: "偏积极",
  neutral: "中性",
  bearish: "偏谨慎"
} as const;

type SearchPanelProps = {
  initialQuery?: string;
  initialInsightId?: string;
};

export function SearchPanel({ initialQuery = "", initialInsightId = "" }: SearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiSearchResponse["data"] | null>(null);
  const [suggestions, setSuggestions] = useState(fallbackSuggestions);
  const accessToken = useAuthStore((state) => state.accessToken);
  const prefilledRan = useRef(false);
  const initialSearchRan = useRef(false);
  const isResultView = Boolean(initialQuery.trim()) || Boolean(result) || loading;

  useEffect(() => {
    let mounted = true;
    async function loadSuggestions() {
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/ai/suggestions`, { cache: "no-store" });
        const body = (await response.json()) as AiSearchSuggestionsResponse | ApiError;
        if (!response.ok || !("data" in body)) return;
        const questions = body.data.items.map((item) => item.question).filter(Boolean);
        if (mounted && questions.length) setSuggestions(questions);
      } catch {
        // Keep curated fallback questions when the API is unavailable.
      }
    }
    void loadSuggestions();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!initialQuery.trim() || prefilledRan.current) return;
    prefilledRan.current = true;
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!initialQuery.trim() || initialSearchRan.current) return;
    initialSearchRan.current = true;
    void runSearch(initialQuery);
  }, [initialQuery]);

  async function runSearch(nextQuery: string) {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setError("请输入问题");
      return;
    }
    if (!accessToken) {
      setError("AI Search 需要登录后使用，请先通过邮箱登录。");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/ai/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: trimmed,
          ...(initialInsightId ? { insight_id: initialInsightId } : {})
        })
      });
      const body = (await response.json()) as AiSearchResponse | ApiError;
      if (!response.ok || !("data" in body)) {
        setError("message" in body ? body.message : "搜索失败");
        return;
      }
      setResult(body.data);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={isResultView ? "mx-auto flex max-w-4xl flex-col space-y-4" : "mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center space-y-6"}>
      {!isResultView ? (
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-[#20808D]">AI 市场研究</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#102A2C] md:text-4xl">
            用一句问题，快速梳理市场背景
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#5F6868]">
            CryptoPilot 会结合已收录来源、叙事与相关资产回答问题，并保留来源供你继续核验。
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-[#20808D]">AI 市场研究</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#102A2C]">关于「{query || initialQuery}」的搜索结果</h1>
        </div>
      )}

      <Card className={isResultView ? "border-[#D9D5C9] bg-white/95 p-3 md:p-4" : "rounded-3xl border-[#D9D5C9] bg-white/95 p-4 shadow-[0_18px_70px_rgba(16,42,44,0.08)] md:p-5"}>
        <label className="text-sm font-medium text-[#5F6868]" htmlFor="search">
          询问 CryptoPilot
        </label>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] p-2 focus-within:border-[#20808D]">
          <input
            className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-[#102A2C] outline-none placeholder:text-[#8A918C]"
            id="search"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void runSearch(query);
            }}
            placeholder="例如：今天 ETH 为什么波动？"
            value={query}
          />
          <Button
            className="h-12 shrink-0 rounded-xl border-[#20808D] bg-[#20808D] px-3 text-sm text-white hover:bg-[#186A73] sm:px-5"
            disabled={loading}
            onClick={() => void runSearch(query)}
            type="button"
          >
            <span className="sm:hidden">{loading ? "检索中" : "搜索"}</span>
            <span className="hidden sm:inline">{loading ? "检索中…" : "开始搜索"}</span>
          </Button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#8A918C]">答案仅用于研究参考，不构成投资建议。</p>
      </Card>

      {!isResultView ? (
        <div className="flex flex-wrap gap-2">
          <span className="py-1.5 text-xs font-medium text-[#8A918C]">可直接试试：</span>
          {suggestions.map((item) => (
            <button
              className="rounded-full border border-[#D9D5C9] bg-white px-3 py-1.5 text-xs text-[#5F6868] hover:border-[#20808D]"
              key={item}
              onClick={() => {
                setQuery(item);
                void runSearch(item);
              }}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          {!accessToken ? (
            <a className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700" href="/login">
              去登录
            </a>
          ) : null}
        </Card>
      ) : null}

      {loading ? (
        <Card className="border-[#D9D5C9] bg-white/95 p-5 text-sm text-[#5F6868]">正在检索已收录来源并生成研究结果…</Card>
      ) : null}

      {result ? (
        <Card className="space-y-5 border-[#D9D5C9] bg-white/95 p-5 shadow-[0_12px_40px_rgba(16,42,44,0.05)]">
          <div>
            <p className="text-xs font-medium text-[#20808D]">AI Research Brief</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8A918C]">
              <span>基于本次问题动态生成</span>
              <span>·</span>
              <span>更新于 {new Date(result.updated_at).toLocaleString("zh-CN")}</span>
              <span className="rounded-full bg-[#F2EEE3] px-2 py-0.5 text-[#5F6868]">
                {sentimentLabels[result.sentiment]}
              </span>
            </div>
          </div>
          <p className="text-base leading-8 text-[#102A2C]">{result.answer}</p>
          <div>
            <h2 className="text-sm font-semibold text-[#102A2C]">关键原因</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#5F6868]">
              {result.key_reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#102A2C]">市场影响</h2>
            <p className="mt-2 text-sm text-[#5F6868]">{result.market_impact}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-[#102A2C]">相关资产</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.related_tokens.length ? (
                  result.related_tokens.map((token) => (
                    <span className="rounded-full bg-[#E8F4F6] px-2 py-1 text-xs text-[#20808D]" key={token}>
                      {token}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#8A918C]">暂无明确资产标签</span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#102A2C]">相关叙事</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.related_narratives.length ? (
                  result.related_narratives.map((narrative) => (
                    <span className="rounded-full bg-[#F2EEE3] px-2 py-1 text-xs text-[#5F6868]" key={narrative}>
                      {narrative}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#8A918C]">暂无明确叙事标签</span>
                )}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#102A2C]">来源</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {result.sources.map((source) => (
                <li key={source.url}>
                  <a className="text-[#20808D]" href={source.url} rel="noopener noreferrer" target="_blank">
                    {source.source_name}
                  </a>
                  <span className="text-[#8A918C]"> · {new Date(source.published_at).toLocaleString("zh-CN")}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-[#8A918C]">以上内容基于已收录来源，仅供研究参考，不构成投资建议。</p>
        </Card>
      ) : null}
    </section>
  );
}
