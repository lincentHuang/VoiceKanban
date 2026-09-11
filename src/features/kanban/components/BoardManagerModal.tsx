"use client";

import React from "react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { useBoardManagerModal } from "./board-manager/useBoardManagerModal";
import { BoardManagerHeader } from "./board-manager/BoardManagerHeader";
import { BoardManagerTabs } from "./board-manager/BoardManagerTabs";
import { ColumnsTab } from "./board-manager/ColumnsTab";
import { GeneralTab } from "./board-manager/GeneralTab";
import { SharingTab } from "./board-manager/SharingTab";
import { AppearanceTab } from "./board-manager/AppearanceTab";

export const BoardManagerModal: React.FC = () => {
  const {
    isBoardManagerOpen,
    activeBoard,
    activeTab,
    setActiveTab,
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
    name,
    setName,
    icon,
    setIcon,
    description,
    setDescription,
    background,
    setBackground,
    canDeleteBoard,
    handleOpenDelete,
    handleOpenSharing,
    handleClose,
    handleConfirmFinish,
  } = useBoardManagerModal();

  useEscapeKey(() => {
    if (isBoardManagerOpen) handleClose();
  }, isBoardManagerOpen);

  if (!isBoardManagerOpen) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden"
      >
        <BoardManagerHeader activeBoard={activeBoard} onClose={handleClose} />
        <BoardManagerTabs activeTab={activeTab} onSelectTab={setActiveTab} />

        <div className="flex-1 overflow-y-auto custom-scrollbar my-4 pr-1">
          {activeTab === "columns" && (
            <ColumnsTab
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
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              newIcon={newIcon}
              setNewIcon={setNewIcon}
              onAddColumn={handleAddColumn}
            />
          )}

          {activeTab === "general" && (
            <GeneralTab
              name={name}
              onSetName={setName}
              icon={icon}
              onSetIcon={setIcon}
              description={description}
              onSetDescription={setDescription}
              canDeleteBoard={canDeleteBoard}
              onDeleteBoard={handleOpenDelete}
            />
          )}

          {activeTab === "sharing" && (
            <SharingTab activeBoard={activeBoard} onOpenSharing={handleOpenSharing} />
          )}

          {activeTab === "appearance" && (
            <AppearanceTab background={background} onSetBackground={setBackground} />
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClose}
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
export default BoardManagerModal;
