"use client";

import React from "react";
import { useListViewModel } from "./list/useListViewModel";
import { ListColumnCard } from "./list/ListColumnCard";

export const ListView: React.FC = () => {
  const { columns, boardTasks, setEditingTaskId, handleToggleComplete } = useListViewModel();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      {columns.map((column) => {
        const columnTasks = boardTasks.filter((t) => t.columnId === column.id);

        return (
          <ListColumnCard
            key={column.id}
            column={column}
            columnTasks={columnTasks}
            onSelectTask={setEditingTaskId}
            onToggleComplete={handleToggleComplete}
          />
        );
      })}
    </div>
  );
};
