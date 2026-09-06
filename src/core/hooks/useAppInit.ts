"use client";

import { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useAppInit() {
  const [isMounted, setIsMounted] = useState(false);
  const initAuthAndSync = useKanbanStore((state) => state.initAuthAndSync);
  const userSession = useKanbanStore((state) => state.userSession);
  const loginAsGuest = useKanbanStore((state) => state.loginAsGuest);
  const setJoinBoardInitialCode = useKanbanStore((state) => state.setJoinBoardInitialCode);
  const setIsJoinBoardModalOpen = useKanbanStore((state) => state.setIsJoinBoardModalOpen);

  useEffect(() => {
    setIsMounted(true);
    const cleanup = initAuthAndSync();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get("invite");
      if (inviteCode) {
        if (!userSession.isAuthenticated) {
          loginAsGuest();
        }
        setJoinBoardInitialCode(inviteCode.toUpperCase());
        setIsJoinBoardModalOpen(true);
      }
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [initAuthAndSync, setJoinBoardInitialCode, setIsJoinBoardModalOpen, userSession.isAuthenticated, loginAsGuest]);

  return { isMounted, userSession };
}
