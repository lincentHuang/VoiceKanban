"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import {
  X,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    byokConfig,
    updateBYOKConfig,
    boards,
  } = useKanbanStore();

  const [inputKey, setInputKey] = useState(byokConfig.apiKey || "");
  const [selectedModel, setSelectedModel] = useState(byokConfig.model || "gemini-2.0-flash");
  const [defaultBoard, setDefaultBoard] = useState(byokConfig.defaultBoardId || "board-work");
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  if (!isSettingsModalOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestStatus(null);

    if (!inputKey.trim()) {
      updateBYOKConfig({
        apiKey: "",
        isCustomKeyActive: false,
        model: selectedModel,
        defaultBoardId: defaultBoard,
      });
      setTestStatus({ type: "success", msg: "已清除自備 Key，系統將使用預設智慧模式。" });
      return;
    }

    setIsTesting(true);

    try {
      const res = await fetch("/api/user/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: inputKey.trim(), model: selectedModel }),
      });

      const data = await res.json();

      if (data.success) {
        updateBYOKConfig({
          apiKey: inputKey.trim(),
          isCustomKeyActive: true,
          model: selectedModel,
          defaultBoardId: defaultBoard,
          isEncrypted: true,
          lastTestedAt: new Date().toISOString(),
        });
        setTestStatus({ type: "success", msg: "🎉 Gemini API Key 驗證成功！已啟用 AES-256 加密代理。" });
      } else {
        setTestStatus({ type: "error", msg: data.error || "驗證失敗，請檢查 Key 是否正確。" });
      }
    } catch (err: any) {
      setTestStatus({ type: "error", msg: err.message || "連線測試失敗" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                個人設定 &amp; Gemini BYOK
              </h3>
              <p className="text-xs text-slate-500">配置您自己的 Google AI Studio API Key</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTestAndSave} className="mt-5 space-y-4">
          {/* Card 1: API Key Section */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Google AI Studio API Key
              </label>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>取得免費 Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="貼上 AIzaSy... 開頭的 API Key"
                className="w-full pr-10 pl-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Encryption badge */}
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>端到端隱私：伺服器採用 AES-256-GCM 加密保護，音訊萃取後即刻銷毀。</span>
            </div>
          </div>

          {/* Model Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                多模態模型
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="gemini-2.0-flash">gemini-2.0-flash (推薦 - 極速)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (深度語義)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                預設注入看板
              </label>
              <select
                value={defaultBoard}
                onChange={(e) => setDefaultBoard(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.icon} {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Feedback Status Alert */}
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

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              關閉
            </button>
            <button
              type="submit"
              disabled={isTesting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{isTesting ? "連線測試中..." : "測試連線並儲存"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
