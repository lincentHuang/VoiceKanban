"use client";

import React from "react";
import { UserSession } from "@/core/types/auth";

interface NavbarUserProfileHeaderProps {
  userSession: UserSession;
  isGuest: boolean;
}

export const NavbarUserProfileHeader: React.FC<NavbarUserProfileHeaderProps> = ({
  userSession,
  isGuest,
}) => {
  return (
    <div className="px-1.5 py-1">
      <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
        {userSession.name}
      </div>
      <div className="text-xs text-slate-400 truncate">{userSession.email}</div>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
            isGuest
              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          }`}
        >
          {userSession.provider}
        </span>
        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          在線
        </span>
      </div>
    </div>
  );
};
