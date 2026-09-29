"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useBatchTagMenu(isOpen: boolean) {
  const {
    tasks,
    selectedTaskIds,
    batchAddTag,
    batchRemoveTag,
    batchToggleTag,
  } = useKanbanStore();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const selectedTasks = useMemo(
    () => tasks.filter((t) => selectedTaskIds.includes(t.id)),
    [tasks, selectedTaskIds]
  );

  const { allWorkspaceTags, tagCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return { allWorkspaceTags: Object.keys(counts), tagCounts: counts };
  }, [tasks]);

  const selectedTagsCoverage = useMemo(() => {
    const coverage: Record<string, "all" | "some"> = {};
    if (selectedTasks.length === 0) return coverage;

    const tagInTasksCount: Record<string, number> = {};
    selectedTasks.forEach((t) => {
      const uniqueTags = new Set(t.tags || []);
      uniqueTags.forEach((tag) => {
        tagInTasksCount[tag] = (tagInTasksCount[tag] || 0) + 1;
      });
    });

    Object.entries(tagInTasksCount).forEach(([tag, count]) => {
      coverage[tag] = count === selectedTasks.length ? "all" : "some";
    });
    return coverage;
  }, [selectedTasks]);

  const appliedTags = useMemo(
    () => Object.keys(selectedTagsCoverage),
    [selectedTagsCoverage]
  );

  const trimmed = query.trim();

  const options = useMemo(() => {
    const pool = Array.from(new Set([...appliedTags, ...allWorkspaceTags])).filter(Boolean);
    const lower = trimmed.toLowerCase();
    return pool
      .filter((t) => !lower || t.toLowerCase().includes(lower))
      .sort((a, b) => {
        const aCov = selectedTagsCoverage[a];
        const bCov = selectedTagsCoverage[b];
        const aRank = aCov === "all" ? 0 : aCov === "some" ? 1 : 2;
        const bRank = bCov === "all" ? 0 : bCov === "some" ? 1 : 2;
        if (aRank !== bRank) return aRank - bRank;
        return (tagCounts[b] || 0) - (tagCounts[a] || 0);
      });
  }, [appliedTags, allWorkspaceTags, selectedTagsCoverage, tagCounts, trimmed]);

  const canCreate =
    trimmed.length > 0 &&
    !allWorkspaceTags.some((t) => t.toLowerCase() === trimmed.toLowerCase());

  const handleCommitTag = (tag: string) => {
    batchToggleTag(tag);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleCreateAndAdd = () => {
    if (!trimmed) return;
    batchAddTag(trimmed);
    setQuery("");
    inputRef.current?.focus();
  };

  return {
    query,
    setQuery,
    inputRef,
    trimmed,
    selectedTasks,
    allWorkspaceTags,
    tagCounts,
    selectedTagsCoverage,
    appliedTags,
    options,
    canCreate,
    batchRemoveTag,
    handleCommitTag,
    handleCreateAndAdd,
  };
}
