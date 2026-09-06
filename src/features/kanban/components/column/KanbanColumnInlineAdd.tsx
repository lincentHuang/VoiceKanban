import React from "react";
import { X } from "lucide-react";

interface Props {
  isAddingCard: boolean;
  newCardTitle: string;
  isSubmitting: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onTitleChange: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const KanbanColumnInlineAdd: React.FC<Props> = ({
  isAddingCard, newCardTitle, isSubmitting, inputRef, onTitleChange, onSubmit, onCancel,
}) => {
  if (!isAddingCard) return null;

  return (
    <div className="pt-1 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 shadow-md border-2 border-blue-500/80">
        <textarea
          ref={inputRef}
          value={newCardTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.key === "Process") return;
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          placeholder="輸入標題或貼上連結"
          rows={2}
          className="w-full bg-transparent text-[16px] sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none leading-snug"
          autoFocus
        />
      </div>
      <div className="flex items-center gap-2 mt-2 pb-1">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!newCardTitle.trim() || isSubmitting}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
        >
          {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          <span>新增卡片</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="取消 (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
