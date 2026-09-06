"use client";

import React from "react";
import { Plus, UserPlus } from "lucide-react";

interface Props {
  isPrompt: boolean;
  newName: string;
  onSetNewName: (name: string) => void;
  onOpenPrompt: () => void;
  onClosePrompt: () => void;
  onCreate: (e: React.FormEvent) => void;
  onOpenJoinModal: () => void;
}

export const BoardSwitcherAddForm: React.FC<Props> = ({
  isPrompt,
  newName,
  onSetNewName,
  onOpenPrompt,
  onClosePrompt,
  onCreate,
  onOpenJoinModal,
}) => {
  return (
    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5 px-2 space-y-0.5">
      {isPrompt ? (
        <form
          onSubmit={onCreate}
          className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <input
            type="text"
            placeholder="看板名稱..."
            value={newName}
            onChange={(e) => onSetNewName(e.target.value)}
            autoFocus
            className="w-full text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 mb-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <div className="flex gap-1 justify-end">
            <button
              type="button"
              onClick={onClosePrompt}
              className="text-xs px-2 py-0.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!newName.trim()}
              className="text-xs px-2.5 py-0.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold"
            >
              建立
            </button>
          </div>
        </form>
      ) : (
        <>
          <button
            onClick={onOpenPrompt}
            className="w-full text-left px-2 py-1.5 text-xs text-orange-600 dark:text-orange-400 font-medium hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增看板...</span>
          </button>
          <button
            onClick={onOpenJoinModal}
            className="w-full text-left px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>加入協作看板...</span>
          </button>
        </>
      )}
    </div>
  );
};
