"use client";

import React, { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Board } from "@/core/types/task";
import { useClickOutside } from "@/core/hooks/useClickOutside";
import { BoardSwitcherItem } from "./BoardSwitcherItem";
import { BoardSwitcherAddForm } from "./BoardSwitcherAddForm";

interface Props {
  boards: Board[];
  activeBoard: Board;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  onOpenJoinModal: () => void;
  onOpenCollection?: () => void;
}

export const BoardSwitcherMenu: React.FC<Props> = ({
  boards, activeBoard, isOpen, onToggle, onClose, onSelectBoard, onCreateBoard, onOpenJoinModal, onOpenCollection,
}) => {
  const [isPrompt, setIsPrompt] = useState(false);
  const [newName, setNewName] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  useClickOutside(rootRef, onClose, isOpen);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateBoard(newName.trim());
      setNewName("");
      setIsPrompt(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
      >
        <span>{activeBoard?.icon || "💼"}</span>
        <span className="max-w-[120px] sm:max-w-[180px] truncate">{activeBoard?.name || "看板"}</span>
        <ChevronDown className="w-3.5 h-3.5 text-white/70" />
      </button>

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
                onSelect={() => onSelectBoard(b.id)}
              />
            ))}
          </div>

          {onOpenCollection && (
            <button
              type="button"
              onClick={onOpenCollection}
              className="w-[calc(100%-1rem)] mx-2 mb-1 px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-orange-700 dark:text-orange-300 bg-orange-50/80 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
            >
              <span>🔖</span>
              <span>建立「收藏」看板</span>
              <span className="ml-auto text-[10px] font-normal text-orange-500">IG · YouTube · Threads</span>
            </button>
          )}

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
