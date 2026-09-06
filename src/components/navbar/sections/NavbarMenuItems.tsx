"use client";

import React from "react";
import { UserPlus, SlidersHorizontal, KeyRound, LogIn, LogOut } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { InstallPwaMenuItem } from "@/features/pwa-mobile";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

interface NavbarMenuItemsProps {
  isGuest: boolean;
}

export const NavbarMenuItems: React.FC<NavbarMenuItemsProps> = ({ isGuest }) => {
  const {
    byokConfig,
    setIsSettingsModalOpen,
    setIsColumnManagerOpen,
    setIsJoinBoardModalOpen,
    logout,
  } = useKanbanStore();

  return (
    <>
      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => setIsJoinBoardModalOpen(true)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <UserPlus className="w-4 h-4 text-blue-500" />
        <span>加入協作看板 (輸入代碼)</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsColumnManagerOpen(true)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
        <span>狀態流程管理 (Workflow)</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsSettingsModalOpen(true)}
        className="flex items-center justify-between cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-orange-500" />
          <span>自備 Gemini Key (BYOK)</span>
        </span>
        <span
          className={`w-2 h-2 rounded-full ${
            byokConfig.apiKey ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
      </DropdownMenuItem>

      <InstallPwaMenuItem />

      <DropdownMenuSeparator />

      {isGuest ? (
        <>
          <DropdownMenuItem
            onClick={() => logout()}
            className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>切換為會員登入</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => logout()}
            className="flex items-center gap-2 text-slate-500 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>離開訪客模式</span>
          </DropdownMenuItem>
        </>
      ) : (
        <DropdownMenuItem
          variant="destructive"
          onClick={() => logout()}
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>登出帳號</span>
        </DropdownMenuItem>
      )}
    </>
  );
};
