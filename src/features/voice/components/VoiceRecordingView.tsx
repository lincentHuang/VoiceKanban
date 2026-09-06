import React from "react";
import { Mic, Square, AlertTriangle } from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";

interface VoiceRecordingViewProps {
  recordingDuration: number;
  isSilentWarning: boolean;
  interimTranscript: string;
  onCancel: () => void;
  onStopAndProcess: () => void;
}

export const VoiceRecordingView: React.FC<VoiceRecordingViewProps> = ({
  recordingDuration,
  isSilentWarning,
  interimTranscript,
  onCancel,
  onStopAndProcess,
}) => {
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="relative mb-4">
        <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping" />
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-lg">
          <Mic className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <div className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mb-3">
        {formatTimer(recordingDuration)}
      </div>

      {isSilentWarning && !interimTranscript && (
        <div className="w-full max-w-md p-3 mb-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 text-left shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold">⚠️ 未偵測到聲音訊號</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
              • <b>電腦端（耳機）</b>：請至系統設定「聲音 ➔ 輸入」確認選中耳機麥克風。<br />
              • <b>手機端</b>：瀏覽器可能預設使用手機底部麥克風，請靠近手機麥克風說話。
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md min-h-[52px] max-h-24 overflow-y-auto px-4 py-2.5 mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 text-left">
        {interimTranscript ? (
          <p className="font-medium animate-in fade-in">🎙️ {interimTranscript}</p>
        ) : (
          <p className="text-slate-400 italic text-center">
            正在聆聽口述...（例如：「明天下午三點完成首頁切版，高優先級」或 &quot;Fix bug by tomorrow 5pm&quot;）
          </p>
        )}
      </div>

      <AudioVisualizer isRecording={true} />

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          取消
        </button>
        <button
          onClick={onStopAndProcess}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg hover:scale-105 transition-all"
        >
          <Square className="w-4 h-4 fill-white" />
          <span>完成口述並辨識</span>
        </button>
      </div>
    </div>
  );
};
