"use client";

import React from "react";
import { Tag, ChevronUp } from "lucide-react";
import { useBatchTagMenu } from "./tag-menu/useBatchTagMenu";
import { BatchTagPopoverContent } from "./tag-menu/BatchTagPopoverContent";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { BATCH_MENU_CONTENT_CLASS } from "./batchMenuStyles";

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
    <Popover open={isOpen && hasSelection} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={!hasSelection}
          className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          title="批次加入或管理標籤"
        >
          <Tag className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="inline-block">標籤</span>
          <ChevronUp className="w-3 h-3 text-slate-400 shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        onEscapeKeyDown={(e) => {
          // 注音選字中按 Escape 是取消候選字，不是關閉選單
          if (e.isComposing || e.key === "Process") e.preventDefault();
        }}
        className={`${BATCH_MENU_CONTENT_CLASS} w-64 max-w-[calc(100vw-2rem)] p-2.5 border-slate-700/80 dark:border-slate-700/80 flex flex-col gap-2`}
      >
        <BatchTagPopoverContent onClose={() => setIsOpen(false)} menu={menu} />
      </PopoverContent>
    </Popover>
  );
};
