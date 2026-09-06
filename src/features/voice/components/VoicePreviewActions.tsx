import React from "react";
import { RotateCcw, Trash2, Check } from "lucide-react";

interface VoicePreviewActionsProps {
  onReRecord: () => void;
  onDiscard: () => void;
  onConfirm: () => void;
}

export const VoicePreviewActions: React.FC<VoicePreviewActionsProps> = ({
  onReRecord,
  onDiscard,
  onConfirm,
}) => {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 gap-2">
      <button
        type="button"
        onClick={onReRecord}
        className="flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        title="重新錄音"
      >
        <RotateCcw className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="hidden sm:inline">重新錄音</span>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onDiscard}
          className="flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
          title="捨棄"
        >
          <Trash2 className="w-4 h-4 text-slate-500 hover:text-rose-500 shrink-0" />
          <span className="hidden sm:inline">捨棄</span>
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-base44-lime hover:bg-base44-limeDark text-slate-900 font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <Check className="w-4 h-4 text-slate-900 stroke-[3]" />
          <span>確認</span>
        </button>
      </div>
    </div>
  );
};
