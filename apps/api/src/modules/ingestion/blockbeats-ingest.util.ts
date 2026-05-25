import type { CleanRssItem } from "./rss-cleaner";

const OPEN_FLASH =
  "https://api.theblockbeats.news/v1/open-api/open-flash?page=1&size=30&type=push&lang=cn";

type BlockBeatsFlash = {
  id?: number;
  title?: string;
  content?: string;
  link?: string;
  url?: string;
  create_time?: string;
};

type BlockBeatsResponse = {
  status?: number;
  data?: { data?: BlockBeatsFlash[] } | BlockBeatsFlash[];
};

export function isBlockBeatsSourceUrl(url: string | null | undefined): boolean {
  return Boolean(url?.includes("theblockbeats.news"));
}

export async function fetchBlockBeatsFlashItems(maxItems = 30): Promise<CleanRssItem[]> {
  const response = await fetch(OPEN_FLASH, {
    headers: { Accept: "application/json", "User-Agent": "CryptoPilot/1.0 (+https://cryptopilot.local)" }
  });
  if (!response.ok) {
    throw new Error(`BlockBeats API HTTP ${response.status}`);
  }

  const body = (await response.json()) as BlockBeatsResponse;
  const rows = Array.isArray(body.data)
    ? body.data
    : Array.isArray(body.data?.data)
      ? body.data.data
      : [];

  const collectedAt = new Date();
  const items: CleanRssItem[] = [];

  for (const row of rows.slice(0, maxItems)) {
    const title = row.title?.trim();
    if (!title) continue;

    const sourceUrl =
      row.link?.trim() ||
      row.url?.trim() ||
      (row.id ? `https://m.theblockbeats.info/flash/${row.id}` : "");
    if (!sourceUrl) continue;

    const content = row.content?.trim() || title;
    const unix = row.create_time ? Number(row.create_time) : NaN;
    const publishTime = Number.isFinite(unix) ? new Date(unix * 1000) : collectedAt;

    items.push({ title, sourceUrl, content, publishTime });
  }

  return items;
}
