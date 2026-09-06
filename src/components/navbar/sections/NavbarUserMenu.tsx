"use client";

import React from "react";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { NavbarUserProfileHeader } from "./NavbarUserProfileHeader";
import { NavbarGuestCallout } from "./NavbarGuestCallout";
import { NavbarSyncStatusCard } from "./NavbarSyncStatusCard";
import { NavbarMenuItems } from "./NavbarMenuItems";

interface NavbarUserMenuProps {
  currentTime: Date;
}

export const NavbarUserMenu: React.FC<NavbarUserMenuProps> = ({ currentTime }) => {
  const { userSession, syncState, triggerSync } = useKanbanStore();
  const isGuest = userSession.isGuest || userSession.provider === "guest";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-8 h-8 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800 flex items-center justify-center text-slate-700 hover:border-orange-500 transition-all overflow-hidden shadow-2xs cursor-pointer focus:outline-none focus:border-orange-500"
          aria-label="使用者選單"
        >
          {userSession.avatarUrl ? (
            <img src={userSession.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-72 p-3 space-y-2 z-[9999] rounded-3xl"
      >
        <NavbarUserProfileHeader userSession={userSession} isGuest={isGuest} />
        <NavbarGuestCallout isGuest={isGuest} />
        <NavbarSyncStatusCard
          syncState={syncState}
          currentTime={currentTime}
          isGuest={isGuest}
          onTriggerSync={triggerSync}
        />
        <NavbarMenuItems isGuest={isGuest} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
