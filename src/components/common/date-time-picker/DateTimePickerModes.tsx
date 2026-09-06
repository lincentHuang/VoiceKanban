import React from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface Props {
  isRangeMode: boolean;
  includeTime: boolean;
  activeRangeField: "start" | "end";
  startD: Date | null;
  endD: Date | null;
  isValidStart: boolean;
  isValidEnd: boolean;
  onToggleRange: (val: boolean) => void;
  onToggleIncludeTime: (val: boolean) => void;
  onSelectActiveRangeField: (field: "start" | "end") => void;
}

export const DateTimePickerModes: React.FC<Props> = ({
  isRangeMode, includeTime, activeRangeField, startD, endD, isValidStart, isValidEnd,
  onToggleRange, onToggleIncludeTime, onSelectActiveRangeField,
}) => {
  return (
    <>
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => onToggleRange(!isRangeMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isRangeMode
              ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200"
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{isRangeMode ? "跨天/時段活動" : "+ 設定結束時間"}</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleIncludeTime(!includeTime)}
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

      {isRangeMode && (
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => onSelectActiveRangeField("start")}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              activeRangeField === "start" ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span className="text-[10px] text-slate-400 font-medium">開始時間</span>
            <span className="truncate">
              {isValidStart && startD ? `${startD.getMonth() + 1}/${startD.getDate()} ${includeTime ? `${startD.getHours()}:${startD.getMinutes().toString().padStart(2, "0")}` : ""}` : "點擊選取"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectActiveRangeField("end")}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              activeRangeField === "end" ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span className="text-[10px] text-slate-400 font-medium">結束時間</span>
            <span className="truncate">
              {isValidEnd && endD ? `${endD.getMonth() + 1}/${endD.getDate()} ${includeTime ? `${endD.getHours()}:${endD.getMinutes().toString().padStart(2, "0")}` : ""}` : "點擊選取"}
            </span>
          </button>
        </div>
      )}
    </>
  );
};
