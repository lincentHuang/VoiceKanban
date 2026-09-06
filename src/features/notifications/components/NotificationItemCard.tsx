"use client";

import React from "react";
import { Plus, ArrowRight, CheckCircle2, RotateCcw, Trash2, UserPlus, Sparkles } from "lucide-react";
import { NotificationItem, NotificationActionType } from "../types";

interface Props {
  notification: NotificationItem;
  onClick: (item: NotificationItem) => void;
  onMarkAsRead?: (id: string) => void;
}

function getActionIcon(type: NotificationActionType) {
  switch (type) {
    case "task_created":
      return <Plus className="w-3.5 h-3.5 text-emerald-500" />;
    case "task_moved":
      return <ArrowRight className="w-3.5 h-3.5 text-blue-500" />;
    case "task_completed":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    case "task_uncompleted":
      return <RotateCcw className="w-3.5 h-3.5 text-amber-500" />;
    case "task_deleted":
      return <Trash2 className="w-3.5 h-3.5 text-rose-500" />;
    case "member_joined":
      return <UserPlus className="w-3.5 h-3.5 text-purple-500" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-orange-500" />;
  }
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 30) return "剛剛";
    if (diffSec < 60) return `${diffSec} 秒前`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} 分鐘前`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} 小時前`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} 天前`;
    return new Date(isoString).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
  } catch {
    return "剛剛";
  }
}

export const NotificationItemCard: React.FC<Props> = ({
  notification,
  onClick,
  onMarkAsRead,
}) => {
  const isUnread = !notification.read;

  return (
    <div
      onClick={() => onClick(notification)}
      className={`relative group p-3 rounded-2xl transition-all cursor-pointer border ${
        isUnread
          ? "bg-orange-50/70 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/50 shadow-2xs"
          : "bg-white/60 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with action badge */}
        <div className="relative shrink-0 mt-0.5">
          <img
            src={
              notification.actorAvatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(notification.actorName || "user")}`
            }
            alt={notification.actorName}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover bg-slate-100 dark:bg-slate-800"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center border border-slate-100 dark:border-slate-800">
            {getActionIcon(notification.actionType)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {notification.title}
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium shrink-0">
              {formatRelativeTime(notification.timestamp)}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug break-words">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {notification.boardName || "協作看板"}
            </span>

            {isUnread && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                未讀
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
