"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthModalAlertsProps {
  errorMsg: string | null;
  successMsg: string | null;
}

export const AuthModalAlerts: React.FC<AuthModalAlertsProps> = ({
  errorMsg,
  successMsg,
}) => {
  return (
    <>
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
    </>
  );
};
