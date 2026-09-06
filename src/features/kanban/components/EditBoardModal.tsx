"use client";

import React, { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { EditBoardHeader } from "./edit-board/EditBoardHeader";
import { EditBoardFields } from "./edit-board/EditBoardFields";
import { EditBoardFooter } from "./edit-board/EditBoardFooter";

export const EditBoardModal: React.FC = () => {
  const {
    boards,
    editingBoardId,
    setEditingBoardId,
    updateBoard,
    setDeletingBoardId,
  } = useKanbanStore();

  const boardToEdit = boards.find((b) => b.id === editingBoardId);
  const isOpen = !!editingBoardId && !!boardToEdit;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📌");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (boardToEdit) {
      setName(boardToEdit.name || "");
      setIcon(boardToEdit.icon || "📌");
      setDescription(boardToEdit.description || "");
    }
  }, [boardToEdit]);

  useEscapeKey(() => {
    if (isOpen) setEditingBoardId(null);
  }, isOpen);

  if (!isOpen || !boardToEdit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateBoard(boardToEdit.id, {
      name: name.trim(),
      icon,
      description: description.trim(),
    });
    setEditingBoardId(null);
  };

  const handleOpenDelete = () => {
    const currentId = boardToEdit.id;
    setEditingBoardId(null);
    setDeletingBoardId(currentId);
  };

  return (
    <div
      onClick={() => setEditingBoardId(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 relative overflow-hidden"
      >
        <EditBoardHeader onClose={() => setEditingBoardId(null)} />

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <EditBoardFields
            name={name}
            onSetName={setName}
            icon={icon}
            onSetIcon={setIcon}
            description={description}
            onSetDescription={setDescription}
          />

          <EditBoardFooter
            canDelete={boards.length > 1}
            isSubmitDisabled={!name.trim()}
            onCancel={() => setEditingBoardId(null)}
            onDelete={handleOpenDelete}
          />
        </form>
      </div>
    </div>
  );
};

export default EditBoardModal;
