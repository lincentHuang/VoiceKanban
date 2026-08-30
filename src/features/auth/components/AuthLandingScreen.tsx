"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { AuthProvider } from "@/core/types/auth";
import { formatAuthErrorMessage } from "@/core/services/authService";
import {
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Kanban,
  Mic,
} from "lucide-react";

export const AuthLandingScreen: React.FC = () => {
  const { login, loginAsGuest } = useKanbanStore();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleProviderLogin = async (
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

      await login(
        provider,
        email || emailInput.trim(),
        password || passwordInput.trim(),
        displayName || nameInput.trim(),
        authMode === "register"
      );

      setSuccessMsg(
        authMode === "register"
          ? "🎉 註冊成功！正在為您準備專屬看板..."
          : "✨ 登入成功！正在進入看板工作區..."
      );
    } catch (err: any) {
      setErrorMsg(formatAuthErrorMessage(err));
      setLoadingProvider(null);
    }
  };

  const handleGuestEntry = () => {
    loginAsGuest();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-lg backdrop-blur-2xl bg-white/95 dark:bg-slate-900/90 border border-white/40 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="text-center pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 mb-3.5">
            <Kanban className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            VoiceKanban
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <Mic className="w-3.5 h-3.5 text-orange-500" />
            <span>AI 語音驅動的極速視覺看板與任務管理系統</span>
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl mb-5 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition-all ${
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
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              authMode === "register"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            註冊新帳號
          </button>
        </div>

        {/* Status Alerts (Error / Success States) */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleProviderLogin("google")}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/90 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-100 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all disabled:opacity-60"
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
          <span>使用 Google 帳號一鍵{authMode === "login" ? "登入" : "註冊"}</span>
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">
              或使用 Email {authMode === "login" ? "登入" : "註冊"}
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleProviderLogin("email");
          }}
          className="space-y-3"
        >
          {authMode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                姓名 / 稱呼（選填）
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="例如：Alex Wang"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Email 電子郵件
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
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
                className="w-full px-3.5 py-2.5 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition-all"
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
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingProvider === "email" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : authMode === "login" ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{authMode === "login" ? "登入並進入看板" : "註冊並進入看板"}</span>
          </button>
        </form>

        {/* Prominent Guest Mode Entry */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={handleGuestEntry}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>免註冊，以訪客身份直接體驗 (Guest Mode)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            💡 訪客期間的所有自訂看板與任務卡片均可隨時一鍵綁定為正式帳號
          </p>
        </div>

      </div>
    </div>
  );
};
