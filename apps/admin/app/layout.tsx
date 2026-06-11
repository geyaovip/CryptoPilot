import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CryptoPilot 管理后台",
  description: "CryptoPilot 管理后台",
  icons: {
    icon: [
      { url: "/brand/app-icon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon.ico", sizes: "64x64", type: "image/x-icon" }
    ],
    shortcut: "/brand/app-icon.svg",
    apple: "/icon-192.png"
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
      "max-image-preview": "none",
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
