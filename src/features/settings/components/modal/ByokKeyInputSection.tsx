"use client";

import React from "react";
import { Sparkles, ExternalLink, ShieldCheck, Eye, EyeOff } from "lucide-react";

interface ByokKeyInputSectionProps {
  inputKey: string;
  setInputKey: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}

export const ByokKeyInputSection: React.FC<ByokKeyInputSectionProps> = ({
  inputKey,
  setInputKey,
  showPassword,
  setShowPassword,
}) => {
  return (
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
          className="w-full pr-10 pl-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>端到端隱私：AES-256 加密代理，音訊分析完畢立即銷毀。</span>
      </div>
    </div>
  );
};
