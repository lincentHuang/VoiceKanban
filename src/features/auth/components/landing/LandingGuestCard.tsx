"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface LandingGuestCardProps {
  onGuestEntry: () => void;
}

export const LandingGuestCard: React.FC<LandingGuestCardProps> = ({ onGuestEntry }) => {
  return (
    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-900/50 flex items-center justify-between gap-3 text-left">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 dark:text-orange-300">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>先體驗再決定？</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            免註冊即可建立看板、口述建立任務，稍後隨時無縫綁定
          </p>
        </div>
        <button
          type="button"
          onClick={onGuestEntry}
          className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>訪客試用</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
