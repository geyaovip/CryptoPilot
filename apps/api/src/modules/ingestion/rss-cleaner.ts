export type RawRssItem = {
  title?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  isoDate?: string;
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
      title,
      sourceUrl,
      content: (item.contentSnippet ?? item.content ?? title).trim(),
      publishTime: item.isoDate ? new Date(item.isoDate) : collectedAt
    });
  }

  return cleaned;
}
