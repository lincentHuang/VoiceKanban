"use client";

import React from "react";
import { Kanban, Mic } from "lucide-react";

export const LandingBrandHeader: React.FC = () => {
  return (
    <div className="text-center pb-5">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 mb-3.5">
        <Kanban className="w-7 h-7" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        VoiceKanban
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
        <Mic className="w-3.5 h-3.5 text-orange-500" />
        <span>AI 語音驅動的極速視覺看板與任務管理系統</span>
      </p>
    </div>
  );
};
