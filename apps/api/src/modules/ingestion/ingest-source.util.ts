import type { PrismaClient, Source } from "@prisma/client";
import Parser from "rss-parser";
import { isChineseContent } from "./chinese-content.util";
import { fetchBlockBeatsFlashItems, isBlockBeatsSourceUrl } from "./blockbeats-ingest.util";
import { calculateHeatScore } from "./heat-score";
import { evaluateFeedQuality } from "./feed-quality.util";
import { fetchRedditSignals, type RedditCredentials } from "./reddit-provider";
import { cleanRssItems, type CleanRssItem } from "./rss-cleaner";
import { classifyFeedContentType } from "../feed/feed-content-type.util";
import { attachHeuristicTags, inferHeuristicTags, loadHeuristicTagCatalog } from "./heuristic-tags.util";

const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; CryptoPilot/1.0; +https://cryptopilot.chat)",
    Accept: "application/rss+xml, application/xml, text/xml, */*"
  }
});

/**
 * Medium RSS feeds contain named HTML entities (e.g. &amp;nbsp;)
 * which are not valid XML. rss-parser's underlying xml2js parser
 * rejects these. We fetch the raw XML, convert named HTML entities
 * to numeric XML entities, then parse.
 */
const HTML_ENTITIES: Record<string, string> = {
  nbsp: "&#160;", iexcl: "&#161;", cent: "&#162;", pound: "&#163;", curren: "&#164;",
  yen: "&#165;", brvbar: "&#166;", sect: "&#167;", uml: "&#168;", copy: "&#169;",
  ordf: "&#170;", laquo: "&#171;", not: "&#172;", shy: "&#173;", reg: "&#174;",
  macr: "&#175;", deg: "&#176;", plusmn: "&#177;", sup2: "&#178;", sup3: "&#179;",
  acute: "&#180;", micro: "&#181;", para: "&#182;", middot: "&#183;", cedil: "&#184;",
  sup1: "&#185;", ordm: "&#186;", raquo: "&#187;", frac14: "&#188;", frac12: "&#189;",
  frac34: "&#190;", iquest: "&#191;", times: "&#215;", divide: "&#247;",
  lsquo: "&#8216;", rsquo: "&#8217;", ldquo: "&#8220;", rdquo: "&#8221;",
  ndash: "&#8211;", mdash: "&#8212;", hellip: "&#8230;", sbquo: "&#8218;", bdquo: "&#8222;",
  lsquor: "&#8218;", rsquor: "&#8217;", ldquor: "&#8222;",
};

function sanitizeXmlEntities(xml: string): string {
  return xml.replace(/&([a-zA-Z]+);/g, (match, name) => {
    // keep XML built-in entities (lt, gt, amp, quot, apos)
    if (["lt", "gt", "amp", "quot", "apos"].includes(name)) return match;
    // convert known HTML entities to numeric
    const lower = name.toLowerCase();
    if (HTML_ENTITIES[lower]) return HTML_ENTITIES[lower];
    // unknown: encode the & to avoid XML parser error
    return `&amp;${name};`;
  });
}

function isMediumUrl(url: string): boolean {
  return url.includes("medium.com/feed");
}

async function fetchMediumFeed(url: string): Promise<CleanRssItem[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CryptoPilot/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml, */*"
    }
  });
  if (!res.ok) throw new Error(`Medium fetch failed: ${res.status} ${res.statusText}`);
  const raw = await res.text();
  const sanitized = sanitizeXmlEntities(raw);
  const feed = await parser.parseString(sanitized);
  return cleanRssItems(feed.items ?? [], new Date());
}

export type IngestSourceResult = { items_found: number; items_created: number };

export async function fetchItemsForSource(
  source: Pick<Source, "url" | "contentLocale">,
  maxPerSource: number
): Promise<CleanRssItem[]> {
  if (!source.url) return [];

  if (isBlockBeatsSourceUrl(source.url)) {
    return (await fetchBlockBeatsFlashItems(maxPerSource)).slice(0, maxPerSource);
  }

  if (isMediumUrl(source.url)) {
    return (await fetchMediumFeed(source.url)).slice(0, maxPerSource);
  }

  const feed = await parser.parseURL(source.url);
  return cleanRssItems(feed.items ?? [], new Date()).slice(0, maxPerSource);
}

export async function fetchRedditItemsForSource(
  source: Pick<Source, "url" | "sourceWeight">,
  credentials: RedditCredentials,
  maxPerSource: number
): Promise<CleanRssItem[]> {
  const signals = await fetchRedditSignals(source, credentials, maxPerSource);
  return signals.map((signal) => ({
    title: signal.title,
    sourceUrl: signal.sourceUrl,
    content: `${signal.content}\n\nReddit author: u/${signal.author}; score: ${signal.score}; comments: ${signal.comments}`,
    publishTime: signal.publishTime
  }));
}

export function initialAiFields(
  item: CleanRssItem,
  source: Pick<Source, "contentLocale">
): { aiSummary: string; narrativeHook: string | null } {
  const summary = item.content.replace(/\s+/g, " ").trim().slice(0, 220) || item.title;
  const hook =
    source.contentLocale === "ZH" && isChineseContent(item.title)
      ? item.title.slice(0, 120)
      : null;
  return { aiSummary: summary, narrativeHook: hook };
}

export async function ingestSourceItems(
  prisma: PrismaClient,
  source: Source,
  maxPerSource: number,
  onCreated?: (feedItemId: string, item: CleanRssItem) => void | Promise<void>,
  itemsOverride?: CleanRssItem[]
): Promise<IngestSourceResult> {
  const items = itemsOverride ?? (await fetchItemsForSource(source, maxPerSource));
  const tagCatalog = await loadHeuristicTagCatalog(prisma);
  let created = 0;

  for (const item of items) {
    const existing = await prisma.feedItem.findUnique({ where: { sourceUrl: item.sourceUrl } });
    if (existing) continue;

    const quality = evaluateFeedQuality(item);
    if (!quality.shouldPublish) continue;

    const heatScore = calculateHeatScore({
      publishTime: item.publishTime,
      sourceWeight: source.sourceWeight,
      tokenMoves: []
    });
    const { aiSummary, narrativeHook } = initialAiFields(item, source);
    const inferredTags = inferHeuristicTags(item, tagCatalog);

    const row = await prisma.feedItem.create({
      data: {
        sourceId: source.id,
        title: item.title,
        content: item.content,
        aiSummary,
        narrativeHook,
        sourceUrl: item.sourceUrl,
        type: source.type === "REDDIT"
          ? "SOCIAL_TREND"
          : classifyFeedContentType({
              title: item.title,
              content: item.content,
              source: { name: source.name },
              feedItemTokens: inferredTags.tokenIds.map((tokenId) => ({ tokenId })),
              feedItemNarratives: inferredTags.narrativeIds.map((narrativeId) => ({ narrativeId }))
            }),
        publishTime: item.publishTime,
        heatScore,
        rankScore: heatScore + (source.contentLocale === "ZH" ? 8 : 0),
        status: "PUBLISHED"
      }
    });

    await attachHeuristicTags(prisma, row.id, item, tagCatalog);
    await onCreated?.(row.id, item);
    created += 1;
  }

  return { items_found: items.length, items_created: created };
}
