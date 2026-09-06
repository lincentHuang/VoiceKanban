import React from "react";
import { Columns3 } from "lucide-react";

interface EditTaskExpandModalProps {
  isExpandConfirm: boolean;
  taskTitle: string;
  totalItems: number;
  onOpenConfirm: () => void;
  onCancelConfirm: () => void;
  onConfirmExpand: () => void;
}

export const EditTaskExpandModal: React.FC<EditTaskExpandModalProps> = ({
  isExpandConfirm,
  taskTitle,
  totalItems,
  onOpenConfirm,
  onCancelConfirm,
  onConfirmExpand,
}) => {
  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
      {isExpandConfirm ? (
        <div className="p-3 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <Columns3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-indigo-900 dark:text-indigo-200 font-bold block">
                確定將此任務展開為獨立狀態欄位？
              </span>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
                {totalItems > 0
                  ? `將以「${taskTitle}」建立全新狀態欄，並將 ${totalItems} 個子待辦轉為獨立任務卡片。`
                  : `將以「${taskTitle}」在看板中建立全新獨立狀態欄位。`}
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onConfirmExpand}
              className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              🚀 確認展開
            </button>
            <button
              type="button"
              onClick={onCancelConfirm}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenConfirm}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 hover:bg-indigo-100/90 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="將卡片升級為狀態欄位，子待辦化為獨立卡片"
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>🚀 展開為狀態欄位</span>
        </button>
      )}
    </div>
  );
};
