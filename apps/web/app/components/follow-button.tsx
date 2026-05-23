"use client";

import { useState } from "react";
import { Button } from "@cryptopilot/ui";
import type { WatchlistTargetType } from "@cryptopilot/types";
import { addWatchlist, removeWatchlist } from "../lib/api";

type FollowButtonProps = {
  targetType: WatchlistTargetType;
  targetId: string;
  initialFollowed: boolean;
  initialWatchlistId?: string | null;
};

export function FollowButton({
  targetType,
  targetId,
  initialFollowed,
  initialWatchlistId
}: FollowButtonProps) {
  const [followed, setFollowed] = useState(initialFollowed);
  const [watchlistId, setWatchlistId] = useState(initialWatchlistId ?? null);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      if (followed && watchlistId) {
        await removeWatchlist(watchlistId);
        setFollowed(false);
        setWatchlistId(null);
        return;
      }
      const created = (await addWatchlist(targetType, targetId)) as { id?: string };
      setFollowed(true);
      if (created.id) setWatchlistId(created.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button disabled={busy} onClick={() => void toggle()} type="button">
      {followed ? "已关注" : "关注"}
    </Button>
  );
}
