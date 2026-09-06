"use client";

import React from "react";
import { Flag, ChevronUp } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

interface BatchPriorityMenuProps {
  hasSelection: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const BatchPriorityMenu: React.FC<BatchPriorityMenuProps> = ({
  hasSelection,
  isOpen,
  setIsOpen,
}) => {
  const { batchSetPriority } = useKanbanStore();

  return (
    <div className="relative">
      <button
        disabled={!hasSelection}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
      >
        <Flag className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="inline-block">優先級</span>
        <ChevronUp className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && hasSelection && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-36 backdrop-blur-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            {(["high", "medium", "low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  batchSetPriority(p);
                  setIsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                {p === "high" ? "🔴 高優先" : p === "medium" ? "🟡 中優先" : "🟢 低優先"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
