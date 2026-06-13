import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@cryptopilot/ui";
import { ContextBackLink } from "../../components/context-back-link";
import { FeedCardActions } from "../../components/feed-card-actions";
import { FeedTypeBadge } from "../../components/feed-type-badge";
import { JsonLd } from "../../components/json-ld";
import { NarrativeTagLinks } from "../../components/narrative-tag-links";
import { RelatedSourcesList } from "../../components/related-sources-list";
import { SiteFooter } from "../../components/site-footer";
import { getFeedDetail } from "../../lib/api";
import { articleJsonLd, articlePageMetadata, breadcrumbJsonLd, seoTitle } from "../../lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const feed = await getFeedDetail(id);
    const title = feed.narrative_hook?.trim() || feed.title;
    return articlePageMetadata({
      title: seoTitle(title),
      description: feed.ai_summary || feed.title,
      path: `/feed/${feed.id}`,
      ogTitle: title,
      ogTag: feed.primary_narrative?.name ?? "市场动态"
    });
  } catch {
    return articlePageMetadata({
      title: "市场动态 | CryptoPilot",
      description: "查看加密市场动态、来源、关键原因和 AI 摘要。",
      path: `/feed/${id}`,
      ogTitle: "市场动态",
      ogTag: "AI 加密市场情报"
    });
  }
}

export default async function FeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feed = await getFeedDetail(id);
  const hook = feed.narrative_hook?.trim() || feed.ai_summary?.trim() || "叙事动态更新中…";
  const summary = feed.ai_summary?.trim() || "AI 摘要生成中，请稍后刷新。";
  const feedType = feed.feed_type ?? feed.type;
  const sourceExcerpt = normalizeSourceExcerpt(feed.content);
  const sourcePreview = getSourcePreview(sourceExcerpt);
  const shouldShowSourceExcerpt = Boolean(sourceExcerpt) && sourceExcerpt !== summary && sourceExcerpt !== hook;
  const hasLongSourceExcerpt = sourceExcerpt.length > sourcePreview.length;

  return (
    <main className="min-h-screen bg-[#FCFCF9] px-4 py-6 text-[#102A2C]">
      <JsonLd
        data={[
          articleJsonLd({
            headline: hook,
            description: summary,
            path: `/feed/${feed.id}`,
            datePublished: feed.publish_time,
            authorName: feed.source_name
          }),
          breadcrumbJsonLd([
            { name: "首页", path: "/" },
            ...(feed.primary_narrative
              ? [{ name: feed.primary_narrative.name, path: `/narratives/${feed.primary_narrative.slug}` }]
              : []),
            { name: "市场动态", path: `/feed/${feed.id}` }
          ])
        ]}
      />
      <article className="mx-auto max-w-4xl space-y-5">
        <ContextBackLink fallbackHref="/" />
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
          <div className="mt-5 rounded-2xl border border-[#D9D5C9] bg-[#F7F5EE] p-4">
            <p className="text-xs font-semibold text-[#8A918C]">AI 已为你提炼</p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[#5F6868]">{summary}</p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {feed.related_tokens.map((token) => (
              <span className="rounded-full border border-[#D9D5C9] bg-[#FCFCF9] px-2.5 py-1 text-xs text-[#5F6868]" key={token.id}>
                {token.symbol}
              </span>
            ))}
            <NarrativeTagLinks narratives={feed.narrative_tags} />
          </div>
          {shouldShowSourceExcerpt ? (
            <section className="mt-5 rounded-2xl border border-[#E8E2D4] bg-[#FCFCF9] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#102A2C]">来源摘录</h2>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs text-[#8A918C]">原始内容，非 AI 改写</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#8A918C]">
                这里保留原始来源的关键信息，完整报道建议打开原文查看。
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5F6868]">
                {sourcePreview}
                {hasLongSourceExcerpt ? "…" : ""}
              </p>
              {hasLongSourceExcerpt ? (
                <details className="mt-3 rounded-xl border border-[#D9D5C9] bg-white px-3 py-2">
                  <summary className="cursor-pointer text-sm font-medium text-[#20808D]">展开完整原始摘录</summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5F6868]">{sourceExcerpt}</p>
                </details>
              ) : null}
            </section>
          ) : null}
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
          related_sources={feed.related_sources}
          similar={feed.similar_feed}
        />

        <p className="text-center text-sm text-[#5F6868]">
          想深入追问？
          <Link
            className="ml-1 font-medium text-[#20808D]"
            href={`/search?q=${encodeURIComponent(`关于「${summary.slice(0, 80)}」的背景与影响？`)}`}
          >
            去 AI 研究
          </Link>
        </p>
        <SiteFooter />
      </article>
    </main>
  );
}

function normalizeSourceExcerpt(content: string): string {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function getSourcePreview(content: string): string {
  const maxLength = 420;
  if (content.length <= maxLength) return content;
  const sentenceEnd = content.slice(0, maxLength).search(/[。！？.!?](?!.*[。！？.!?])/);
  if (sentenceEnd > 180) return content.slice(0, sentenceEnd + 1);
  return content.slice(0, maxLength).trimEnd();
}
