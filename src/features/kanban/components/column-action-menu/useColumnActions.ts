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
import { ColumnTransferMode } from "../../utils/columnTransfer";

export interface BoardTransferTarget {
  id: string;
  name: string;
  icon: string;
  isShared: boolean;
  /** Undefined when this column can't be moved out (e.g. it lives on a shared board). */
  onMove?: () => void;
  onCopy: () => void;
}

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
    boards,
    activeBoardId,
    setActiveBoardId,
    canCurrentUserEdit,
    transferColumnToBoard,
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

  const sourceBoard = boards.find((b) => b.id === activeBoardId);
  // 共享看板的欄位只能複製出去；只剩一欄時搬走會讓預設欄位冒出來，所以也只能複製
  const canMoveOut = Boolean(sourceBoard && !sourceBoard.isShared) && otherColumns.length > 0;
  const moveOutBlockedReason = sourceBoard?.isShared
    ? "共享看板的列表只能複製出去"
    : otherColumns.length === 0
      ? "看板只剩這個列表，只能複製"
      : null;

  const transfer = (targetBoardId: string, mode: ColumnTransferMode) => {
    onCloseMenu();
    void transferColumnToBoard(columnId, targetBoardId, mode).then((newColumnId) => {
      if (!newColumnId) return;
      // 跳到目標看板並捲到新列表（它排在最後，手機上一定在畫面外），讓人直接看到落在哪裡
      setActiveBoardId(targetBoardId);
      requestAnimationFrame(() => {
        document
          .querySelector(`[data-column-id="${newColumnId}"]`)
          ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
    });
  };

  const boardTransferTargets: BoardTransferTarget[] = boards
    .filter((b) => b.id !== activeBoardId && canCurrentUserEdit(b.id))
    .map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      isShared: Boolean(b.isShared),
      onMove: canMoveOut ? () => transfer(b.id, "move") : undefined,
      onCopy: () => transfer(b.id, "copy"),
    }));

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
    boardTransferTargets,
    moveOutBlockedReason,
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
