"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { AuthProvider } from "@/core/types/auth";
import { formatAuthErrorMessage } from "@/core/services/authService";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import {
  X,
  Link2,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Cloud,
  Sparkles,
} from "lucide-react";

export const BindAccountModal: React.FC = () => {
  const { isBindModalOpen, setIsBindModalOpen, bindGuestAccount, userSession } = useKanbanStore();

  useEscapeKey(() => {
    if (isBindModalOpen) {
      setIsBindModalOpen(false);
    }
  }, isBindModalOpen);

  const [bindMode, setBindMode] = useState<"register" | "login">("register");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isBindModalOpen) return null;

  const handleBind = async (
    provider: AuthProvider,
    email?: string,
    password?: string,
    displayName?: string
  ) => {
    setLoadingProvider(provider);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (provider === "email") {
        if (!emailInput.trim()) {
          throw new Error("請輸入有效的 Email 電子郵件地址");
        }
        if (!passwordInput.trim() || passwordInput.length < 6) {
          throw new Error("密碼需至少 6 個字元");
        }
      }

      await bindGuestAccount(
        provider,
        email || emailInput.trim(),
        password || passwordInput.trim(),
        displayName || nameInput.trim(),
        bindMode === "register"
      );

      setSuccessMsg("🎉 帳號綁定成功！已自動整併訪客資料並啟用雲端同步！");

      setTimeout(() => {
        setIsBindModalOpen(false);
        setLoadingProvider(null);
        setSuccessMsg(null);
      }, 900);
    } catch (err: any) {
      setErrorMsg(formatAuthErrorMessage(err));
      setLoadingProvider(null);
    }
  };

  return (
    <div
      onClick={() => setIsBindModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsBindModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-2 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md mb-2">
            <Link2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            綁定正式帳號
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            將目前的訪客資料無縫合併至正式帳號
          </p>
        </div>

        {/* Migration Guarantee Callout */}
        <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-900/50 text-xs text-orange-900 dark:text-orange-200 flex items-start gap-2.5 shrink-0">
          <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">無縫資料整併保障：</span>
            <span> 您在訪客期間建立的看板、工作流程與所有任務將全數自動合併至新帳號，絕不丟失。</span>
          </div>
        </div>

        {/* Tab Switcher: Register vs Login */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-3 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => {
              setBindMode("register");
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-xl transition-all ${
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
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-xl transition-all ${
              bindMode === "login"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            綁定既有帳號
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">

        {/* Status Alerts (Error / Success States) */}
        {errorMsg && (
          <div className="mb-3.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Binding */}
        <div className="space-y-2 mb-3">
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleBind("google")}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all disabled:opacity-60"
          >
            {loadingProvider === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.33 21.46 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.2.005 10.04.005 12c0 1.96.46 3.8 1.28 5.42l4-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.33 2.54 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>使用 Google 帳號一鍵綁定</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
              或使用 Email 綁定
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleBind("email");
          }}
          className="space-y-2.5"
        >
          {bindMode === "register" && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                姓名 / 稱呼（選填）
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="例如：Alex Wang"
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500"
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
              className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              密碼（至少 6 碼）
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingProvider !== null || !emailInput.trim() || !passwordInput.trim()}
            className="w-full mt-2 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingProvider === "email" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            <span>{bindMode === "register" ? "註冊新帳號並整併資料" : "登入並整併資料"}</span>
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};
