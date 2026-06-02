import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const appName = process.argv[2];
if (!appName) {
  console.error("Usage: node scripts/assert-cloudflare-build-env.mjs <web|admin>");
  process.exit(1);
}

const root = join(process.cwd(), "apps", appName, ".open-next");
const forbidden = [
  { label: "local API URL", pattern: "http://localhost:3002" },
  { label: "local API URL", pattern: "http://127.0.0.1:3002" },
  { label: "local API URL", pattern: "http://0.0.0.0:3002" },
  { label: "compiled local API env", pattern: "NEXT_PUBLIC_API_URL=http://localhost" },
  { label: "compiled local API env", pattern: "API_URL=http://localhost" },
  { label: "temporary Cloudflare tunnel", pattern: "trycloudflare.com" },
  { label: "development login flag enabled", pattern: "NEXT_PUBLIC_BETA_DEV_LOGIN=true" },
  { label: "development login flag enabled", pattern: 'NEXT_PUBLIC_BETA_DEV_LOGIN="true"' },
  { label: "development login flag enabled", pattern: '"NEXT_PUBLIC_BETA_DEV_LOGIN":"true"' },
  { label: "development login copy", pattern: "快速登录（开发" },
  { label: "development login copy", pattern: "Beta 快速登录" },
  { label: "local demo account", pattern: "cryptopilot.local" },
  { label: "technical auth copy", pattern: "Bearer Token" },
  { label: "GitHub token", pattern: /ghp_[A-Za-z0-9_]{20,}/ },
  { label: "Resend API key", pattern: /\bre_[A-Za-z0-9]{24,}\b/ },
  { label: "Telegram bot token", pattern: /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/ }
];
const allowedExtensions = new Set([".js", ".mjs", ".cjs", ".json", ".map"]);

const matches = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (![...allowedExtensions].some((extension) => entry.name.endsWith(extension))) continue;
    const content = await readFile(path, "utf8");
    const hit = forbidden.find((rule) => {
      if (typeof rule.pattern === "string") return content.includes(rule.pattern);
      return rule.pattern.test(content);
    });
    if (hit) matches.push({ path, label: hit.label });
  }
}

try {
  await walk(root);
} catch (error) {
  console.error(`Cloudflare build artifact check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

if (matches.length > 0) {
  console.error("Cloudflare build artifact contains forbidden production values. Refusing to deploy:");
  for (const match of matches.slice(0, 10)) {
    console.error(`- ${match.path}: ${match.label}`);
  }
  process.exit(1);
}

console.log(`Cloudflare build artifact check passed for ${appName}.`);
