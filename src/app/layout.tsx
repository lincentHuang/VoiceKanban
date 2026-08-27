import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceKanban | 語音智能看板待辦",
  description: "極簡流暢的 Trello 風格多狀態看板，搭配 Gemini 2.0 Flash 一鍵語音智能萃取與分流。",
  icons: {
    icon: "/favicon.ico",
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
        {/* Background Aurora Canvas */}
        <div className="aurora-canvas pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
