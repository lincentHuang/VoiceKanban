"use client";

import React from "react";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { AuthProvider } from "@/core/types/auth";
import { AuthPasswordField } from "./AuthPasswordField";
import { inputClass } from "@/components/ui/input";

interface AuthEmailFormProps {
  authMode: "login" | "register";
  emailInput: string;
  setEmailInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  nameInput: string;
  setNameInput: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loadingProvider: AuthProvider | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthEmailForm: React.FC<AuthEmailFormProps> = ({
  authMode,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  nameInput,
  setNameInput,
  showPassword,
  setShowPassword,
  loadingProvider,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-2.5">
      {authMode === "register" && (
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            姓名 / 稱呼（選填）
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="例如：Alex Wang"
            className={inputClass("md")}
          />
        </div>
      )}

      <div>
        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
          Email 電子郵件
        </label>
        <input
          type="email"
          required
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="name@example.com"
          className={inputClass("md")}
        />
      </div>

      <AuthPasswordField
        value={passwordInput}
        onChange={setPasswordInput}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />

      <button
        type="submit"
        disabled={loadingProvider !== null || !emailInput.trim() || !passwordInput.trim()}
        className="w-full mt-2 py-2.5 rounded-2xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs sm:text-sm font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loadingProvider === "email" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : authMode === "login" ? (
          <LogIn className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        <span>{authMode === "login" ? "登入帳號" : "完成註冊並同步"}</span>
      </button>
    </form>
  );
};
