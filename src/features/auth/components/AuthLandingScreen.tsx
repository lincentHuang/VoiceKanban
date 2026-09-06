"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useAuthForm } from "./modal/useAuthForm";
import { LandingBrandHeader } from "./landing/LandingBrandHeader";
import { LandingGuestCard } from "./landing/LandingGuestCard";
import { LandingFeatureBadges } from "./landing/LandingFeatureBadges";
import { AuthModalTabs } from "./modal/AuthModalTabs";
import { AuthModalBody } from "./modal/AuthModalBody";

export const AuthLandingScreen: React.FC = () => {
  const { loginAsGuest } = useKanbanStore();
  const form = useAuthForm();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg backdrop-blur-2xl bg-white/95 dark:bg-slate-900/90 border border-white/40 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <LandingBrandHeader />
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

        <LandingGuestCard onGuestEntry={loginAsGuest} />
        <LandingFeatureBadges />
      </div>
    </div>
  );
};
export default AuthLandingScreen;
