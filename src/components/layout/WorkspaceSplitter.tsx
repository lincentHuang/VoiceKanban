"use client";

import React from "react";
import { useWorkspaceSplitter } from "./useWorkspaceSplitter";

export const WorkspaceSplitter: React.FC = () => {
  const { isInboxSidebarOpen, isDragging, handleMouseDown } = useWorkspaceSplitter();

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        width: isInboxSidebarOpen ? "0.75rem" : "0px",
        opacity: isInboxSidebarOpen ? 1 : 0,
        pointerEvents: isInboxSidebarOpen ? "auto" : "none",
      }}
      className={`hidden sm:flex group relative h-full shrink-0 items-center justify-center cursor-col-resize select-none z-20 overflow-hidden ${
        isDragging
          ? "bg-orange-500/20 transition-none"
          : "transition-all duration-300 ease-in-out hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
      }`}
      title="拖曳以調整收件匣與看板寬度（小於200px自動收合）"
    >
      <div
        className={`w-[2px] h-full transition-colors ${
          isDragging
            ? "bg-orange-500"
            : "bg-slate-300/80 dark:bg-slate-700/80 group-hover:bg-orange-400"
        }`}
      />

      <div
        className={`absolute w-1.5 h-10 rounded-full transition-all ${
          isDragging
            ? "bg-orange-600 scale-y-125"
            : "bg-slate-400 dark:bg-slate-500 group-hover:bg-orange-500 group-hover:scale-y-110"
        }`}
      />
    </div>
  );
};
