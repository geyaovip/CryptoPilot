import { ImageResponse } from "next/og";

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

async function loadFont(): Promise<ArrayBuffer> {
  const response = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.2.5/files/noto-sans-sc-chinese-simplified-700-normal.woff"
  );
  if (!response.ok) {
    throw new Error("Failed to load OG font");
  }
  return response.arrayBuffer();
}

function wrapTitle(title: string, maxLines = 3, maxCharsPerLine = 18): string[] {
  const normalized = title.replace(/\s+/g, " ").trim();
  if (!normalized) return ["CryptoPilot"];

  const lines: string[] = [];
  let current = "";

  for (const char of normalized) {
    const next = current + char;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = char;
      if (lines.length >= maxLines) break;
    } else {
      current = next;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current.length > maxCharsPerLine + 2 ? `${current.slice(0, maxCharsPerLine)}…` : current);
  }

  return lines.slice(0, maxLines);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.trim() || "CryptoPilot AI 加密市场情报终端";
  const tag = searchParams.get("tag")?.trim() || "AI 加密市场情报";
  const lines = wrapTitle(title);
  const font = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#FCFCF9",
          color: "#102A2C",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Noto Sans SC",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 80px",
          width: "100%"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              background: "#111111",
              borderRadius: 18,
              height: 56,
              width: 56
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>CryptoPilot</div>
            <div style={{ color: "#5F6868", fontSize: 24 }}>AI 加密市场情报终端</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 980 }}>
          <div
            style={{
              background: "#E8F4F6",
              borderRadius: 999,
              color: "#186A73",
              display: "inline-flex",
              fontSize: 24,
              fontWeight: 700,
              padding: "10px 22px",
              width: "fit-content"
            }}
          >
            {tag}
          </div>
          {lines.map((line) => (
            <div key={line} style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.25 }}>
              {line}
            </div>
          ))}
        </div>

        <div style={{ color: "#8A918C", fontSize: 24 }}>cryptopilot.chat · 仅供研究参考，不构成投资建议</div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: "Noto Sans SC", data: font, style: "normal", weight: 700 }]
    }
  );
}
