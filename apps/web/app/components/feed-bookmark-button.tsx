"use client";

import { useState } from "react";
import { createBookmark, deleteBookmark } from "../lib/api";

export function FeedBookmarkButton({ feedId }: { feedId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <button
      className="rounded-full border border-[#D9D5C9] px-3 py-1 text-sm text-[#5F6868] disabled:opacity-60"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          if (bookmarked) {
            await deleteBookmark(feedId);
            setBookmarked(false);
          } else {
            await createBookmark(feedId);
            setBookmarked(true);
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
