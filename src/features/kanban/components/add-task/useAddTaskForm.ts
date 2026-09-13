import { useState, useEffect, useMemo } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ColumnId } from "@/core/types/task";

export function useAddTaskForm() {
  const {
    isAddTaskModalOpen,
    setIsAddTaskModalOpen,
    addTaskDefaultColumn,
    activeBoardId,
    getActiveBoardColumns,
    addTask,
    tasks,
  } = useKanbanStore();

  // Tag vocabulary shared with the picker, so a new task can reuse existing tags.
  const { allTags, tagCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => t.tags?.forEach((tag) => { if (tag) counts[tag] = (counts[tag] || 0) + 1; }));
    return { allTags: Object.keys(counts), tagCounts: counts };
  }, [tasks]);

  const columns = getActiveBoardColumns();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState<ColumnId>(() => {
    const validCols = columns.map((c) => c.id);
    if (addTaskDefaultColumn === "inbox" || validCols.includes(addTaskDefaultColumn)) {
      return addTaskDefaultColumn;
    }
    return validCols[0] || "todo";
  });
  const [isStarred, setIsStarred] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [isAllDay, setIsAllDay] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAddTaskModalOpen) {
      const validCols = columns.map((c) => c.id);
      if (addTaskDefaultColumn === "inbox" || validCols.includes(addTaskDefaultColumn)) {
        setColumnId(addTaskDefaultColumn);
      } else {
        setColumnId(validCols[0] || "todo");
      }
    }
  }, [isAddTaskModalOpen, addTaskDefaultColumn, columns]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleToggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      addTask({
        title: title.trim(),
        description: description.trim(),
        boardId: columnId === "inbox" ? "global" : activeBoardId,
        columnId,
        isStarred,
        tags,
        startDate: startDate || null,
        dueDate: dueDate || null,
        isAllDay,
        completed: false,
      });

      setTitle("");
      setDescription("");
      setIsStarred(false);
      setDueDate(null);
      setStartDate(null);
      setIsAllDay(false);
      setTags([]);
      setIsAddTaskModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isAddTaskModalOpen,
    setIsAddTaskModalOpen,
    columns,
    title,
    setTitle,
    description,
    setDescription,
    columnId,
    setColumnId,
    isStarred,
    setIsStarred,
    dueDate,
    setDueDate,
    startDate,
    setStartDate,
    isAllDay,
    setIsAllDay,
    tagInput,
    setTagInput,
    tags,
    allTags,
    tagCounts,
    isSubmitting,
    handleAddTag,
    handleRemoveTag,
    handleToggleTag,
    handleSubmit,
  };
}
