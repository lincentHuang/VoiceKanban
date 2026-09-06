"use client";

import React from "react";
import { Task, Column, ColumnId } from "@/core/types/task";
import { Check, Edit3, Star } from "lucide-react";
import { TableRowDueDate } from "./TableRowDueDate";
import { TableRowChecklist } from "./TableRowChecklist";
import { TableRowColumnSelect } from "./TableRowColumnSelect";
import { TableRowTags } from "./TableRowTags";

interface TableRowItemProps {
  task: Task;
  columns: Column[];
  onSelectTask: (id: string) => void;
  onToggleComplete: (e: React.MouseEvent, task: Task) => void;
  onToggleStarred: (id: string) => void;
  onUpdateColumn: (taskId: string, colId: ColumnId, completed: boolean) => void;
}

export const TableRowItem: React.FC<TableRowItemProps> = ({
  task,
  columns,
  onSelectTask,
  onToggleComplete,
  onToggleStarred,
  onUpdateColumn,
}) => {
  return (
    <tr
      onClick={() => onSelectTask(task.id)}
      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
    >
      <td className="py-3 px-3">
        <button
          onClick={(e) => onToggleComplete(e, task)}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
            task.completed
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-300 dark:border-slate-600 hover:border-orange-500"
          }`}
        >
          {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      </td>

      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">
        <span className={task.completed ? "line-through text-slate-400" : ""}>
          {task.title}
        </span>
      </td>

      <td className="py-3 px-3">
        <TableRowColumnSelect
          taskId={task.id}
          columnId={task.columnId}
          completed={task.completed}
          columns={columns}
          onUpdateColumn={onUpdateColumn}
        />
      </td>

      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onToggleStarred(task.id)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
        >
          <Star
            className={`w-4 h-4 mx-auto ${
              task.isStarred ? "fill-amber-400 text-amber-500" : "text-slate-300 hover:text-amber-400"
            }`}
          />
        </button>
      </td>

      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
        <TableRowDueDate task={task} />
      </td>

      <td className="py-3 px-3">
        <TableRowChecklist checklist={task.checklist} />
      </td>

      <td className="py-3 px-3">
        <TableRowTags tags={task.tags} />
      </td>

      <td className="py-3 px-3 text-right">
        <button
          onClick={() => onSelectTask(task.id)}
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          title="編輯卡片"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
};
