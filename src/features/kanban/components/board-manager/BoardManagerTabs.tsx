"use client";

import React from "react";
import { Columns3, Info, Users, Palette } from "lucide-react";
import { BoardManagerTabId } from "./useBoardManagerModal";

const TAB_CONFIG: { id: BoardManagerTabId; label: string; icon: React.ReactNode }[] = [
  { id: "columns", label: "欄位流程", icon: <Columns3 className="w-3.5 h-3.5" /> },
  { id: "general", label: "一般設定", icon: <Info className="w-3.5 h-3.5" /> },
  { id: "sharing", label: "共享協作", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "appearance", label: "背景外觀", icon: <Palette className="w-3.5 h-3.5" /> },
];

interface BoardManagerTabsProps {
  activeTab: BoardManagerTabId;
  onSelectTab: (tab: BoardManagerTabId) => void;
}

export const BoardManagerTabs: React.FC<BoardManagerTabsProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="flex items-center gap-1 pt-3 shrink-0 overflow-x-auto custom-scrollbar -mx-1 px-1">
      {TAB_CONFIG.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelectTab(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === tab.id
              ? "bg-base44-orange text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
