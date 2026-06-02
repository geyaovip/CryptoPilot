import "dotenv/config";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { SOURCE_CATALOG } from "../../src/modules/ingestion/source-catalog";

config({ path: "../../.env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function nameToStableId(name: string): string {
  const hex = Buffer.from(name).toString("hex").padEnd(32, "0").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function main() {
  let synced = 0;

  for (const entry of SOURCE_CATALOG) {
    await prisma.source.upsert({
      where: { id: nameToStableId(entry.name) },
      update: {
        url: entry.url,
        status: entry.defaultActive === false ? "PAUSED" : "ACTIVE",
        contentLocale: entry.locale,
        sourceWeight: entry.sourceWeight,
        fetchIntervalSeconds: entry.fetchIntervalSeconds ?? 300
      },
      create: {
        id: nameToStableId(entry.name),
        name: entry.name,
        url: entry.url,
        type: entry.type ?? "RSS",
        status: entry.defaultActive === false ? "PAUSED" : "ACTIVE",
        contentLocale: entry.locale,
        fetchIntervalSeconds: entry.fetchIntervalSeconds ?? 300,
        sourceWeight: entry.sourceWeight
      }
    });
    synced += 1;
  }

  console.log(`已同步 ${synced} 个数据源。`);
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
