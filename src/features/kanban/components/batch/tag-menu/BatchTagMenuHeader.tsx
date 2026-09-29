"use client";

import React from "react";
import { Tag } from "lucide-react";

interface BatchTagMenuHeaderProps {
  selectedCount: number;
}

export const BatchTagMenuHeader: React.FC<BatchTagMenuHeaderProps> = ({ selectedCount }) => {
  return (
    <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800">
      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-orange-400" />
        <span>批次標籤</span>
      </span>
      <span className="text-[11px] text-slate-400">已選 {selectedCount} 項</span>
    </div>
  );
};
