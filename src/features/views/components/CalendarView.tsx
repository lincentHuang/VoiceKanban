"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useCalendarView } from "./calendar/useCalendarView";
import { CalendarHeaderControls } from "./calendar/CalendarHeaderControls";
import { CalendarGrid } from "./calendar/CalendarGrid";

export const CalendarView: React.FC = () => {
  const {
    year,
    month,
    calendarMode,
    setCalendarMode,
    syncToast,
    monthDays,
    boardTasks,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    handleQuickAddOnDate,
    handleExportICS,
    setEditingTaskId,
  } = useCalendarView();

  return (
    <div className="w-full flex-1 min-h-0 p-1 text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col">
      <div className="backdrop-blur-2xl bg-white/75 dark:bg-slate-900/75 border border-white/80 dark:border-slate-800 rounded-3xl shadow-glass overflow-hidden flex-1 min-h-0 flex flex-col">
        <CalendarHeaderControls
          year={year}
          month={month}
          calendarMode={calendarMode}
          setCalendarMode={setCalendarMode}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onExportICS={handleExportICS}
        />

        {syncToast && (
          <div className="m-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>行事曆檔案 (.ics) 已成功匯出！可直接匯入 Google Calendar、Apple 行事曆或 Outlook。</span>
          </div>
        )}

        <CalendarGrid
          monthDays={monthDays}
          boardTasks={boardTasks}
          onSelectTask={setEditingTaskId}
          onQuickAdd={handleQuickAddOnDate}
        />
      </div>
    </div>
  );
};
export default CalendarView;
