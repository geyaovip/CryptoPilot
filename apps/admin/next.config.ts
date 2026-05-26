import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cryptopilot/ui", "@cryptopilot/types", "@cryptopilot/config"],
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, noimageindex"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
