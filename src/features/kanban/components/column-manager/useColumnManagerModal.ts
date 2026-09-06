import { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Column } from "@/core/types/task";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export function useColumnManagerModal() {
  const {
    isColumnManagerOpen,
    setIsColumnManagerOpen,
    getActiveBoardColumns,
    deleteColumnFromActiveBoard,
    reorderBoardColumns,
    boards,
    activeBoardId,
  } = useKanbanStore();

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const [localColumns, setLocalColumns] = useState<Column[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("✨");
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("✨");

  useEffect(() => {
    if (isColumnManagerOpen) {
      setLocalColumns(getActiveBoardColumns());
      setEditingColId(null);
      setNewTitle("");
      setNewIcon("✨");
    }
  }, [isColumnManagerOpen, activeBoardId, getActiveBoardColumns]);

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCol: Column = {
      id: `col-${Date.now()}`,
      title: newTitle.trim(),
      icon: newIcon,
      color: "#3b82f6",
      isCustom: true,
    };
    setLocalColumns((prev) => [...prev, newCol]);
    setNewTitle("");
    setNewIcon("✨");
  };

  const handleStartEdit = (colId: string, title: string, icon: string) => {
    setEditingColId(colId);
    setEditTitle(title);
    setEditIcon(icon || "");
  };

  const handleSaveEdit = (colId: string) => {
    if (!editTitle.trim()) return;
    setLocalColumns((prev) =>
      prev.map((c) =>
        c.id === colId ? { ...c, title: editTitle.trim(), icon: editIcon } : c
      )
    );
    setEditingColId(null);
  };

  const handleDeleteColumn = (colId: string) => {
    if (localColumns.length <= 1) return;
    setLocalColumns((prev) => prev.filter((c) => c.id !== colId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localColumns.findIndex((c) => c.id === active.id);
      const newIndex = localColumns.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setLocalColumns((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  const handleConfirmFinish = () => {
    const currentStoreCols = getActiveBoardColumns();
    const deletedColIds = currentStoreCols
      .map((c) => c.id)
      .filter((id) => !localColumns.some((lc) => lc.id === id));

    deletedColIds.forEach((id) => {
      deleteColumnFromActiveBoard(id);
    });

    reorderBoardColumns(activeBoardId, localColumns);
    setIsColumnManagerOpen(false);
  };

  return {
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
  };
}
