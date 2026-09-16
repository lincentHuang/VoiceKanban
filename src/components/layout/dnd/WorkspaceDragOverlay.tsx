"use client";

import React from "react";
import { DragOverlay } from "@dnd-kit/core";
import { Column, Task } from "@/core/types/task";
import { KanbanColumn } from "@/features/kanban/components/KanbanColumn";
import { TaskCard } from "@/features/kanban/components/TaskCard";

interface WorkspaceDragOverlayProps {
  activeColumn: Column | null;
  activeTask: Task | null;
  activeColumnTasks: Task[];
}

export const WorkspaceDragOverlay: React.FC<WorkspaceDragOverlayProps> = ({
  activeColumn,
  activeTask,
  activeColumnTasks,
}) => {
  return (
    <DragOverlay
      dropAnimation={{
        duration: 180,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
      }}
    >
      {activeColumn ? (
        <KanbanColumn
          column={activeColumn}
          tasks={activeColumnTasks}
          isOverlay={true}
        />
      ) : activeTask ? (
        <div
          style={{
            width: activeTask.columnId === "inbox" ? "294px" : "246px",
            transformOrigin: "center center",
          }}
          className="scale-105 rotate-2 shadow-2xl rounded-2xl border-2 border-orange-500 pointer-events-none transition-transform duration-75 select-none cursor-grabbing opacity-100"
        >
          <TaskCard
            task={activeTask}
            variant="card"
            inboxWidth={320}
            isOverlay={true}
          />
        </div>
      ) : null}
    </DragOverlay>
  );
};
