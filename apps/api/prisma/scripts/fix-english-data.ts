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

async function translate(text: string, context: string): Promise<string> {
  const system = "你是CryptoPilot的翻译助手。将英文加密货币新闻标题/摘要翻译成简洁精准的中文，保留专业术语，100字以内。只输出译文，不要解释。";
  const user = `原文: ${text.slice(0, 800)}\n${context ? `上下文: ${context.slice(0, 300)}` : ""}`;

  const res = await fetch(`${LLM_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_KEY}`
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.3,
      max_tokens: 300
    })
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`LLM ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function main() {
  let fixedFeeds = 0;
  let fixedInsights = 0;
  let total = 0;

  // Feed items with English content
  const feeds = await prisma.feedItem.findMany({
    where: { deletedAt: null, status: "PUBLISHED", aiGeneratedAt: { not: null } },
    select: { id: true, title: true, content: true, narrativeHook: true, aiSummary: true }
  });

  for (const feed of feeds) {
    const hookOk = isChinese(feed.narrativeHook);
    const summaryOk = isChinese(feed.aiSummary);
    if (hookOk && summaryOk) continue;

    total += 1;

    try {
      const data: Record<string, string> = {};

      if (!hookOk) {
        const text = feed.narrativeHook ?? feed.title;
        if (text && !isChinese(text)) {
          data.narrativeHook = await translate(text, feed.title ?? "");
        }
      }
      if (!summaryOk) {
        const text = feed.aiSummary ?? feed.title;
        if (text && !isChinese(text)) {
          data.aiSummary = await translate(text, feed.title ?? "");
        }
      }

      if (Object.keys(data).length > 0) {
        await prisma.feedItem.update({ where: { id: feed.id }, data });
        fixedFeeds += 1;
      }
    } catch (e) {
      console.error(`Feed ${feed.id} failed:`, (e as Error).message);
    }

    // Rate limit: wait 1s between LLM calls
    if (total % 5 === 0) console.log(`Progress: ${total} items processed, ${fixedFeeds} feeds fixed...`);
    await new Promise((r) => setTimeout(r, 200));
  }

  // Insights with English content
  const insights = await prisma.marketInsight.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { id: true, aiInsight: true, aiSummary: true, sourcesJson: true, primaryNarrative: { select: { name: true } } },
    orderBy: { id: "asc" }
  });

  for (const insight of insights) {
    const insightOk = isChinese(insight.aiInsight);
    const summaryOk = isChinese(insight.aiSummary);
    if (insightOk && summaryOk) continue;

    total += 1;

    // Build context from source titles
    let sourceContext = "";
    try {
      const sources = JSON.parse(String(insight.sourcesJson ?? "[]"));
      if (Array.isArray(sources)) {
        sourceContext = sources
          .map((s: { title?: string }) => s.title ?? "")
          .filter(Boolean)
          .slice(0, 3)
          .join(" | ");
      }
    } catch { /* ignore */ }

    const topic = insight.primaryNarrative?.name ?? "加密市场";

    try {
      const data: Record<string, string> = {};

      if (!insightOk) {
        const text = insight.aiInsight ?? sourceContext;
        if (text && !isChinese(text)) {
          data.aiInsight = await translate(text, `主题: ${topic}\n${sourceContext}`);
        }
      }
      if (!summaryOk) {
        const text = insight.aiSummary ?? sourceContext;
        if (text && !isChinese(text)) {
          data.aiSummary = await translate(text, `主题: ${topic}\n${sourceContext}`);
        }
      }

      if (Object.keys(data).length > 0) {
        await prisma.marketInsight.update({ where: { id: insight.id }, data });
        fixedInsights += 1;
      }
    } catch (e) {
      console.error(`Insight ${insight.id} failed:`, (e as Error).message);
    }

    if (total % 5 === 0) console.log(`Progress: ${total} items, ${fixedInsights} insights fixed...`);
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`Done. Feeds: ${fixedFeeds}, Insights: ${fixedInsights}, Total: ${total}`);
}

main()
  .finally(async () => { await prisma.$disconnect(); await pool.end(); })
  .catch((error) => { console.error(error); process.exitCode = 1; });
