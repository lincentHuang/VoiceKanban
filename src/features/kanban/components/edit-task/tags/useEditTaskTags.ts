import { useState, useRef, useMemo, useEffect } from "react";

interface UseEditTaskTagsParams {
  tags: string[];
  allTags: string[];
  tagCounts?: Record<string, number>;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function useEditTaskTags({
  tags,
  allTags,
  tagCounts,
  onAddTag,
  onRemoveTag,
}: UseEditTaskTagsParams) {
  const [tagInput, setTagInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = tagInput.trim();

  const options = useMemo(() => {
    const pool = Array.from(new Set([...tags, ...allTags])).filter(Boolean);
    const lower = trimmed.toLowerCase();
    return pool
      .filter((t) => !lower || t.toLowerCase().includes(lower))
      .sort((a, b) => {
        const aSel = tags.includes(a) ? 0 : 1;
        const bSel = tags.includes(b) ? 0 : 1;
        if (aSel !== bSel) return aSel - bSel;
        return (tagCounts?.[b] || 0) - (tagCounts?.[a] || 0);
      });
  }, [tags, allTags, tagCounts, trimmed]);

  const canCreate =
    trimmed.length > 0 &&
    !options.some((t) => t.toLowerCase() === trimmed.toLowerCase());

  const handleToggle = (tag: string) => {
    if (tags.includes(tag)) onRemoveTag(tag);
    else onAddTag(tag);
    setTagInput("");
    inputRef.current?.focus();
  };

  const handleAdd = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) onAddTag(value);
    setTagInput("");
  };

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  return {
    tagInput,
    setTagInput,
    isOpen,
    setIsOpen,
    containerRef,
    inputRef,
    trimmed,
    options,
    canCreate,
    handleToggle,
    handleAdd,
  };
}
