"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { EditBoardFields } from "../edit-board/EditBoardFields";

interface GeneralTabProps {
  name: string;
  onSetName: (name: string) => void;
  icon: string;
  onSetIcon: (icon: string) => void;
  description: string;
  onSetDescription: (description: string) => void;
  canDeleteBoard: boolean;
  onDeleteBoard: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  name,
  onSetName,
  icon,
  onSetIcon,
  description,
  onSetDescription,
  canDeleteBoard,
  onDeleteBoard,
}) => {
  return (
    <div className="space-y-5">
      <EditBoardFields
        name={name}
        onSetName={onSetName}
        icon={icon}
        onSetIcon={onSetIcon}
        description={description}
        onSetDescription={onSetDescription}
      />

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold text-red-500 mb-1.5">危險區域</label>
        {canDeleteBoard ? (
          <button
            type="button"
            onClick={onDeleteBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>刪除此看板</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400">需保留至少一個看板，無法刪除</span>
        )}
      </div>
    </div>
  );
};
