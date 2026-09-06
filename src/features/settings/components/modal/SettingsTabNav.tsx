"use client";

import React from "react";
import { Sparkles, WifiOff, BrainCircuit } from "lucide-react";

interface SettingsTabNavProps {
  activeTab: "api" | "offline" | "learning";
  setActiveTab: (tab: "api" | "offline" | "learning") => void;
}

export const SettingsTabNav: React.FC<SettingsTabNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="flex items-center gap-2 mt-4 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
      <button
        type="button"
        onClick={() => setActiveTab("api")}
        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
          activeTab === "api"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
        <span>Gemini BYOK</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("offline")}
        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
          activeTab === "offline"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <WifiOff className="w-3.5 h-3.5 text-amber-500" />
        <span>離線與同步</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("learning")}
        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
          activeTab === "learning"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <BrainCircuit className="w-3.5 h-3.5 text-lime-600" />
        <span>半自動學習</span>
      </button>
    </div>
  );
};
