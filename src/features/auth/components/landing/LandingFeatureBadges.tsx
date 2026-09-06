"use client";

import React from "react";
import { Mic, Zap, ShieldCheck } from "lucide-react";

export const LandingFeatureBadges: React.FC = () => {
  return (
    <div className="mt-4 pt-3 flex items-center justify-around text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-1">
        <Mic className="w-3.5 h-3.5 text-orange-500" />
        <span>語音自然語言解析</span>
      </div>
      <div className="flex items-center gap-1">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span>100% 離線即時響應</span>
      </div>
      <div className="flex items-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>端到端加密代理</span>
      </div>
    </div>
  );
};
