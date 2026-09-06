"use client";

import React from "react";
import { ArrowUpDown, Calendar, Layers, FileText } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

interface ColumnSortSubmenuProps {
  columnId: string;
  onCloseMenu: () => void;
}

export const ColumnSortSubmenu: React.FC<ColumnSortSubmenuProps> = ({
  columnId,
  onCloseMenu,
}) => {
  const { sortColumnTasks } = useKanbanStore();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <span>排序依據</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent collisionPadding={12} className="min-w-[11rem]">
        <DropdownMenuItem
          onClick={() => {
            sortColumnTasks(columnId, "date");
            onCloseMenu();
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>依到期日排序</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            sortColumnTasks(columnId, "priority");
            onCloseMenu();
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>依優先等級排序</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            sortColumnTasks(columnId, "title");
            onCloseMenu();
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>依卡片名稱排序</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
