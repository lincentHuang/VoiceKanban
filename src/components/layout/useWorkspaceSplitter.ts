"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useWorkspaceSplitter() {
  const {
    inboxWidth,
    setInboxWidth,
    isInboxSidebarOpen,
    setIsInboxSidebarOpen,
    isDraggingSplitter,
    setIsDraggingSplitter,
  } = useKanbanStore();

  const [isDragging, setIsDragging] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setIsDraggingSplitter(true);
  }, [setIsDraggingSplitter]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const clientX = e.clientX;
        const screenWidth = window.innerWidth;

        if (clientX < 200) {
          setIsInboxSidebarOpen(false);
          setIsDragging(false);
          setIsDraggingSplitter(false);
          return;
        }

        const maxInboxWidth = Math.max(300, screenWidth - 380);
        const newWidth = Math.min(Math.max(clientX - 12, 220), maxInboxWidth);
        setInboxWidth(newWidth);
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setIsDraggingSplitter(false);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      }
    };

    if (isDragging) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging, setInboxWidth, setIsInboxSidebarOpen, setIsDraggingSplitter]);

  return {
    isInboxSidebarOpen,
    isDragging,
    handleMouseDown,
  };
}
