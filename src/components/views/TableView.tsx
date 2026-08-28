"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Task, ColumnId } from "@/core/types/task";
import { isoToDateTimeLocal, getDueDateStatus } from "@/core/utils/dateUtils";
import { Check, Calendar, Trash2, Edit3, CheckSquare2, Plus, Star } from "lucide-react";
import confetti from "canvas-confetti";

export const TableView: React.FC = () => {
  const {
    tasks,
    activeBoardId,
    getActiveBoardColumns,
    toggleTaskComplete,
    toggleTaskStarred,
    deleteTask,
    updateTask,
    setEditingTaskId,
    openAddTaskModal,
    searchQuery,
    tagFilter,
  } = useKanbanStore();

  const columns = getActiveBoardColumns();

  const boardTasks = tasks.filter((task) => {
    if (task.boardId !== activeBoardId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    if (tagFilter !== "all" && !task.tags.includes(tagFilter)) return false;

    return true;
  });

  const handleToggleComplete = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!task.completed) {
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#BEF264", "#F97316", "#10B981"],
        });
      } catch {}
    }
    toggleTaskComplete(task.id);
  };

  return (
    <div className="w-full h-full p-1 overflow-hidden">
      <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-glass overflow-hidden h-full flex flex-col">
        {/* Table Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              表格模式 (Table View)
            </h3>
            <p className="text-xs text-slate-500">
              共 {boardTasks.length} 項卡片任務，點擊欄位可快速編輯狀態與屬性
            </p>
          </div>

          <button
            onClick={() => openAddTaskModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增卡片</span>
          </button>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-700/80 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 w-10">狀態</th>
                <th className="py-2.5 px-3 min-w-[220px]">任務名稱</th>
                <th className="py-2.5 px-3 min-w-[140px]">所屬列表</th>
                <th className="py-2.5 px-3 w-16 text-center">重要</th>
                <th className="py-2.5 px-3 min-w-[140px]">到期時間</th>
                <th className="py-2.5 px-3 min-w-[120px]">子任務進度</th>
                <th className="py-2.5 px-3 min-w-[130px]">標籤</th>
                <th className="py-2.5 px-3 text-right w-16">動作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {boardTasks.map((task) => {
                const totalChecklist = task.checklist ? task.checklist.length : 0;
                const completedChecklist = task.checklist
                  ? task.checklist.filter((i) => i.completed).length
                  : 0;

                return (
                  <tr
                    key={task.id}
                    onClick={() => setEditingTaskId(task.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Complete Checkbox */}
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => handleToggleComplete(e, task)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          task.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-600 hover:border-orange-500"
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">
                      <span className={task.completed ? "line-through text-slate-400" : ""}>
                        {task.title}
                      </span>
                    </td>

                    {/* Column Dropdown */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.columnId}
                        onChange={(e) => {
                          const newCol = e.target.value as ColumnId;
                          updateTask(task.id, {
                            columnId: newCol,
                            completed: newCol === "done" ? true : (task.columnId === "done" ? false : task.completed),
                          });
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        {columns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.title}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Star Toggle */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleTaskStarred(task.id)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Star
                          className={`w-4 h-4 mx-auto ${
                            task.isStarred
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-300 hover:text-amber-400"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {task.dueDate || task.startDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-xs">
                            {getDueDateStatus(task.dueDate, task.completed, task.isAllDay, task.startDate)?.formattedFullDateTime ||
                              (task.dueDate ? isoToDateTimeLocal(task.dueDate).slice(5).replace("T", " ") : "")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">無</span>
                      )}
                    </td>

                    {/* Subtasks Progress */}
                    <td className="py-3 px-3">
                      {totalChecklist > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <CheckSquare2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {completedChecklist}/{totalChecklist}
                          </span>
                          <div className="w-12 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
                              className="h-full bg-emerald-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">無子任務</span>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTaskId(task.id)}
                          className="p-1 rounded text-slate-400 hover:text-orange-500"
                          title="詳細資訊"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                          title="刪除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {boardTasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    尚無符合條件的任務卡片
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
