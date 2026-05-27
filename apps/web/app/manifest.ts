import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CryptoPilot",
    short_name: "CryptoPilot",
    description: "CryptoPilot 是面向加密市场研究者的 AI Market Intelligence 工具，聚合多来源新闻、市场叙事、资产信号与 AI 解读。",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFCF9",
    theme_color: "#111111",
    icons: [
      { src: "/icon.svg", sizes: "64x64", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" }
    ]
  };
}
