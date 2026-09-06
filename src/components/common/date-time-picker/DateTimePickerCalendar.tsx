import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  viewYear: number;
  viewMonth: number;
  startD: Date | null;
  endD: Date | null;
  isValidStart: boolean;
  isValidEnd: boolean;
  isRangeMode: boolean;
  onPrevMonth: (e: React.MouseEvent) => void;
  onNextMonth: (e: React.MouseEvent) => void;
  onSelectDay: (day: number, monthOffset: number) => void;
  onJumpToday: () => void;
}

export const DateTimePickerCalendar: React.FC<Props> = ({
  viewYear, viewMonth, startD, endD, isValidStart, isValidEnd, isRangeMode,
  onPrevMonth, onNextMonth, onSelectDay, onJumpToday,
}) => {
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, monthOffset: -1, isCurrent: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, monthOffset: 0, isCurrent: true });
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, monthOffset: 1, isCurrent: false });

  const today = new Date();
  const isTodayMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={onPrevMonth} className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer" title="上個月"><ChevronLeft className="w-4 h-4" /></button>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
          <span>{viewYear}年 {viewMonth + 1}月</span>
          {(!isTodayMonth || today.getFullYear() !== viewYear) && (
            <button type="button" onClick={onJumpToday} className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-600 font-bold hover:bg-orange-200 cursor-pointer">今天</button>
          )}
        </div>
        <button type="button" onClick={onNextMonth} className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer" title="下個月"><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {["日", "一", "二", "三", "四", "五", "六"].map((w, idx) => (<span key={idx} className="text-[10px] font-bold text-slate-400 py-1">{w}</span>))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((cell, idx) => {
          const cellDate = new Date(viewYear, viewMonth + cell.monthOffset, cell.day);
          const cellTime = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate()).getTime();
          const startTime = isValidStart && startD ? new Date(startD.getFullYear(), startD.getMonth(), startD.getDate()).getTime() : null;
          const endTime = isValidEnd && endD ? new Date(endD.getFullYear(), endD.getMonth(), endD.getDate()).getTime() : null;
          const isSelected = isRangeMode ? (startTime === cellTime || endTime === cellTime) : (endTime === cellTime);
          const isInRange = isRangeMode && startTime && endTime && cellTime > startTime && cellTime < endTime;
          const isToday = isTodayMonth && cell.monthOffset === 0 && cell.day === today.getDate();

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDay(cell.day, cell.monthOffset)}
              className={`h-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                isSelected ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md scale-105 z-10" : isInRange ? "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-200 font-medium rounded-none" : isToday ? "border-2 border-orange-500 text-orange-600 font-bold hover:bg-orange-50" : cell.isCurrent ? "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-300 dark:text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
