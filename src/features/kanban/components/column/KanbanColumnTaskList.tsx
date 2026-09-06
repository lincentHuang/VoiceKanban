import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Task } from "@/core/types/task";
import { TaskCard } from "../TaskCard";

interface Props {
  columnId: string;
  taskIds: string[];
  visibleActiveTasks: Task[];
  visibleCompletedTasks: Task[];
  renderedTasks: Task[];
  insertIndex: number;
  isCrossColumnDrag: boolean;
  isColumnOver: boolean;
  isCompletedExpanded: boolean;
  onToggleCompletedExpanded: () => void;
}

export const KanbanColumnTaskList: React.FC<Props> = ({
  columnId, taskIds, visibleActiveTasks, visibleCompletedTasks, renderedTasks,
  insertIndex, isCrossColumnDrag, isColumnOver, isCompletedExpanded, onToggleCompletedExpanded,
}) => {
  return (
    <SortableContext items={taskIds} strategy={isCrossColumnDrag ? () => null : verticalListSortingStrategy}>
      {visibleActiveTasks.map((task, idx) => (
        <React.Fragment key={task.id}>
          {insertIndex === idx && (
            <div key={`drop-slot-${columnId}-${idx}`} className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 flex items-center justify-center text-xs font-semibold text-slate-500 pointer-events-none">
              <span className="flex items-center gap-1.5 opacity-80"><span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />插入此處</span>
            </div>
          )}
          <TaskCard task={task} />
        </React.Fragment>
      ))}

      {visibleActiveTasks.length > 0 && !isCompletedExpanded && insertIndex >= visibleActiveTasks.length && (
        <div key={`drop-slot-${columnId}-end`} className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 flex items-center justify-center text-xs font-semibold text-slate-500 pointer-events-none">
          <span className="flex items-center gap-1.5 opacity-80"><span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />插入此處</span>
        </div>
      )}

      {visibleActiveTasks.length === 0 && visibleCompletedTasks.length > 0 && (
        <div className="py-3 px-2 text-center text-xs font-medium text-slate-400 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-slate-200/80 dark:border-slate-700/60 select-none">
          待辦事項已全部完成 ✨
        </div>
      )}

      {visibleCompletedTasks.length > 0 && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40 mt-2">
          <button type="button" onClick={onToggleCompletedExpanded} className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/8 transition-all cursor-pointer group/comp select-none">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">已完成</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">{visibleCompletedTasks.length}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 group-hover/comp:text-slate-600 dark:group-hover/comp:text-slate-200">
              <span className="text-[11px] font-normal">{isCompletedExpanded ? "隱藏" : "查看"}</span>
              {isCompletedExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {isCompletedExpanded && (
            <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
              {visibleCompletedTasks.map((task, idx) => (
                <React.Fragment key={task.id}>
                  {insertIndex === visibleActiveTasks.length + idx && (
                    <div key={`drop-slot-comp-${columnId}-${idx}`} className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 flex items-center justify-center text-xs font-semibold text-slate-500 pointer-events-none">
                      <span className="flex items-center gap-1.5 opacity-80"><span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />插入此處</span>
                    </div>
                  )}
                  <TaskCard task={task} />
                </React.Fragment>
              ))}
              {insertIndex >= renderedTasks.length && (
                <div key={`drop-slot-${columnId}-comp-end`} className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 flex items-center justify-center text-xs font-semibold text-slate-500 pointer-events-none">
                  <span className="flex items-center gap-1.5 opacity-80"><span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />插入此處</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {visibleActiveTasks.length === 0 && visibleCompletedTasks.length === 0 && isColumnOver && (
        <div key={`drop-slot-${columnId}-empty`} className="h-14 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 flex items-center justify-center text-xs font-semibold text-slate-500 pointer-events-none">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />放置於此欄位</span>
        </div>
      )}
    </SortableContext>
  );
};
