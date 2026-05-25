import type { FeedItemSummary, FeedRelatedSourceRef } from "@cryptopilot/types";
import { Card } from "@cryptopilot/ui";

type RelatedSourcesListProps = {
  primary: Pick<FeedItemSummary, "source_name" | "source_url" | "publish_time">;
  similar: FeedItemSummary[];
  related_sources?: FeedRelatedSourceRef[];
};

export function RelatedSourcesList({ primary, similar, related_sources }: RelatedSourcesListProps) {
  const rows =
    related_sources && related_sources.length > 0
      ? related_sources.map((item) => ({
          key: item.feed_item_id,
          name: item.source_name,
          url: item.source_url,
          time: item.published_at,
          title: item.title
        }))
      : [
          { key: "primary", name: primary.source_name, url: primary.source_url, time: primary.publish_time, title: "" },
          ...similar.map((item) => ({
            key: item.id,
            name: item.source_name,
            url: item.source_url,
            time: item.publish_time,
            title: item.title
          }))
        ];

  return (
    <Card className="border-[#D9D5C9] bg-white/95 p-5">
      <h2 className="text-sm font-semibold text-[#102A2C]">相关来源</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[#8A918C]">暂无额外来源，可查看原文链接。</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((row) => (
            <li className="text-sm" key={row.key}>
              <a className="font-medium text-[#20808D] hover:text-[#186A73]" href={row.url} rel="noopener noreferrer" target="_blank">
                {row.name}
              </a>
              {row.title ? <span className="text-[#5F6868]"> — {row.title}</span> : null}
              <span className="text-[#8A918C]"> · {new Date(row.time).toLocaleString("zh-CN")}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
