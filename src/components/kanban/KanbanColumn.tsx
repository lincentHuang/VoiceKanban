"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column, Task } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { TaskCard } from "./TaskCard";
import { ColumnActionMenu } from "./ColumnActionMenu";
import { Plus, MoreHorizontal, CheckSquare } from "lucide-react";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const {
    openAddTaskModal,
    openVoiceForColumn,
    isMultiSelectMode,
    toggleTaskSelection,
    selectedTaskIds,
  } = useKanbanStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleVoiceAddClick = () => {
    openVoiceForColumn(column.id);
  };

  const handleManualAddClick = () => {
    openAddTaskModal(column.id);
  };

  const handleSelectAllInColumn = () => {
    tasks.forEach((t) => {
      if (!selectedTaskIds.includes(t.id)) {
        toggleTaskSelection(t.id);
      }
    });
  };

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[270px] min-w-[270px] max-w-[270px] shrink-0 max-h-full backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border rounded-2xl p-3 shadow-md transition-all relative overflow-hidden ${
        isOver
          ? "border-orange-400 bg-orange-50/90 dark:bg-orange-950/80 ring-2 ring-orange-400/40"
          : "border-slate-200/80 dark:border-slate-800"
      }`}
    >
      {/* Optional Top Color Accent Line */}
      {column.color && (
        <div
          style={{ backgroundColor: column.color }}
          className="absolute top-0 left-4 right-4 h-1 rounded-b-full shadow-xs"
        />
      )}

      {/* Column Header (Fixed shrink-0) */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800/60 px-1 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{column.icon}</span>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
            {column.title}
          </h3>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs shadow-2xs">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Select all in column */}
          {isMultiSelectMode && tasks.length > 0 && (
            <button
              onClick={handleSelectAllInColumn}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 text-slate-500 hover:text-orange-600 transition-colors"
              title="全選此欄位"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Add Task Plus - Direct Voice Input */}
          <button
            onClick={handleVoiceAddClick}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-600 transition-colors"
            title={`在「${column.title}」用語音新增卡片`}
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Column Action Hamburger Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              title="列表選項與顏色"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <ColumnActionMenu
                column={column}
                onClose={() => setIsMenuOpen(false)}
                onAddTask={handleManualAddClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Cards Scrollable Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-1 custom-scrollbar min-h-0">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div
            className={`h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-xs gap-1.5 p-3 text-center transition-all duration-200 ${
              isOver
                ? "border-orange-500 bg-orange-50/80 dark:bg-orange-950/60 ring-2 ring-orange-500/30 text-orange-600 dark:text-orange-300 shadow-inner"
                : "border-slate-200/80 dark:border-slate-800 text-slate-400"
            }`}
          >
            {isOver ? (
              <span className="font-bold text-sm">✨ 放開以移入此欄位</span>
            ) : (
              <>
                <span>尚無卡片</span>
                <button
                  onClick={handleVoiceAddClick}
                  className="text-orange-500 font-medium hover:underline text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 語音快速建立
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
