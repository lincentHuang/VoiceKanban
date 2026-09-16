"use client";

import React, { useState, useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import { SidebarInbox } from "@/features/inbox/components/SidebarInbox";
import { BoardCanvasContainer } from "@/features/kanban/components/BoardCanvasContainer";
import { useUnifiedDnD } from "./dnd/useUnifiedDnD";
import { WorkspaceDragOverlay } from "./dnd/WorkspaceDragOverlay";

export const UnifiedDnDWorkspace: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const {
    sensors,
    collisionDetectionStrategy,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeTask,
    activeColumn,
    activeColumnTasks,
  } = useUnifiedDnD();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex-1 min-h-0 w-full flex p-2.5 sm:p-3 items-start overflow-hidden gap-3">
        <SidebarInbox />
        <BoardCanvasContainer />
      </div>
    );
  }

  return (
    <DndContext
      id="voice-kanban-unified-dnd"
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      autoScroll={{
        threshold: { x: 0, y: 0.15 },
        acceleration: 15,
        interval: 10,
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 min-h-0 w-full flex p-2.5 pt-0 sm:pt-3 sm:p-3 items-start overflow-hidden gap-3 relative">
        <SidebarInbox />
        <BoardCanvasContainer />
      </div>

      <WorkspaceDragOverlay
        activeColumn={activeColumn}
        activeTask={activeTask}
        activeColumnTasks={activeColumnTasks}
      />
    </DndContext>
  );
};
