import React, { useState } from "react";
import { Board, ViewMode } from "@/core/types/task";
import { CollaboratorAvatars } from "@/features/collaboration";
import { BoardSwitcherMenu } from "./BoardSwitcherMenu";
import { ViewModeMenu } from "./ViewModeMenu";
import { BoardCanvasWideControls } from "./BoardCanvasWideControls";
import { BoardCanvasCompactControls } from "./BoardCanvasCompactControls";

interface Props {
  boards: Board[];
  activeBoard: Board;
  isCompact: boolean;
  viewMode: ViewMode;
  tagFilter: string;
  priorityFilter: string;
  isMultiSelectMode: boolean;
  selectedTaskCount: number;
  allTags: string[];
  totalTaskCount: number;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  onOpenJoinModal: () => void;
  onSetViewMode: (mode: ViewMode) => void;
  onSetTagFilter: (tag: string) => void;
  onTogglePriorityFilter: () => void;
  onToggleMultiSelect: () => void;
  onOpenColumnManager: () => void;
}

export const BoardCanvasHeader: React.FC<Props> = ({
  boards, activeBoard, isCompact, viewMode, tagFilter, priorityFilter, isMultiSelectMode,
  selectedTaskCount, allTags, totalTaskCount, onSelectBoard, onCreateBoard, onOpenJoinModal,
  onSetViewMode, onSetTagFilter, onTogglePriorityFilter, onToggleMultiSelect, onOpenColumnManager,
}) => {
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const closeAll = () => {
    setIsBoardOpen(false); setIsViewOpen(false); setIsTagOpen(false); setIsFilterOpen(false); setIsMoreOpen(false);
  };

  return (
    <div className="h-11 px-3 sm:px-4 bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-2 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <BoardSwitcherMenu
          boards={boards} activeBoard={activeBoard} isOpen={isBoardOpen}
          onToggle={() => { const s = isBoardOpen; closeAll(); setIsBoardOpen(!s); }}
          onSelectBoard={(id) => { onSelectBoard(id); setIsBoardOpen(false); }}
          onCreateBoard={onCreateBoard} onOpenJoinModal={onOpenJoinModal}
        />
        {!isCompact && (
          <ViewModeMenu
            viewMode={viewMode} isOpen={isViewOpen}
            onToggle={() => { const s = isViewOpen; closeAll(); setIsViewOpen(!s); }}
            onSelectViewMode={(m) => { onSetViewMode(m); setIsViewOpen(false); }}
          />
        )}
      </div>

      <CollaboratorAvatars compact={isCompact} />

      <div className="flex items-center gap-1.5">
        {!isCompact ? (
          <BoardCanvasWideControls
            tagFilter={tagFilter} priorityFilter={priorityFilter} isMultiSelectMode={isMultiSelectMode}
            selectedTaskCount={selectedTaskCount} allTags={allTags} totalTaskCount={totalTaskCount}
            isTagMenuOpen={isTagOpen} onToggleTagMenu={() => { const s = isTagOpen; closeAll(); setIsTagOpen(!s); }}
            onSetTagFilter={(t) => { onSetTagFilter(t); setIsTagOpen(false); }}
            onTogglePriorityFilter={onTogglePriorityFilter} onToggleMultiSelect={onToggleMultiSelect} onOpenColumnManager={onOpenColumnManager}
          />
        ) : (
          <BoardCanvasCompactControls
            isMultiSelectMode={isMultiSelectMode} selectedTaskCount={selectedTaskCount} tagFilter={tagFilter}
            priorityFilter={priorityFilter} allTags={allTags} viewMode={viewMode} isFilterMenuOpen={isFilterOpen}
            isMoreMenuOpen={isMoreOpen} onToggleMultiSelect={onToggleMultiSelect}
            onToggleFilterMenu={() => { const s = isFilterOpen; closeAll(); setIsFilterOpen(!s); }}
            onToggleMoreMenu={() => { const s = isMoreOpen; closeAll(); setIsMoreOpen(!s); }}
            onSetTagFilter={(t) => { onSetTagFilter(t); setIsFilterOpen(false); }}
            onTogglePriorityFilter={onTogglePriorityFilter} onSetViewMode={(m) => { onSetViewMode(m); setIsMoreOpen(false); }}
            onOpenColumnManager={onOpenColumnManager}
          />
        )}
      </div>
    </div>
  );
};
