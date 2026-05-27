"use client";

import Link from "next/link";
import { useState } from "react";
import { InsightBookmarkButton } from "./insight-bookmark-button";

type InsightCardActionsProps = {
  insightId: string;
  askQuery: string;
};

export function InsightCardActions({ insightId, askQuery }: InsightCardActionsProps) {
  const [copied, setCopied] = useState(false);
  const sharePath = `/insights/${insightId}`;
  const askHref = `/search?q=${encodeURIComponent(askQuery)}&insight_id=${insightId}`;

  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : sharePath;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "CryptoPilot Insight", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <InsightBookmarkButton insightId={insightId} />
      <button className="font-medium text-[#5F6868] hover:text-[#20808D]" onClick={() => void share()} type="button">
        {copied ? "已复制链接" : "分享"}
      </button>
      <Link className="font-medium text-[#20808D]" href={askHref}>
        问 AI
      </Link>
      <Link className="font-medium text-[#5F6868] hover:text-[#20808D]" href={sharePath}>
        查看详情
      </Link>
    </div>
  );
}
