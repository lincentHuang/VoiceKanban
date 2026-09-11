import { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Column } from "@/core/types/task";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { DEFAULT_BOARD_BACKGROUND_ID } from "../../utils/boardBackgrounds";

export type BoardManagerTabId = "columns" | "general" | "sharing" | "appearance";

export function useBoardManagerModal() {
  const {
    isBoardManagerOpen,
    setIsBoardManagerOpen,
    getActiveBoardColumns,
    deleteColumnFromActiveBoard,
    reorderBoardColumns,
    updateBoard,
    setDeletingBoardId,
    setIsShareBoardModalOpen,
    boards,
    activeBoardId,
  } = useKanbanStore();

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const [activeTab, setActiveTab] = useState<BoardManagerTabId>("columns");

  // Columns tab state
  const [localColumns, setLocalColumns] = useState<Column[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("✨");
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("✨");

  // General tab state
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📌");
  const [description, setDescription] = useState("");

  // Appearance tab state
  const [background, setBackground] = useState(DEFAULT_BOARD_BACKGROUND_ID);

  useEffect(() => {
    if (isBoardManagerOpen) {
      setActiveTab("columns");
      setLocalColumns(getActiveBoardColumns());
      setEditingColId(null);
      setNewTitle("");
      setNewIcon("✨");
      setName(activeBoard?.name || "");
      setIcon(activeBoard?.icon || "📌");
      setDescription(activeBoard?.description || "");
      setBackground(activeBoard?.background || DEFAULT_BOARD_BACKGROUND_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBoardManagerOpen, activeBoardId]);

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

  const handleStartEdit = (colId: string, title: string, colIcon: string) => {
    setEditingColId(colId);
    setEditTitle(title);
    setEditIcon(colIcon || "");
  };

  const handleSaveEdit = (colId: string) => {
    if (!editTitle.trim()) return;
    setLocalColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, title: editTitle.trim(), icon: editIcon } : c))
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

  const handleClose = () => setIsBoardManagerOpen(false);

  const handleConfirmFinish = () => {
    if (!activeBoard) {
      setIsBoardManagerOpen(false);
      return;
    }

    const currentStoreCols = getActiveBoardColumns();
    const deletedColIds = currentStoreCols
      .map((c) => c.id)
      .filter((id) => !localColumns.some((lc) => lc.id === id));
    deletedColIds.forEach((id) => deleteColumnFromActiveBoard(id));
    reorderBoardColumns(activeBoardId, localColumns);

    updateBoard(activeBoard.id, {
      name: name.trim() || activeBoard.name,
      icon,
      description: description.trim(),
      background,
    });

    setIsBoardManagerOpen(false);
  };

  const handleOpenDelete = () => {
    if (!activeBoard) return;
    setIsBoardManagerOpen(false);
    setDeletingBoardId(activeBoard.id);
  };

  const handleOpenSharing = () => {
    setIsBoardManagerOpen(false);
    setIsShareBoardModalOpen(true);
  };

  return {
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

    canDeleteBoard: boards.length > 1,
    handleOpenDelete,
    handleOpenSharing,

    handleClose,
    handleConfirmFinish,
  };
}
