"use client";

import React, { useState } from "react";
import { NotificationItem } from "../types";
import { NotificationPopoverHeader } from "./popover/NotificationPopoverHeader";
import { NotificationPopoverFilters } from "./popover/NotificationPopoverFilters";
import { NotificationPopoverList } from "./popover/NotificationPopoverList";
import { NotificationPopoverFooter } from "./popover/NotificationPopoverFooter";

interface Props {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (item: NotificationItem) => void;
  isBrowserPushEnabled: boolean;
  onToggleBrowserPush: (enabled: boolean) => void;
  isLoading?: boolean;
}

export const NotificationPopover: React.FC<Props> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
  isBrowserPushEnabled,
  onToggleBrowserPush,
  isLoading = false,
}) => {
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filterTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <>
      <div
        className="fixed inset-0 z-[9990] bg-black/10 dark:bg-black/30 backdrop-blur-[1px] sm:bg-transparent"
        onClick={onClose}
      />

      <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-10 w-[calc(100vw-24px)] sm:w-96 max-h-[80vh] sm:max-h-[540px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl z-[9995] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <NotificationPopoverHeader
          unreadCount={unreadCount}
          isBrowserPushEnabled={isBrowserPushEnabled}
          isRequestingPermission={isRequestingPermission}
          onToggleBrowserPush={onToggleBrowserPush}
          onMarkAllAsRead={onMarkAllAsRead}
          onClose={onClose}
          setIsRequestingPermission={setIsRequestingPermission}
        />

        <NotificationPopoverFilters
          filterTab={filterTab}
          totalCount={notifications.length}
          unreadCount={unreadCount}
          onSelectTab={setFilterTab}
        />

        <NotificationPopoverList
          isLoading={isLoading}
          filterTab={filterTab}
          notifications={filteredNotifications}
          onSelectNotification={onSelectNotification}
        />

        <NotificationPopoverFooter
          totalCount={notifications.length}
          onClearAll={onClearAll}
        />
      </div>
    </>
  );
};
