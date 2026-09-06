"use client";

import React from "react";
import { LogIn, UserPlus, Cloud } from "lucide-react";

interface AuthModalHeaderProps {
  authMode: "login" | "register";
}

export const AuthModalHeader: React.FC<AuthModalHeaderProps> = ({ authMode }) => {
  return (
    <div className="text-center pb-2 shrink-0">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md mb-2">
        {authMode === "login" ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        {authMode === "login" ? "登入 VoiceKanban" : "註冊 VoiceKanban 帳號"}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-1">
        <Cloud className="w-3.5 h-3.5 text-orange-500" />
        <span>跨裝置 Firestore 即時雙向同步與無縫資料整併</span>
      </p>
    </div>
  );
};
