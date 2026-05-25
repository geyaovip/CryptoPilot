import Link from "next/link";
import { Card } from "@cryptopilot/ui";
import { FeedCardActions } from "../../components/feed-card-actions";
import { FeedTypeBadge } from "../../components/feed-type-badge";
import { RelatedSourcesList } from "../../components/related-sources-list";
import { getFeedDetail } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function FeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feed = await getFeedDetail(id);
  const hook = feed.narrative_hook?.trim() || feed.ai_summary?.trim() || "叙事动态更新中…";
  const summary = feed.ai_summary?.trim() || "AI 摘要生成中，请稍后刷新。";
  const feedType = feed.feed_type ?? feed.type;

  return (
    <main className="min-h-screen bg-[#FCFCF9] px-4 py-6 text-[#102A2C]">
      <article className="mx-auto max-w-4xl space-y-5">
        <a className="text-sm font-medium text-[#20808D]" href="/home">
          返回首页
        </a>
        <Card className="border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_70px_rgba(16,42,44,0.08)]">
          <div className="flex flex-wrap items-center gap-2">
            <FeedTypeBadge feedType={feedType} />
            {feed.primary_narrative ? (
              <Link className="text-xs font-medium text-[#20808D]" href={`/narratives/${feed.primary_narrative.slug}`}>
                🔥 {feed.primary_narrative.name}
              </Link>
            ) : null}
            <span className="text-xs text-[#5F6868]">{feed.source_name}</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold leading-snug tracking-[-0.02em] text-[#102A2C]" data-testid="feed-detail-hook">
            {hook}
          </h1>
          {summary !== hook ? (
            <p className="mt-3 text-sm leading-7 text-[#5F6868]" data-testid="feed-detail-summary">
              {summary}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-[#8A918C]">
            原文标题：
            <span className="text-[#5F6868]"> {feed.title}</span>
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {feed.related_tokens.map((token) => (
              <span className="rounded-full border border-[#D9D5C9] bg-[#FCFCF9] px-2.5 py-1 text-xs text-[#5F6868]" key={token.id}>
                {token.symbol}
              </span>
            ))}
            {feed.narrative_tags.map((narrative) => (
              <span className="rounded-full bg-[#F7F5EE] px-2.5 py-1 text-xs text-[#5F6868]" key={narrative.id}>
                {narrative.name}
              </span>
            ))}
          </div>
          <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#5F6868]">{feed.content}</div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a className="text-sm font-medium text-[#20808D]" href={feed.source_url} rel="noopener noreferrer" target="_blank">
              打开原文
            </a>
            <FeedCardActions askQuery={summary} feedId={feed.id} />
          </div>
          <p className="mt-6 text-xs text-[#8A918C]">以上内容基于已收录来源整理，仅供研究参考，不构成投资建议。</p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-[#D9D5C9] bg-white/95 p-5">
            <h2 className="text-sm font-semibold text-[#102A2C]">关键原因</h2>
            <p className="mt-1 text-xs text-[#8A918C]">基于已收录来源的解读要点，非行情预测。</p>
            {feed.key_reasons.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#5F6868]">
                {feed.key_reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#8A918C]">AI 摘要生成中，请稍后刷新。</p>
            )}
          </Card>
          <Card className="border-[#D9D5C9] bg-white/95 p-5">
            <h2 className="text-sm font-semibold text-[#102A2C]">市场影响</h2>
            <p className="mt-1 text-xs text-[#8A918C]">对市场的可能影响梳理，不构成投资建议。</p>
            <p className="mt-3 text-sm leading-6 text-[#5F6868]">
              {feed.market_impact ?? "AI 市场影响分析生成中，请稍后刷新。"}
            </p>
          </Card>
        </div>

        <RelatedSourcesList
          primary={{ source_name: feed.source_name, source_url: feed.source_url, publish_time: feed.publish_time }}
          similar={feed.similar_feed}
        />

        <p className="text-center text-sm text-[#5F6868]">
          想深入追问？
          <Link
            className="ml-1 font-medium text-[#20808D]"
            href={`/search?q=${encodeURIComponent(`关于「${summary.slice(0, 80)}」的背景与影响？`)}`}
          >
            去 Ask AI
          </Link>
        </p>
      </article>
    </main>
  );
}
