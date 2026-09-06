"use client";

import React from "react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { useSearchModal } from "./modal/useSearchModal";
import { SearchModalInputBar } from "./modal/SearchModalInputBar";
import { SearchQuickTags } from "./modal/SearchQuickTags";
import { SearchResultsList } from "./modal/SearchResultsList";
import { SearchModalFooter } from "./modal/SearchModalFooter";

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    searchQuery,
    inputVal,
    setInputVal,
    selectedIndex,
    setSelectedIndex,
    inputRef,
    listRef,
    columnMap,
    allTags,
    searchResults,
    handleKeyDown,
    handleSelectTask,
    handleApplyFilter,
    handleClearFilter,
  } = useSearchModal();

  useEscapeKey(() => {
    if (isSearchModalOpen) {
      setIsSearchModalOpen(false);
    }
  }, isSearchModalOpen);

  if (!isSearchModalOpen) return null;

  const isSearching = inputVal.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 animate-in fade-in duration-150 overflow-hidden">
      <div
        className="fixed inset-0 -z-10"
        onClick={() => setIsSearchModalOpen(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="搜尋任務"
        className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-4rem)] sm:max-h-[82vh] transition-all animate-in zoom-in-95 duration-200"
      >
        <SearchModalInputBar
          inputRef={inputRef}
          inputVal={inputVal}
          setInputVal={setInputVal}
          onKeyDown={handleKeyDown}
          onClose={() => setIsSearchModalOpen(false)}
        />

        {!isSearching && (
          <SearchQuickTags
            tags={allTags}
            onSelectTag={(tag) => {
              setInputVal(tag);
              inputRef.current?.focus();
            }}
          />
        )}

        <SearchResultsList
          listRef={listRef}
          isSearching={isSearching}
          searchResults={searchResults}
          inputVal={inputVal}
          selectedIndex={selectedIndex}
          columnMap={columnMap}
          onSelectTask={handleSelectTask}
          setSelectedIndex={setSelectedIndex}
        />

        <SearchModalFooter
          searchQuery={searchQuery}
          isSearching={isSearching}
          onClearFilter={handleClearFilter}
          onApplyFilter={handleApplyFilter}
        />
      </div>
    </div>
  );
};
export default SearchModal;
