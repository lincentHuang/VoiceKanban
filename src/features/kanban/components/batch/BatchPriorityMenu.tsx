"use client";

import React from "react";
import { Flag, ChevronUp } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { BATCH_MENU_CONTENT_CLASS } from "./batchMenuStyles";

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
    <Popover open={isOpen && hasSelection} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={!hasSelection}
          className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        >
          <Flag className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="inline-block">優先級</span>
          <ChevronUp className="w-3 h-3 text-slate-400 shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent side="top" align="start" sideOffset={8} className={`${BATCH_MENU_CONTENT_CLASS} w-36`}>
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
      </PopoverContent>
    </Popover>
  );
};
