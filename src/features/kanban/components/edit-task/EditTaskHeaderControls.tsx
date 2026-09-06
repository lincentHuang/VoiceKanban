import React from "react";
import { CheckCircle2, Star, MoveRight, Palette, Columns3, Trash2, X } from "lucide-react";
import { ColumnId } from "@/core/types/task";
import { EditTaskMovePopover } from "./EditTaskMovePopover";
import { EditTaskCoverPickerModal } from "./EditTaskCoverPickerModal";
import { CoverAspectRatio } from "@/core/types/task";

interface EditTaskHeaderControlsProps {
  completed?: boolean;
  isStarred: boolean;
  coverColor: string;
  coverAspectRatio: CoverAspectRatio;
  columnId: ColumnId;
  allTargetColumns: { id: ColumnId; title: string; icon: string }[];
  isMovePopoverOpen: boolean;
  isCoverModalOpen: boolean;
  onToggleComplete: () => void;
  onToggleStar: () => void;
  onToggleMovePopover: () => void;
  onToggleCoverModal: () => void;
  onSelectRatio: (ratio: CoverAspectRatio) => void;
  onApplyCover: (color: string) => void;
  onRemoveCover: () => void;
  onMoveColumn: (targetColId: ColumnId) => void;
  onOpenExpandConfirm: () => void;
  onOpenDeleteConfirm: () => void;
  onClose: () => void;
}

export const EditTaskHeaderControls: React.FC<EditTaskHeaderControlsProps> = ({
  completed, isStarred, coverColor, coverAspectRatio, columnId, allTargetColumns,
  isMovePopoverOpen, isCoverModalOpen, onToggleComplete, onToggleStar, onToggleMovePopover,
  onToggleCoverModal, onSelectRatio, onApplyCover, onRemoveCover, onMoveColumn,
  onOpenExpandConfirm, onOpenDeleteConfirm, onClose,
}) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <button type="button" onClick={onToggleComplete} className="p-1 rounded-lg transition-transform duration-150 hover:scale-115 active:scale-90" title={completed ? "標記為未完成" : "標記為已完成"}>
          <CheckCircle2 className={`w-6 h-6 transition-all duration-200 ${completed ? "text-emerald-500 fill-emerald-100 dark:fill-emerald-950/60 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)] scale-105" : "text-slate-300 dark:text-slate-600 hover:text-emerald-500 hover:fill-emerald-50"}`} />
        </button>
        <button type="button" onClick={onToggleStar} className="p-1 rounded-lg transition-transform duration-150 hover:scale-115 active:scale-90" title={isStarred ? "取消重要標記" : "標記為重要事項"}>
          <Star className={`w-6 h-6 transition-all duration-200 ${isStarred ? "fill-amber-400 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.45)] scale-105" : "text-slate-300 dark:text-slate-600 hover:text-amber-400 hover:fill-amber-100"}`} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative">
          <button type="button" onClick={onToggleMovePopover} className="p-1 rounded-lg text-slate-400 hover:text-blue-500 transition-transform duration-150 hover:scale-115 active:scale-90" title="移動卡片">
            <MoveRight className="w-6 h-6" />
          </button>
          <EditTaskMovePopover isOpen={isMovePopoverOpen} columnId={columnId} allTargetColumns={allTargetColumns} onClose={onToggleMovePopover} onMoveColumn={onMoveColumn} />
        </div>

        <div className="relative">
          <button type="button" onClick={onToggleCoverModal} className="p-1 rounded-lg text-slate-400 hover:text-orange-500 transition-transform duration-150 hover:scale-115 active:scale-90" title="封面設定">
            <Palette className={`w-6 h-6 transition-colors ${coverColor ? "text-orange-500 drop-shadow-[0_2px_8px_rgba(249,115,22,0.35)]" : ""}`} />
          </button>
          <EditTaskCoverPickerModal isOpen={isCoverModalOpen} coverColor={coverColor} coverAspectRatio={coverAspectRatio} onClose={onToggleCoverModal} onSelectRatio={onSelectRatio} onApplyCover={onApplyCover} onRemoveCover={onRemoveCover} />
        </div>

        <button type="button" onClick={onOpenExpandConfirm} className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-transform duration-150 hover:scale-115 active:scale-90" title="展開為狀態欄位">
          <Columns3 className="w-6 h-6" />
        </button>

        <button type="button" onClick={onOpenDeleteConfirm} className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-transform duration-150 hover:scale-115 active:scale-90 cursor-pointer" title="刪除卡片">
          <Trash2 className="w-6 h-6" />
        </button>

        <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-transform duration-150 hover:scale-115 active:scale-90" title="關閉">
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
