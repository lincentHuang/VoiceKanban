"use client";

import React from "react";
import { Column } from "@/core/types/task";
import { DragEndEvent } from "@dnd-kit/core";
import { ColumnManagerDndList } from "../column-manager/ColumnManagerDndList";
import { ColumnManagerAddForm } from "../column-manager/ColumnManagerAddForm";

interface ColumnsTabProps {
  localColumns: Column[];
  editingColId: string | null;
  editTitle: string;
  editIcon: string;
  setEditingColId: (id: string | null) => void;
  setEditTitle: (title: string) => void;
  setEditIcon: (icon: string) => void;
  handleStartEdit: (colId: string, title: string, icon: string) => void;
  handleSaveEdit: (colId: string) => void;
  handleDeleteColumn: (colId: string) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newIcon: string;
  setNewIcon: (val: string) => void;
  onAddColumn: (e: React.FormEvent) => void;
}

export const ColumnsTab: React.FC<ColumnsTabProps> = ({
  localColumns,
  editingColId,
  editTitle,
  editIcon,
  setEditingColId,
  setEditTitle,
  setEditIcon,
  handleStartEdit,
  handleSaveEdit,
  handleDeleteColumn,
  handleDragEnd,
  newTitle,
  setNewTitle,
  newIcon,
  setNewIcon,
  onAddColumn,
}) => {
  return (
    <div className="space-y-4">
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
        onAddColumn={onAddColumn}
      />
    </div>
  );
};
