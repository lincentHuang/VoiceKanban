import { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { getMonthDays } from "@/core/utils/calendar";

export function useCalendarView() {
  const { tasks, activeBoardId, setEditingTaskId, addTask } = useKanbanStore();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [calendarMode, setCalendarMode] = useState<"month" | "week">("month");
  const [syncToast, setSyncToast] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  return {
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
  };
}
