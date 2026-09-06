"use client";

import React from "react";
import { Column, ColumnId } from "@/core/types/task";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface TableRowColumnSelectProps {
  taskId: string;
  columnId: ColumnId;
  completed: boolean;
  columns: Column[];
  onUpdateColumn: (taskId: string, colId: ColumnId, completed: boolean) => void;
}

export const TableRowColumnSelect: React.FC<TableRowColumnSelectProps> = ({
  taskId,
  columnId,
  completed,
  columns,
  onUpdateColumn,
}) => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Select
        value={columnId}
        onValueChange={(newCol) => onUpdateColumn(taskId, newCol as ColumnId, completed)}
      >
        <SelectTrigger className="h-7 w-[120px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {columns.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.icon} {c.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
