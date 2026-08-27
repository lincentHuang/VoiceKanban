"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { AuthProvider } from "@/core/types/auth";
import { X, LogIn, Sparkles, Shield, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useKanbanStore();
  const [emailInput, setEmailInput] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleProviderLogin = async (provider: AuthProvider, email?: string) => {
    setLoadingProvider(provider);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (provider === "email" && !emailInput.trim()) {
        throw new Error("請輸入有效的 Email 電子郵件地址");
      }

      await login(provider, email || emailInput.trim());
      setSuccessMsg("登入成功！正在載入您的看板資料...");
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setLoadingProvider(null);
        setSuccessMsg(null);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "登入失敗，請稍後再試");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            登入 VoiceKanban
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            同步跨裝置看板資料、自備 Gemini Key 與多端即時協作
          </p>
        </div>

        {/* Status Alerts (Error / Success States) */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Providers List */}
        <div className="space-y-2.5">
          {/* Google Sign-in */}
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleProviderLogin("google")}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold shadow-xs hover:shadow-sm transition-all disabled:opacity-60"
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
            <span>使用 Google 帳號快速登入</span>
          </button>

          {/* Apple Sign-in */}
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleProviderLogin("apple")}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs hover:shadow-sm transition-all disabled:opacity-60"
          >
            {loadingProvider === "apple" ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.73-7.85-12.08-14.42-6.86-10.45-12.19-22.14-15.98-35.08-3.79-12.94-5.69-24.8-5.69-35.58 0-14.79 3.69-26.68 11.08-35.67 7.39-8.99 16.65-13.6 27.79-13.84 4.57 0 9.79 1.25 15.66 3.76 5.88 2.5 9.7 3.82 11.47 3.96 1.52-.14 5.56-1.46 12.12-3.96 6.56-2.5 12.13-3.64 16.71-3.41 12.51.64 22.42 5.09 29.74 13.34-11.08 6.63-16.51 15.77-16.29 27.42.23 9.14 3.79 16.86 10.67 23.16 6.89 6.3 14.99 9.87 24.31 10.72-2.18 6.31-4.79 12.84-7.83 19.59zM119.22 31.84c0-7.39 2.72-14.19 8.16-20.4 5.44-6.21 12.18-10.23 20.22-12.06.33 1.19.49 2.37.49 3.54 0 7.38-2.83 14.35-8.49 20.91-5.66 6.56-12.44 10.37-20.38 11.44z" />
              </svg>
            )}
            <span>使用 Apple 帳號登入</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">或使用 Email 登入</span>
          </div>
        </div>

        {/* Email Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleProviderLogin("email");
          }}
          className="space-y-3"
        >
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="請輸入您的 Email 地址..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />

          <button
            type="submit"
            disabled={loadingProvider !== null || !emailInput.trim()}
            className="w-full py-2.5 rounded-2xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs sm:text-sm font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loadingProvider === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>送出並登入</span>
          </button>
        </form>

        {/* Quick Demo Guest Login */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleProviderLogin("guest")}
            className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold hover:underline"
          >
            ✨ 免註冊，以訪客 (Guest) 模式快速體驗
          </button>
        </div>
      </div>
    </div>
  );
};
