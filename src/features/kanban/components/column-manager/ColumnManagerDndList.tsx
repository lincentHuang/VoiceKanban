"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  Modifier,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column } from "@/core/types/task";
import { SortableColumnRow } from "./SortableColumnRow";

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

interface ColumnManagerDndListProps {
  localColumns: Column[];
  editingColId: string | null;
  editTitle: string;
  editIcon: string;
  setEditingColId: (id: string | null) => void;
  setEditTitle: (title: string) => void;
  setEditIcon: (icon: string) => void;
  handleStartEdit: (colId: string, title: string, icon: string) => void;
  handleSaveEdit: (colId: string) => void;
  handleDeleteColumn: (colId: string) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const ColumnManagerDndList: React.FC<ColumnManagerDndListProps> = ({
  localColumns,
  editingColId,
  editTitle,
  editIcon,
  setEditingColId,
  setEditTitle,
  setEditIcon,
  handleStartEdit,
  handleSaveEdit,
  handleDeleteColumn,
  handleDragEnd,
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          現有狀態欄位 ({localColumns.length})
        </label>
        <span className="text-[11px] text-slate-400">
          按住左側 ⋮⋮ 拖曳調整順序 (點擊完成後生效)
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localColumns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {localColumns.map((col) => (
              <SortableColumnRow
                key={col.id}
                col={col}
                isEditing={editingColId === col.id}
                editTitle={editTitle}
                editIcon={editIcon}
                onStartEdit={() => handleStartEdit(col.id, col.title, col.icon)}
                onSaveEdit={() => handleSaveEdit(col.id)}
                onCancelEdit={() => setEditingColId(null)}
                onEditTitleChange={setEditTitle}
                onEditIconChange={setEditIcon}
                onDelete={() => handleDeleteColumn(col.id)}
                canDelete={localColumns.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
