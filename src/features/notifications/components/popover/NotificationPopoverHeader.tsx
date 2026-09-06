"use client";

import React from "react";
import { Bell, BellRing, BellOff, CheckCheck, X } from "lucide-react";
import { notificationService } from "../../services/notificationService";

interface Props {
  unreadCount: number;
  isBrowserPushEnabled: boolean;
  isRequestingPermission: boolean;
  onToggleBrowserPush: (enabled: boolean) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  setIsRequestingPermission: (req: boolean) => void;
}

export const NotificationPopoverHeader: React.FC<Props> = ({
  unreadCount,
  isBrowserPushEnabled,
  isRequestingPermission,
  onToggleBrowserPush,
  onMarkAllAsRead,
  onClose,
  setIsRequestingPermission,
}) => {
  const handleTogglePush = async () => {
    if (!isBrowserPushEnabled) {
      setIsRequestingPermission(true);
      const granted = await notificationService.requestPermission();
      setIsRequestingPermission(false);
      onToggleBrowserPush(granted);
    } else {
      onToggleBrowserPush(false);
    }
  };

  return (
    <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-2xs">
          <BellRing className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            通知中心
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-orange-500 text-white">
                {unreadCount}
              </span>
            )}
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            多人協作看板即時動態
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleTogglePush}
          disabled={isRequestingPermission}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            isBrowserPushEnabled
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-500"
          }`}
          title={isBrowserPushEnabled ? "桌面推播已開啟 (點擊關閉)" : "開啟桌面推播通知"}
        >
          {isBrowserPushEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-200 transition-all cursor-pointer"
            title="全部標為已讀"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
