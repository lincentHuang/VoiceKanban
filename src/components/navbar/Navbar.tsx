"use client";

import React, { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Search } from "lucide-react";
import { NavbarBrandSection } from "./sections/NavbarBrandSection";
import { NavbarSearchBar } from "./sections/NavbarSearchBar";
import { NavbarUserMenu } from "./sections/NavbarUserMenu";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { DesktopInstallButton } from "@/features/pwa-mobile/components/DesktopInstallButton";

export const Navbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setIsSearchModalOpen,
    userSession,
  } = useKanbanStore();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchModalOpen]);

  const isGuest = userSession.isGuest || userSession.provider === "guest";

  return (
    <header className="w-full min-h-12 bg-transparent pt-[env(safe-area-inset-top,0px)] sm:pt-[calc(0.75rem+env(safe-area-inset-top,0px))] px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-30">
      <NavbarBrandSection isGuest={isGuest} />

      <NavbarSearchBar
        searchQuery={searchQuery}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onClearSearch={(e) => {
          e.stopPropagation();
          setSearchQuery("");
        }}
      />

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="sm:hidden w-8 h-8 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-orange-500 hover:text-orange-500 transition-all shadow-2xs cursor-pointer active:scale-95"
          aria-label="開啟搜尋"
          title="搜尋任務"
        >
          <Search className="w-4 h-4" />
        </button>

        <DesktopInstallButton />

        <NotificationBell />

        <NavbarUserMenu currentTime={currentTime} />
      </div>
    </header>
  );
};
export default Navbar;
