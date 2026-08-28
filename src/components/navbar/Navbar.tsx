"use client";

import React, { useState, useEffect, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import {
  Mic,
  Search,
  Settings,
  Plus,
  ChevronDown,
  KeyRound,
  Check,
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

export const Navbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    byokConfig,
    setIsVoiceOverlayOpen,
    setVoiceState,
    setIsSettingsModalOpen,
    userSession,
    setIsAuthModalOpen,
    setIsBindModalOpen,
    logout,
    syncState,
    triggerSync,
    openAddTaskModal,
    setIsColumnManagerOpen,
  } = useKanbanStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Periodically refresh relative time display every 15s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Global Ctrl+K / Cmd+K key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === "Escape") {
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStartVoice = () => {
    setVoiceState("recording");
    setIsVoiceOverlayOpen(true);
  };

  const isGuest = userSession.isGuest || userSession.provider === "guest";

  return (
    <header className="w-full h-12 bg-transparent px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-30">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <BrandLogo bgVariant="white" size="sm" showBadge={false} />
        {isGuest && (
          <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[10px] font-bold text-amber-800 dark:text-amber-300">
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            <span>訪客體驗中</span>
          </span>
        )}
      </div>

      {/* Center: Centered Search Bar */}
      <div className="flex items-center flex-1 max-w-md sm:max-w-lg mx-auto relative">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜尋任務、標籤或關鍵字..."
          className="w-full pl-9 pr-14 py-1.5 text-xs sm:text-sm rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/60 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 shadow-xs transition-all"
        />
        <div className="absolute right-2.5 flex items-center gap-1">
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              ✕
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-200 dark:border-slate-700 shadow-2xs">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Right: Quick Add, Voice, BYOK, User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Add Button */}
        <button
          onClick={() => openAddTaskModal()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline-block">建立</span>
        </button>

        {/* Quick Voice CTA Button */}
        <button
          onClick={handleStartVoice}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-base44-lime hover:bg-base44-limeDark text-slate-900 font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          title="一鍵語音建立"
        >
          <Mic className="w-3.5 h-3.5 text-slate-900" />
          <span className="hidden md:inline-block">一鍵語音</span>
        </button>

        {/* User Profile & Settings Popup */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800 flex items-center justify-center text-slate-700 hover:border-orange-500 transition-all overflow-hidden shadow-2xs"
          >
            {userSession.avatarUrl ? (
              <img src={userSession.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {userSession.name}
                </div>
                <div className="text-xs text-slate-400 truncate">{userSession.email}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                    isGuest ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
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
                    onClick={() => {
                      setIsBindModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
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

              <div className="space-y-1 pt-1">
                {/* Workflow column manager */}
                <button
                  onClick={() => {
                    setIsColumnManagerOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span>狀態流程管理 (Workflow)</span>
                </button>

                {/* BYOK Settings */}
                <button
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between transition-colors"
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
                </button>

                {/* Auth / Logout */}
                {isGuest ? (
                  <>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-orange-600 font-semibold hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>切換為會員登入</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>離開訪客模式</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>登出帳號</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

