"use client";

import React, { useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";
import { Board } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { BoardSwitcherItem } from "./BoardSwitcherItem";
import { BoardSwitcherAddForm } from "./BoardSwitcherAddForm";

interface Props {
  boards: Board[];
  activeBoard: Board;
  isOpen: boolean;
  onToggle: () => void;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  onOpenJoinModal: () => void;
}

export const BoardSwitcherMenu: React.FC<Props> = ({
  boards, activeBoard, isOpen, onToggle, onSelectBoard, onCreateBoard, onOpenJoinModal,
}) => {
  const { setEditingBoardId, setDeletingBoardId } = useKanbanStore();
  const [isPrompt, setIsPrompt] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateBoard(newName.trim());
      setNewName("");
      setIsPrompt(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <span>{activeBoard?.icon || "💼"}</span>
          <span className="max-w-[120px] sm:max-w-[180px] truncate">{activeBoard?.name || "看板"}</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/70" />
        </button>

        {activeBoard && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setEditingBoardId(activeBoard.id); }}
            title="編輯此看板名稱與圖示"
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>切換看板</span>
            <span className="text-[10px] lowercase text-slate-400 font-normal">{boards.length} 個看板</span>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar my-1">
            {boards.map((b) => (
              <BoardSwitcherItem
                key={b.id}
                board={b}
                isActive={b.id === activeBoard?.id}
                canDelete={boards.length > 1}
                onSelect={() => onSelectBoard(b.id)}
                onEdit={(e) => { e.stopPropagation(); setEditingBoardId(b.id); onToggle(); }}
                onDelete={(e) => { e.stopPropagation(); setDeletingBoardId(b.id); onToggle(); }}
              />
            ))}
          </div>

          <BoardSwitcherAddForm
            isPrompt={isPrompt}
            newName={newName}
            onSetNewName={setNewName}
            onOpenPrompt={() => setIsPrompt(true)}
            onClosePrompt={() => setIsPrompt(false)}
            onCreate={handleCreate}
            onOpenJoinModal={onOpenJoinModal}
          />
        </div>
      )}
    </div>
  );
};
