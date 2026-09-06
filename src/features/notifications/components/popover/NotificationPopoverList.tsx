"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { NotificationItem } from "../../types";
import { NotificationItemCard } from "../NotificationItemCard";

interface Props {
  isLoading: boolean;
  filterTab: "all" | "unread";
  notifications: NotificationItem[];
  onSelectNotification: (item: NotificationItem) => void;
}

export const NotificationPopoverList: React.FC<Props> = ({
  isLoading,
  filterTab,
  notifications,
  onSelectNotification,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2 py-2 p-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 animate-pulse flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
              <div className="h-2.5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-10 text-center flex flex-col items-center justify-center p-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-2.5 shadow-2xs">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {filterTab === "unread" ? "沒有未讀通知" : "目前尚無協作動態"}
        </h4>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 max-w-[220px] mt-1 leading-relaxed">
          當其他成員在共享看板中新增、移動或完成任務時，將在此處即時通知。
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[160px] max-h-[380px]">
      {notifications.map((notification) => (
        <NotificationItemCard
          key={notification.id}
          notification={notification}
          onClick={onSelectNotification}
        />
      ))}
    </div>
  );
};
