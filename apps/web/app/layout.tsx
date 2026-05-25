import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { PwaInstallBanner } from "./components/pwa-install-banner";
import { PwaRegister } from "./components/pwa-register";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CryptoPilot",
  description: "AI 加密市场情报终端",
  applicationName: "CryptoPilot",
  appleWebApp: { capable: true, title: "CryptoPilot" },
  themeColor: "#20808D"
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
