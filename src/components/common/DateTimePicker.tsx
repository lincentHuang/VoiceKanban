"use client";

import React from "react";
import { Check } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useDateTimePicker } from "./date-time-picker/useDateTimePicker";
import { DateTimePickerTrigger } from "./date-time-picker/DateTimePickerTrigger";
import { DateTimePickerModes } from "./date-time-picker/DateTimePickerModes";
import { DateTimePickerCalendar } from "./date-time-picker/DateTimePickerCalendar";
import { DateTimePickerTimeSection } from "./date-time-picker/DateTimePickerTimeSection";

export interface DateTimePickerValue {
  dueDate: string | null;
  startDate?: string | null;
  isAllDay?: boolean;
}

interface DateTimePickerProps {
  value: string | null | undefined;
  startDate?: string | null | undefined;
  isAllDay?: boolean;
  onChange: (val: { dueDate: string | null; startDate: string | null; isAllDay: boolean }) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end" | "left" | "right";
  showClear?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value, startDate = null, isAllDay = false, onChange, placeholder = "設定到期日或活動時間",
  className = "", align = "start", showClear = true,
}) => {
  const picker = useDateTimePicker(value, startDate, isAllDay, onChange);
  const radixAlign = align === "left" ? "start" : align === "right" ? "end" : align;

  const currentHours = picker.activeRangeField === "start" && picker.isRangeMode
    ? (picker.isValidStart && picker.startD ? picker.startD.getHours() : 9)
    : (picker.isValidEnd && picker.endD ? picker.endD.getHours() : 18);

  const currentMins = picker.activeRangeField === "start" && picker.isRangeMode
    ? (picker.isValidStart && picker.startD ? picker.startD.getMinutes() : 0)
    : (picker.isValidEnd && picker.endD ? picker.endD.getMinutes() : 0);

  return (
    <Popover open={picker.isOpen} onOpenChange={picker.setIsOpen}>
      <PopoverTrigger asChild>
        <DateTimePickerTrigger
          value={value} startDate={startDate} isAllDay={isAllDay} placeholder={placeholder}
          className={className} showClear={showClear} startD={picker.startD} endD={picker.endD}
          isValidEnd={picker.isValidEnd} isValidStart={picker.isValidStart} isRangeMode={picker.isRangeMode}
          includeTime={picker.includeTime} onClear={picker.handleClear} onToggleOpen={() => picker.setIsOpen(!picker.isOpen)}
        />
      </PopoverTrigger>
      <PopoverContent align={radixAlign} sideOffset={6} collisionPadding={12} className="w-80 sm:w-88 p-4 space-y-3.5 z-[9999] shadow-2xl rounded-3xl">
        <DateTimePickerModes
          isRangeMode={picker.isRangeMode} includeTime={picker.includeTime} activeRangeField={picker.activeRangeField}
          startD={picker.startD} endD={picker.endD} isValidStart={picker.isValidStart} isValidEnd={picker.isValidEnd}
          onToggleRange={(val) => { picker.setIsRangeMode(val); if (val) { const cur = value ? new Date(value) : new Date(); const st = new Date(cur.getTime() - 24 * 3600 * 1000); onChange({ startDate: st.toISOString(), dueDate: cur.toISOString(), isAllDay: !picker.includeTime }); picker.setActiveRangeField("start"); } else { onChange({ startDate: null, dueDate: value || new Date().toISOString(), isAllDay: !picker.includeTime }); } }}
          onToggleIncludeTime={(val) => { picker.setIncludeTime(val); onChange({ startDate: startDate || null, dueDate: value || null, isAllDay: !val }); }}
          onSelectActiveRangeField={picker.setActiveRangeField}
        />
        <DateTimePickerCalendar
          viewYear={picker.viewYear} viewMonth={picker.viewMonth} startD={picker.startD} endD={picker.endD}
          isValidStart={picker.isValidStart} isValidEnd={picker.isValidEnd} isRangeMode={picker.isRangeMode}
          onPrevMonth={picker.handlePrevMonth} onNextMonth={picker.handleNextMonth} onSelectDay={picker.handleSelectDay}
          onJumpToday={() => { const now = new Date(); picker.setViewYear(now.getFullYear()); picker.setViewMonth(now.getMonth()); }}
        />
        {picker.includeTime && (
          <DateTimePickerTimeSection isRangeMode={picker.isRangeMode} activeRangeField={picker.activeRangeField} currentHours={currentHours} currentMins={currentMins} onTimeChange={picker.handleTimeChange} />
        )}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {(picker.isValidEnd || picker.isValidStart) ? (
            <button type="button" onClick={picker.handleClear} className="text-[11px] font-semibold text-rose-500 hover:underline px-2 py-1 cursor-pointer">✕ 清除日期</button>
          ) : <div />}
          <button type="button" onClick={() => picker.setIsOpen(false)} className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs ml-auto flex items-center gap-1 cursor-pointer">
            <Check className="w-3.5 h-3.5" /><span>完成</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
