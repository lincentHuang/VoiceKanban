import React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { getDueDateStatus } from "@/core/utils/dateUtils";

interface Props {
  value: string | null | undefined;
  startDate?: string | null | undefined;
  isAllDay?: boolean;
  placeholder?: string;
  className?: string;
  showClear?: boolean;
  startD: Date | null;
  endD: Date | null;
  isValidEnd: boolean;
  isValidStart: boolean;
  isRangeMode: boolean;
  includeTime: boolean;
  onClear: (e: React.MouseEvent) => void;
  onToggleOpen: () => void;
}

export const DateTimePickerTrigger: React.FC<Props> = ({
  value, startDate, isAllDay, placeholder = "設定到期日或活動時間", className = "",
  showClear = true, startD, endD, isValidEnd, isValidStart, isRangeMode, includeTime, onClear, onToggleOpen,
}) => {
  const dueDateStatus = getDueDateStatus(value, false, isAllDay, startDate);
  const pad = (n: number) => n.toString().padStart(2, "0");

  const formatSingle = (d: Date | null) => {
    if (!d || isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const dayOfWeek = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    if (!includeTime || isAllDay) return `${y}/${m}/${day} (${dayOfWeek})`;
    return `${y}/${m}/${day} (${dayOfWeek}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const hasBoth = (isRangeMode || (isValidStart && isValidEnd)) && isValidStart && isValidEnd;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggleOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleOpen(); } }}
      className={`w-full px-3 py-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all border shadow-2xs group outline-none focus:border-orange-500 ${
        isValidEnd || isValidStart
          ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
          : "bg-slate-50/60 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400"
      } ${className}`}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1 py-0.5">
        <CalendarIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        {hasBoth ? (
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">開始</span>
              <span className="font-semibold truncate">{formatSingle(startD)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-100 flex-wrap">
              <span className="text-[10px] font-bold text-orange-500 dark:text-orange-400 shrink-0">到期</span>
              <span className="font-bold truncate">{formatSingle(endD)}</span>
              {dueDateStatus && <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${dueDateStatus.badgeClasses.modalBadge}`}>{dueDateStatus.label}</span>}
            </div>
          </div>
        ) : isValidEnd ? (
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-bold leading-relaxed">{formatSingle(endD)}</span>
            {dueDateStatus && <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${dueDateStatus.badgeClasses.modalBadge}`}>{dueDateStatus.label}</span>}
          </div>
        ) : isValidStart ? (
          <div className="flex items-center gap-2 flex-wrap min-w-0"><span className="text-xs font-bold leading-relaxed">{formatSingle(startD)}</span></div>
        ) : (
          <span className="text-xs font-medium">{placeholder}</span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 self-center">
        {(isValidEnd || isValidStart) && showClear && (
          <button type="button" onClick={onClear} className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" title="清除時間">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
