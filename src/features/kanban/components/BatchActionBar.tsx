"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { DEFAULT_COLUMNS } from "@/core/types/task";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { BatchSelectionCount } from "./batch/BatchSelectionCount";
import { BatchMoveMenu } from "./batch/BatchMoveMenu";
import { BatchPriorityMenu } from "./batch/BatchPriorityMenu";
import { BatchActionButtons } from "./batch/BatchActionButtons";
import { BatchDeleteConfirmModal } from "./batch/BatchDeleteConfirmModal";

export const BatchActionBar: React.FC = () => {
  const {
    isMultiSelectMode,
    selectedTaskIds,
    clearSelection,
    setIsMultiSelectMode,
    getActiveBoardColumns,
  } = useKanbanStore();

  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isBatchDeleteConfirm, setIsBatchDeleteConfirm] = useState(false);

  const hasSelection = selectedTaskIds.length > 0;
  const isVisible = isMultiSelectMode || hasSelection;

  useEscapeKey(() => {
    if (isBatchDeleteConfirm) {
      setIsBatchDeleteConfirm(false);
    } else if (isMoveMenuOpen) {
      setIsMoveMenuOpen(false);
    } else if (isPriorityMenuOpen) {
      setIsPriorityMenuOpen(false);
    } else if (hasSelection) {
      clearSelection();
    } else if (isMultiSelectMode) {
      setIsMultiSelectMode(false);
    }
  }, isVisible);

  if (!isVisible) return null;

  const boardColumns = getActiveBoardColumns();
  const allTargetColumns = [
    { id: "inbox", title: "收件匣", icon: "📥" },
    ...(boardColumns && boardColumns.length > 0 ? boardColumns : DEFAULT_COLUMNS),
  ];

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 w-full max-w-[calc(100vw-1.25rem)] sm:max-w-2xl px-1 sm:px-4 animate-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
      <div className="backdrop-blur-2xl bg-slate-900/95 dark:bg-slate-900/98 text-white border border-slate-700/80 shadow-2xl rounded-2xl sm:rounded-full p-2.5 sm:px-5 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <BatchSelectionCount selectedCount={selectedTaskIds.length} />

        <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-1.5 w-full sm:w-auto pt-1.5 sm:pt-0 border-t border-slate-800/80 sm:border-t-0">
          <BatchMoveMenu
            hasSelection={hasSelection}
            isOpen={isMoveMenuOpen}
            setIsOpen={(open) => {
              setIsMoveMenuOpen(open);
              if (open) setIsPriorityMenuOpen(false);
            }}
            targetColumns={allTargetColumns}
          />

          <BatchPriorityMenu
            hasSelection={hasSelection}
            isOpen={isPriorityMenuOpen}
            setIsOpen={(open) => {
              setIsPriorityMenuOpen(open);
              if (open) setIsMoveMenuOpen(false);
            }}
          />

          <BatchActionButtons
            hasSelection={hasSelection}
            onOpenDeleteConfirm={() => setIsBatchDeleteConfirm(true)}
          />
        </div>
      </div>

      <BatchDeleteConfirmModal
        isOpen={isBatchDeleteConfirm}
        onClose={() => setIsBatchDeleteConfirm(false)}
        selectedCount={selectedTaskIds.length}
      />
    </div>
  );
};
export default BatchActionBar;
