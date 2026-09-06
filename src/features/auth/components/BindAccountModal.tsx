"use client";

import React from "react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { X } from "lucide-react";
import { useBindAccountForm } from "./bind/useBindAccountForm";
import { BindAccountHeader } from "./bind/BindAccountHeader";
import { BindAccountGuarantee } from "./bind/BindAccountGuarantee";
import { BindAccountTabs } from "./bind/BindAccountTabs";
import { AuthModalBody } from "./modal/AuthModalBody";

export const BindAccountModal: React.FC = () => {
  const form = useBindAccountForm();

  useEscapeKey(() => {
    if (form.isBindModalOpen) {
      form.setIsBindModalOpen(false);
    }
  }, form.isBindModalOpen);

  if (!form.isBindModalOpen) return null;

  return (
    <div
      onClick={() => form.setIsBindModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden"
      >
        <button
          type="button"
          onClick={() => form.setIsBindModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        <BindAccountHeader />
        <BindAccountGuarantee />
        <BindAccountTabs
          bindMode={form.bindMode}
          setBindMode={form.setBindMode}
          onClearError={() => form.setErrorMsg(null)}
        />

        <AuthModalBody
          authMode={form.bindMode}
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
          onProviderLogin={form.handleBind}
        />
      </div>
    </div>
  );
};
export default BindAccountModal;
