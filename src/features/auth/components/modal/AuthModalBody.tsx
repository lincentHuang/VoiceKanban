"use client";

import React from "react";
import { AuthProvider } from "@/core/types/auth";
import { AuthModalAlerts } from "./AuthModalAlerts";
import { AuthGoogleButton } from "./AuthGoogleButton";
import { AuthEmailForm } from "./AuthEmailForm";

interface AuthModalBodyProps {
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
  errorMsg: string | null;
  successMsg: string | null;
  onProviderLogin: (provider: AuthProvider) => void;
}

export const AuthModalBody: React.FC<AuthModalBodyProps> = ({
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
  errorMsg,
  successMsg,
  onProviderLogin,
}) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
      <AuthModalAlerts errorMsg={errorMsg} successMsg={successMsg} />
      <AuthGoogleButton
        authMode={authMode}
        loadingProvider={loadingProvider}
        onGoogleLogin={() => onProviderLogin("google")}
      />

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
            或使用 Email {authMode === "login" ? "登入" : "註冊"}
          </span>
        </div>
      </div>

      <AuthEmailForm
        authMode={authMode}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        nameInput={nameInput}
        setNameInput={setNameInput}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loadingProvider={loadingProvider}
        onSubmit={(e) => {
          e.preventDefault();
          onProviderLogin("email");
        }}
      />
    </div>
  );
};
