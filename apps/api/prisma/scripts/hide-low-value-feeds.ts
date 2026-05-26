import "dotenv/config";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { evaluateFeedQuality } from "../../src/modules/ingestion/feed-quality.util";

config({ path: "../../.env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const feeds = await prisma.feedItem.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { id: true, title: true, content: true, sourceUrl: true, publishTime: true },
    orderBy: { publishTime: "desc" }
  });

  const lowValue = feeds
    .map((feed) => {
      const decision = evaluateFeedQuality({
        title: feed.title,
        content: feed.content,
        sourceUrl: feed.sourceUrl,
        publishTime: feed.publishTime
      });
      return { ...feed, reason: decision.reason, shouldPublish: decision.shouldPublish };
    })
    .filter((feed) => !feed.shouldPublish);

  console.log(`已扫描 ${feeds.length} 条已发布 Feed，命中低价值聚合内容 ${lowValue.length} 条。`);
  for (const feed of lowValue.slice(0, 20)) {
    console.log(`- [${feed.reason}] ${feed.title}`);
  }

  if (lowValue.length === 0) return;

  const result = await prisma.feedItem.updateMany({
    where: { id: { in: lowValue.map((feed) => feed.id) } },
    data: { status: "HIDDEN", clusterId: null, isClusterLead: false }
  });

  await prisma.marketInsight.updateMany({
    where: { signals: { none: { deletedAt: null, status: "PUBLISHED" } } },
    data: { status: "HIDDEN" }
  });

  console.log(`已隐藏 ${result.count} 条低价值 Feed，并同步隐藏无有效信号的 Insight。`);
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
