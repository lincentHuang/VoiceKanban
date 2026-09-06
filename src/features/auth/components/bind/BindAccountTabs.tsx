"use client";

import React from "react";

interface BindAccountTabsProps {
  bindMode: "register" | "login";
  setBindMode: (mode: "register" | "login") => void;
  onClearError: () => void;
}

export const BindAccountTabs: React.FC<BindAccountTabsProps> = ({
  bindMode,
  setBindMode,
  onClearError,
}) => {
  return (
    <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-3 text-xs font-semibold shrink-0">
      <button
        type="button"
        onClick={() => {
          setBindMode("register");
          onClearError();
        }}
        className={`py-1.5 rounded-xl transition-all cursor-pointer ${
          bindMode === "register"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        註冊並綁定
      </button>
      <button
        type="button"
        onClick={() => {
          setBindMode("login");
          onClearError();
        }}
        className={`py-1.5 rounded-xl transition-all cursor-pointer ${
          bindMode === "login"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        綁定既有帳號
      </button>
    </div>
  );
};
