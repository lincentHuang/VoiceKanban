import React from "react";
import { AlertCircle } from "lucide-react";

interface VoiceErrorViewProps {
  errorMessage: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export const VoiceErrorView: React.FC<VoiceErrorViewProps> = ({
  errorMessage,
  onRetry,
  onClose,
}) => {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
        語音辨識異常
      </h3>
      <p className="text-xs text-slate-500 max-w-xs mb-5">
        {errorMessage || "無法啟動語音輸入，請確認麥克風權限或改為文字輸入。"}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors"
        >
          重試錄音
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold hover:bg-slate-100 transition-colors"
        >
          關閉
        </button>
      </div>
    </div>
  );
};
