"use client";

import React, { useState, useEffect } from "react";
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
  BrainCircuit,
  RotateCcw,
  BookOpen,
  Check,
} from "lucide-react";

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    byokConfig,
    updateBYOKConfig,
    boards,
    getLearningStats,
    resetLearningModel,
  } = useKanbanStore();

  const [activeTab, setActiveTab] = useState<"api" | "learning">("api");
  const [inputKey, setInputKey] = useState(byokConfig.apiKey || "");
  const [selectedModel, setSelectedModel] = useState(byokConfig.model || "gemini-2.0-flash");
  const [defaultBoard, setDefaultBoard] = useState(byokConfig.defaultBoardId || "board-work");
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Learning Stats
  const [learningStats, setLearningStats] = useState({
    totalLearnedWords: 0,
    totalFeedbackCount: 0,
    zhFeedbackCount: 0,
    enFeedbackCount: 0,
    lastUpdated: null as string | null,
  });
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (isSettingsModalOpen) {
      setLearningStats(getLearningStats());
      setResetSuccess(false);
    }
  }, [isSettingsModalOpen, getLearningStats]);

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
      setTestStatus({ type: "success", msg: "已清除自備 Key，系統將以離線半自動學習模式運作。" });
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

  const handleResetLearning = () => {
    if (confirm("確定要重設本地半自動學習記憶庫嗎？這將會清除歷史詞彙加權與修正關聯。")) {
      resetLearningModel();
      setLearningStats(getLearningStats());
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                系統設定 &amp; AI / 離線學習引擎
              </h3>
              <p className="text-xs text-slate-500">管理 Gemini API Key 與本地半自動學習詞庫</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("api")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "api"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Gemini BYOK 設定</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("learning")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "learning"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-lime-600" />
            <span>半自動學習模型</span>
          </button>
        </div>

        {/* Tab 1: BYOK Gemini Settings */}
        {activeTab === "api" && (
          <form onSubmit={handleTestAndSave} className="mt-4 space-y-4">
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
                  placeholder="貼上 AIzaSy... 開頭的 API Key (留空則使用離線學習模式)"
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
                <span>端到端隱私：AES-256 加密代理，音訊分析完畢立即銷毀。</span>
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
        )}

        {/* Tab 2: Semi-Automatic Learning Model Stats & Controls */}
        {activeTab === "learning" && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-lime-50/60 dark:bg-lime-950/20 border border-lime-200/60 dark:border-lime-900/60 space-y-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-lime-600" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  純前端半自動學習 (Active Correction Feedback)
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                每次您在預覽確認卡片中調整看板、欄位、標籤或優先級時，系統會自動在本地瀏覽器強化對應詞彙的貝氏權重，越用越精準，<strong>完全無須連接雲端 AI API</strong>。
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">已學習詞彙</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">
                  {learningStats.totalLearnedWords}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">總修正回饋次數</span>
                <span className="text-lg font-black text-lime-600 font-mono">
                  {learningStats.totalFeedbackCount}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">🇹🇼 中文樣本</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">
                  {learningStats.zhFeedbackCount}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">🇺🇸 英文樣本</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">
                  {learningStats.enFeedbackCount}
                </span>
              </div>
            </div>

            {/* Reset Alert / Status */}
            {resetSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>學習記憶庫已重設為初始乾淨狀態！</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetLearning}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重設學習記憶庫</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
