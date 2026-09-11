import { Board, Column, LinkPlatform } from "@/core/types/task";

export const COLLECTION_BOARD_NAME = "收藏";
export const COLLECTION_BOARD_ICON = "🔖";

interface PlatformMeta {
  label: string;
  icon: string;
  /** Column that links from this platform are routed into. */
  columnId: string;
  /** Tailwind gradient used when a thumbnail is missing or has expired. */
  fallbackGradient: string;
  badgeClass: string;
}

export const PLATFORM_META: Record<LinkPlatform, PlatformMeta> = {
  youtube: {
    label: "YouTube",
    icon: "▶️",
    columnId: "col-youtube",
    fallbackGradient: "from-rose-500 to-red-600",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },
  instagram: {
    label: "Instagram",
    icon: "📸",
    columnId: "col-instagram",
    fallbackGradient: "from-fuchsia-500 via-pink-500 to-amber-400",
    badgeClass: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300",
  },
  threads: {
    label: "Threads",
    icon: "🧵",
    columnId: "col-threads",
    fallbackGradient: "from-slate-700 to-slate-900",
    badgeClass: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  other: {
    label: "連結",
    icon: "🔗",
    columnId: "col-links",
    fallbackGradient: "from-sky-500 to-indigo-500",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  },
};

export const COLLECTION_COLUMNS: Column[] = [
  { id: "col-youtube", title: "YouTube", icon: "▶️", color: "#ffe4e6", description: "從 YouTube 收藏的影片" },
  { id: "col-instagram", title: "Instagram", icon: "📸", color: "#f3e8ff", description: "從 Instagram 收藏的貼文與 Reels" },
  { id: "col-threads", title: "Threads", icon: "🧵", color: "#f1f5f9", description: "從 Threads 收藏的串文" },
  { id: "col-links", title: "其他連結", icon: "🔗", color: "#e0f2fe", description: "其他網站連結" },
];

export function createCollectionBoard(id: string): Board {
  return {
    id,
    name: COLLECTION_BOARD_NAME,
    icon: COLLECTION_BOARD_ICON,
    description: "從 IG、YouTube、Threads 分享過來的收藏內容",
    kind: "collection",
    columns: COLLECTION_COLUMNS,
  };
}

export function findCollectionBoard(boards: Board[]): Board | undefined {
  return boards.find((b) => b.kind === "collection");
}
