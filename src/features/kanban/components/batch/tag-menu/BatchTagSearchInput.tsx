"use client";

import React from "react";
import { Search } from "lucide-react";

interface BatchTagSearchInputProps {
  query: string;
  setQuery: (val: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  canCreate: boolean;
  firstOption?: string;
  onCommitTag: (tag: string) => void;
  onCreateAndAdd: () => void;
}

export const BatchTagSearchInput: React.FC<BatchTagSearchInputProps> = ({
  query,
  setQuery,
  inputRef,
  canCreate,
  firstOption,
  onCommitTag,
  onCreateAndAdd,
}) => {
  return (
    <div className="relative">
      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.key === "Process") return;
          if (e.key === "Enter") {
            e.preventDefault();
            if (canCreate) onCreateAndAdd();
            else if (firstOption) onCommitTag(firstOption);
          }
        }}
        placeholder="搜尋或建立標籤..."
        className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
      />
    </div>
  );
};
