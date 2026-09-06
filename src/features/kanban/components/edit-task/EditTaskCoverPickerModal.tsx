import React, { useRef, useState } from "react";
import { Loader2, Upload, RectangleHorizontal, RectangleVertical, Square, Minus } from "lucide-react";
import { CoverAspectRatio, TRELLO_COLUMN_COLORS } from "@/core/types/task";
import { uploadFile } from "@/core/utils/uploadUtils";

const GRADIENTS = [
  { name: "日落暖陽", value: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)" },
  { name: "極光青綠", value: "linear-gradient(135deg, #bef264 0%, #10b981 100%)" },
  { name: "深邃海洋", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "霓虹魅紫", value: "linear-gradient(135deg, #c471ed 0%, #f64f59 100%)" },
];

const RATIOS: { id: CoverAspectRatio; label: string; icon: React.ReactNode }[] = [
  { id: "banner", label: "橫式 16:9", icon: <RectangleHorizontal className="w-4 h-4" /> },
  { id: "1:1", label: "正方形 1:1", icon: <Square className="w-3.5 h-3.5" /> },
  { id: "3:4", label: "直式 3:4", icon: <RectangleVertical className="w-3.5 h-3.5" /> },
  { id: "9:16", label: "長直 9:16", icon: <RectangleVertical className="w-4 h-4 scale-y-125" /> },
  { id: "bar", label: "極簡飾條", icon: <Minus className="w-4 h-4" /> },
];

interface Props {
  isOpen: boolean;
  coverColor: string;
  coverAspectRatio: CoverAspectRatio;
  onClose: () => void;
  onSelectRatio: (ratio: CoverAspectRatio) => void;
  onApplyCover: (color: string) => void;
  onRemoveCover: () => void;
}

export const EditTaskCoverPickerModal: React.FC<Props> = ({
  isOpen, coverColor, coverAspectRatio, onClose, onSelectRatio, onApplyCover, onRemoveCover,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const res = await uploadFile(file, file.name, "covers");
        onApplyCover(res.url);
      } catch (err) { console.error("Cover upload error:", err); }
      finally { setIsUploading(false); e.target.value = ""; }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:bg-transparent" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:absolute sm:translate-y-0 sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-80 max-h-[85vh] sm:max-h-[380px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">設定卡片封面與比例</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">封面比例與版型</span>
          <div className="grid grid-cols-3 gap-1.5 mb-1.5">
            {RATIOS.slice(0, 3).map((r) => (
              <button key={r.id} onClick={() => onSelectRatio(r.id)} className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${coverAspectRatio === r.id ? "bg-orange-500 text-white border-orange-500" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}>{r.icon}<span>{r.label}</span></button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {RATIOS.slice(3).map((r) => (
              <button key={r.id} onClick={() => onSelectRatio(r.id)} className={`p-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all ${coverAspectRatio === r.id ? "bg-orange-500 text-white border-orange-500" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}>{r.icon}<span>{r.label}</span></button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">經典色彩與漸層</span>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {TRELLO_COLUMN_COLORS.map((c) => (
              <button key={c.hex} onClick={() => onApplyCover(c.hex)} style={{ backgroundColor: c.hex }} className={`w-full h-7 rounded-xl transition-all border ${coverColor === c.hex ? "border-2 border-slate-900 dark:border-white shadow-sm" : "border-transparent"}`} title={c.name} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {GRADIENTS.map((g) => (
              <button key={g.name} onClick={() => onApplyCover(g.value)} style={{ background: g.value }} className={`h-8 rounded-xl text-[10px] font-bold text-white transition-all flex items-center justify-center border ${coverColor === g.value ? "border-2 border-slate-900 dark:border-white shadow-sm" : "border-transparent"}`}>{g.name}</button>
            ))}
          </div>
        </div>

        <div>
          <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300/80 dark:border-slate-700 disabled:opacity-50">
            {isUploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" /><span>上傳中...</span></> : <><Upload className="w-3.5 h-3.5 text-orange-500" /><span>挑選相片圖檔...</span></>}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
        </div>

        {coverColor && (
          <button onClick={() => { onRemoveCover(); onClose(); }} className="w-full py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-semibold transition-colors">✕ 移除當前封面</button>
        )}
      </div>
    </>
  );
};
