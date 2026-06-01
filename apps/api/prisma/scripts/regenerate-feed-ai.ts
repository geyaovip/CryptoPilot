import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../src/modules/app.module";
import { FeedAiService } from "../../src/modules/ai/feed-ai.service";
import { PrismaService } from "../../src/modules/prisma/prisma.service";

const DEFAULT_LIMIT = 80;

async function main() {
  const limit = Number(process.env.FEED_AI_REGEN_LIMIT ?? DEFAULT_LIMIT);
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["error", "warn"] });
  const prisma = app.get(PrismaService);
  const feedAi = app.get(FeedAiService);

  const feeds = await prisma.feedItem.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      sourceUrl: { not: "" }
    },
    orderBy: { publishTime: "desc" },
    take: limit,
    select: { id: true, title: true }
  });

  let regenerated = 0;
  let failed = 0;
  for (const feed of feeds) {
    await prisma.feedItem.update({
      where: { id: feed.id },
      data: { aiGeneratedAt: null, aiGenerationError: null }
    });
    await feedAi.generateForFeed(feed.id);
    const refreshed = await prisma.feedItem.findUnique({
      where: { id: feed.id },
      select: { aiGeneratedAt: true, aiGenerationError: true }
    });
    if (refreshed?.aiGeneratedAt && !refreshed.aiGenerationError) {
      regenerated += 1;
    } else {
      failed += 1;
      console.warn(`Feed AI regenerate failed: ${feed.id} ${feed.title}`);
    }
  }

  await app.close();
  console.log(`Feed AI regeneration complete. regenerated=${regenerated} failed=${failed}`);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
