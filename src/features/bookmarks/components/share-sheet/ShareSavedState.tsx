import React from "react";
import { CheckCircle2 } from "lucide-react";

interface Props {
  boardName: string;
  columnTitle: string;
  onViewCollection: () => void;
  onDone: () => void;
}

export const ShareSavedState: React.FC<Props> = ({ boardName, columnTitle, onViewCollection, onDone }) => (
  <div className="py-4 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in-95 duration-200">
    <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
    </div>
    <div>
      <p className="text-base font-bold text-slate-900 dark:text-white">已加入收藏</p>
      <p className="text-xs text-slate-500 mt-0.5">
        {boardName}
        {columnTitle && ` › ${columnTitle}`}
      </p>
    </div>
    <div className="w-full grid grid-cols-2 gap-2 pt-1">
      <button
        type="button"
        onClick={onDone}
        className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        完成
      </button>
      <button
        type="button"
        onClick={onViewCollection}
        className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors cursor-pointer"
      >
        查看收藏
      </button>
    </div>
  </div>
);
