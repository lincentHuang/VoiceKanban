"use client";

import React from "react";
import { Sparkles, Link2 } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

interface NavbarGuestCalloutProps {
  isGuest: boolean;
}

export const NavbarGuestCallout: React.FC<NavbarGuestCalloutProps> = ({ isGuest }) => {
  const { setIsBindModalOpen } = useKanbanStore();

  if (!isGuest) return null;

  return (
    <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 dark:from-orange-950/40 dark:to-amber-950/30 border border-orange-200/80 dark:border-orange-900/60">
      <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 dark:text-orange-300 mb-1">
        <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <span>訪客體驗模式</span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
        隨時可綁定正式帳號，自動保留並整併目前所有看板資料。
      </p>
      <button
        type="button"
        onClick={() => setIsBindModalOpen(true)}
        className="w-full py-1.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Link2 className="w-3.5 h-3.5" />
        <span>立即綁定正式帳號</span>
      </button>
    </div>
  );
};
