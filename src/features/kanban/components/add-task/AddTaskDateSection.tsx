"use client";

import React from "react";
import { DateTimePicker } from "@/components/common/DateTimePicker";

interface AddTaskDateSectionProps {
  dueDate: string | null;
  startDate: string | null;
  isAllDay: boolean;
  setStartDate: (val: string | null) => void;
  setDueDate: (val: string | null) => void;
  setIsAllDay: (val: boolean) => void;
}

export const AddTaskDateSection: React.FC<AddTaskDateSectionProps> = ({
  dueDate,
  startDate,
  isAllDay,
  setStartDate,
  setDueDate,
  setIsAllDay,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        到期日 / 活動時段 (選填)
      </label>
      <DateTimePicker
        value={dueDate}
        startDate={startDate}
        isAllDay={isAllDay}
        onChange={(dates) => {
          setStartDate(dates.startDate || null);
          setDueDate(dates.dueDate);
          setIsAllDay(dates.isAllDay);
        }}
        placeholder="點擊選擇日期或活動時段..."
      />
    </div>
  );
};
