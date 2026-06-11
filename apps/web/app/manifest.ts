import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CryptoPilot",
    short_name: "CryptoPilot",
    description: "CryptoPilot 聚合多来源加密新闻、市场叙事、资产信号与 AI 解读，帮助研究者快速跟踪 Web3 市场变化。",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FCFCF9",
    theme_color: "#111111",
    categories: ["finance", "news", "productivity"],
    lang: "zh-CN",
    dir: "ltr",
    icons: [
      { src: "/icon.svg", sizes: "64x64", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" }
    ]
  };
}
