"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { getMonthDays, CalendarDay } from "@/core/utils/calendar";
import { isoToDateTimeLocal } from "@/core/utils/dateUtils";
import { Task } from "@/core/types/task";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Share2,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

export const CalendarView: React.FC = () => {
  const {
    tasks,
    activeBoardId,
    setEditingTaskId,
    addTask,
  } = useKanbanStore();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026 as per user screenshot
  const [calendarMode, setCalendarMode] = useState<"month" | "week">("month");
  const [syncToast, setSyncToast] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthDays = getMonthDays(year, month);
  const boardTasks = tasks.filter((t) => t.boardId === activeBoardId);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleQuickAddOnDate = (dateStr: string) => {
    addTask({
      title: "新行事曆待辦",
      description: "由行事曆快速建立",
      boardId: activeBoardId,
      columnId: "todo",
      priority: "medium",
      tags: ["Calendar"],
      dueDate: new Date(`${dateStr}T10:00:00`).toISOString(),
      completed: false,
    });
  };

  const handleExportICS = () => {
    // Generate .ics standard calendar file
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//VoiceKanban//TW\nCALSCALE:GREGORIAN\n";
    boardTasks.forEach((task) => {
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        const dtStr = d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
        icsContent += `BEGIN:VEVENT\nSUMMARY:${task.title}\nDESCRIPTION:${task.description || ""}\nDTSTART:${dtStr}\nDTEND:${dtStr}\nSTATUS:${task.completed ? "COMPLETED" : "CONFIRMED"}\nEND:VEVENT\n`;
      }
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `voicekanban-${activeBoardId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSyncToast(true);
    setTimeout(() => setSyncToast(false), 2500);
  };

  const weekDayNames = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

  return (
    <div className="w-full flex-1 min-h-0 p-1 text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col">
      <div className="backdrop-blur-2xl bg-white/75 dark:bg-slate-900/75 border border-white/80 dark:border-slate-800 rounded-3xl shadow-glass overflow-hidden flex-1 min-h-0 flex flex-col">
        {/* Calendar Top Controls Header (Matching Image 2) */}
        <div className="p-4 sm:p-5 border-b border-slate-200/70 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Year/Month Selector & Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Year Month Display */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-sm font-bold shadow-2xs">
              <CalendarIcon className="w-4 h-4 text-orange-500" />
              <span>
                {year}年{month + 1}月
              </span>
            </div>

            {/* Prev / Today / Next */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                title="上個月"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="px-3 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
              >
                今天
              </button>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                title="下個月"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month / Week View Mode */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setCalendarMode("month")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  calendarMode === "month"
                    ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                月
              </button>
              <button
                onClick={() => setCalendarMode("week")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  calendarMode === "week"
                    ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                週
              </button>
            </div>
          </div>

          {/* Right: Sync to Personal Calendar (.ics export) (Image 2) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportICS}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="匯出 .ics 行事曆檔或同步 Google Calendar / Apple Calendar"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>同步到個人行事曆</span>
            </button>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {syncToast && (
          <div className="m-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>行事曆檔案 (.ics) 已成功匯出！可直接匯入 Google Calendar、Apple 行事曆或 Outlook。</span>
          </div>
        )}

        {/* Calendar 7-Column Grid (Image 2) */}
        <div className="overflow-auto flex-1 min-h-0 custom-scrollbar">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 min-w-[700px] text-center bg-slate-50/50 dark:bg-slate-800/30">
            {weekDayNames.map((dayName, idx) => (
              <div
                key={idx}
                className="py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200/60 dark:border-slate-800 last:border-r-0"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 min-w-[700px] auto-rows-fr divide-x divide-y divide-slate-200/60 dark:divide-slate-800">
            {monthDays.map((dayCell, i) => {
              const dateKey = dayCell.dateStr;
              const cellTasks = boardTasks.filter((t) => {
                if (!t.dueDate && !t.startDate) return false;
                const startKey = t.startDate ? isoToDateTimeLocal(t.startDate).slice(0, 10) : null;
                const endKey = t.dueDate ? isoToDateTimeLocal(t.dueDate).slice(0, 10) : null;
                if (startKey && endKey) {
                  return dateKey >= startKey && dateKey <= endKey;
                }
                return endKey === dateKey || startKey === dateKey;
              });

              return (
                <div
                  key={i}
                  className={`min-h-[110px] p-2 flex flex-col justify-between group transition-colors relative ${
                    !dayCell.isCurrentMonth
                      ? "bg-slate-50/40 dark:bg-slate-900/30 opacity-45"
                      : "bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  } ${dayCell.isToday ? "border-2 border-orange-500/80 bg-orange-50/20" : ""}`}
                >
                  {/* Top Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${
                        dayCell.isToday
                          ? "bg-orange-500 text-white shadow-xs"
                          : dayCell.isCurrentMonth
                          ? "text-slate-700 dark:text-slate-200"
                          : "text-slate-400"
                      }`}
                    >
                      {dayCell.dayNumber}日
                    </span>

                    {cellTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {cellTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Tasks inside this Day Cell */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                    {cellTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTaskId(task.id);
                        }}
                        className={`p-1.5 rounded-xl border text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer truncate ${
                          task.completed
                            ? "bg-slate-100 border-slate-200 text-slate-400 line-through"
                            : "bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-orange-400"
                        }`}
                        title={task.title}
                      >
                        <div className="flex items-center gap-1">
                          {task.coverColor ? (
                            <span
                              style={{ backgroundColor: task.coverColor }}
                              className="w-2 h-2 rounded-full shrink-0"
                            />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                          )}
                          <span className="truncate font-medium text-[11px]">{task.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hover + Quick Add Button (Image 2) */}
                  <button
                    onClick={() => handleQuickAddOnDate(dayCell.dateStr)}
                    className="opacity-0 group-hover:opacity-100 mt-auto w-full py-0.5 text-center text-[10px] font-semibold text-slate-500 hover:text-orange-600 hover:bg-white dark:hover:bg-slate-700 rounded transition-all border border-slate-200/80 dark:border-slate-700"
                  >
                    + 新增
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
