"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar/Navbar";
import { BottomDock } from "@/components/navigation/BottomDock";
import { UnifiedDnDWorkspace } from "@/components/layout/UnifiedDnDWorkspace";
import { AppModals } from "@/components/layout/AppModals";
import { VoiceFAB } from "@/features/voice/components/VoiceFAB";
import { OfflineBanner } from "@/features/offline/components/OfflineBanner";
import { useAppInit } from "@/core/hooks/useAppInit";

// 這三個在「已登入、沒在多選、沒有通知」的常態下都是 null，不必進首屏 bundle
const AuthLandingScreen = dynamic(
  () => import("@/features/auth/components/AuthLandingScreen").then((m) => ({ default: m.AuthLandingScreen })),
  { ssr: false }
);
const BatchActionBar = dynamic(
  () => import("@/features/kanban/components/BatchActionBar").then((m) => ({ default: m.BatchActionBar })),
  { ssr: false }
);
const NotificationToastContainer = dynamic(
  () => import("@/features/notifications/components/NotificationToastContainer").then((m) => ({ default: m.NotificationToastContainer })),
  { ssr: false }
);

export default function Home() {
  const { isMounted, userSession } = useAppInit();

  if (!isMounted) {
    return (
      <main className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between opacity-90">
        <div className="w-full min-h-12 pt-[env(safe-area-inset-top,0px)] bg-white/70 dark:bg-slate-900/70 animate-pulse" />
        <div className="flex-1 w-full flex gap-3 p-3 overflow-hidden">
          <div className="w-80 h-full rounded-2xl bg-white/50 animate-pulse" />
          <div className="flex-1 h-full rounded-2xl bg-purple-900/30 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!userSession.isAuthenticated) {
    return <AuthLandingScreen />;
  }

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between relative select-none">
      <OfflineBanner />
      <NotificationToastContainer />
      <Navbar />
      <UnifiedDnDWorkspace />
      <BottomDock />
      <VoiceFAB />
      <BatchActionBar />
      <AppModals />
    </main>
  );
}
