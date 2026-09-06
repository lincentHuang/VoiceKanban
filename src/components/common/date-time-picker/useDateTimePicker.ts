import { useState, useEffect } from "react";

export function useDateTimePicker(
  value: string | null | undefined, startDate: string | null | undefined, isAllDay: boolean,
  onChange: (val: { dueDate: string | null; startDate: string | null; isAllDay: boolean }) => void
) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRangeMode, setIsRangeMode] = useState(() => !!startDate);
  const [includeTime, setIncludeTime] = useState(() => !isAllDay);
  const [activeRangeField, setActiveRangeField] = useState<"start" | "end">("end");

  const startD = startDate ? new Date(startDate) : null;
  const endD = value ? new Date(value) : null;
  const isValidEnd = Boolean(endD && !isNaN(endD.getTime()));
  const isValidStart = Boolean(startD && !isNaN(startD.getTime()));

  const [viewYear, setViewYear] = useState(() => (isValidEnd && endD ? endD.getFullYear() : isValidStart && startD ? startD.getFullYear() : new Date().getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (isValidEnd && endD ? endD.getMonth() : isValidStart && startD ? startD.getMonth() : new Date().getMonth()));

  useEffect(() => {
    setIsRangeMode(!!startDate); setIncludeTime(!isAllDay);
    if (endD && !isNaN(endD.getTime())) { setViewYear(endD.getFullYear()); setViewMonth(endD.getMonth()); }
    else if (startD && !isNaN(startD.getTime())) { setViewYear(startD.getFullYear()); setViewMonth(startD.getMonth()); }
  }, [value, startDate, isAllDay]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else { setViewMonth(viewMonth - 1); }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else { setViewMonth(viewMonth + 1); }
  };

  const handleSelectDay = (day: number, monthOffset: number) => {
    const target = new Date(viewYear, viewMonth + monthOffset, day);
    if (!isRangeMode) {
      const h = includeTime && isValidEnd && endD ? endD.getHours() : 18;
      const m = includeTime && isValidEnd && endD ? endD.getMinutes() : 0;
      target.setHours(h, m, 0, 0);
      onChange({ startDate: null, dueDate: target.toISOString(), isAllDay: !includeTime });
    } else if (activeRangeField === "start") {
      const h = includeTime && isValidStart && startD ? startD.getHours() : 9;
      const m = includeTime && isValidStart && startD ? startD.getMinutes() : 0;
      target.setHours(h, m, 0, 0);
      let newEnd = endD ? new Date(endD) : new Date(target);
      if (newEnd.getTime() < target.getTime()) newEnd = new Date(target.getTime() + 2 * 3600 * 1000);
      onChange({ startDate: target.toISOString(), dueDate: newEnd.toISOString(), isAllDay: !includeTime });
      setActiveRangeField("end");
    } else {
      const h = includeTime && isValidEnd && endD ? endD.getHours() : 18;
      const m = includeTime && isValidEnd && endD ? endD.getMinutes() : 0;
      target.setHours(h, m, 0, 0);
      let newStart = startD ? new Date(startD) : new Date(target);
      if (newStart.getTime() > target.getTime()) newStart = new Date(target.getTime() - 2 * 3600 * 1000);
      onChange({ startDate: newStart.toISOString(), dueDate: target.toISOString(), isAllDay: !includeTime });
    }
    if (monthOffset !== 0) { setViewMonth(target.getMonth()); setViewYear(target.getFullYear()); }
  };

  const handleTimeChange = (type: "start" | "end", hours: number, minutes: number) => {
    if (type === "start") {
      const base = isValidStart && startD ? new Date(startD) : new Date();
      base.setHours(hours, minutes, 0, 0);
      onChange({ startDate: base.toISOString(), dueDate: value || null, isAllDay: false });
    } else {
      const base = isValidEnd && endD ? new Date(endD) : new Date();
      base.setHours(hours, minutes, 0, 0);
      onChange({ startDate: startDate || null, dueDate: base.toISOString(), isAllDay: false });
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); onChange({ startDate: null, dueDate: null, isAllDay: true }); setIsOpen(false);
  };

  return {
    isOpen, setIsOpen, isRangeMode, setIsRangeMode, includeTime, setIncludeTime,
    activeRangeField, setActiveRangeField, startD, endD, isValidEnd, isValidStart,
    viewYear, setViewYear, viewMonth, setViewMonth, handlePrevMonth, handleNextMonth,
    handleSelectDay, handleTimeChange, handleClear,
  };
}
