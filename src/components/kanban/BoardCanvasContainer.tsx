"use client";

import React, { useState, useRef, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ViewMode } from "@/core/types/task";
import { getDueDateStatus } from "@/core/utils/dateUtils";
import { KanbanContainer } from "./KanbanContainer";
import { TableView } from "../views/TableView";
import { ListView } from "../views/ListView";
import { CalendarView } from "../views/CalendarView";
import {
  Columns,
  Calendar,
  Table2,
  ListTodo,
  ChevronDown,
  Check,
  Tag,
  Star,
  CheckSquare,
  Plus,
  SlidersHorizontal,
  Filter,
  MoreHorizontal,
} from "lucide-react";

const VIEW_CONFIG: Record<ViewMode, { label: string; icon: React.ReactNode }> = {
  kanban: { label: "看板", icon: <Columns className="w-3.5 h-3.5" /> },
  calendar: { label: "行事曆", icon: <Calendar className="w-3.5 h-3.5" /> },
  table: { label: "表格", icon: <Table2 className="w-3.5 h-3.5" /> },
  list: { label: "清單", icon: <ListTodo className="w-3.5 h-3.5" /> },
};

export const BoardCanvasContainer: React.FC = () => {
  const {
    boards,
    activeBoardId,
    setActiveBoardId,
    createBoard,
    viewMode,
    setViewMode,
    priorityFilter,
    setPriorityFilter,
    tagFilter,
    setTagFilter,
    isMultiSelectMode,
    setIsMultiSelectMode,
    selectedTaskIds,
    tasks,
    setIsColumnManagerOpen,
    isInboxSidebarOpen,
  } = useKanbanStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);

  // ResizeObserver for precise container-level responsive collapse
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isCompact = containerWidth < 720;

  const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isNewBoardPrompt, setIsNewBoardPrompt] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];
  const boardTasks = tasks.filter((t) => t.boardId === activeBoardId && t.columnId !== "inbox");

  const rawTags = Array.from(new Set(boardTasks.flatMap((t) => t.tags || []))).filter(Boolean);
  const hasOverdueTasks = boardTasks.some((t) => {
    const s = getDueDateStatus(t.dueDate, t.completed);
    return s?.urgency === "overdue" && !t.completed;
  });
  const hasDueSoonTasks = boardTasks.some((t) => {
    const s = getDueDateStatus(t.dueDate, t.completed);
    return s?.urgency === "due-soon" && !t.completed;
  });

  const allTags = [
    ...(hasOverdueTasks ? ["逾期"] : []),
    ...(hasDueSoonTasks ? ["即將到期"] : []),
    ...rawTags.filter((t) => t !== "逾期" && t !== "即將到期"),
  ];

  const handleCreateNewBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      createBoard(newBoardName.trim(), "📌");
      setNewBoardName("");
      setIsNewBoardPrompt(false);
      setIsBoardMenuOpen(false);
    }
  };

  const closeAllMenus = () => {
    setIsBoardMenuOpen(false);
    setIsViewMenuOpen(false);
    setIsTagMenuOpen(false);
    setIsFilterMenuOpen(false);
    setIsMoreMenuOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 h-full min-w-0 rounded-2xl bg-gradient-to-br from-indigo-950/95 via-purple-950/90 to-pink-950/85 dark:from-slate-950 dark:to-slate-900 border border-purple-500/20 shadow-2xl flex flex-col overflow-hidden text-slate-100 relative ${
        isInboxSidebarOpen ? "hidden sm:flex" : "flex"
      }`}
    >
      {/* Board Top Sub-Header (Container-Aware Auto-Collapse) */}
      <div className="h-11 px-3 sm:px-4 bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-2 shrink-0 z-10">
        {/* Left: Board Switcher + (View Dropdown when not compact) */}
        <div className="flex items-center gap-2">
          {/* Board Picker */}
          <div className="relative">
            <button
              onClick={() => {
                const state = isBoardMenuOpen;
                closeAllMenus();
                setIsBoardMenuOpen(!state);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
            >
              <span>{activeBoard?.icon || "💼"}</span>
              <span className="max-w-[120px] sm:max-w-[180px] truncate">
                {activeBoard?.name || "看板"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            </button>

            {isBoardMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-56 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  切換看板
                </div>
                {boards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => {
                      setActiveBoardId(board.id);
                      setIsBoardMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      board.id === activeBoardId ? "text-orange-600 font-bold bg-orange-50/50" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{board.icon}</span>
                      <span>{board.name}</span>
                    </span>
                    {board.id === activeBoardId && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </button>
                ))}

                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-2">
                  {isNewBoardPrompt ? (
                    <form onSubmit={handleCreateNewBoard} className="p-1">
                      <input
                        type="text"
                        placeholder="看板名稱..."
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        autoFocus
                        className="w-full text-xs px-2 py-1 rounded-lg border text-slate-800 mb-1"
                      />
                      <div className="flex gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsNewBoardPrompt(false)}
                          className="text-xs px-2 py-0.5 text-slate-500"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          className="text-xs px-2.5 py-0.5 rounded bg-orange-500 text-white font-medium"
                        >
                          建立
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsNewBoardPrompt(true)}
                      className="w-full text-left px-2 py-1 text-xs text-orange-600 font-medium hover:bg-orange-50 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>新增看板...</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* View Dropdown (Visible only when NOT compact) */}
          {!isCompact && (
            <div className="relative">
              <button
                onClick={() => {
                  const state = isViewMenuOpen;
                  closeAllMenus();
                  setIsViewMenuOpen(!state);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                {VIEW_CONFIG[viewMode].icon}
                <span>{VIEW_CONFIG[viewMode].label}</span>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </button>

              {isViewMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50">
                  {(["kanban", "calendar", "table", "list"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setViewMode(mode);
                        setIsViewMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        viewMode === mode ? "text-orange-600 font-bold bg-orange-50/50" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {VIEW_CONFIG[mode].icon}
                        <span>{VIEW_CONFIG[mode].label}模式</span>
                      </span>
                      {viewMode === mode && <Check className="w-3.5 h-3.5 text-orange-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Compact (≡ & ···) vs Full Inline Controls */}
        <div className="flex items-center gap-1.5">
          {/* --- WIDE MODE CONTROLS (Rendered when width >= 720px) --- */}
          {!isCompact && (
            <div className="flex items-center gap-1.5">
              {/* Tag Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    const state = isTagMenuOpen;
                    closeAllMenus();
                    setIsTagMenuOpen(!state);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    tagFilter !== "all"
                      ? "bg-orange-500 text-white font-bold"
                      : "bg-white/10 hover:bg-white/20 text-white/90"
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{tagFilter === "all" ? "標籤" : `#${tagFilter}`}</span>
                </button>

                {isTagMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                    <button
                      onClick={() => {
                        setTagFilter("all");
                        setIsTagMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded-lg text-xs font-semibold hover:bg-slate-100"
                    >
                      全部標籤 ({boardTasks.length})
                    </button>
                    <div className="mt-1 pt-1 border-t border-slate-100 space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setTagFilter(tag === tagFilter ? "all" : tag);
                            setIsTagMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1 rounded-lg text-xs flex items-center justify-between ${
                            tagFilter === tag ? "text-orange-600 font-bold bg-orange-50" : "hover:bg-slate-100"
                          }`}
                        >
                          <span>#{tag}</span>
                          {tagFilter === tag && <Check className="w-3 h-3 text-orange-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Star Filter */}
              <button
                onClick={() => setPriorityFilter(priorityFilter === "high" ? "all" : "high")}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  priorityFilter === "high"
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-white/10 hover:bg-white/20 text-white/90"
                }`}
                title="僅看重要星號卡片"
              >
                <Star className={`w-3 h-3 ${priorityFilter === "high" ? "fill-slate-950" : ""}`} />
                <span>重要</span>
              </button>

              {/* Multi-select Mode */}
              <button
                onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isMultiSelectMode
                    ? "bg-orange-500 text-white font-bold"
                    : "bg-white/10 hover:bg-white/20 text-white/90"
                }`}
                title="多選模式"
              >
                <CheckSquare className="w-3 h-3" />
                <span>多選</span>
                {selectedTaskIds.length > 0 && (
                  <span className="w-3.5 h-3.5 rounded-full bg-white text-orange-600 text-[9px] font-black flex items-center justify-center">
                    {selectedTaskIds.length}
                  </span>
                )}
              </button>

              {/* Workflow Settings */}
              <button
                onClick={() => setIsColumnManagerOpen(true)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
                title="自訂流程欄位"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* --- COMPACT MODE CONTROLS (Rendered when width < 720px - Matching Screenshot) --- */}
          {isCompact && (
            <div className="flex items-center gap-1">
              {/* Filter Button (≡) */}
              <div className="relative">
                <button
                  onClick={() => {
                    const state = isFilterMenuOpen;
                    closeAllMenus();
                    setIsFilterMenuOpen(!state);
                  }}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                    tagFilter !== "all" || priorityFilter === "high"
                      ? "bg-orange-500 text-white font-bold"
                      : "bg-white/10 hover:bg-white/20 text-white/90"
                  }`}
                  title="篩選器 (標籤/重要)"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {(tagFilter !== "all" || priorityFilter === "high") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>

                {isFilterMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-1 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>篩選選項</span>
                      {(tagFilter !== "all" || priorityFilter === "high") && (
                        <button
                          onClick={() => {
                            setTagFilter("all");
                            setPriorityFilter("all");
                          }}
                          className="text-[10px] text-orange-600 font-medium hover:underline"
                        >
                          重設
                        </button>
                      )}
                    </div>

                    {/* Star Toggle */}
                    <button
                      onClick={() => setPriorityFilter(priorityFilter === "high" ? "all" : "high")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between mb-1.5 transition-colors ${
                        priorityFilter === "high"
                          ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Star
                          className={`w-3.5 h-3.5 ${
                            priorityFilter === "high" ? "fill-amber-500 text-amber-500" : ""
                          }`}
                        />
                        <span>僅看重要卡片</span>
                      </span>
                      {priorityFilter === "high" && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>

                    {/* Tag List */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5">
                      <div className="text-[10px] text-slate-400 font-semibold px-1 mb-1">
                        依標籤篩選
                      </div>
                      <button
                        onClick={() => setTagFilter("all")}
                        className={`w-full text-left px-2.5 py-1 rounded-lg text-xs flex items-center justify-between ${
                          tagFilter === "all" ? "text-orange-600 font-bold bg-orange-50" : "hover:bg-slate-100"
                        }`}
                      >
                        <span>全部標籤</span>
                        {tagFilter === "all" && <Check className="w-3 h-3 text-orange-600" />}
                      </button>
                      <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-0.5 mt-1">
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setTagFilter(tag === tagFilter ? "all" : tag)}
                            className={`w-full text-left px-2.5 py-1 rounded-lg text-xs flex items-center justify-between ${
                              tagFilter === tag ? "text-orange-600 font-bold bg-orange-50" : "hover:bg-slate-100"
                            }`}
                          >
                            <span>#{tag}</span>
                            {tagFilter === tag && <Check className="w-3 h-3 text-orange-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* More Button (···) */}
              <div className="relative">
                <button
                  onClick={() => {
                    const state = isMoreMenuOpen;
                    closeAllMenus();
                    setIsMoreMenuOpen(!state);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
                  title="看板選單 (檢視/多選/流程)"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      檢視模式
                    </div>
                    {(isCompact
                      ? (["kanban", "list"] as const)
                      : (["kanban", "calendar", "table", "list"] as const)
                    ).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setViewMode(mode);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          viewMode === mode ? "text-orange-600 font-bold bg-orange-50/50" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {VIEW_CONFIG[mode].icon}
                          <span>{VIEW_CONFIG[mode].label}模式</span>
                        </span>
                        {viewMode === mode && <Check className="w-3.5 h-3.5 text-orange-600" />}
                      </button>
                    ))}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1 space-y-1">
                      {/* Multi-Select Toggle */}
                      <button
                        onClick={() => {
                          setIsMultiSelectMode(!isMultiSelectMode);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          isMultiSelectMode ? "text-orange-600 font-bold" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>多選模式</span>
                        </span>
                        {isMultiSelectMode && <Check className="w-3.5 h-3.5 text-orange-600" />}
                      </button>

                      {/* Column Workflow Settings */}
                      <button
                        onClick={() => {
                          setIsColumnManagerOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                        <span>自訂流程欄位</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area Inside Container */}
      <div className="flex-1 h-full min-h-0 overflow-hidden relative">
        {viewMode === "kanban" && <KanbanContainer />}
        {viewMode === "calendar" && <CalendarView />}
        {viewMode === "table" && <TableView />}
        {viewMode === "list" && <ListView />}
      </div>
    </div>
  );
};
