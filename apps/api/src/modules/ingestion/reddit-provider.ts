import type { Source } from "@prisma/client";
import { calculateHeatScore } from "./heat-score";

export type RedditCredentials = {
  clientId?: string;
  clientSecret?: string;
  userAgent?: string;
};

export type RedditSignalItem = {
  title: string;
  content: string;
  sourceUrl: string;
  publishTime: Date;
  score: number;
  comments: number;
  author: string;
};

type RedditPostData = {
  title?: string;
  selftext?: string;
  permalink?: string;
  url?: string;
  created_utc?: number;
  score?: number;
  num_comments?: number;
  author?: string;
  stickied?: boolean;
  over_18?: boolean;
};

type RedditListing = {
  data?: {
    children?: Array<{
      data?: RedditPostData;
    }>;
  };
};

const RELEVANCE_PATTERNS = [
  /\b(bitcoin|btc|ethereum|eth|solana|sol|stablecoin|defi|rwa|etf|sec|token|airdrop|staking|layer\s?2|l2)\b/i,
  /\b(exchange|regulation|liquidity|on-?chain|wallet|hack|exploit|bridge|dao|governance|treasury)\b/i
];

const NOISE_PATTERNS = [
  /\b(daily discussion|weekly discussion|megathread|simple questions|support thread|general discussion)\b/i,
  /\b(giveaway|referral|promo code|airdrop farming|free money|100x|moonshot|shill|rate my portfolio)\b/i,
  /\b(what should i buy|should i buy|help me|lost money|price prediction|when moon)\b/i
];

const MIN_TITLE_LENGTH = 16;
const MIN_SOCIAL_SCORE = 35;

export async function fetchRedditSignals(
  source: Pick<Source, "url" | "sourceWeight">,
  credentials: RedditCredentials,
  maxPerSource: number
): Promise<RedditSignalItem[]> {
  if (!source.url) return [];
  const token = await fetchRedditAccessToken(credentials);
  const url = new URL(`${source.url.replace(/\/$/, "")}/hot`);
  url.searchParams.set("limit", String(Math.min(Math.max(maxPerSource * 3, 25), 100)));
  url.searchParams.set("raw_json", "1");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": redditUserAgent(credentials)
    }
  });
  if (!response.ok) throw new Error(`Reddit 采集失败：${response.status}`);

  const listing = (await response.json()) as RedditListing;
  const now = new Date();
  const items = (listing.data?.children ?? [])
    .map((child) => normalizeRedditPost(child.data))
    .filter((item): item is RedditSignalItem => Boolean(item))
    .filter((item) => shouldKeepRedditSignal(item, source.sourceWeight, now))
    .sort((a, b) => socialScore(b, source.sourceWeight, now) - socialScore(a, source.sourceWeight, now));

  return items.slice(0, maxPerSource);
}

async function fetchRedditAccessToken(credentials: RedditCredentials): Promise<string> {
  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error("Reddit OAuth 未配置：请设置 REDDIT_CLIENT_ID 和 REDDIT_CLIENT_SECRET");
  }

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": redditUserAgent(credentials)
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });
  if (!response.ok) throw new Error(`Reddit OAuth 失败：${response.status}`);

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("Reddit OAuth 未返回 access_token");
  return body.access_token;
}

function redditUserAgent(credentials: RedditCredentials): string {
  return credentials.userAgent?.trim() || "CryptoPilot/0.1 social-ingestion";
}

function normalizeRedditPost(post?: RedditPostData): RedditSignalItem | null {
  if (!post) return null;
  const title = post.title?.trim();
  const permalink = post.permalink?.trim();
  if (!title || !permalink || post.stickied || post.over_18) return null;

  const content = post.selftext?.replace(/\s+/g, " ").trim() || title;
  return {
    title,
    content,
    sourceUrl: `https://www.reddit.com${permalink}`,
    publishTime: post.created_utc ? new Date(post.created_utc * 1000) : new Date(),
    score: post.score ?? 0,
    comments: post.num_comments ?? 0,
    author: post.author ?? "reddit"
  };
}

function shouldKeepRedditSignal(item: RedditSignalItem, sourceWeight: number, now: Date): boolean {
  const text = `${item.title}\n${item.content}`;
  if (item.title.length < MIN_TITLE_LENGTH) return false;
  if (NOISE_PATTERNS.some((pattern) => pattern.test(text))) return false;
  if (!RELEVANCE_PATTERNS.some((pattern) => pattern.test(text))) return false;
  return socialScore(item, sourceWeight, now) >= MIN_SOCIAL_SCORE;
}

function socialScore(item: RedditSignalItem, sourceWeight: number, now: Date): number {
  const engagement = Math.min(100, item.score * 0.65 + item.comments * 1.4);
  const baseHeat = calculateHeatScore({ publishTime: item.publishTime, sourceWeight, tokenMoves: [], now });
  return Math.round(baseHeat * 0.55 + engagement * 0.45);
}
