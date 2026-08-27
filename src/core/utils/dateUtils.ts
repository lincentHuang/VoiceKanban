export type DueDateUrgency = "overdue" | "due-soon" | "upcoming" | "normal" | "completed";

export interface DueDateStatus {
  urgency: DueDateUrgency;
  label: string; // e.g. "逾期", "即將到期", "今天到期", "明天到期", "已完成", "正常"
  formattedDateOnly: string; // e.g. "8月24日" (看板上顯示只需要日期 不需要時間)
  formattedFullDateTime: string; // e.g. "8月24日 09:00"
  badgeClasses: {
    cardBadge: string;
    cardText: string;
    iconColor: string;
    modalBadge: string;
  };
  isUrgent: boolean; // true if overdue or due within 24h
  daysDiff: number;
}

export function getDueDateStatus(
  dueDateStr: string | null | undefined,
  completed: boolean = false
): DueDateStatus | null {
  if (!dueDateStr) return null;

  try {
    const due = new Date(dueDateStr);
    if (isNaN(due.getTime())) return null;

    const month = due.getMonth() + 1;
    const day = due.getDate();
    const formattedDateOnly = `${month}月${day}日`;

    const hours = due.getHours().toString().padStart(2, "0");
    const mins = due.getMinutes().toString().padStart(2, "0");
    const formattedFullDateTime = `${month}月${day}日 ${hours}:${mins}`;

    if (completed) {
      return {
        urgency: "completed",
        label: "已完成",
        formattedDateOnly,
        formattedFullDateTime,
        badgeClasses: {
          cardBadge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
          cardText: "text-emerald-700 dark:text-emerald-400 font-semibold",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          modalBadge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300",
        },
        isUrgent: false,
        daysDiff: 0,
      };
    }

    const now = new Date();
    // Midnight comparison for day difference
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfDueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
    const dayDifference = Math.round((startOfDueDay - startOfToday) / (1000 * 60 * 60 * 24));

    const timeDiffMs = due.getTime() - now.getTime();
    const hoursDiff = timeDiffMs / (1000 * 60 * 60);

    // 1. 逾期 (Overdue): due time has passed
    if (timeDiffMs < 0) {
      return {
        urgency: "overdue",
        label: "逾期",
        formattedDateOnly,
        formattedFullDateTime,
        badgeClasses: {
          cardBadge: "bg-rose-600 text-white font-bold shadow-xs border border-rose-700",
          cardText: "text-white font-bold",
          iconColor: "text-white",
          modalBadge: "bg-rose-600 text-white font-bold",
        },
        isUrgent: true,
        daysDiff: dayDifference,
      };
    }

    // 2. 今天到期 / 24小時內即將到期 (Due Soon / Today)
    if (hoursDiff <= 24 || dayDifference === 0) {
      const label = dayDifference === 0 ? "今天到期" : "即將到期";
      return {
        urgency: "due-soon",
        label,
        formattedDateOnly,
        formattedFullDateTime,
        badgeClasses: {
          cardBadge: "bg-amber-500 text-white font-bold shadow-xs border border-amber-600",
          cardText: "text-white font-bold",
          iconColor: "text-white",
          modalBadge: "bg-amber-500 text-white font-bold",
        },
        isUrgent: true,
        daysDiff: dayDifference,
      };
    }

    // 3. 明天或近期 2-3 天內到期 (Upcoming)
    if (dayDifference <= 3) {
      const label = dayDifference === 1 ? "明天到期" : "近期到期";
      return {
        urgency: "upcoming",
        label,
        formattedDateOnly,
        formattedFullDateTime,
        badgeClasses: {
          cardBadge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold",
          cardText: "text-amber-800 dark:text-amber-300 font-semibold",
          iconColor: "text-amber-600 dark:text-amber-400",
          modalBadge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300",
        },
        isUrgent: false,
        daysDiff: dayDifference,
      };
    }

    // 4. 正常未來到期 (Normal / Future)
    return {
      urgency: "normal",
      label: "正常",
      formattedDateOnly,
      formattedFullDateTime,
      badgeClasses: {
        cardBadge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
        cardText: "text-slate-600 dark:text-slate-300 font-medium",
        iconColor: "text-slate-400 dark:text-slate-500",
        modalBadge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200",
      },
      isUrgent: false,
      daysDiff: dayDifference,
    };
  } catch {
    return null;
  }
}
