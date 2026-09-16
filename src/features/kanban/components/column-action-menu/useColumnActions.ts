"use client";

import type { LucideIcon } from "lucide-react";
import {
  Plus,
  Pencil,
  Boxes,
  SlidersHorizontal,
  Archive,
  Calendar,
  Layers,
  FileText,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Column, TRELLO_COLUMN_COLORS, getColumnColorConfig } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export interface ColumnActionItem {
  key: string;
  label: string;
  icon: LucideIcon;
  tone?: "default" | "accent" | "destructive";
  onSelect: () => void;
}

interface UseColumnActionsOptions {
  column: Column;
  onAddTask: () => void;
  onStartRename?: () => void;
  onCloseMenu: () => void;
}

/**
 * Single source of truth for everything the column menu can do, so the desktop
 * dropdown and the mobile bottom sheet stay in sync.
 */
export function useColumnActions({
  column,
  onAddTask,
  onStartRename,
  onCloseMenu,
}: UseColumnActionsOptions) {
  const {
    archiveColumn,
    aggregateColumnToTask,
    setIsBoardManagerOpen,
    sortColumnTasks,
    moveAllColumnTasks,
    setColumnColor,
    getActiveBoardColumns,
  } = useKanbanStore();

  const columnId = column.id;
  const otherColumns = getActiveBoardColumns().filter((c) => c.id !== columnId);

  const handleAggregate = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#6366f1", "#f97316", "#10b981"],
      });
    } catch {}
    aggregateColumnToTask(columnId);
    onCloseMenu();
  };

  const primaryItems: ColumnActionItem[] = [
    {
      key: "add",
      label: "新增卡片",
      icon: Plus,
      onSelect: () => {
        onAddTask();
        onCloseMenu();
      },
    },
    ...(onStartRename
      ? [
          {
            key: "rename",
            label: "重新命名列表",
            icon: Pencil,
            onSelect: () => {
              onCloseMenu();
              onStartRename();
            },
          } satisfies ColumnActionItem,
        ]
      : []),
    {
      key: "aggregate",
      label: "📦 聚合為單一任務卡 (移至收件匣)",
      icon: Boxes,
      tone: "accent",
      onSelect: handleAggregate,
    },
  ];

  const manageItems: ColumnActionItem[] = [
    {
      key: "board-manager",
      label: "看板管理...",
      icon: SlidersHorizontal,
      onSelect: () => {
        onCloseMenu();
        setIsBoardManagerOpen(true);
      },
    },
    {
      key: "archive",
      label: "封存這個列表",
      icon: Archive,
      tone: "destructive",
      onSelect: () => {
        archiveColumn(columnId);
        onCloseMenu();
      },
    },
  ];

  const sortItems: ColumnActionItem[] = [
    {
      key: "sort-date",
      label: "依到期日排序",
      icon: Calendar,
      onSelect: () => {
        sortColumnTasks(columnId, "date");
        onCloseMenu();
      },
    },
    {
      key: "sort-priority",
      label: "依優先等級排序",
      icon: Layers,
      onSelect: () => {
        sortColumnTasks(columnId, "priority");
        onCloseMenu();
      },
    },
    {
      key: "sort-title",
      label: "依卡片名稱排序",
      icon: FileText,
      onSelect: () => {
        sortColumnTasks(columnId, "title");
        onCloseMenu();
      },
    },
  ];

  const moveTargets = otherColumns.map((target) => ({
    id: target.id,
    title: target.title,
    onSelect: () => {
      moveAllColumnTasks(columnId, target.id);
      onCloseMenu();
    },
  }));

  const isColorSelected = (hex: string) =>
    column.color?.toLowerCase() === hex.toLowerCase() ||
    getColumnColorConfig(column.color).hex.toLowerCase() === hex.toLowerCase();

  return {
    primaryItems,
    manageItems,
    sortItems,
    moveTargets,
    colors: TRELLO_COLUMN_COLORS,
    isColorSelected,
    applyColor: (hex: string) => {
      setColumnColor(columnId, hex);
      onCloseMenu();
    },
    clearColor: () => {
      setColumnColor(columnId, "");
      onCloseMenu();
    },
  };
}
