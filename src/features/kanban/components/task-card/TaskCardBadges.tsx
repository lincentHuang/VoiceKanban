import React from "react";
import { Star, AlignLeft, Paperclip, CheckSquare2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { DueDateStatus } from "@/core/utils/dateUtils";

interface Props {
  isStarred?: boolean;
  hasDescription: boolean;
  totalAttachments: number;
  totalChecklist: number;
  completedChecklist: number;
  isChecklistAllDone: boolean;
  isSubtasksExpanded: boolean;
  dueDateStatus?: DueDateStatus | null;
  onToggleSubtasksExpand: (e: React.MouseEvent) => void;
}

export const TaskCardBadges: React.FC<Props> = ({
  isStarred, hasDescription, totalAttachments, totalChecklist, completedChecklist,
  isChecklistAllDone, isSubtasksExpanded, dueDateStatus, onToggleSubtasksExpand,
}) => {
  const hasBadges = isStarred || hasDescription || totalAttachments > 0 || totalChecklist > 0 || Boolean(dueDateStatus);
  if (!hasBadges) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-slate-100/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
      {isStarred && <span className="text-amber-500 flex items-center justify-center shrink-0" title="重要事項"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" /></span>}
      {hasDescription && <span className="inline-flex items-center gap-1 shrink-0" title="有備註說明"><AlignLeft className="w-3.5 h-3.5" /></span>}
      {totalAttachments > 0 && <span className="inline-flex items-center gap-1 shrink-0" title="有附件檔案"><Paperclip className="w-3.5 h-3.5" /><span>{totalAttachments}</span></span>}

      {totalChecklist > 0 && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onToggleSubtasksExpand}
          className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-lg transition-all cursor-pointer group/badge select-none whitespace-nowrap shrink-0 ${
            isSubtasksExpanded
              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-400/50 shadow-2xs"
              : isChecklistAllDone
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 font-bold"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
          title={isSubtasksExpanded ? "收合子任務列表" : `點擊展開子任務 (${completedChecklist}/${totalChecklist})`}
        >
          <CheckSquare2 className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">{completedChecklist}/{totalChecklist}</span>
          {isSubtasksExpanded ? <ChevronUp className="w-3 h-3 ml-0.5 opacity-75 shrink-0" /> : <ChevronDown className="w-3 h-3 ml-0.5 opacity-75 shrink-0" />}
        </button>
      )}

      {dueDateStatus && (
        <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ml-auto ${dueDateStatus.badgeClasses.cardBadge}`} title={`到期時間: ${dueDateStatus.formattedFullDateTime}`}>
          <Calendar className={`w-3.5 h-3.5 shrink-0 ${dueDateStatus.badgeClasses.iconColor}`} />
          <span className={`whitespace-nowrap ${dueDateStatus.badgeClasses.cardText}`}>{dueDateStatus.formattedDateOnly}</span>
        </span>
      )}
    </div>
  );
};
