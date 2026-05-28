"use client";

import { useEffect, useState } from "react";
import { createInsightBookmark, deleteBookmark } from "../lib/api";
import { useBookmarkStore } from "../lib/bookmark-store";

export function InsightBookmarkButton({ insightId }: { insightId: string }) {
  const [pending, setPending] = useState(false);
  const loadBookmarks = useBookmarkStore((state) => state.load);
  const saved = useBookmarkStore((state) => state.isSaved(insightId));
  const markSaved = useBookmarkStore((state) => state.markSaved);
  const markRemoved = useBookmarkStore((state) => state.markRemoved);

  useEffect(() => {
    void loadBookmarks();
  }, [loadBookmarks]);

  const toggle = async () => {
    setPending(true);
    try {
      if (saved) {
        await deleteBookmark(insightId);
        markRemoved(insightId);
      } else {
        await createInsightBookmark(insightId);
        markSaved(insightId);
      }
    } catch {
      // keep UI state unchanged on error
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      className="font-medium text-[#5F6868] hover:text-[#20808D] disabled:opacity-60"
      disabled={pending}
      onClick={() => void toggle()}
      type="button"
    >
      {saved ? "已收藏" : "收藏"}
    </button>
  );
}
