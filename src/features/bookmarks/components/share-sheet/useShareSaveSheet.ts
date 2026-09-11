"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Task, TaskLink } from "@/core/types/task";
import { LinkPreview } from "../../types";
import { fetchLinkPreview } from "../../services/linkPreviewService";
import { buildSharedDraft, getDisplayHost, toCardTitle } from "../../utils/linkParser";

export type ShareSheetStatus = "idle" | "loading" | "ready" | "saved";

export function useShareSaveSheet() {
  const pendingShare = useKanbanStore((s) => s.pendingShare);
  const setPendingShare = useKanbanStore((s) => s.setPendingShare);
  const saveLinkToCollection = useKanbanStore((s) => s.saveLinkToCollection);
  const openCollectionBoard = useKanbanStore((s) => s.openCollectionBoard);
  const tasks = useKanbanStore((s) => s.tasks);
  const boards = useKanbanStore((s) => s.boards);

  const [status, setStatus] = useState<ShareSheetStatus>("idle");
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [savedTask, setSavedTask] = useState<Task | null>(null);
  const isTitleEditedRef = useRef(false);

  const url = pendingShare?.url ?? null;

  useEffect(() => {
    setPreview(null);
    setSavedTask(null);
    setNote("");
    isTitleEditedRef.current = false;

    if (!pendingShare || !url) {
      setStatus("idle");
      setTitle("");
      return;
    }

    setTitle(toCardTitle(pendingShare.sharedTitle) || getDisplayHost(url));
    setStatus("loading");

    const controller = new AbortController();
    fetchLinkPreview(url, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setPreview(result);
      const previewTitle = toCardTitle(result?.title);
      if (previewTitle && !isTitleEditedRef.current) setTitle(previewTitle);
      setStatus((current) => (current === "saved" ? current : "ready"));
    });
    return () => controller.abort();
  }, [pendingShare, url]);

  const duplicateTask = useMemo(
    () => (url && status !== "saved" ? tasks.find((t) => t.link?.url === url && !t.isArchived) : undefined),
    [tasks, url, status]
  );

  const savedLocation = useMemo(() => {
    if (!savedTask) return null;
    const board = boards.find((b) => b.id === savedTask.boardId);
    const column = board?.columns?.find((c) => c.id === savedTask.columnId);
    return { boardName: board?.name || "收藏", columnTitle: column?.title || "" };
  }, [savedTask, boards]);

  const handleTitleChange = (value: string) => {
    isTitleEditedRef.current = true;
    setTitle(value);
  };

  const handleSave = () => {
    if (!pendingShare || !url || status === "saved") return;
    const link: TaskLink = {
      url,
      platform: pendingShare.platform,
      title: preview?.title ?? pendingShare.sharedTitle ?? null,
      description: preview?.description ?? null,
      thumbnailUrl: preview?.thumbnailUrl ?? null,
      author: preview?.author ?? null,
      siteName: preview?.siteName ?? null,
      savedAt: new Date().toISOString(),
    };
    const task = saveLinkToCollection({ title: title.trim() || getDisplayHost(url), note: note.trim(), link });
    setSavedTask(task);
    setStatus("saved");
  };

  /** Returns false when the pasted text contains no URL so the form can show an error. */
  const handleSubmitManualUrl = (text: string): boolean => {
    const draft = buildSharedDraft({ text });
    if (!draft.url) return false;
    setPendingShare(draft);
    return true;
  };

  const close = () => setPendingShare(null);

  const viewCollection = () => {
    openCollectionBoard();
    setPendingShare(null);
  };

  return {
    pendingShare,
    url,
    status,
    preview,
    title,
    note,
    duplicateTask,
    savedLocation,
    setNote,
    handleTitleChange,
    handleSave,
    handleSubmitManualUrl,
    close,
    viewCollection,
  };
}
