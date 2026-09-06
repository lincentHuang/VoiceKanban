import React from "react";
import { AlignLeft, Check, Edit3 } from "lucide-react";

interface EditorHeaderProps {
  title: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlignLeft className="w-4 h-4 text-slate-400 shrink-0" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onSaveEdit}
            className="px-3.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 hover:scale-102 active:scale-98"
          >
            <Check className="w-3.5 h-3.5" />
            <span>完成</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-all shadow-2xs hover:scale-102 active:scale-98 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>編輯說明</span>
        </button>
      )}
    </div>
  );
};
