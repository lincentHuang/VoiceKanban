"use client";

import React from "react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { useColumnManagerModal } from "./column-manager/useColumnManagerModal";
import { ColumnManagerHeader } from "./column-manager/ColumnManagerHeader";
import { ColumnManagerDndList } from "./column-manager/ColumnManagerDndList";
import { ColumnManagerAddForm } from "./column-manager/ColumnManagerAddForm";

export const ColumnManagerModal: React.FC = () => {
  const {
    isColumnManagerOpen,
    setIsColumnManagerOpen,
    activeBoard,
    localColumns,
    newTitle,
    setNewTitle,
    newIcon,
    setNewIcon,
    editingColId,
    setEditingColId,
    editTitle,
    setEditTitle,
    editIcon,
    setEditIcon,
    handleAddColumn,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteColumn,
    handleDragEnd,
    handleConfirmFinish,
  } = useColumnManagerModal();

  useEscapeKey(() => {
    if (isColumnManagerOpen) {
      setIsColumnManagerOpen(false);
    }
  }, isColumnManagerOpen);

  if (!isColumnManagerOpen) return null;

  return (
    <div
      onClick={() => setIsColumnManagerOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden"
      >
        <ColumnManagerHeader activeBoard={activeBoard} onClose={() => setIsColumnManagerOpen(false)} />

        <div className="flex-1 overflow-y-auto custom-scrollbar my-4 pr-1 space-y-4">
          <ColumnManagerDndList
            localColumns={localColumns}
            editingColId={editingColId}
            editTitle={editTitle}
            editIcon={editIcon}
            setEditingColId={setEditingColId}
            setEditTitle={setEditTitle}
            setEditIcon={setEditIcon}
            handleStartEdit={handleStartEdit}
            handleSaveEdit={handleSaveEdit}
            handleDeleteColumn={handleDeleteColumn}
            handleDragEnd={handleDragEnd}
          />

          <ColumnManagerAddForm
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newIcon={newIcon}
            setNewIcon={setNewIcon}
            onAddColumn={handleAddColumn}
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsColumnManagerOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirmFinish}
            className="px-5 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
export default ColumnManagerModal;
