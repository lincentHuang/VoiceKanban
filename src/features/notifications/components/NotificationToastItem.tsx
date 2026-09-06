"use client";

import React, { useEffect } from "react";
import { X, Sparkles, Plus, ArrowRight, CheckCircle2, RotateCcw, Trash2, UserPlus } from "lucide-react";
import { NotificationItem, NotificationActionType } from "../types";

interface Props {
  notification: NotificationItem;
  onDismiss: (id: string) => void;
  onSelect: (item: NotificationItem) => void;
}

function getActionIcon(type: NotificationActionType) {
  switch (type) {
    case "task_created":
      return <Plus className="w-3 h-3 text-emerald-500" />;
    case "task_moved":
      return <ArrowRight className="w-3 h-3 text-blue-500" />;
    case "task_completed":
      return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
    case "task_uncompleted":
      return <RotateCcw className="w-3 h-3 text-amber-500" />;
    case "task_deleted":
      return <Trash2 className="w-3 h-3 text-rose-500" />;
    case "member_joined":
      return <UserPlus className="w-3 h-3 text-purple-500" />;
    default:
      return <Sparkles className="w-3 h-3 text-orange-500" />;
  }
}

export const NotificationToastItem: React.FC<Props> = ({
  notification,
  onDismiss,
  onSelect,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div
      onClick={() => {
        onSelect(notification);
        onDismiss(notification.id);
      }}
      className="relative group w-80 sm:w-96 p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl flex items-start gap-3 cursor-pointer hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-200 animate-in slide-in-from-top-3 fade-in"
    >
      {/* Avatar */}
      <div className="relative shrink-0 mt-0.5">
        <img
          src={
            notification.actorAvatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(notification.actorName || "user")}`
          }
          alt={notification.actorName}
          className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 object-cover bg-slate-100 dark:bg-slate-800 shadow-2xs"
        />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center border border-slate-100 dark:border-slate-800">
          {getActionIcon(notification.actionType)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
            {notification.title}
          </span>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
            {notification.boardName || "協作看板"}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug break-words">
          {notification.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className="absolute top-2.5 right-2.5 p-1 text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        aria-label="關閉"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle Auto-dismiss Progress Indicator */}
      <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500/20 dark:bg-orange-500/10 rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 animate-[shrink_4.5s_linear_forwards]" />
      </div>
    </div>
  );
};
