"use client";

import React, { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { NotificationPopover } from "./NotificationPopover";
import { NotificationItem } from "../types";

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    isBrowserNotificationEnabled,
    setIsBrowserNotificationEnabled,
    setActiveBoardId,
    setEditingTaskId,
    boards,
  } = useKanbanStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSelectNotification = (item: NotificationItem) => {
    markNotificationAsRead(item.id);

    // If belongs to a specific board, switch to it
    if (item.boardId && boards.some((b) => b.id === item.boardId)) {
      setActiveBoardId(item.boardId);
    }

    // If relates to a task, open task editor if not deleted
    if (item.taskId && item.actionType !== "task_deleted") {
      setEditingTaskId(item.taskId);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95 ${
          unreadCount > 0
            ? "border-orange-300 dark:border-orange-800 bg-orange-50/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:border-orange-500"
            : "border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-orange-500 hover:text-orange-500"
        }`}
        aria-label="協作動態通知中心"
        title={unreadCount > 0 ? `${unreadCount} 則未讀通知` : "通知中心"}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 animate-swing" />
        ) : (
          <Bell className="w-4 h-4" />
        )}

        {/* Unread Red Dot Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs border border-white dark:border-slate-900 animate-in zoom-in duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      <NotificationPopover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onClearAll={clearAllNotifications}
        onSelectNotification={handleSelectNotification}
        isBrowserPushEnabled={isBrowserNotificationEnabled}
        onToggleBrowserPush={setIsBrowserNotificationEnabled}
      />
    </div>
  );
};
