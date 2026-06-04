export type RawRssItem = {
  title?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  isoDate?: string;
  ["content:encoded"]?: string;
};

export type CleanRssItem = {
  title: string;
  sourceUrl: string;
  content: string;
  publishTime: Date;
};

export function cleanRssItems(items: RawRssItem[], collectedAt = new Date()): CleanRssItem[] {
  const seen = new Set<string>();
  const cleaned: CleanRssItem[] = [];

  for (const item of items) {
    const title = item.title?.trim();
    const sourceUrl = item.link?.trim();

    if (!title || !sourceUrl) continue;
    const dedupeKey = `${title.toLowerCase()}::${sourceUrl}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    cleaned.push({
      title: cleanTitle(title),
      sourceUrl,
      content: cleanRssContent(item) || cleanText(title),
      publishTime: item.isoDate ? new Date(item.isoDate) : collectedAt
    });
  }

  return cleaned;
}

function cleanRssContent(item: RawRssItem): string {
  const raw = item["content:encoded"] ?? item.content ?? item.contentSnippet ?? item.title ?? "";
  return cleanText(stripPublisherBoilerplate(raw));
}

function stripPublisherBoilerplate(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<figcaption[\s\S]*?<\/figcaption>/gi, " ")
    .replace(/The post .{0,180}? appeared first on .{0,80}\./gi, " ")
    .replace(/This post is public so feel free to share it\./gi, " ")
    .replace(/Thanks for reading .{0,120}? Subscribe for free .{0,200}?/gi, " ")
    .replace(/Continue reading on Medium\.?/gi, " ")
    .replace(/Sign up for Medium.{0,200}?/gi, " ")
    .replace(/Subscribe to .{0,80}? on Paragraph\.?/gi, " ")
    .replace(/You're receiving this because you subscribed to .{0,160}?/gi, " ");
}

function cleanText(raw: string): string {
  return decodeHtmlEntities(raw)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(raw: string): string {
  return cleanText(raw).replace(/[。.，,；;！!？?]+$/, "").trim();
}

function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}
