"use client";

import React, { useState } from "react";
import { Palette, ChevronDown, Check } from "lucide-react";
import { TRELLO_COLUMN_COLORS } from "@/core/types/task";

interface ColumnColorPickerSectionProps {
  colors: typeof TRELLO_COLUMN_COLORS;
  isColorSelected: (hex: string) => boolean;
  onApplyColor: (hex: string) => void;
  onClearColor: () => void;
}

export const ColumnColorPickerSection: React.FC<ColumnColorPickerSectionProps> = ({
  colors,
  isColorSelected,
  onApplyColor,
  onClearColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="my-0.5">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }}
        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-medium text-slate-700 dark:text-slate-200 transition-colors focus:outline-none cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-orange-500" />
          <span>變更列表顏色</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold">
            PREMIUM
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isExpanded && (
        <div className="p-2 my-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 animate-in fade-in zoom-in-95 duration-100">
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {colors.map((c) => {
              const isSelected = isColorSelected(c.hex);
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => onApplyColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-lg shadow-xs hover:scale-110 active:scale-95 transition-transform flex items-center justify-center border cursor-pointer ${
                    isSelected
                      ? "border-2 border-slate-900 dark:border-white shadow-sm"
                      : "border-slate-300/80 dark:border-slate-600"
                  }`}
                  title={c.name}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-slate-800" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClearColor}
            className="w-full py-1 text-center text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 font-medium hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
          >
            ✕ 移除顏色
          </button>
        </div>
      )}
    </div>
  );
};
