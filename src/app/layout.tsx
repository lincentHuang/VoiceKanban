import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/features/pwa-mobile/components/PwaRegister";


export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "聲動看板 | AI 語音智能任務管理",
  description: "極簡流暢的 AI 語音多狀態任務看板，搭配 Gemini 2.0 Flash 一鍵語音智能萃取與分流。",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "聲動看板",
  },
  icons: {
    icon: [
      { url: "/smile_icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased selection:bg-orange-500 selection:text-white"
      >
        {/* PWA Service Worker 註冊器 */}
        <PwaRegister />
        {/* Background Aurora Canvas */}
        <div className="aurora-canvas pointer-events-none" />
        {children}
      </body>
    </html>
  );
}

