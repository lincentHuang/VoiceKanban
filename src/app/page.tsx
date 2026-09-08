"use client";

import React from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { BottomDock } from "@/components/navigation/BottomDock";
import { UnifiedDnDWorkspace } from "@/components/layout/UnifiedDnDWorkspace";
import { AppModals } from "@/components/layout/AppModals";
import { VoiceFAB } from "@/features/voice";
import { BatchActionBar } from "@/features/kanban";
import { AuthLandingScreen } from "@/features/auth";
import { OfflineBanner } from "@/features/offline";
import { NotificationToastContainer } from "@/features/notifications";
import { useAppInit } from "@/core/hooks/useAppInit";

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
