import React from "react";
import { GripVertical } from "lucide-react";
import { Column, Task, getColumnColorConfig } from "@/core/types/task";
import { TaskCard } from "../TaskCard";

interface Props {
  column: Column;
  tasks: Task[];
}

export const KanbanColumnOverlay: React.FC<Props> = ({ column, tasks }) => {
  const colorConfig = getColumnColorConfig(column.color);
  const uncompleted = tasks.filter((t) => !t.completed);

  return (
    <div className={`flex flex-col w-[270px] min-w-[270px] max-w-[270px] shrink-0 max-h-[500px] h-fit backdrop-blur-2xl border-2 border-orange-500 rounded-2xl p-3 shadow-2xl scale-105 rotate-2 relative overflow-hidden select-none cursor-grabbing pointer-events-none transition-transform duration-75 ${colorConfig.containerClass}`}>
      <div className="flex items-center justify-between px-1 py-1 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-orange-500 shrink-0 -ml-0.5" />
          {column.icon && <span className="text-base shrink-0">{column.icon}</span>}
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight truncate">{column.title}</h3>
          <span className={`ml-0.5 px-2 py-0.5 rounded-full font-bold text-xs shadow-2xs shrink-0 ${colorConfig.badgeClass}`}>{uncompleted.length}</span>
        </div>
      </div>
      <div className="space-y-2 pr-1 custom-scrollbar min-h-0">
        {uncompleted.slice(0, 3).map((t) => (
          <TaskCard key={t.id} task={t} isOverlay={true} />
        ))}
        {uncompleted.length > 3 && (
          <div className="text-center py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl">
            +{uncompleted.length - 3} 項卡片
          </div>
        )}
      </div>
    </div>
  );
};
