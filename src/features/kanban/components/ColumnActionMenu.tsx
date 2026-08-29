"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Column, TRELLO_COLUMN_COLORS, getColumnColorConfig } from "@/core/types/task";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoveRight,
  ArrowUpDown,
  Palette,
  Archive,
  MoreHorizontal,
  Check,
  Calendar,
  Layers,
  FileText,
  ChevronDown,
} from "lucide-react";

interface ColumnActionMenuProps {
  column: Column;
  onAddTask: () => void;
}

export const ColumnActionMenu: React.FC<ColumnActionMenuProps> = ({
  column,
  onAddTask,
}) => {
  const {
    setColumnColor,
    sortColumnTasks,
    moveAllColumnTasks,
    archiveColumn,
    getActiveBoardColumns,
  } = useKanbanStore();

  const [isColorPickerExpanded, setIsColorPickerExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const columns = getActiveBoardColumns();
  const otherColumns = columns.filter((c) => c.id !== column.id);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          title="列表選項與顏色"
          aria-label="列表選項"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        collisionPadding={12}
        className="w-64 p-2 shadow-2xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl text-xs z-[9999]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">列表動作</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {column.title}
          </span>
        </div>

        {/* 1. Add Card */}
        <DropdownMenuItem
          onClick={() => {
            onAddTask();
            setIsOpen(false);
          }}
          className="flex items-center gap-2 font-medium"
        >
          <Plus className="w-3.5 h-3.5 text-slate-400" />
          <span>新增卡片</span>
        </DropdownMenuItem>

        {/* 2. Color Picker (Accordion style inside menu) */}
        <div className="my-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsColorPickerExpanded(!isColorPickerExpanded);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-medium text-slate-700 dark:text-slate-200 transition-colors focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-orange-500" />
              <span>變更列表顏色</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold">
                PREMIUM
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  isColorPickerExpanded ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>

          {isColorPickerExpanded && (
            <div className="p-2 my-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 animate-in fade-in zoom-in-95 duration-100">
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {TRELLO_COLUMN_COLORS.map((c) => {
                  const isSelected =
                    column.color?.toLowerCase() === c.hex.toLowerCase() ||
                    getColumnColorConfig(column.color).hex.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setColumnColor(column.id, c.hex);
                        setIsOpen(false);
                      }}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-lg shadow-xs hover:scale-110 active:scale-95 transition-transform flex items-center justify-center border border-slate-300/80 dark:border-slate-600 cursor-pointer ${
                        isSelected ? "ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-slate-800" : ""
                      }`}
                      title={c.name}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-slate-800" />}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setColumnColor(column.id, "");
                  setIsOpen(false);
                }}
                className="w-full py-1 text-center text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 font-medium hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
              >
                ✕ 移除顏色
              </button>
            </div>
          )}
        </div>

        {/* 3. Sub-menu: Sort Column Tasks */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>排序依據</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent collisionPadding={12} className="min-w-[11rem]">
            <DropdownMenuItem
              onClick={() => {
                sortColumnTasks(column.id, "date");
                setIsOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>依到期日排序</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                sortColumnTasks(column.id, "priority");
                setIsOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>依優先等級排序</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                sortColumnTasks(column.id, "title");
                setIsOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>依卡片名稱排序</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 4. Sub-menu: Move All Cards */}
        {otherColumns.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
              <MoveRight className="w-3.5 h-3.5 text-slate-400" />
              <span>移動這個列表的所有卡片</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent collisionPadding={12} className="min-w-[12rem] max-h-56 overflow-y-auto custom-scrollbar">
              {otherColumns.map((target) => (
                <DropdownMenuItem
                  key={target.id}
                  onClick={() => {
                    moveAllColumnTasks(column.id, target.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1.5 truncate"
                >
                  <span className="text-orange-500">➔</span>
                  <span className="truncate">移動至「{target.title}」</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />

        {/* 5. Archive Column */}
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            archiveColumn(column.id);
            setIsOpen(false);
          }}
          className="flex items-center gap-2"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>封存這個列表</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
