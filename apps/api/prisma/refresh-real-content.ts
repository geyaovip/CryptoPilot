import "dotenv/config";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import {
  assignFeedClusters,
  backfillHeuristicTags,
  ingestAllRssSources,
  purgeExampleContent,
  rebuildInsightsFromFeeds
} from "./lib/real-content";

config({ path: "../../.env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("1/5 清理 example.com 示例数据…");
  const purged = await purgeExampleContent(prisma);
  console.log(`   已移除 ${purged.removed_feeds} 条示例 Feed，并重置 Insight`);

  console.log("2/5 从 RSS 采集真实文章…");
  const ingested = await ingestAllRssSources(prisma, 25);
  console.log(`   ${ingested.sources} 个来源，发现 ${ingested.items_found} 条，新建 ${ingested.items_created} 条`);

  console.log("3/5 为已有文章回填叙事/代币标签…");
  const tags = await backfillHeuristicTags(prisma);
  console.log(`   处理 ${tags.feeds_processed} 条，其中 ${tags.feeds_with_narrative} 条含叙事标签`);

  console.log("4/5 按主题聚合并重建 Insight…");
  const insights = await rebuildInsightsFromFeeds(prisma);
  console.log(`   新建 ${insights.insights_created} 条 Insight`);

  console.log("5/5 分配 Feed 轻聚合簇（方案 B）…");
  const clusters = await assignFeedClusters(prisma);
  console.log(`   ${clusters.clusters} 个簇，关联 ${clusters.linked} 条 Feed`);

  const [feeds, publishedInsights] = await Promise.all([
    prisma.feedItem.count({ where: { deletedAt: null, status: "PUBLISHED", NOT: { sourceUrl: { startsWith: "https://example.com/" } } } }),
    prisma.marketInsight.count({ where: { deletedAt: null, status: "PUBLISHED" } })
  ]);
  console.log(`完成：真实 Feed ${feeds} 条，已发布 Insight ${publishedInsights} 条`);
  console.log("提示：API 运行后 Feed AI 定时任务会继续优化 ai_summary（需配置 LLM）。");
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
