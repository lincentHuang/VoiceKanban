import React, { useState } from "react";
import { CheckSquare } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { ChecklistItem } from "@/core/types/task";
import { SortableChecklistItem } from "../SortableChecklistItem";

interface EditTaskChecklistSectionProps {
  taskId: string;
  checklist?: ChecklistItem[];
  onAddChecklistItem: (taskId: string, title: string) => void;
  onUpdateChecklistItem: (taskId: string, itemId: string, title: string) => void;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
  onRemoveChecklistItem: (taskId: string, itemId: string) => void;
  onReorderChecklistItems: (taskId: string, newChecklist: ChecklistItem[]) => void;
}

export const EditTaskChecklistSection: React.FC<EditTaskChecklistSectionProps> = ({
  taskId, checklist, onAddChecklistItem, onUpdateChecklistItem, onToggleChecklistItem,
  onRemoveChecklistItem, onReorderChecklistItems,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 500, tolerance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const total = checklist ? checklist.length : 0;
  const completed = checklist ? checklist.filter((i) => i.completed).length : 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !checklist) return;
    const oldIdx = checklist.findIndex((i) => i.id === active.id);
    const newIdx = checklist.findIndex((i) => i.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      onReorderChecklistItems(taskId, arrayMove(checklist, oldIdx, newIdx));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddChecklistItem(taskId, newTitle.trim());
    setNewTitle("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-orange-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">待辦清單</h4>
        </div>
        {total > 0 && <span className="text-xs font-bold text-slate-500 font-mono">{percent}%</span>}
      </div>

      {total > 0 && (
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-3 overflow-hidden">
          <div style={{ width: `${percent}%` }} className={`h-full transition-all duration-300 ${percent === 100 ? "bg-emerald-500" : "bg-orange-500"}`} />
        </div>
      )}

      {checklist && checklist.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={checklist.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5 mb-3">
              {checklist.map((item) => (
                <SortableChecklistItem
                  key={item.id}
                  item={item}
                  taskId={taskId}
                  isEditing={editingId === item.id}
                  editingText={editingText}
                  onStartEdit={(id, title) => { setEditingId(id); setEditingText(title); }}
                  onSaveEdit={(id) => { if (editingText.trim()) onUpdateChecklistItem(taskId, id, editingText.trim()); setEditingId(null); }}
                  onCancelEdit={() => setEditingId(null)}
                  onEditTextChange={setEditingText}
                  onToggle={onToggleChecklistItem}
                  onRemove={onRemoveChecklistItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="+ 新增子任務項目..." className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200" />
        <button type="submit" disabled={!newTitle.trim()} className="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 hover:bg-slate-700 transition-colors">新增</button>
      </form>
    </div>
  );
};
