"use client";

import { useState } from "react";
import { createInsightBookmark, deleteBookmark } from "../lib/api";

export function InsightBookmarkButton({ insightId }: { insightId: string }) {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    setPending(true);
    try {
      if (saved) {
        await deleteBookmark(insightId);
        setSaved(false);
      } else {
        await createInsightBookmark(insightId);
        setSaved(true);
      }
    } catch {
      // keep UI state unchanged on error
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      className="rounded-full border border-[#D9D5C9] px-3 py-1 text-sm text-[#5F6868] disabled:opacity-60"
      disabled={pending}
      onClick={() => void toggle()}
      type="button"
    >
      {saved ? "已收藏" : "收藏"}
    </button>
  );
}
