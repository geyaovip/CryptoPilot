"use client";

import Link from "next/link";
import { useState } from "react";
import { FeedBookmarkButton } from "./feed-bookmark-button";

type FeedCardActionsProps = {
  feedId: string;
  askQuery: string;
};

export function FeedCardActions({ feedId, askQuery }: FeedCardActionsProps) {
  const [copied, setCopied] = useState(false);
  const sharePath = `/feed/${feedId}`;
  const askHref = `/search?q=${encodeURIComponent(askQuery.trim() || "这条动态有什么背景？")}`;

  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : sharePath;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "CryptoPilot", url });
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
      <FeedBookmarkButton feedId={feedId} />
      <button className="font-medium text-[#5F6868] hover:text-[#20808D]" onClick={() => void share()} type="button">
        {copied ? "已复制链接" : "分享"}
      </button>
      <Link className="font-medium text-[#20808D] hover:text-[#186A73]" href={askHref}>
        问 AI
      </Link>
    </div>
  );
}
