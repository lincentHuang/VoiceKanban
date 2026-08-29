"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { getDueDateStatus } from "@/core/utils/dateUtils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface DateTimePickerValue {
  dueDate: string | null;
  startDate?: string | null;
  isAllDay?: boolean;
}

interface DateTimePickerProps {
  value: string | null | undefined; // Due / End date ISO string
  startDate?: string | null | undefined; // Optional Start date ISO string
  isAllDay?: boolean; // True if date only without specific time
  onChange: (val: { dueDate: string | null; startDate: string | null; isAllDay: boolean }) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end" | "left" | "right";
  showClear?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  startDate = null,
  isAllDay = false,
  onChange,
  placeholder = "設定到期日或活動時間",
  className = "",
  align = "start",
  showClear = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize align prop for Radix UI
  const radixAlign: "start" | "center" | "end" =
    align === "left" ? "start" : align === "right" ? "end" : align;

  // Internal state for configuring dates & range
  const [isRangeMode, setIsRangeMode] = useState<boolean>(() => !!startDate);
  const [includeTime, setIncludeTime] = useState<boolean>(() => !isAllDay);
  const [activeRangeField, setActiveRangeField] = useState<"start" | "end">("end");

  // Parse start and end dates
  const startD = startDate ? new Date(startDate) : null;
  const endD = value ? new Date(value) : null;

  const isValidEnd = endD && !isNaN(endD.getTime());
  const isValidStart = startD && !isNaN(startD.getTime());

  // View state for calendar browsing (month / year)
  const [viewYear, setViewYear] = useState<number>(() => {
    if (isValidEnd) return endD.getFullYear();
    if (isValidStart) return startD.getFullYear();
    return new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (isValidEnd) return endD.getMonth();
    if (isValidStart) return startD.getMonth();
    return new Date().getMonth();
  });

  // Synchronize when props change
  useEffect(() => {
    setIsRangeMode(!!startDate);
    setIncludeTime(!isAllDay);
    if (endD && !isNaN(endD.getTime())) {
      setViewYear(endD.getFullYear());
      setViewMonth(endD.getMonth());
    } else if (startD && !isNaN(startD.getTime())) {
      setViewYear(startD.getFullYear());
      setViewMonth(startD.getMonth());
    }
  }, [value, startDate, isAllDay]);

  const dueDateStatus = getDueDateStatus(value, false, isAllDay, startDate);

  // Calendar Day Generation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells = [];

  // Trailing previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      monthOffset: -1,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      monthOffset: 0,
      isCurrentMonth: true,
    });
  }

  // Leading next month days
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      day: i,
      monthOffset: 1,
      isCurrentMonth: false,
    });
  }

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number, monthOffset: number) => {
    const targetDate = new Date(viewYear, viewMonth + monthOffset, day);

    if (!isRangeMode) {
      // Single Date Mode
      const hours = includeTime && isValidEnd ? endD.getHours() : 18;
      const mins = includeTime && isValidEnd ? endD.getMinutes() : 0;
      targetDate.setHours(hours, mins, 0, 0);

      onChange({
        startDate: null,
        dueDate: targetDate.toISOString(),
        isAllDay: !includeTime,
      });
    } else {
      // Range Mode: check whether modifying start or end
      if (activeRangeField === "start") {
        const hours = includeTime && isValidStart ? startD.getHours() : 9;
        const mins = includeTime && isValidStart ? startD.getMinutes() : 0;
        targetDate.setHours(hours, mins, 0, 0);

        let newEnd = endD ? new Date(endD) : new Date(targetDate);
        if (newEnd.getTime() < targetDate.getTime()) {
          newEnd = new Date(targetDate.getTime() + 2 * 3600 * 1000);
        }

        onChange({
          startDate: targetDate.toISOString(),
          dueDate: newEnd.toISOString(),
          isAllDay: !includeTime,
        });
        setActiveRangeField("end");
      } else {
        // Modifying end date
        const hours = includeTime && isValidEnd ? endD.getHours() : 18;
        const mins = includeTime && isValidEnd ? endD.getMinutes() : 0;
        targetDate.setHours(hours, mins, 0, 0);

        let newStart = startD ? new Date(startD) : new Date(targetDate);
        if (newStart.getTime() > targetDate.getTime()) {
          newStart = new Date(targetDate.getTime() - 2 * 3600 * 1000);
        }

        onChange({
          startDate: newStart.toISOString(),
          dueDate: targetDate.toISOString(),
          isAllDay: !includeTime,
        });
      }
    }

    if (monthOffset !== 0) {
      setViewMonth(targetDate.getMonth());
      setViewYear(targetDate.getFullYear());
    }
  };

  const handleToggleIncludeTime = (enabled: boolean) => {
    setIncludeTime(enabled);
    if (!value && !startDate) {
      const now = new Date();
      now.setHours(enabled ? 18 : 0, 0, 0, 0);
      onChange({
        startDate: null,
        dueDate: now.toISOString(),
        isAllDay: !enabled,
      });
    } else {
      onChange({
        startDate: startDate || null,
        dueDate: value || null,
        isAllDay: !enabled,
      });
    }
  };

  const handleToggleRangeMode = (enabled: boolean) => {
    setIsRangeMode(enabled);
    if (enabled) {
      const currentEnd = value ? new Date(value) : new Date();
      const newStart = new Date(currentEnd.getTime() - 24 * 3600 * 1000);
      onChange({
        startDate: newStart.toISOString(),
        dueDate: currentEnd.toISOString(),
        isAllDay: !includeTime,
      });
      setActiveRangeField("start");
    } else {
      onChange({
        startDate: null,
        dueDate: value || new Date().toISOString(),
        isAllDay: !includeTime,
      });
    }
  };

  const handleTimeChange = (type: "start" | "end", hours: number, minutes: number) => {
    if (type === "start") {
      const base = isValidStart ? new Date(startD) : new Date();
      base.setHours(hours, minutes, 0, 0);
      onChange({
        startDate: base.toISOString(),
        dueDate: value || null,
        isAllDay: false,
      });
    } else {
      const base = isValidEnd ? new Date(endD) : new Date();
      base.setHours(hours, minutes, 0, 0);
      onChange({
        startDate: startDate || null,
        dueDate: base.toISOString(),
        isAllDay: false,
      });
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      startDate: null,
      dueDate: null,
      isAllDay: true,
    });
    setIsOpen(false);
  };

  // Helper formatting for single date
  const pad = (n: number) => n.toString().padStart(2, "0");
  const formatSingle = (d: Date | null) => {
    if (!d || isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const dayOfWeek = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    if (!includeTime || isAllDay) {
      return `${y}/${m}/${day} (${dayOfWeek})`;
    }
    const h = pad(d.getHours());
    const mins = pad(d.getMinutes());
    return `${y}/${m}/${day} (${dayOfWeek}) ${h}:${mins}`;
  };

  const startHours = isValidStart ? startD.getHours() : 9;
  const startMins = isValidStart ? startD.getMinutes() : 0;
  const endHours = isValidEnd ? endD.getHours() : 18;
  const endMins = isValidEnd ? endD.getMinutes() : 0;

  const currentHours = activeRangeField === "start" && isRangeMode ? startHours : endHours;
  const currentMins = activeRangeField === "start" && isRangeMode ? startMins : endMins;

  const today = new Date();
  const isTodayMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDay = today.getDate();

  const hasBothDates = (isRangeMode || (isValidStart && isValidEnd)) && isValidStart && isValidEnd;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((prev) => !prev);
            }
          }}
          className={`w-full px-3 py-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all border shadow-2xs group outline-none focus:ring-2 focus:ring-orange-500/30 ${
            isValidEnd || isValidStart
              ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              : "bg-slate-50/60 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400"
          } ${className}`}
        >
          <div className="flex items-start gap-2.5 min-w-0 flex-1 py-0.5">
            <CalendarIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            {hasBothDates ? (
              /* Multi-line Date Display: Start Date on line 1, Due Date wraps to line 2 */
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">開始</span>
                  <span className="font-semibold truncate">{formatSingle(startD)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-100 flex-wrap">
                  <span className="text-[10px] font-bold text-orange-500 dark:text-orange-400 shrink-0">到期</span>
                  <span className="font-bold truncate">{formatSingle(endD)}</span>
                  {dueDateStatus && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${dueDateStatus.badgeClasses.modalBadge}`}
                    >
                      {dueDateStatus.label}
                    </span>
                  )}
                </div>
              </div>
            ) : isValidEnd ? (
              /* Single Due Date Mode */
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-xs font-bold leading-relaxed">{formatSingle(endD)}</span>
                {dueDateStatus && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${dueDateStatus.badgeClasses.modalBadge}`}
                  >
                    {dueDateStatus.label}
                  </span>
                )}
              </div>
            ) : isValidStart ? (
              /* Single Start Date Mode */
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-xs font-bold leading-relaxed">{formatSingle(startD)}</span>
              </div>
            ) : (
              <span className="text-xs font-medium">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 self-center">
            {(isValidEnd || isValidStart) && showClear && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="清除時間"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        align={radixAlign}
        sideOffset={6}
        collisionPadding={12}
        className="w-80 sm:w-88 p-4 space-y-3.5 z-[9999] shadow-2xl rounded-3xl"
      >
        {/* 1. Mode Switches (Range Mode & Include Time) */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
          {/* Range Toggle */}
          <button
            type="button"
            onClick={() => handleToggleRangeMode(!isRangeMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isRangeMode
                ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{isRangeMode ? "跨天/時段活動" : "+ 設定結束時間"}</span>
          </button>

          {/* Include Time Toggle */}
          <button
            type="button"
            onClick={() => handleToggleIncludeTime(!includeTime)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              includeTime
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{includeTime ? "指定時間" : "整天 (無時間)"}</span>
          </button>
        </div>

        {/* In Range Mode: Show Active Field Selector */}
        {isRangeMode && (
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveRangeField("start")}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                activeRangeField === "start"
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <span className="text-[10px] text-slate-400 font-medium">開始時間</span>
              <span className="truncate">
                {isValidStart
                  ? `${startD.getMonth() + 1}/${startD.getDate()} ${includeTime ? `${startD.getHours()}:${startD.getMinutes().toString().padStart(2, "0")}` : ""}`
                  : "點擊選取"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRangeField("end")}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                activeRangeField === "end"
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <span className="text-[10px] text-slate-400 font-medium">結束時間</span>
              <span className="truncate">
                {isValidEnd
                  ? `${endD.getMonth() + 1}/${endD.getDate()} ${includeTime ? `${endD.getHours()}:${endD.getMinutes().toString().padStart(2, "0")}` : ""}`
                  : "點擊選取"}
              </span>
            </button>
          </div>
        )}

        {/* 2. Calendar Month Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="上個月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <span>
                {viewYear}年 {viewMonth + 1}月
              </span>
              {(!isTodayMonth || today.getFullYear() !== viewYear) && (
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setViewYear(now.getFullYear());
                    setViewMonth(now.getMonth());
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-600 font-bold hover:bg-orange-200 transition-colors cursor-pointer"
                >
                  今天
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="下個月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["日", "一", "二", "三", "四", "五", "六"].map((w, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold text-slate-400 py-1"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarCells.map((cell, idx) => {
              const cellDate = new Date(viewYear, viewMonth + cell.monthOffset, cell.day);
              const cellTime = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate()).getTime();

              const startTime = isValidStart ? new Date(startD.getFullYear(), startD.getMonth(), startD.getDate()).getTime() : null;
              const endTime = isValidEnd ? new Date(endD.getFullYear(), endD.getMonth(), endD.getDate()).getTime() : null;

              const isStart = startTime === cellTime;
              const isEnd = endTime === cellTime;
              const isSelected = isRangeMode ? isStart || isEnd : isEnd || (isValidEnd && cellTime === endTime);

              const isInRange = isRangeMode && startTime && endTime && cellTime > startTime && cellTime < endTime;

              const isTodayCell =
                isTodayMonth &&
                cell.monthOffset === 0 &&
                cell.day === todayDay;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.day, cell.monthOffset)}
                  className={`h-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md scale-105 z-10"
                      : isInRange
                      ? "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-200 font-medium rounded-none"
                      : isTodayCell
                      ? "ring-1.5 ring-orange-500 text-orange-600 font-bold hover:bg-orange-50 dark:hover:bg-slate-800"
                      : cell.isCurrentMonth
                      ? "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      : "text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Time Selector Section with Radix Selects */}
        {includeTime && (
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-orange-500" />
                <span>{isRangeMode ? (activeRangeField === "start" ? "開始時間" : "結束時間") : "具體時間"}</span>
              </span>

              {/* Radix Selects for Hours & Minutes */}
              <div className="flex items-center gap-1.5">
                <div className="w-20">
                  <Select
                    value={String(currentHours)}
                    onValueChange={(val) =>
                      handleTimeChange(
                        activeRangeField === "start" && isRangeMode ? "start" : "end",
                        Number(val),
                        currentMins
                      )
                    }
                  >
                    <SelectTrigger className="h-7 text-xs font-bold px-2 py-0">
                      <SelectValue placeholder="時" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {Array.from({ length: 24 }).map((_, h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h.toString().padStart(2, "0")} 點
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <span className="text-xs font-bold text-slate-400">:</span>

                <div className="w-20">
                  <Select
                    value={String(Math.floor(currentMins / 5) * 5)}
                    onValueChange={(val) =>
                      handleTimeChange(
                        activeRangeField === "start" && isRangeMode ? "start" : "end",
                        currentHours,
                        Number(val)
                      )
                    }
                  >
                    <SelectTrigger className="h-7 text-xs font-bold px-2 py-0">
                      <SelectValue placeholder="分" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const m = i * 5;
                        return (
                          <SelectItem key={m} value={String(m)}>
                            {m.toString().padStart(2, "0")} 分
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Popover Actions Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {isValidEnd || isValidStart ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-semibold text-rose-500 hover:underline px-2 py-1 cursor-pointer"
            >
              ✕ 清除日期
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs ml-auto flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>完成</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
