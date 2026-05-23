import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cryptopilot/ui", "@cryptopilot/types", "@cryptopilot/config"],
  devIndicators: false
};

export default nextConfig;
