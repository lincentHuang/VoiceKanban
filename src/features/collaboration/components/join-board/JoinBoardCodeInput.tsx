"use client";

import React from "react";

interface JoinBoardCodeInputProps {
  code: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const JoinBoardCodeInput: React.FC<JoinBoardCodeInputProps> = ({ code, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
        <span>看板邀請代碼 (Invite Code)</span>
        <span className="text-[11px] font-normal text-slate-400">格式：VK-XXXX</span>
      </label>
      <input
        type="text"
        placeholder="例如：VK-9X4B"
        value={code}
        onChange={onChange}
        autoFocus
        maxLength={10}
        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-mono font-black text-xl tracking-widest text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-normal placeholder:text-sm focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all uppercase"
      />
    </div>
  );
};
