import React from "react";
import { Trash2 } from "lucide-react";

interface EditTaskDeleteModalProps {
  isOpen: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const EditTaskDeleteModal: React.FC<EditTaskDeleteModalProps> = ({
  isOpen,
  taskTitle,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-2xl p-5 space-y-3 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
      >
        <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-base">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <span>確定刪除此任務？</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          刪除後將無法復原「<span className="font-semibold text-slate-800 dark:text-slate-200">{taskTitle}</span>」及其所有待辦紀錄。
        </p>
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onConfirmDelete}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            確認刪除
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 transition-all cursor-pointer"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
