"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export const WorkspaceSplitter: React.FC = () => {
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

        // Auto-close inbox if dragged too far left (< 200px)
        if (clientX < 200) {
          setIsInboxSidebarOpen(false);
          setIsDragging(false);
          setIsDraggingSplitter(false);
          return;
        }

        // Board minimum width is 360px. Max allowed inbox width is screenWidth - 360px - margins
        const maxInboxWidth = Math.max(300, screenWidth - 380);

        // Clamp inbox width between 220px and maxInboxWidth
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

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        width: isInboxSidebarOpen ? "0.75rem" : "0px",
        opacity: isInboxSidebarOpen ? 1 : 0,
        pointerEvents: isInboxSidebarOpen ? "auto" : "none",
      }}
      className={`hidden sm:flex group relative h-full shrink-0 items-center justify-center cursor-col-resize select-none z-20 overflow-hidden ${
        isDragging
          ? "bg-orange-500/20 transition-none"
          : "transition-all duration-300 ease-in-out hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
      }`}
      title="拖曳以調整收件匣與看板寬度（小於200px自動收合）"
    >
      {/* Visual Divider Line */}
      <div
        className={`w-[2px] h-full transition-colors ${
          isDragging
            ? "bg-orange-500"
            : "bg-slate-300/80 dark:bg-slate-700/80 group-hover:bg-orange-400"
        }`}
      />

      {/* Center Drag Handle Pill */}
      <div
        className={`absolute w-1.5 h-10 rounded-full transition-all ${
          isDragging
            ? "bg-orange-600 scale-y-125"
            : "bg-slate-400 dark:bg-slate-500 group-hover:bg-orange-500 group-hover:scale-y-110"
        }`}
      />
    </div>
  );
};
