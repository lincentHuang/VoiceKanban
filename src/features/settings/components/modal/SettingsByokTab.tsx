"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Board } from "@/core/types/task";
import { ByokKeyInputSection } from "./ByokKeyInputSection";
import { ByokModelSelectSection } from "./ByokModelSelectSection";

interface SettingsByokTabProps {
  inputKey: string;
  setInputKey: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  selectedModel: "gemini-2.0-flash" | "gemini-1.5-pro";
  setSelectedModel: (v: "gemini-2.0-flash" | "gemini-1.5-pro") => void;
  defaultBoard: string;
  setDefaultBoard: (v: string) => void;
  boards: Board[];
  testStatus: { type: "success" | "error"; msg: string } | null;
  isTesting: boolean;
  handleTestAndSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const SettingsByokTab: React.FC<SettingsByokTabProps> = ({
  inputKey,
  setInputKey,
  showPassword,
  setShowPassword,
  selectedModel,
  setSelectedModel,
  defaultBoard,
  setDefaultBoard,
  boards,
  testStatus,
  isTesting,
  handleTestAndSave,
  onClose,
}) => {
  return (
    <form onSubmit={handleTestAndSave} className="space-y-4">
      <ByokKeyInputSection
        inputKey={inputKey}
        setInputKey={setInputKey}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />

      <ByokModelSelectSection
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        defaultBoard={defaultBoard}
        setDefaultBoard={setDefaultBoard}
        boards={boards}
      />

      {testStatus && (
        <div
          className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-medium ${
            testStatus.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {testStatus.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{testStatus.msg}</span>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          關閉
        </button>
        <button
          type="submit"
          disabled={isTesting}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          <span>{isTesting ? "連線測試中..." : "測試連線並儲存"}</span>
        </button>
      </div>
    </form>
  );
};
