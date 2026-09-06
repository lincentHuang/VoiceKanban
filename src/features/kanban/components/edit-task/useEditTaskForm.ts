import { useState, useEffect } from "react";
import { Task, ColumnId, CoverAspectRatio } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useEditTaskForm(task: Task | undefined) {
  const { updateTask } = useKanbanStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [boardId, setBoardId] = useState("");
  const [columnId, setColumnId] = useState<ColumnId>("inbox");
  const [isStarred, setIsStarred] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [isAllDay, setIsAllDay] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [coverColor, setCoverColor] = useState<string>("");
  const [coverAspectRatio, setCoverAspectRatio] = useState<CoverAspectRatio>("banner");
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setBoardId(task.boardId);
      setColumnId(task.columnId);
      setIsStarred(!!task.isStarred);
      setDueDate(task.dueDate || null);
      setStartDate(task.startDate || null);
      setIsAllDay(!!task.isAllDay);
      setTags(task.tags || []);
      setCoverColor(task.coverColor || "");
      setCoverAspectRatio(
        task.coverAspectRatio ||
        (task.coverColor?.startsWith("data:image") || task.coverColor?.startsWith("http") ? "banner" : "bar")
      );
      setSaveToast(false);
    }
  }, [task]);

  const handleSave = (customDescOrEvent?: string | React.FormEvent) => {
    if (typeof customDescOrEvent === "object" && customDescOrEvent !== null && "preventDefault" in customDescOrEvent) {
      customDescOrEvent.preventDefault();
    }
    if (!task || !title.trim()) return;

    const finalDescription = typeof customDescOrEvent === "string" ? customDescOrEvent : description;
    updateTask(task.id, {
      title: title.trim(),
      description: finalDescription.trim(),
      boardId, columnId, isStarred, tags, coverColor, coverAspectRatio,
      startDate: startDate || null, dueDate: dueDate || null, isAllDay, completed: task.completed,
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1500);
  };

  const handleApplyCover = (val: string, ratio?: CoverAspectRatio) => {
    if (!task) return;
    const newRatio = ratio || coverAspectRatio || (val.startsWith("data:image") || val.startsWith("http") ? "banner" : "bar");
    setCoverColor(val);
    setCoverAspectRatio(newRatio);
    updateTask(task.id, { coverColor: val, coverAspectRatio: newRatio });
  };

  return {
    title, setTitle, description, setDescription, boardId, setBoardId, columnId, setColumnId,
    isStarred, setIsStarred, dueDate, setDueDate, startDate, setStartDate, isAllDay, setIsAllDay,
    tags, setTags, coverColor, setCoverColor, coverAspectRatio, setCoverAspectRatio, saveToast,
    handleSave, handleApplyCover,
  };
}
