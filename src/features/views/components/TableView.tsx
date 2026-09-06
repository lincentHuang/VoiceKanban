"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useTableViewModel } from "./table/useTableViewModel";
import { TableHeaderRow } from "./table/TableHeaderRow";
import { TableRowItem } from "./table/TableRowItem";

export const TableView: React.FC = () => {
  const {
    columns,
    boardTasks,
    openAddTaskModal,
    setEditingTaskId,
    toggleTaskStarred,
    handleToggleComplete,
    handleUpdateColumn,
  } = useTableViewModel();

  return (
    <div className="w-full h-full p-1 overflow-hidden">
      <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-glass overflow-hidden h-full flex flex-col">
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增卡片</span>
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <TableHeaderRow />
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {boardTasks.map((task) => (
                <TableRowItem
                  key={task.id}
                  task={task}
                  columns={columns}
                  onSelectTask={setEditingTaskId}
                  onToggleComplete={handleToggleComplete}
                  onToggleStarred={toggleTaskStarred}
                  onUpdateColumn={handleUpdateColumn}
                />
              ))}

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
