import { useState, useEffect, useRef, useMemo } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useSearchModal() {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    searchQuery,
    setSearchQuery,
    tasks,
    activeBoardId,
    getActiveBoardColumns,
    setEditingTaskId,
  } = useKanbanStore();

  const [inputVal, setInputVal] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setInputVal(searchQuery || "");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isSearchModalOpen, searchQuery]);

  const columns = getActiveBoardColumns();
  const columnMap = useMemo(() => {
    const map = new Map<string, { title: string; color?: string }>();
    columns.forEach((c) => {
      map.set(c.id, { title: c.title, color: c.color });
    });
    map.set("inbox", { title: "收件匣", color: "#64748b" });
    return map;
  }, [columns]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((t) => {
      t.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).slice(0, 8);
  }, [tasks]);

  const searchResults = useMemo(() => {
    const q = inputVal.trim().toLowerCase();
    if (!q) {
      return tasks
        .filter((t) => t.isStarred || t.boardId === activeBoardId)
        .slice(0, 10);
    }

    return tasks.filter((task) => {
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((tag) => tag.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTag;
    });
  }, [inputVal, tasks, activeBoardId]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [inputVal]);

  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  const handleSelectTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsSearchModalOpen(false);
  };

  const handleApplyFilter = () => {
    setSearchQuery(inputVal.trim());
    setIsSearchModalOpen(false);
  };

  const handleClearFilter = () => {
    setInputVal("");
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        searchResults.length > 0 ? (prev + 1) % searchResults.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        searchResults.length > 0
          ? (prev - 1 + searchResults.length) % searchResults.length
          : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectTask(searchResults[selectedIndex].id);
      } else if (inputVal.trim()) {
        handleApplyFilter();
      }
    }
  };

  return {
    isSearchModalOpen,
    setIsSearchModalOpen,
    searchQuery,
    inputVal,
    setInputVal,
    selectedIndex,
    setSelectedIndex,
    inputRef,
    listRef,
    columnMap,
    allTags,
    searchResults,
    handleKeyDown,
    handleSelectTask,
    handleApplyFilter,
    handleClearFilter,
  };
}
