import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CryptoPilot",
    short_name: "CryptoPilot",
    description: "AI 加密市场情报终端",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFCF9",
    theme_color: "#20808D",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ]
  };
}
