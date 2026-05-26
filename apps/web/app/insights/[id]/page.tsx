import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@cryptopilot/ui";
import { FeedCard } from "../../components/feed-card";
import { FeedTypeBadge } from "../../components/feed-type-badge";
import { InsightCardActions } from "../../components/insight-card-actions";
import { JsonLd } from "../../components/json-ld";
import { getInsightDetail } from "../../lib/api";
import { articleJsonLd, publicPageMetadata, seoTitle } from "../../lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const insight = await getInsightDetail(id);
    return publicPageMetadata({
      title: seoTitle(insight.ai_insight),
      description: insight.ai_summary,
      path: `/insights/${insight.id}`,
      type: "article"
    });
  } catch {
    return publicPageMetadata({
      title: "AI 市场解读 | CryptoPilot",
      description: "查看带来源的加密市场 AI 解读、关键原因和相关市场信号。",
      path: `/insights/${id}`,
      type: "article"
    });
  }
}

export default async function InsightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const insight = await getInsightDetail(id);

  return (
    <main className="min-h-screen bg-[#FCFCF9] px-4 py-6 text-[#102A2C]">
      <JsonLd
        data={articleJsonLd({
          headline: insight.ai_insight,
          description: insight.ai_summary,
          path: `/insights/${insight.id}`,
          datePublished: insight.sources[0]?.published_at
        })}
      />
      <article className="mx-auto max-w-4xl space-y-5">
        <a className="text-sm font-medium text-[#20808D]" href="/">
          返回市场雷达
        </a>
        <Card className="border-[#D9D5C9] bg-white/95 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <FeedTypeBadge feedType={insight.feed_type} />
            <span className="text-xs text-[#8A918C]">动态热度 {insight.heat_velocity}</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold leading-snug" data-testid="insight-detail-headline">
            {insight.ai_insight}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#5F6868]">{insight.ai_summary}</p>
          <InsightCardActions askQuery={insight.ai_insight} insightId={insight.id} />
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-[#D9D5C9] bg-white/95 p-5">
            <h2 className="text-sm font-semibold">关键原因</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#5F6868]">
              {insight.key_reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </Card>
          <Card className="border-[#D9D5C9] bg-white/95 p-5">
            <h2 className="text-sm font-semibold">市场影响</h2>
            <p className="mt-3 text-sm text-[#5F6868]">
              {insight.market_impact ?? "当前来源还不足以形成稳定判断，建议结合后续更新继续观察。"}
            </p>
          </Card>
        </div>

        <Card className="border-[#D9D5C9] bg-white/95 p-5">
          <h2 className="text-sm font-semibold">来源（{insight.source_count}）</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {insight.sources.map((source) => (
              <li key={source.feed_item_id}>
                <a className="font-medium text-[#20808D]" href={source.source_url} rel="noopener noreferrer" target="_blank">
                  {source.source_name}
                </a>
                <span className="text-[#8A918C]"> · {source.title}</span>
              </li>
            ))}
          </ul>
        </Card>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">相关市场信号</h2>
          {insight.signals.map((signal) => (
            <FeedCard feed={signal} key={signal.id} />
          ))}
        </section>
      </article>
    </main>
  );
}
