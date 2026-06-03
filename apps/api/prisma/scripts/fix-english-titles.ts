import "dotenv/config";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

config({ path: "../../.env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf]/;

function isChinese(text: string): boolean {
  return CJK_RE.test(text ?? "");
}

async function main() {
  const feeds = await prisma.feedItem.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      aiGeneratedAt: { not: null }
    },
    orderBy: { publishedAt: "desc" },
    take: 500
  });

  let fixedHeadlines = 0;
  let fixedSummaries = 0;
  let skipped = 0;

  for (const feed of feeds) {
    const headlineOk = isChinese(feed.narrativeHook ?? "");
    const summaryOk = isChinese(feed.aiSummary ?? "");

    if (headlineOk && summaryOk) {
      skipped += 1;
      continue;
    }

    // Extract Chinese text from title or content as fallback
    const sourceText = [feed.title, feed.content].join(" ");
    const cjkMatches = sourceText.match(/[\u4e00-\u9fff\u3400-\u4dbf][^a-zA-Z]*[\u4e00-\u9fff\u3400-\u4dbf]/g);
    const fallbackChinese = cjkMatches ? cjkMatches.join(" ").slice(0, 120) : "";

    const data: Record<string, string> = {};

    if (!headlineOk && fallbackChinese) {
      data.narrativeHook = fallbackChinese.slice(0, 50);
      fixedHeadlines += 1;
    }

    if (!summaryOk && fallbackChinese) {
      data.aiSummary = fallbackChinese.slice(0, 220);
      fixedSummaries += 1;
    }

    if (Object.keys(data).length > 0) {
      await prisma.feedItem.update({
        where: { id: feed.id },
        data
      });
    }
  }

  console.log(
    `Checked ${feeds.length} AI-processed feeds: ` +
    `${fixedHeadlines} headlines fixed, ${fixedSummaries} summaries fixed, ${skipped} already OK`
  );
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
