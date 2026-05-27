import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { PwaInstallBanner } from "./components/pwa-install-banner";
import { PwaRegister } from "./components/pwa-register";
import { Providers } from "./providers";
import { defaultDescription, publicPageMetadata, siteName, siteUrl } from "./lib/seo";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  ...publicPageMetadata({
    title: "CryptoPilot | AI 加密市场情报终端",
    description: defaultDescription,
    path: "/"
  }),
  applicationName: siteName,
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  },
  category: "finance"
};

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "light"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <PwaRegister />
          <PwaInstallBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
