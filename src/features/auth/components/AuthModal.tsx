"use client";

import React from "react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { X, Sparkles } from "lucide-react";
import { useAuthForm } from "./modal/useAuthForm";
import { AuthModalHeader } from "./modal/AuthModalHeader";
import { AuthModalTabs } from "./modal/AuthModalTabs";
import { AuthModalBody } from "./modal/AuthModalBody";

export const AuthModal: React.FC = () => {
  const form = useAuthForm();

  useEscapeKey(() => {
    if (form.isAuthModalOpen) {
      form.setIsAuthModalOpen(false);
    }
  }, form.isAuthModalOpen);

  if (!form.isAuthModalOpen) return null;

  return (
    <div
      onClick={() => form.setIsAuthModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden"
      >
        <button
          type="button"
          onClick={() => form.setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        <AuthModalHeader authMode={form.authMode} />
        <AuthModalTabs
          authMode={form.authMode}
          setAuthMode={form.setAuthMode}
          onClearError={() => form.setErrorMsg(null)}
        />

        <AuthModalBody
          authMode={form.authMode}
          emailInput={form.emailInput}
          setEmailInput={form.setEmailInput}
          passwordInput={form.passwordInput}
          setPasswordInput={form.setPasswordInput}
          nameInput={form.nameInput}
          setNameInput={form.setNameInput}
          showPassword={form.showPassword}
          setShowPassword={form.setShowPassword}
          loadingProvider={form.loadingProvider}
          errorMsg={form.errorMsg}
          successMsg={form.successMsg}
          onProviderLogin={form.handleProviderLogin}
        />

        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center gap-1 text-xs shrink-0">
          <button
            type="button"
            disabled={form.loadingProvider !== null}
            onClick={() => form.handleProviderLogin("guest")}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>以訪客模式 (Guest) 體驗</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default AuthModal;
