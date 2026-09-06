"use client";

import React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface CalendarHeaderControlsProps {
  year: number;
  month: number;
  calendarMode: "month" | "week";
  setCalendarMode: (mode: "month" | "week") => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onExportICS: () => void;
}

export const CalendarHeaderControls: React.FC<CalendarHeaderControlsProps> = ({
  year,
  month,
  calendarMode,
  setCalendarMode,
  onPrevMonth,
  onNextMonth,
  onToday,
  onExportICS,
}) => {
  return (
    <div className="p-4 sm:p-5 border-b border-slate-200/70 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-sm font-bold shadow-2xs">
          <CalendarIcon className="w-4 h-4 text-orange-500" />
          <span>
            {year}年{month + 1}月
          </span>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
            title="上個月"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            今天
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
            title="下個月"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setCalendarMode("month")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              calendarMode === "month"
                ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            月
          </button>
          <button
            onClick={() => setCalendarMode("week")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              calendarMode === "week"
                ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            週
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportICS}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          title="匯出 .ics 行事曆檔或同步 Google Calendar / Apple Calendar"
        >
          <Download className="w-3.5 h-3.5 text-blue-500" />
          <span>同步到個人行事曆</span>
        </button>
      </div>
    </div>
  );
};
