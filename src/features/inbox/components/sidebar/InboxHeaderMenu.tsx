"use client";

import React from "react";
import { ArrowUpDown, Settings } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

interface InboxHeaderMenuProps {
  inboxSort: "date" | "priority" | "title";
  setInboxSort: (sort: "date" | "priority" | "title") => void;
  onClose: () => void;
}

export const InboxHeaderMenu: React.FC<InboxHeaderMenuProps> = ({
  inboxSort,
  setInboxSort,
  onClose,
}) => {
  const { setIsSettingsModalOpen } = useKanbanStore();

  return (
    <div className="absolute right-0 top-full mt-1.5 w-44 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in">
      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        排序方式
      </div>
      <button
        onClick={() => {
          setInboxSort("date");
          onClose();
        }}
        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer ${
          inboxSort === "date"
            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        }`}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span>依建立時間</span>
      </button>
      <button
        onClick={() => {
          setInboxSort("priority");
          onClose();
        }}
        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer ${
          inboxSort === "priority"
            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        }`}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span>依重要程度</span>
      </button>

      <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
        <button
          onClick={() => {
            setIsSettingsModalOpen(true);
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>語音與 API 設定</span>
        </button>
      </div>
    </div>
  );
};
