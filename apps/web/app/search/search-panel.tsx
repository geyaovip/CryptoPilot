"use client";

import { Button, Card } from "@cryptopilot/ui";
import type { AiSearchResponse, ApiError } from "@cryptopilot/types";
import { DEMO_USER_ID } from "@cryptopilot/types";
import { useEffect, useRef, useState } from "react";
import { getApiUrl } from "../lib/api-url";

const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? DEMO_USER_ID;

const suggestions = [
  "今天 ETH 为什么波动？",
  "BTC ETF 资金流有什么变化？",
  "Solana 生态最近有哪些热点？",
  "哪些叙事正在升温？"
];

type SearchPanelProps = {
  initialQuery?: string;
  initialInsightId?: string;
};

export function SearchPanel({ initialQuery = "", initialInsightId = "" }: SearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiSearchResponse["data"] | null>(null);
  const prefilledRan = useRef(false);

  useEffect(() => {
    if (!initialQuery.trim() || prefilledRan.current) return;
    prefilledRan.current = true;
    setQuery(initialQuery);
  }, [initialQuery]);

  async function runSearch(nextQuery: string) {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setError("请输入问题");
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
          "x-user-id": demoUserId
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
    <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center space-y-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-[#20808D]">AI 市场研究</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#102A2C] md:text-4xl">
          用一句问题，快速梳理市场背景
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5F6868]">
          CryptoPilot 会结合已收录来源、叙事与相关资产回答问题，并保留来源供你继续核验。
        </p>
      </div>
      <Card className="rounded-3xl border-[#D9D5C9] bg-white/95 p-4 shadow-[0_18px_70px_rgba(16,42,44,0.08)] md:p-5">
        <label className="text-sm font-medium text-[#5F6868]" htmlFor="search">
          询问 CryptoPilot
        </label>
        <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] p-2 focus-within:border-[#20808D] sm:flex-row">
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
            className="h-12 shrink-0 rounded-xl border-[#20808D] bg-[#20808D] px-5 text-white hover:bg-[#186A73]"
            disabled={loading}
            onClick={() => void runSearch(query)}
            type="button"
          >
            {loading ? "检索中…" : "开始搜索"}
          </Button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#8A918C]">答案仅用于研究参考，不构成投资建议。</p>
      </Card>

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

      {error ? (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</Card>
      ) : null}

      {result ? (
        <Card className="space-y-5 border-[#D9D5C9] bg-white/95 p-5 shadow-[0_12px_40px_rgba(16,42,44,0.05)]">
          <div>
            <p className="text-xs font-medium text-[#20808D]">AI Research Brief</p>
            <p className="mt-1 text-xs text-[#8A918C]">更新于 {new Date(result.updated_at).toLocaleString("zh-CN")}</p>
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
          <div className="flex flex-wrap gap-2">
            {result.related_tokens.map((token) => (
              <span className="rounded-full bg-[#E8F4F6] px-2 py-1 text-xs text-[#20808D]" key={token}>
                {token}
              </span>
            ))}
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
