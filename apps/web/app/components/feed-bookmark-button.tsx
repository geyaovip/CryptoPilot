"use client";

import { useEffect, useState } from "react";
import { createBookmark, deleteBookmark } from "../lib/api";
import { useBookmarkStore } from "../lib/bookmark-store";

export function FeedBookmarkButton({ feedId }: { feedId: string }) {
  const [pending, setPending] = useState(false);
  const loadBookmarks = useBookmarkStore((state) => state.load);
  const bookmarked = useBookmarkStore((state) => state.isSaved(feedId));
  const markSaved = useBookmarkStore((state) => state.markSaved);
  const markRemoved = useBookmarkStore((state) => state.markRemoved);

  useEffect(() => {
    void loadBookmarks();
  }, [loadBookmarks]);

  return (
    <button
      className="font-medium text-[#5F6868] hover:text-[#20808D] disabled:opacity-60"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          if (bookmarked) {
            await deleteBookmark(feedId);
            markRemoved(feedId);
          } else {
            await createBookmark(feedId);
            markSaved(feedId);
          }
        } catch {
          window.alert("收藏操作失败，请确认 API 与演示用户已配置。");
        } finally {
          setPending(false);
        }
      }}
      type="button"
    >
      {bookmarked ? "已收藏" : "收藏"}
    </button>
  );
}
