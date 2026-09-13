"use client";

import React, { useState } from "react";
import { Link2 } from "lucide-react";
import { inputClass } from "@/components/ui/input";

interface Props {
  initialText: string;
  onSubmitUrl: (text: string) => boolean;
}

export const ShareManualUrlForm: React.FC<Props> = ({ initialText, onSubmitUrl }) => {
  const [value, setValue] = useState(initialText);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitUrl(value)) setError("找不到有效的連結，請貼上 https:// 開頭的網址");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="p-3 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
        在 Instagram、YouTube 或 Threads 點「分享 → 複製連結」，再回到這裡貼上。
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-bold text-slate-500">連結</span>
        <input
          type="url"
          inputMode="url"
          autoFocus
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          placeholder="https://www.instagram.com/p/…"
          className={inputClass("md", "bg-white dark:bg-slate-800")}
        />
      </label>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      <button
        type="submit"
        disabled={!value.trim()}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold disabled:opacity-40 transition-opacity cursor-pointer"
      >
        <Link2 className="w-4 h-4" />
        讀取連結
      </button>
    </form>
  );
};
