"use client";

import { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ViewMode } from "@/core/types/task";

export function useBottomDock() {
  const {
    viewMode,
    setViewMode,
    isInboxSidebarOpen,
    setIsInboxSidebarOpen,
    isMultiSelectMode,
    selectedTaskIds,
  } = useKanbanStore();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleInboxClick = () => {
    if (isMobile) {
      setIsInboxSidebarOpen(true);
    } else {
      setIsInboxSidebarOpen(!isInboxSidebarOpen);
    }
  };

  const handleViewClick = (mode: ViewMode) => {
    if (isMobile) {
      setIsInboxSidebarOpen(false);
    }
    setViewMode(mode);
  };

  const isInboxActive = isInboxSidebarOpen;
  const isKanbanActive = isMobile ? (!isInboxSidebarOpen && viewMode === "kanban") : viewMode === "kanban";
  const isCalendarActive = !isMobile && viewMode === "calendar";
  const isVisible = !(isMultiSelectMode || selectedTaskIds.length > 0);

  return {
    isVisible,
    isInboxActive,
    isKanbanActive,
    isCalendarActive,
    handleInboxClick,
    handleViewClick,
  };
}
