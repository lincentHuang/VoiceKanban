"use client";

import React, { useEffect } from "react";
import { Mic, X } from "lucide-react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { useVoiceCapture } from "./useVoiceCapture";
import { VoiceRecordingView } from "./VoiceRecordingView";
import { VoiceProcessingView } from "./VoiceProcessingView";
import { VoiceErrorView } from "./VoiceErrorView";
import { VoicePreviewForm } from "./VoicePreviewForm";
import { VoicePreviewActions } from "./VoicePreviewActions";

export const VoiceCaptureOverlay: React.FC = () => {
  const v = useVoiceCapture();

  useEffect(() => {
    if (v.isVoiceOverlayOpen && v.voiceState === "recording") {
      v.startRecording();
    } else if (!v.isVoiceOverlayOpen) {
      v.stopRecordingCleanup();
    }
    return () => v.stopRecordingCleanup();
  }, [v.isVoiceOverlayOpen, v.voiceState]);

  useEscapeKey(v.handleClose, v.isVoiceOverlayOpen);

  if (!v.isVoiceOverlayOpen) return null;

  return (
    <div onClick={v.handleClose} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600"><Mic className="w-4 h-4" /></div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">語音輸入</h2>
          </div>
          <button type="button" onClick={v.handleClose} className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" aria-label="關閉">
            <X className="w-5 h-5" />
          </button>
        </div>

        {v.voiceState === "recording" && (
          <VoiceRecordingView recordingDuration={v.recordingDuration} isSilentWarning={v.isSilentWarning} interimTranscript={v.interimTranscript} onCancel={v.handleClose} onStopAndProcess={v.handleStopAndProcess} />
        )}

        {v.voiceState === "processing" && <VoiceProcessingView />}

        {v.voiceState === "error" && (
          <VoiceErrorView errorMessage={v.errorMessage} onRetry={() => { v.setVoiceState("recording"); v.startRecording(); }} onClose={v.handleClose} />
        )}

        {v.voiceState === "preview" && (
          <div className="flex-1 flex flex-col min-h-0 text-left animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <VoicePreviewForm
              extractedTask={v.extractedTask} editTitle={v.editTitle} editBoardId={v.editBoardId} editColumnId={v.editColumnId}
              editPriority={v.editPriority} editDueDate={v.editDueDate} editTags={v.editTags} tagInput={v.tagInput} boards={v.boards}
              onTitleChange={v.setEditTitle} onBoardChange={(bId) => { v.setEditBoardId(bId); const nb = v.boards.find((b) => b.id === bId); if (nb?.columns?.length && !nb.columns.some((c) => c.id === v.editColumnId) && v.editColumnId !== "inbox") v.setEditColumnId(nb.columns[0].id); }}
              onColumnChange={v.setEditColumnId} onPriorityChange={v.setPriority} onDueDateChange={v.setEditDueDate} onTagInputChange={v.setTagInput}
              onAddTag={() => { if (v.tagInput.trim() && !v.editTags.includes(v.tagInput.trim().replace(/^#/, ""))) { v.setEditTags([...v.editTags, v.tagInput.trim().replace(/^#/, "")]); v.setTagInput(""); } }}
              onRemoveTag={(t) => v.setEditTags(v.editTags.filter((x) => x !== t))}
            />
            <VoicePreviewActions onReRecord={() => { v.setVoiceState("recording"); v.startRecording(); }} onDiscard={v.handleClose} onConfirm={v.handleConfirmAdd} />
          </div>
        )}
      </div>
    </div>
  );
};
