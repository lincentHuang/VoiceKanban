"use client";

import React from "react";
import { Tag, ChevronUp } from "lucide-react";
import { useBatchTagMenu } from "./tag-menu/useBatchTagMenu";
import { BatchTagPopoverContent } from "./tag-menu/BatchTagPopoverContent";

interface BatchTagMenuProps {
  hasSelection: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const BatchTagMenu: React.FC<BatchTagMenuProps> = ({
  hasSelection,
  isOpen,
  setIsOpen,
}) => {
  const menu = useBatchTagMenu(isOpen);

  return (
    <div className="relative">
      <button
        disabled={!hasSelection}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        title="批次加入或管理標籤"
      >
        <Tag className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="inline-block">標籤</span>
        <ChevronUp className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && hasSelection && (
        <BatchTagPopoverContent onClose={() => setIsOpen(false)} menu={menu} />
      )}
    </div>
  );
};
