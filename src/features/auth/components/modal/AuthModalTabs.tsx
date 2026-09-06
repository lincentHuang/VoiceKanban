"use client";

import React from "react";

interface AuthModalTabsProps {
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  onClearError: () => void;
}

export const AuthModalTabs: React.FC<AuthModalTabsProps> = ({
  authMode,
  setAuthMode,
  onClearError,
}) => {
  return (
    <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-3 text-xs font-semibold shrink-0">
      <button
        type="button"
        onClick={() => {
          setAuthMode("login");
          onClearError();
        }}
        className={`py-1.5 rounded-xl transition-all cursor-pointer ${
          authMode === "login"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        會員登入
      </button>
      <button
        type="button"
        onClick={() => {
          setAuthMode("register");
          onClearError();
        }}
        className={`py-1.5 rounded-xl transition-all cursor-pointer ${
          authMode === "register"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        註冊新帳號
      </button>
    </div>
  );
};
