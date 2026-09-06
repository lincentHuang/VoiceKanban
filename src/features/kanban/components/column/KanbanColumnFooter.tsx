import React from "react";
import { Plus, Mic } from "lucide-react";

interface Props {
  canEdit: boolean;
  isAddingCard: boolean;
  columnTitle: string;
  onStartAddCard: () => void;
  onVoiceAdd: () => void;
}

export const KanbanColumnFooter: React.FC<Props> = ({
  canEdit, isAddingCard, columnTitle, onStartAddCard, onVoiceAdd,
}) => {
  if (!canEdit || isAddingCard) return null;

  return (
    <div className="pt-1.5 flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={onStartAddCard}
        className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors text-left group cursor-pointer"
      >
        <Plus className="w-4 h-4 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white" />
        <span>新增卡片</span>
      </button>

      <button
        type="button"
        onClick={onVoiceAdd}
        className="p-1.5 rounded-xl bg-orange-50/90 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200/60 dark:border-orange-900/40 transition-colors shadow-2xs cursor-pointer"
        title={`在「${columnTitle}」使用語音模式新增`}
      >
        <Mic className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
