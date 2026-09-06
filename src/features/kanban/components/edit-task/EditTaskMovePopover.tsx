import React from "react";
import { ColumnId } from "@/core/types/task";

interface EditTaskMovePopoverProps {
  isOpen: boolean;
  columnId: ColumnId;
  allTargetColumns: { id: ColumnId; title: string; icon: string }[];
  onClose: () => void;
  onMoveColumn: (targetColId: ColumnId) => void;
}

export const EditTaskMovePopover: React.FC<EditTaskMovePopoverProps> = ({
  isOpen,
  columnId,
  allTargetColumns,
  onClose,
  onMoveColumn,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:bg-transparent" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:absolute sm:translate-y-0 sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-56 max-h-[80vh] sm:max-h-none overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in space-y-1">
        <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-100 dark:border-slate-800 sm:border-0 sm:pb-0">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 sm:text-[10px] sm:text-slate-400">選取目標欄位</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 sm:hidden">✕</button>
        </div>
        {allTargetColumns.map((col) => (
          <button
            key={col.id}
            type="button"
            onClick={() => onMoveColumn(col.id)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
              columnId === col.id
                ? "bg-orange-500 text-white font-bold"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <span>{col.icon}</span>
            <span>{col.title}</span>
          </button>
        ))}
      </div>
    </>
  );
};
