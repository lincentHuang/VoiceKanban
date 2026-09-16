"use client";

import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "@/core/types/task";
import { TaskCard } from "@/features/kanban/components/TaskCard";

interface InboxTaskListProps {
  tasks: Task[];
  taskIds: string[];
  isCrossColumnDrag: boolean;
  isInboxOver: boolean;
  insertIndex: number;
}

export const InboxTaskList: React.FC<InboxTaskListProps> = ({
  tasks,
  taskIds,
  isCrossColumnDrag,
  isInboxOver,
  insertIndex,
}) => {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden my-2.5 pr-1 pb-3 sm:pb-16 custom-scrollbar min-h-0 space-y-2.5">
      <SortableContext items={taskIds} strategy={isCrossColumnDrag ? () => null : verticalListSortingStrategy}>
        {tasks.map((task, idx) => (
          <React.Fragment key={task.id}>
            {insertIndex === idx && (
              <div
                key={`drop-slot-inbox-${idx}`}
                className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 animate-in fade-in duration-100 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-none shadow-2xs pointer-events-none"
              >
                <span className="flex items-center gap-1.5 opacity-80">
                  <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
                  放入收件匣
                </span>
              </div>
            )}
            <TaskCard task={task} variant="card" inboxWidth={320} />
          </React.Fragment>
        ))}

        {tasks.length > 0 && insertIndex >= tasks.length && (
          <div
            key="drop-slot-inbox-end"
            className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 animate-in fade-in duration-100 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-none shadow-2xs pointer-events-none"
          >
            <span className="flex items-center gap-1.5 opacity-80">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
              放入收件匣
            </span>
          </div>
        )}
        <div className="h-2 shrink-0 pointer-events-none" />
      </SortableContext>

      {tasks.length === 0 && (
        <div
          className={`h-36 border-2 rounded-2xl flex flex-col items-center justify-center text-xs gap-1.5 p-4 text-center transition-all duration-200 ${
            isInboxOver
              ? "border-2 border-slate-400 bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 shadow-inner"
              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 text-slate-400"
          }`}
        >
          {isInboxOver ? (
            <>
              <span className="font-bold text-sm">📥 放開以移至收件匣</span>
              <p className="text-[11px] text-blue-500/80">卡片將存入收件匣</p>
            </>
          ) : (
            <>
              <span>收件匣已清空 ✨</span>
              <p className="text-[11px] text-slate-400">可將外部卡片拖曳入此暫存，或直接語音輸入</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
