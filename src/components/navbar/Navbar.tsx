"use client";

import React, { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import {
  Search,
  KeyRound,
  Cloud,
  CloudOff,
  RefreshCw,
  User,
  LogOut,
  LogIn,
  SlidersHorizontal,
  Link2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { formatSyncTime } from "@/core/utils/dateUtils";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { InstallPwaMenuItem } from "@/features/pwa-mobile";
import { OfflineIndicator } from "@/features/offline";


export const Navbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    isSearchModalOpen,
    setIsSearchModalOpen,
    byokConfig,
    setIsSettingsModalOpen,
    userSession,
    setIsBindModalOpen,
    logout,
    syncState,
    triggerSync,
    setIsColumnManagerOpen,
  } = useKanbanStore();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Periodically refresh relative time display every 15s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Global Ctrl+K / Cmd+K key listener to open Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchModalOpen]);

  const isGuest = userSession.isGuest || userSession.provider === "guest";

  return (
    <header className="w-full h-12 bg-transparent sm:pt-3 px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-30">
      {/* Left: Logo & Brand & Offline Indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <BrandLogo bgVariant="white" size="sm" showBadge={false} />
        <OfflineIndicator />
        {isGuest && (
          <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[10px] font-bold text-amber-800 dark:text-amber-300">
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            <span>訪客體驗中</span>
          </span>
        )}
      </div>

      {/* Center: Desktop Triggerable Search Bar */}
      <button
        type="button"
        onClick={() => setIsSearchModalOpen(true)}
        className="hidden sm:flex items-center flex-1 max-w-xs md:max-w-md mx-auto relative px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-orange-500/50 shadow-xs transition-all cursor-pointer text-left group"
      >
        <Search className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
        <span className="ml-2.5 text-xs sm:text-sm text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 truncate">
          {searchQuery ? searchQuery : "搜尋任務、標籤或關鍵字..."}
        </span>
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {searchQuery ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
              }}
              className="text-xs text-slate-400 hover:text-rose-500 px-1 py-0.5 rounded-full transition-colors"
              title="清除搜尋條件"
            >
              ✕
            </span>
          ) : (
            <kbd className="inline-block px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-200 dark:border-slate-700 shadow-2xs">
              ⌘K
            </kbd>
          )}
        </div>
      </button>

      {/* Right: Mobile Search Button & User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Search Icon Button */}
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="sm:hidden w-8 h-8 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-orange-500 hover:text-orange-500 transition-all shadow-2xs cursor-pointer active:scale-95"
          aria-label="開啟搜尋"
          title="搜尋任務"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* User Profile & Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-8 h-8 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800 flex items-center justify-center text-slate-700 hover:border-orange-500 transition-all overflow-hidden shadow-2xs cursor-pointer focus:outline-none focus:border-orange-500"
              aria-label="使用者選單"
            >
              {userSession.avatarUrl ? (
                <img src={userSession.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            collisionPadding={12}
            className="w-72 p-3 space-y-2 z-[9999] rounded-3xl"
          >
            {/* Profile Header */}
            <div className="px-1.5 py-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {userSession.name}
              </div>
              <div className="text-xs text-slate-400 truncate">{userSession.email}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                    isGuest
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {userSession.provider}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  在線
                </span>
              </div>
            </div>

            {/* Guest Callout Banner */}
            {isGuest && (
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 dark:from-orange-950/40 dark:to-amber-950/30 border border-orange-200/80 dark:border-orange-900/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 dark:text-orange-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>訪客體驗模式</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                  隨時可綁定正式帳號，自動保留並整併目前所有看板資料。
                </p>
                <button
                  type="button"
                  onClick={() => setIsBindModalOpen(true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>立即綁定正式帳號</span>
                </button>
              </div>
            )}

            {/* Cloud Sync Status */}
            {(() => {
              const formattedSync = formatSyncTime(syncState.lastSyncedAt, currentTime);
              return (
                <div
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs transition-all"
                  title={`完整同步時間：${formattedSync.full}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0 p-1.5 rounded-xl bg-white dark:bg-slate-700/80 shadow-2xs border border-slate-100 dark:border-slate-700/50">
                        {syncState.status === "syncing" ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                        ) : syncState.status === "offline" ? (
                          <CloudOff className="w-4 h-4 text-slate-400" />
                        ) : syncState.status === "error" ? (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Cloud className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {syncState.status === "syncing"
                              ? "正在同步..."
                              : syncState.status === "offline"
                              ? "離線模式"
                              : syncState.status === "error"
                              ? "同步異常"
                              : isGuest
                              ? "本機已存檔"
                              : "雲端已同步"}
                          </span>
                          {syncState.status === "synced" && formattedSync.isLatest && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 shrink-0 leading-none">
                              最新
                            </span>
                          )}
                        </div>
                        <div
                          className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5"
                          title={formattedSync.full}
                        >
                          {syncState.status === "syncing"
                            ? "正在更新雲端資料"
                            : syncState.status === "offline"
                            ? `${syncState.lastSyncedAt ? `上次同步於 ${formattedSync.relative}` : "離線快取中"}・連線後自動上傳`
                            : syncState.status === "error"
                            ? `${syncState.errorMessage || "連線異常"}・點擊重試`
                            : isGuest
                            ? `${formattedSync.relative}（訪客本機模式）`
                            : formattedSync.isLatest
                            ? "剛剛（目前為最新版本）"
                            : `上次同步：${formattedSync.relative}`}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerSync()}
                      disabled={syncState.status === "syncing"}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-100/60 dark:hover:bg-orange-950/40 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed border border-orange-200/60 dark:border-orange-900/40"
                    >
                      {syncState.status === "syncing" ? "同步中..." : "立即同步"}
                    </button>
                  </div>
                </div>
              );
            })()}

            <DropdownMenuSeparator />

            {/* Menu Items */}
            <DropdownMenuItem
              onClick={() => setIsColumnManagerOpen(true)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>狀態流程管理 (Workflow)</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center justify-between"
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

            {/* PWA 在手機安裝應用按鈕 (若已在 Standalone/原生模式則自動隱藏) */}
            <InstallPwaMenuItem />

            <DropdownMenuSeparator />


            {/* Auth / Logout */}
            {isGuest ? (
              <>
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold"
                >
                  <LogIn className="w-4 h-4" />
                  <span>切換為會員登入</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="flex items-center gap-2 text-slate-500"
                >
                  <LogOut className="w-4 h-4" />
                  <span>離開訪客模式</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => logout()}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>登出帳號</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
