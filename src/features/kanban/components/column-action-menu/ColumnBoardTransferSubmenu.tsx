"use client";

import React from "react";
import { Copy, FolderInput } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BoardTransferTarget } from "./useColumnActions";

interface ColumnBoardTransferSubmenuProps {
  targets: BoardTransferTarget[];
  moveOutBlockedReason: string | null;
}

const BoardLabel: React.FC<{ target: BoardTransferTarget }> = ({ target }) => (
  <>
    {target.icon && <span className="shrink-0">{target.icon}</span>}
    <span className="truncate">{target.name}</span>
    {target.isShared && (
      <span className="ml-auto shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
        共享
      </span>
    )}
  </>
);

const SUB_CONTENT_CLASS = "min-w-[12rem] max-w-[16rem] max-h-56 overflow-y-auto custom-scrollbar";

export const ColumnBoardTransferSubmenu: React.FC<ColumnBoardTransferSubmenuProps> = ({
  targets,
  moveOutBlockedReason,
}) => {
  if (targets.length === 0) return null;

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger disabled={Boolean(moveOutBlockedReason)} className="flex items-center gap-2 data-disabled:opacity-60 data-disabled:cursor-not-allowed">
          <FolderInput className="w-3.5 h-3.5 text-slate-400" />
          <span className="flex flex-col">
            <span>移動列表到其他看板</span>
            {moveOutBlockedReason && (
              <span className="text-[10px] text-slate-400 font-normal">{moveOutBlockedReason}</span>
            )}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent collisionPadding={12} className={SUB_CONTENT_CLASS}>
          {targets.map((target) => (
            <DropdownMenuItem
              key={target.id}
              onClick={target.onMove}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <BoardLabel target={target} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex items-center gap-2">
          <Copy className="w-3.5 h-3.5 text-slate-400" />
          <span>複製列表到其他看板</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent collisionPadding={12} className={SUB_CONTENT_CLASS}>
          {targets.map((target) => (
            <DropdownMenuItem
              key={target.id}
              onClick={target.onCopy}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <BoardLabel target={target} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  );
};
