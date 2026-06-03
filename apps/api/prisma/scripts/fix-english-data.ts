import "dotenv/config";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

config({ path: "../../.env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const CJK = /[\u4e00-\u9fff]/;

function isChinese(text: string | null | undefined): boolean {
  if (!text) return false;
  return CJK.test(text);
}

function extractChinese(text: string, maxLen: number): string {
  if (!text) return "";
  const matches = text.match(/[\u4e00-\u9fff][\u4e00-\u9fff\uff0c\u3002\uff1a\uff1b\uff01\u2018\u2019\u201c\u201d\u300a\u300b\s]{3,}/g);
  if (!matches) return "";
  const longest = matches.reduce((a, b) => a.length >= b.length ? a : b);
  return longest.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

async function main() {
  let fixedFeeds = 0;
  let fixedInsights = 0;

  const feeds = await prisma.feedItem.findMany({
    where: { deletedAt: null, status: "PUBLISHED", aiGeneratedAt: { not: null } },
    select: { id: true, title: true, content: true, narrativeHook: true, aiSummary: true }
  });

  for (const feed of feeds) {
    const hookOk = isChinese(feed.narrativeHook);
    const summaryOk = isChinese(feed.aiSummary);
    if (hookOk && summaryOk) continue;

    const chinese = extractChinese((feed.title ?? "") + "\n" + (feed.content ?? ""), 200);
    if (!chinese) continue;

    const data: Record<string, string> = {};
    if (!hookOk) data.narrativeHook = chinese.slice(0, 60);
    if (!summaryOk) data.aiSummary = chinese.slice(0, 200);
    await prisma.feedItem.update({ where: { id: feed.id }, data });
    fixedFeeds += 1;
  }

  console.log(`Feeds fixed: ${fixedFeeds}`);

  const insights = await prisma.marketInsight.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { id: true, aiInsight: true, aiSummary: true, sourcesJson: true }
  });

  for (const insight of insights) {
    const insightOk = isChinese(insight.aiInsight);
    const summaryOk = isChinese(insight.aiSummary);
    if (insightOk && summaryOk) continue;

    let sourceText = "";
    try {
      const sources = JSON.parse(String(insight.sourcesJson ?? "[]"));
      if (Array.isArray(sources)) {
        sourceText = sources.map((s: { title?: string }) => s.title ?? "").join("\n");
      }
    } catch { /* ignore */ }

    const chinese = extractChinese(sourceText, 200);
    if (!chinese) continue;

    const data: Record<string, string> = {};
    if (!insightOk) data.aiInsight = chinese.slice(0, 60);
    if (!summaryOk) data.aiSummary = chinese.slice(0, 200);
    await prisma.marketInsight.update({ where: { id: insight.id }, data });
    fixedInsights += 1;
  }

  console.log(`Insights fixed: ${fixedInsights}`);
  console.log("Done.");
}

main()
  .finally(async () => { await prisma.$disconnect(); await pool.end(); })
  .catch((error) => { console.error(error); process.exitCode = 1; });
