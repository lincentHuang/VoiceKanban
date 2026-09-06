"use client";

import React from "react";

export const TableHeaderRow: React.FC = () => {
  return (
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
  );
};
