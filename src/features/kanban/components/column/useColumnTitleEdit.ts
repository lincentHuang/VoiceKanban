import { useState, useRef, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useColumnTitleEdit(columnId: string, initialTitle: string) {
  const { updateColumnInActiveBoard } = useKanbanStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(initialTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditingTitle) setTitleInput(initialTitle);
  }, [initialTitle, isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== initialTitle) {
      updateColumnInActiveBoard(columnId, trimmed);
    } else {
      setTitleInput(initialTitle);
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleInput(initialTitle);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter that confirms an IME candidate must not commit the rename.
    if (e.nativeEvent.isComposing || e.key === "Process") return;
    if (e.key === "Enter") {
      e.preventDefault(); e.stopPropagation(); handleSaveTitle();
    } else if (e.key === "Escape") {
      e.preventDefault(); e.stopPropagation(); handleCancelTitle();
    }
  };

  return {
    isEditingTitle, setIsEditingTitle, titleInput, setTitleInput, titleInputRef,
    handleSaveTitle, handleCancelTitle, handleTitleKeyDown,
  };
}
