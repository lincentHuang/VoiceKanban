export type Priority = "high" | "medium" | "low";

export type ColumnId = string;

export type ViewMode = "kanban" | "table" | "list" | "calendar";

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
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
  dueDate: string | null; // Nullable by default
  completed: boolean;
  checklist?: ChecklistItem[];
  coverColor?: string;
  coverAspectRatio?: CoverAspectRatio; // 1:1, 3:4, 9:16, banner, bar
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

export const TRELLO_COLUMN_COLORS = [
  { name: "綠色", value: "bg-emerald-500/20 text-emerald-700 border-emerald-300 dark:border-emerald-700", hex: "#10b981" },
  { name: "黃色", value: "bg-amber-400/20 text-amber-800 border-amber-300 dark:border-amber-700", hex: "#f59e0b" },
  { name: "橘色", value: "bg-orange-500/20 text-orange-800 border-orange-300 dark:border-orange-700", hex: "#f97316" },
  { name: "紅色", value: "bg-rose-500/20 text-rose-800 border-rose-300 dark:border-rose-700", hex: "#f43f5e" },
  { name: "紫色", value: "bg-purple-500/20 text-purple-800 border-purple-300 dark:border-purple-700", hex: "#a855f7" },
  { name: "藍色", value: "bg-blue-500/20 text-blue-800 border-blue-300 dark:border-blue-700", hex: "#3b82f6" },
  { name: "青色", value: "bg-cyan-500/20 text-cyan-800 border-cyan-300 dark:border-cyan-700", hex: "#06b6d4" },
  { name: "草綠", value: "bg-lime-500/20 text-lime-800 border-lime-300 dark:border-lime-700", hex: "#84cc16" },
  { name: "粉紅", value: "bg-pink-500/20 text-pink-800 border-pink-300 dark:border-pink-700", hex: "#ec4899" },
  { name: "灰色", value: "bg-slate-500/20 text-slate-800 border-slate-300 dark:border-slate-700", hex: "#64748b" },
];

export const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "待辦事項", icon: "📋", color: "#f59e0b", description: "準備執行的具體任務" },
  { id: "in_progress", title: "進行中", icon: "⚡", color: "#f97316", description: "當前正在專注處理" },
  { id: "waiting", title: "等待/阻塞", icon: "⏳", color: "#a855f7", description: "等待外部反饋或依賴中" },
  { id: "done", title: "已完成", icon: "✅", color: "#10b981", description: "已交付或已驗收" },
];
