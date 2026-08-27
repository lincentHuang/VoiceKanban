"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { X, Plus, Edit2, Trash2, Check, SlidersHorizontal, Sparkles } from "lucide-react";

const EMOJI_OPTIONS = ["📥", "📋", "⚡", "⏳", "✅", "🧪", "🎨", "🚀", "💡", "📌", "🔍", "🔥", "🎯", "📦"];

export const ColumnManagerModal: React.FC = () => {
  const {
    isColumnManagerOpen,
    setIsColumnManagerOpen,
    getActiveBoardColumns,
    addColumnToActiveBoard,
    updateColumnInActiveBoard,
    deleteColumnFromActiveBoard,
    boards,
    activeBoardId,
  } = useKanbanStore();

  const columns = getActiveBoardColumns();
  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("✨");
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("✨");

  if (!isColumnManagerOpen) return null;

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addColumnToActiveBoard(newTitle.trim(), newIcon);
    setNewTitle("");
    setNewIcon("✨");
  };

  const handleStartEdit = (colId: string, title: string, icon: string) => {
    setEditingColId(colId);
    setEditTitle(title);
    setEditIcon(icon);
  };

  const handleSaveEdit = (colId: string) => {
    if (!editTitle.trim()) return;
    updateColumnInActiveBoard(colId, editTitle.trim(), editIcon);
    setEditingColId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                狀態流程管理 (Workflow)
              </h3>
              <p className="text-xs text-slate-500">
                看板「{activeBoard?.name}」的欄位增減與命名
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsColumnManagerOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Columns List */}
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            現有狀態欄位 ({columns.length})
          </label>

          {columns.map((col, idx) => (
            <div
              key={col.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
            >
              {editingColId === col.id ? (
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <select
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="p-1 rounded-lg border text-sm bg-white dark:bg-slate-700"
                  >
                    {EMOJI_OPTIONS.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-700 font-semibold"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(col.id)}
                    className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{col.icon}</span>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {col.title}
                    </span>
                    {col.isCustom && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 font-semibold">
                        自訂
                      </span>
                    )}
                  </div>
                </div>
              )}

              {editingColId !== col.id && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(col.id, col.title, col.icon)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="編輯名稱"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {columns.length > 1 && (
                    <button
                      onClick={() => deleteColumnFromActiveBoard(col.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="刪除此欄位 (內部任務將自動移轉)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Column Form */}
        <form onSubmit={handleAddColumn} className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            + 新增自訂狀態欄位
          </label>

          <div className="flex items-center gap-2">
            <select
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              {EMOJI_OPTIONS.map((em) => (
                <option key={em} value={em}>
                  {em}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="例如：🧪 測試驗收、🎨 設計審查..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all"
            >
              新增
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-4 mt-2 flex justify-end">
          <button
            onClick={() => setIsColumnManagerOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
