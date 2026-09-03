"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { BottomDock } from "@/components/navigation/BottomDock";
import { UnifiedDnDWorkspace } from "@/components/layout/UnifiedDnDWorkspace";
import { VoiceFAB, VoiceCaptureOverlay } from "@/features/voice";
import { SettingsModal } from "@/features/settings";
import {
  AddTaskModal,
  EditTaskModal,
  BatchActionBar,
  ColumnManagerModal,
} from "@/features/kanban";
import {
  AuthModal,
  AuthLandingScreen,
  BindAccountModal,
} from "@/features/auth";
import { SearchModal } from "@/features/search";
import { OfflineBanner } from "@/features/offline";

import { useKanbanStore } from "@/core/stores/useKanbanStore";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const initAuthAndSync = useKanbanStore((state) => state.initAuthAndSync);
  const userSession = useKanbanStore((state) => state.userSession);

  useEffect(() => {
    setIsMounted(true);
    const cleanup = initAuthAndSync();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initAuthAndSync]);

  if (!isMounted) {
    return (
      <main className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between opacity-90">
        <div className="w-full h-12 bg-white/70 dark:bg-slate-900/70 animate-pulse" />
        <div className="flex-1 w-full flex gap-3 p-3 overflow-hidden">
          <div className="w-80 h-full rounded-2xl bg-white/50 animate-pulse" />
          <div className="flex-1 h-full rounded-2xl bg-purple-900/30 animate-pulse" />
        </div>
      </main>
    );
  }

  // 0. Gatekeeper: Unauthenticated users are presented with the Auth Landing Screen
  if (!userSession.isAuthenticated) {
    return <AuthLandingScreen />;
  }

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between relative select-none">
      {/* 0. Top Dynamic Offline Banner */}
      <OfflineBanner />

      {/* 1. Top Transparent Centered Header */}
      <Navbar />

      {/* 2. Unified DnD Dual-Container Workspace (Bi-directional Drag & Drop) */}
      <UnifiedDnDWorkspace />

      {/* Floating Bottom Trello Dock (View Switcher & Inbox Toggle) */}
      <BottomDock />

      {/* Floating Voice Action Button */}
      <VoiceFAB />

      {/* Floating Multi-Select Batch Action Bar */}
      <BatchActionBar />

      {/* Overlays & Modals */}
      <SearchModal />
      <VoiceCaptureOverlay />
      <SettingsModal />
      <AddTaskModal />
      <EditTaskModal />
      <AuthModal />
      <BindAccountModal />
      <ColumnManagerModal />
    </main>
  );
}

