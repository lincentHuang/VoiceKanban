"use client";

import React from "react";
import { Check } from "lucide-react";
import { BOARD_BACKGROUND_PRESETS } from "../../utils/boardBackgrounds";

interface AppearanceTabProps {
  background: string;
  onSetBackground: (id: string) => void;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ background, onSetBackground }) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">看板畫布背景</label>
      <div className="grid grid-cols-3 gap-2.5">
        {BOARD_BACKGROUND_PRESETS.map((preset) => {
          const isActive = background === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSetBackground(preset.id)}
              className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                isActive
                  ? "border-base44-orange bg-orange-50/60 dark:bg-orange-950/20"
                  : "border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              }`}
            >
              <div className={`w-full h-12 rounded-xl shadow-inner ${preset.swatchClassName}`}>
                {isActive && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
