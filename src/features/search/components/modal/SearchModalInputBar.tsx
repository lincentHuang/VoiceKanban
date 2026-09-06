"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchModalInputBarProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputVal: string;
  setInputVal: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClose: () => void;
}

export const SearchModalInputBar: React.FC<SearchModalInputBarProps> = ({
  inputRef,
  inputVal,
  setInputVal,
  onKeyDown,
  onClose,
}) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
      <Search className="w-5 h-5 text-orange-500 shrink-0 animate-in fade-in" />
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="搜尋任務名稱、備註、或 #標籤..."
        className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
      />

      {inputVal && (
        <button
          onClick={() => {
            setInputVal("");
            inputRef.current?.focus();
          }}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="清除輸入"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={onClose}
        className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        ESC
      </button>
    </div>
  );
};
