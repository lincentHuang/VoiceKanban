"use client";

import React from "react";
import { SmilePlus } from "lucide-react";
import { cn } from "@/core/utils/cn";

interface IconPickerTriggerProps {
  value: string;
  size?: "sm" | "md";
  variant?: "button" | "ghost";
  children?: React.ReactNode;
}

export const IconPickerTrigger: React.FC<IconPickerTriggerProps> = ({
  value,
  size = "md",
  variant = "button",
  children,
}) => {
  if (children) {
    return (
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        className="focus:outline-hidden focus:ring-1 focus:ring-orange-500 rounded-md shrink-0 cursor-pointer"
        title={value ? `目前圖示：${value} (點擊更換)` : "選擇圖示"}
        aria-label="選擇欄位圖示"
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "flex items-center justify-center rounded-xl border transition-all cursor-pointer select-none shrink-0 focus:outline-hidden focus:border-orange-500",
        size === "sm" ? "w-8 h-8 text-sm" : "w-9 h-9 text-base",
        variant === "ghost"
          ? "border-transparent hover:bg-black/5 dark:hover:bg-white/10"
          : value
          ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/40 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100"
          : "bg-slate-100/90 dark:bg-slate-800/60 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-400"
      )}
      title={value ? `目前圖示：${value} (點擊更換)` : "選擇圖示 (點擊開啟)"}
      aria-label="選擇欄位圖示"
    >
      {value ? <span>{value}</span> : <SmilePlus className="w-4 h-4 opacity-70" />}
    </button>
  );
};
