"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Column } from "@/core/types/task";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ColumnColorPickerSection } from "./column-action-menu/ColumnColorPickerSection";
import { ColumnSortSubmenu } from "./column-action-menu/ColumnSortSubmenu";
import { ColumnMoveSubmenu } from "./column-action-menu/ColumnMoveSubmenu";
import { ColumnActionBasicItems } from "./column-action-menu/ColumnActionBasicItems";

interface ColumnActionMenuProps {
  column: Column;
  onAddTask: () => void;
  onStartRename?: () => void;
}

export const ColumnActionMenu: React.FC<ColumnActionMenuProps> = ({
  column,
  onAddTask,
  onStartRename,
}) => {
  const { getActiveBoardColumns } = useKanbanStore();
  const [isOpen, setIsOpen] = useState(false);
  const columns = getActiveBoardColumns();
  const otherColumns = columns.filter((c) => c.id !== column.id);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus:border-orange-500 cursor-pointer"
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
        <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">列表動作</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {column.title}
          </span>
        </div>

        <ColumnActionBasicItems
          columnId={column.id}
          onAddTask={onAddTask}
          onStartRename={onStartRename}
          onCloseMenu={() => setIsOpen(false)}
        />
        <ColumnColorPickerSection column={column} onCloseMenu={() => setIsOpen(false)} />
        <ColumnSortSubmenu columnId={column.id} onCloseMenu={() => setIsOpen(false)} />
        <ColumnMoveSubmenu columnId={column.id} otherColumns={otherColumns} onCloseMenu={() => setIsOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default ColumnActionMenu;
