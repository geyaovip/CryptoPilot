"use client";

import Link from "next/link";
import { Card } from "@cryptopilot/ui";
import type { NarrativeListItem } from "@cryptopilot/types";
import { FollowButton } from "./follow-button";

export function NarrativeListCard({ item }: { item: NarrativeListItem }) {
  return (
    <Card className="border-[#D9D5C9] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link className="text-lg font-semibold text-[#102A2C] hover:underline" href={`/narratives/${item.slug}`}>
            {item.name}
          </Link>
          <p className="mt-2 text-sm leading-6 text-[#5F6868]">{item.ai_summary ?? "暂无 AI 摘要"}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-[#F7F5EE] px-2 py-1 text-xs text-[#5F6868]">热度 {item.heat_score}</span>
          <FollowButton
            initialFollowed={item.is_followed}
            initialWatchlistId={item.watchlist_id}
            targetId={item.id}
            targetType="narrative"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#5F6868]">
        <span>24h +{item.trend_score_24h}</span>
        <span>讨论 {item.feed_count_24h}</span>
        <span>{item.sentiment}</span>
      </div>
      {item.top_tokens.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.top_tokens.map((token) => (
            <span className="rounded-full bg-[#F7F5EE] px-2 py-1 text-xs text-[#5F6868]" key={token.id}>
              {token.symbol}
            </span>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
