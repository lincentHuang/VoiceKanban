"use client";

import React from "react";
import { Check, Minus } from "lucide-react";

interface BatchTagOptionItemProps {
  tag: string;
  count?: number;
  coverage?: "all" | "some";
  onSelect: (tag: string) => void;
}

export const BatchTagOptionItem: React.FC<BatchTagOptionItemProps> = ({
  tag,
  count,
  coverage,
  onSelect,
}) => {
  const isAll = coverage === "all";
  const isSome = coverage === "some";

  return (
    <button
      type="button"
      onClick={() => onSelect(tag)}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
        isAll
          ? "bg-orange-500/15 hover:bg-orange-500/25 text-orange-200"
          : isSome
          ? "bg-slate-800/70 hover:bg-slate-800 text-slate-200"
          : "hover:bg-slate-800 text-slate-300"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
          isAll
            ? "bg-orange-500 border-orange-500 text-white"
            : isSome
            ? "bg-orange-500/30 border-orange-400 text-orange-300"
            : "border-slate-600 bg-slate-800/60"
        }`}
      >
        {isAll && <Check className="w-3 h-3" strokeWidth={3} />}
        {isSome && <Minus className="w-3 h-3" strokeWidth={3} />}
      </span>

      <span className="flex-1 min-w-0 truncate text-xs font-medium">#{tag}</span>

      {count ? (
        <span className="text-[10px] font-mono text-slate-500 shrink-0">{count}</span>
      ) : null}
    </button>
  );
};
