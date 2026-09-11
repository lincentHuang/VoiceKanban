"use client";

import React from "react";
import { Plus, Pencil, Boxes, SlidersHorizontal, Archive } from "lucide-react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import confetti from "canvas-confetti";

interface ColumnActionBasicItemsProps {
  columnId: string;
  onAddTask: () => void;
  onStartRename?: () => void;
  onCloseMenu: () => void;
}

export const ColumnActionBasicItems: React.FC<ColumnActionBasicItemsProps> = ({
  columnId,
  onAddTask,
  onStartRename,
  onCloseMenu,
}) => {
  const { archiveColumn, aggregateColumnToTask, setIsBoardManagerOpen } = useKanbanStore();

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

  return (
    <>
      <DropdownMenuItem
        onClick={() => {
          onAddTask();
          onCloseMenu();
        }}
        className="flex items-center gap-2 font-medium cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 text-slate-400" />
        <span>新增卡片</span>
      </DropdownMenuItem>

      {onStartRename && (
        <DropdownMenuItem
          onClick={() => {
            onCloseMenu();
            onStartRename();
          }}
          className="flex items-center gap-2 font-medium cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-400" />
          <span>重新命名列表</span>
        </DropdownMenuItem>
      )}

      <DropdownMenuItem
        onClick={handleAggregate}
        className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
      >
        <Boxes className="w-3.5 h-3.5 text-indigo-500" />
        <span>📦 聚合為單一任務卡 (移至收件匣)</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => {
          onCloseMenu();
          setIsBoardManagerOpen(true);
        }}
        className="flex items-center gap-2 font-medium cursor-pointer text-slate-700 dark:text-slate-200"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
        <span>看板管理...</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        variant="destructive"
        onClick={() => {
          archiveColumn(columnId);
          onCloseMenu();
        }}
        className="flex items-center gap-2 cursor-pointer"
      >
        <Archive className="w-3.5 h-3.5" />
        <span>封存這個列表</span>
      </DropdownMenuItem>
    </>
  );
};
