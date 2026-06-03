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

const LLM_URL = process.env.OPENAI_BASE_URL || process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1";
const LLM_MODEL = process.env.OPENAI_CHAT_MODEL || process.env.MOONSHOT_CHAT_MODEL || "kimi-k2.5";
const LLM_KEY =
  process.env.OPENAI_API_KEY ||
  process.env.MOONSHOT_API_KEY ||
  process.env.DEEPSEEK_API_KEY ||
  "";

if (!LLM_KEY) {
  console.error("No LLM API key found. Set MOONSHOT_API_KEY or OPENAI_API_KEY in .env");
  process.exit(1);
}

async function translateHeadline(text: string): Promise<string> {
  const res = await fetch(`${LLM_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_KEY}` },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: "把英文加密货币标题翻译成简洁中文，保留专业术语，只输出译文。" },
        { role: "user", content: text.slice(0, 300) }
      ],
      temperature: 0.3,
      max_tokens: 200
    })
  });

  if (!res.ok) throw new Error(`LLM ${res.status}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function main() {
  let fixedFeeds = 0;
  let fixedInsights = 0;

  // Feed items: only fix English narrative hooks (short headlines)
  const feeds = await prisma.feedItem.findMany({
    where: { deletedAt: null, status: "PUBLISHED", aiGeneratedAt: { not: null } },
    select: { id: true, narrativeHook: true },
    orderBy: { publishTime: "desc" },
    take: 500
  });

  for (const feed of feeds) {
    const hook = feed.narrativeHook?.trim();
    if (!hook || isChinese(hook)) continue;

    try {
      const cn = await translateHeadline(hook);
      if (cn && isChinese(cn)) {
        await prisma.feedItem.update({
          where: { id: feed.id },
          data: { narrativeHook: cn.slice(0, 80) }
        });
        fixedFeeds += 1;
      }
    } catch (e) {
      console.error(`Feed ${feed.id}:`, (e as Error).message);
    }
    if (fixedFeeds % 10 === 0) console.log(`Feeds done: ${fixedFeeds}...`);
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`Feeds fixed: ${fixedFeeds}`);

  // Insights: only fix English aiInsight headlines
  const insights = await prisma.marketInsight.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { id: true, aiInsight: true },
    orderBy: { publishedAt: "desc" },
    take: 200
  });

  for (const insight of insights) {
    const title = insight.aiInsight?.trim();
    if (!title || isChinese(title)) continue;

    try {
      const cn = await translateHeadline(title);
      if (cn && isChinese(cn)) {
        await prisma.marketInsight.update({
          where: { id: insight.id },
          data: { aiInsight: cn.slice(0, 80) }
        });
        fixedInsights += 1;
      }
    } catch (e) {
      console.error(`Insight ${insight.id}:`, (e as Error).message);
    }
    if (fixedInsights % 10 === 0) console.log(`Insights done: ${fixedInsights}...`);
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`Done. Feeds: ${fixedFeeds}, Insights: ${fixedInsights}`);
}

main()
  .finally(async () => { await prisma.$disconnect(); await pool.end(); })
  .catch((error) => { console.error(error); process.exitCode = 1; });
