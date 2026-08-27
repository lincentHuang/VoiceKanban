"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Column, TRELLO_COLUMN_COLORS } from "@/core/types/task";
import {
  Plus,
  Copy,
  MoveRight,
  ArrowUpDown,
  Palette,
  Archive,
  Trash2,
  X,
  Check,
  ChevronRight,
} from "lucide-react";

interface ColumnActionMenuProps {
  column: Column;
  onClose: () => void;
  onAddTask: () => void;
}

export const ColumnActionMenu: React.FC<ColumnActionMenuProps> = ({
  column,
  onClose,
  onAddTask,
}) => {
  const {
    setColumnColor,
    sortColumnTasks,
    moveAllColumnTasks,
    archiveColumn,
    getActiveBoardColumns,
  } = useKanbanStore();

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isMoveAllOpen, setIsMoveAllOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const columns = getActiveBoardColumns();
  const otherColumns = columns.filter((c) => c.id !== column.id);

  return (
    <div className="absolute top-10 right-2 w-64 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-700 dark:text-slate-200 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="font-bold text-slate-800 dark:text-slate-100">列表動作</span>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Actions */}
      <div className="space-y-0.5">
        <button
          onClick={() => {
            onAddTask();
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
        >
          <Plus className="w-3.5 h-3.5 text-slate-400" />
          <span>新增卡片</span>
        </button>

        {/* Change Column Color */}
        <div>
          <button
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-medium"
          >
            <span className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-orange-500" />
              <span>變更列表顏色</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/40 text-orange-600 font-bold">
              PREMIUM
            </span>
          </button>

          {isColorPickerOpen && (
            <div className="p-2 my-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 animate-in fade-in">
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {TRELLO_COLUMN_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      setColumnColor(column.id, c.hex);
                      setIsColorPickerOpen(false);
                    }}
                    style={{ backgroundColor: c.hex }}
                    className="w-7 h-7 rounded-lg shadow-xs hover:scale-110 active:scale-95 transition-transform flex items-center justify-center text-white"
                    title={c.name}
                  >
                    {column.color === c.hex && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setColumnColor(column.id, "");
                  setIsColorPickerOpen(false);
                }}
                className="w-full py-1 text-center text-[11px] text-slate-500 hover:text-slate-800 font-medium hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200/60 dark:border-slate-700"
              >
                ✕ 移除顏色
              </button>
            </div>
          )}
        </div>

        {/* Sort Column Tasks */}
        <div>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-medium"
          >
            <span className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>排序依據</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSortOpen && (
            <div className="pl-6 py-1 space-y-1">
              <button
                onClick={() => {
                  sortColumnTasks(column.id, "date");
                  onClose();
                }}
                className="w-full text-left py-1 text-slate-600 hover:text-orange-600"
              >
                • 依到期日排序
              </button>
              <button
                onClick={() => {
                  sortColumnTasks(column.id, "priority");
                  onClose();
                }}
                className="w-full text-left py-1 text-slate-600 hover:text-orange-600"
              >
                • 依優先等級排序
              </button>
              <button
                onClick={() => {
                  sortColumnTasks(column.id, "title");
                  onClose();
                }}
                className="w-full text-left py-1 text-slate-600 hover:text-orange-600"
              >
                • 依卡片名稱排序
              </button>
            </div>
          )}
        </div>

        {/* Move All Cards */}
        {otherColumns.length > 0 && (
          <div>
            <button
              onClick={() => setIsMoveAllOpen(!isMoveAllOpen)}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-medium"
            >
              <span className="flex items-center gap-2">
                <MoveRight className="w-3.5 h-3.5 text-slate-400" />
                <span>移動這個列表的所有卡片</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isMoveAllOpen && (
              <div className="pl-6 py-1 space-y-1">
                {otherColumns.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => {
                      moveAllColumnTasks(column.id, target.id);
                      onClose();
                    }}
                    className="w-full text-left py-1 text-slate-600 hover:text-orange-600 truncate"
                  >
                    ➔ 移動至「{target.title}」
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Archive / Delete */}
        <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              archiveColumn(column.id);
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2 font-medium"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>封存這個列表</span>
          </button>
        </div>
      </div>
    </div>
  );
};
