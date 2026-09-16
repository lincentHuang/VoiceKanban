"use client";

import React from "react";
import { MoveRight } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ColumnMoveSubmenuProps {
  moveTargets: { id: string; title: string; onSelect: () => void }[];
}

export const ColumnMoveSubmenu: React.FC<ColumnMoveSubmenuProps> = ({ moveTargets }) => {
  if (moveTargets.length === 0) return null;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2">
        <MoveRight className="w-3.5 h-3.5 text-slate-400" />
        <span>移動這個列表的所有卡片</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        collisionPadding={12}
        className="min-w-[12rem] max-h-56 overflow-y-auto custom-scrollbar"
      >
        {moveTargets.map((target) => (
          <DropdownMenuItem
            key={target.id}
            onClick={target.onSelect}
            className="flex items-center gap-1.5 truncate cursor-pointer"
          >
            <span className="text-orange-500">➔</span>
            <span className="truncate">移動至「{target.title}」</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
