export type Priority = "high" | "medium" | "low";

export type ColumnId = string;

export type ViewMode = "kanban" | "calendar";

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  user: string;
  text: string;
  createdAt: string;
}

export type CoverAspectRatio = "banner" | "1:1" | "3:4" | "9:16" | "bar";

export interface Task {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  columnId: ColumnId;
  orderKey: string;
  priority?: Priority;
  isStarred?: boolean; // ⭐ Important / Starred flag
  tags: string[];
  startDate?: string | null; // Optional start date for time range
  dueDate: string | null; // Due date or End date
  isAllDay?: boolean; // True if time is omitted (date only)
  completed: boolean;
  checklist?: ChecklistItem[];
  coverColor?: string | null;
  coverAspectRatio?: CoverAspectRatio | null; // 1:1, 3:4, 9:16, banner, bar
  attachments?: TaskAttachment[];
  attachmentsCount?: number;
  activities?: TaskActivity[];
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  icon: string;
  color?: string;
  description?: string;
  isCustom?: boolean;
  isArchived?: boolean;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  icon: string;
  isDefault?: boolean;
  columns?: Column[];
}

export interface BatchActionPayload {
  taskIds: string[];
  action: "move" | "complete" | "delete" | "star";
  targetColumnId?: ColumnId;
  isStarred?: boolean;
  completed?: boolean;
}

export interface ColumnColorItem {
  id: string;
  name: string;
  hex: string;
  borderHex: string;
  containerClass: string;
  badgeClass: string;
  value?: string;
}

export const TRELLO_COLUMN_COLORS: ColumnColorItem[] = [
  {
    id: "amber",
    name: "柔和淺黃",
    hex: "#fef3c7",
    borderHex: "#fde68a",
    containerClass: "bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40",
    badgeClass: "bg-amber-100/90 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200",
  },
  {
    id: "orange",
    name: "晨曦淺橘",
    hex: "#ffedd5",
    borderHex: "#fed7aa",
    containerClass: "bg-orange-50/80 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/40",
    badgeClass: "bg-orange-100/90 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200",
  },
  {
    id: "purple",
    name: "恬靜淺紫",
    hex: "#f3e8ff",
    borderHex: "#e9d5ff",
    containerClass: "bg-purple-50/80 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-900/40",
    badgeClass: "bg-purple-100/90 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200",
  },
  {
    id: "emerald",
    name: "清新淺綠",
    hex: "#dcfce7",
    borderHex: "#bbf7d0",
    containerClass: "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40",
    badgeClass: "bg-emerald-100/90 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200",
  },
  {
    id: "blue",
    name: "柔霧淺藍",
    hex: "#e0f2fe",
    borderHex: "#bae6fd",
    containerClass: "bg-sky-50/80 dark:bg-sky-950/20 border-sky-200/80 dark:border-sky-900/40",
    badgeClass: "bg-sky-100/90 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200",
  },
  {
    id: "rose",
    name: "浪漫淺粉",
    hex: "#ffe4e6",
    borderHex: "#fecdd3",
    containerClass: "bg-rose-50/80 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40",
    badgeClass: "bg-rose-100/90 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200",
  },
  {
    id: "cyan",
    name: "冰晶淺青",
    hex: "#cffafe",
    borderHex: "#a5f3fc",
    containerClass: "bg-cyan-50/80 dark:bg-cyan-950/20 border-cyan-200/80 dark:border-cyan-900/40",
    badgeClass: "bg-cyan-100/90 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200",
  },
  {
    id: "lime",
    name: "嫩芽草綠",
    hex: "#ecfccb",
    borderHex: "#d9f99d",
    containerClass: "bg-lime-50/80 dark:bg-lime-950/20 border-lime-200/80 dark:border-lime-900/40",
    badgeClass: "bg-lime-100/90 dark:bg-lime-900/50 text-lime-800 dark:text-lime-200",
  },
  {
    id: "stone",
    name: "奶茶燕麥",
    hex: "#f5f5f4",
    borderHex: "#e7e5e4",
    containerClass: "bg-stone-100/80 dark:bg-stone-900/30 border-stone-200/80 dark:border-stone-800/50",
    badgeClass: "bg-stone-200/80 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200",
  },
  {
    id: "slate",
    name: "質感冷灰",
    hex: "#f1f5f9",
    borderHex: "#e2e8f0",
    containerClass: "bg-slate-100/80 dark:bg-slate-850/40 border-slate-200/80 dark:border-slate-800/60",
    badgeClass: "bg-slate-200/80 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200",
  },
];

// Legacy color mapping to smoothly migrate saturated colors to the new pastel design
const LEGACY_COLOR_MAP: Record<string, string> = {
  "#10b981": "#dcfce7",
  "#f59e0b": "#fef3c7",
  "#f97316": "#ffedd5",
  "#f43f5e": "#ffe4e6",
  "#a855f7": "#f3e8ff",
  "#3b82f6": "#e0f2fe",
  "#06b6d4": "#cffafe",
  "#84cc16": "#ecfccb",
  "#ec4899": "#ffe4e6",
  "#64748b": "#f1f5f9",
};

export function getColumnColorConfig(colorHex?: string | null): {
  hex: string;
  name: string;
  containerClass: string;
  badgeClass: string;
} {
  if (!colorHex) {
    return {
      hex: "",
      name: "無顏色",
      containerClass: "bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800",
      badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    };
  }

  const normalizedHex = LEGACY_COLOR_MAP[colorHex.toLowerCase()] || colorHex.toLowerCase();
  const matched = TRELLO_COLUMN_COLORS.find(
    (c) => c.hex.toLowerCase() === normalizedHex || c.hex.toLowerCase() === colorHex.toLowerCase()
  );

  if (matched) {
    return {
      hex: matched.hex,
      name: matched.name,
      containerClass: matched.containerClass,
      badgeClass: matched.badgeClass,
    };
  }

  // Fallback for custom hex
  return {
    hex: colorHex,
    name: "自訂色彩",
    containerClass: "bg-white/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800",
    badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  };
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "待辦事項", icon: "📋", color: "#fef3c7", description: "準備執行的具體任務" },
  { id: "in_progress", title: "進行中", icon: "⚡", color: "#ffedd5", description: "當前正在專注處理" },
  { id: "waiting", title: "等待/阻塞", icon: "⏳", color: "#f3e8ff", description: "等待外部反饋或依賴中" },
  { id: "done", title: "已完成", icon: "✅", color: "#dcfce7", description: "已交付或已驗收" },
];

