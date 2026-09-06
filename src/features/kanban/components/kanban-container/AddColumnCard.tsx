import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Sparkles, Check } from "lucide-react";
import { TRELLO_COLUMN_COLORS } from "@/core/types/task";

const QUICK_ICONS = ["📋", "⚡", "⏳", "✅", "🚀", "💡", "🎯", "🔥", "📌", "⭐"];

interface Props {
  onAddColumn: (title: string, icon: string, color: string) => void;
}

export const AddColumnCard: React.FC<Props> = ({ onAddColumn }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("✨");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
      containerRef.current?.scrollIntoView({ behavior: "smooth", inline: "nearest" });
    }
  }, [isAdding]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const t = title.trim();
    if (!t || isSubmitting) return;
    setIsSubmitting(true);
    try {
      onAddColumn(t, selectedIcon, selectedColor);
      setTitle("");
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} data-add-column-card="true" className="w-[84vw] max-w-[320px] min-w-[270px] sm:w-[270px] sm:min-w-[270px] sm:max-w-[270px] snap-center shrink-0">
      {isAdding ? (
        <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-2 border-orange-400/90 dark:border-orange-500/80 rounded-2xl p-3.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 relative overflow-hidden">
          <div style={{ backgroundColor: selectedColor }} className="absolute top-0 left-4 right-4 h-1 rounded-b-full shadow-xs" />
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-orange-500" />新增狀態欄位</span>
            <button type="button" onClick={() => { setIsAdding(false); setTitle(""); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 mb-2.5">
            <span className="text-sm">{selectedIcon}</span>
            <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") { setIsAdding(false); setTitle(""); } }} placeholder="輸入欄位名稱 (例如：待審核)..." className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-semibold" />
          </div>
          <div className="mb-2.5">
            <div className="text-[10px] font-bold text-slate-400 mb-1">選擇圖示</div>
            <div className="flex items-center gap-1 flex-wrap py-0.5">
              {QUICK_ICONS.map((icon) => (
                <button key={icon} type="button" onClick={() => setSelectedIcon(icon)} className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${selectedIcon === icon ? "bg-orange-100 dark:bg-orange-950/60 border-2 border-orange-500 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{icon}</button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 mb-1">欄位顏色</div>
            <div className="flex items-center gap-1.5 flex-wrap py-1 px-0.5">
              {TRELLO_COLUMN_COLORS.map((c) => (
                <button key={c.hex} type="button" onClick={() => setSelectedColor(c.hex)} style={{ backgroundColor: c.hex }} className={`w-5 h-5 rounded-full shrink-0 cursor-pointer flex items-center justify-center border ${selectedColor.toLowerCase() === c.hex.toLowerCase() ? "scale-110 border-2 border-slate-900 dark:border-white shadow-xs" : "opacity-85 hover:opacity-100"}`} title={c.name}>
                  {selectedColor.toLowerCase() === c.hex.toLowerCase() && <Check className="w-3 h-3 text-slate-800 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={!title.trim() || isSubmitting} className="flex-1 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1 cursor-pointer">
              {isSubmitting ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>建立欄位</span>
            </button>
            <button type="button" onClick={() => { setIsAdding(false); setTitle(""); }} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer">取消</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setIsAdding(true)} className="w-full py-4 px-3 rounded-2xl border border-white/25 hover:border-white/45 bg-white/30 hover:bg-white/22 text-slate-100 hover:text-white flex items-center justify-start gap-2 font-bold text-xs cursor-pointer transition-all group shadow-md hover:shadow-lg backdrop-blur-xl">
          <div className="w-6 h-6 rounded-lg text-white flex items-center justify-center"><Plus className="w-4 h-4" /></div>
          <span>新增欄位</span>
        </button>
      )}
    </div>
  );
};
