"use client";

import React, { useState, useEffect, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { AudioVisualizer } from "./AudioVisualizer";
import { VoiceExtractResult } from "@/core/types/voice";
import { DEFAULT_COLUMNS, ColumnId, Priority } from "@/core/types/task";
import {
  Mic,
  Square,
  Sparkles,
  Check,
  RotateCcw,
  X,
  Calendar,
  Layers,
  Flag,
  Loader2,
  Tag,
} from "lucide-react";
import confetti from "canvas-confetti";

export const VoiceCaptureOverlay: React.FC = () => {
  const {
    isVoiceOverlayOpen,
    setIsVoiceOverlayOpen,
    voiceState,
    setVoiceState,
    extractedTask,
    setExtractedTask,
    boards,
    activeBoardId,
    addTask,
    byokConfig,
  } = useKanbanStore();

  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Editable Preview State
  const [editTitle, setEditTitle] = useState("");
  const [editBoardId, setEditBoardId] = useState(activeBoardId);
  const [editColumnId, setEditColumnId] = useState<ColumnId>("in_progress");
  const [editPriority, setPriority] = useState<Priority>("medium");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start recording on mount if open and state is recording
  useEffect(() => {
    if (isVoiceOverlayOpen && voiceState === "recording") {
      startRecording();
    } else {
      stopTimer();
    }

    return () => {
      stopRecordingCleanup();
    };
  }, [isVoiceOverlayOpen, voiceState]);

  const startTimer = () => {
    setRecordingDuration(0);
    timerIntervalRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setNoticeMessage(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
        });

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || "audio/webm",
          });
          setAudioBlob(blob);
          processAudio(blob);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start(200);
        startTimer();
      } else {
        throw new Error("此瀏覽器未支援或未允許麥克風存取");
      }
    } catch (err: any) {
      console.warn("Microphone not available, using simulated recording:", err);
      // Fallback: simulate 3 seconds of recording then process
      startTimer();
      setTimeout(() => {
        if (voiceState === "recording") {
          handleStopAndProcess();
        }
      }, 3000);
    }
  };

  const stopRecordingCleanup = () => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  const handleStopAndProcess = () => {
    stopTimer();
    setVoiceState("processing");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      // Simulate audio blob for fallback
      const dummyBlob = new Blob(["dummy audio data"], { type: "audio/webm" });
      processAudio(dummyBlob);
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("currentTimestamp", new Date().toISOString());
      formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei");
      formData.append(
        "availableBoards",
        JSON.stringify(boards.map((b) => ({ id: b.id, name: b.name })))
      );

      if (byokConfig.apiKey && byokConfig.apiKey.trim()) {
        formData.append("customApiKey", byokConfig.apiKey.trim());
      }

      const res = await fetch("/api/voice/extract", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.success && json.data) {
        const result = json.data as VoiceExtractResult;
        setExtractedTask(result);
        setEditTitle(result.title);
        setEditBoardId(boards.some((b) => b.id === result.targetBoardId) ? result.targetBoardId : activeBoardId);
        setEditColumnId(result.targetColumnId || "inbox");
        setPriority(result.priority || "medium");
        setEditDueDate(result.dueDate || "");
        setEditTags(result.tags || ["VoiceAdd"]);
        if (json.notice) {
          setNoticeMessage(json.notice);
        }
        setVoiceState("preview");
      } else {
        throw new Error(json.error || "解析失敗");
      }
    } catch (err: any) {
      console.error("Audio extraction failed:", err);
      // Create a fallback result
      const fallbackResult: VoiceExtractResult = {
        title: "語音待辦事項 (快速口述)",
        tags: ["語音", "待辦"],
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        priority: "medium",
        targetBoardId: activeBoardId,
        targetColumnId: "inbox",
        transcript: "未能成功連線 Gemini，已為您自動建立預備任務卡片。",
      };
      setExtractedTask(fallbackResult);
      setEditTitle(fallbackResult.title);
      setEditBoardId(activeBoardId);
      setEditColumnId("inbox");
      setPriority("medium");
      setEditTags(fallbackResult.tags);
      setVoiceState("preview");
    }
  };

  const handleConfirmAdd = () => {
    if (!editTitle.trim()) return;

    addTask({
      title: editTitle.trim(),
      description: extractedTask?.transcript ? `🎙️ 語音逐字稿：${extractedTask.transcript}` : "",
      boardId: editBoardId,
      columnId: editColumnId,
      priority: editPriority,
      tags: editTags,
      dueDate: editDueDate || null,
      completed: editColumnId === "done",
    });

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#BEF264", "#F97316", "#10B981"],
      });
    } catch {}

    handleClose();
  };

  const handleClose = () => {
    stopRecordingCleanup();
    setIsVoiceOverlayOpen(false);
    setVoiceState("idle");
    setExtractedTask(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (!isVoiceOverlayOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-xl backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* State 1: Recording */}
        {voiceState === "recording" && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="relative mb-4">
              <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-lg">
                <Mic className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mb-1">
              {formatTimer(recordingDuration)}
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              正在聆聽您的語音...
            </p>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              您可以口述：「明天下午三點和團隊對接首頁 RWD，放進工作日常進行中，高優先級」
            </p>

            {/* Dynamic Soundwave */}
            <AudioVisualizer isRecording={true} />

            {/* Stop Button */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleStopAndProcess}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg hover:scale-105 transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>完成並由 AI 萃取</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: Processing */}
        {voiceState === "processing" && (
          <div className="flex flex-col items-center text-center py-10">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              Gemini 2.0 正在多模態解析...
            </h3>
            <p className="text-xs text-slate-500 max-w-xs">
              正在自動辨識語音、計算到期時間、評估優先級並分流目標看板...
            </p>
          </div>
        )}

        {/* State 3: Preview & Confirm (The Grill-me Consensus Card) */}
        {voiceState === "preview" && (
          <div className="flex flex-col text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI 智能萃取結果預覽
                </h3>
                <p className="text-xs text-slate-500">可於下方即時微調後確認推入看板</p>
              </div>
            </div>

            {noticeMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300">
                💡 {noticeMessage}
              </div>
            )}

            {/* Transcript Quote */}
            {extractedTask?.transcript && (
              <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  🎙️ 語音辨識逐字稿：
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
                  &ldquo;{extractedTask.transcript}&rdquo;
                </p>
              </div>
            )}

            {/* Editable Title */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                任務標題
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Dropdown Pickers: Board & Column */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  目標看板
                </label>
                <select
                  value={editBoardId}
                  onChange={(e) => setEditBoardId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.icon} {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  目標欄位
                </label>
                <select
                  value={editColumnId}
                  onChange={(e) => setEditColumnId(e.target.value as ColumnId)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  {DEFAULT_COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-slate-400" />
                  優先等級
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="high">🔴 高優先級 (High)</option>
                  <option value="medium">🟡 中優先級 (Medium)</option>
                  <option value="low">🟢 低優先級 (Low)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  到期時間
                </label>
                <input
                  type="text"
                  value={editDueDate || ""}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  placeholder="如: 2026-08-25T18:00..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Tags Pills */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                標籤
              </label>
              <div className="flex flex-wrap gap-1.5">
                {editTags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setVoiceState("recording");
                  startRecording();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重新錄音</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  捨棄
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-base44-lime hover:bg-base44-limeDark text-slate-900 font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Check className="w-4 h-4 text-slate-900 stroke-[3]" />
                  <span>確認加入看板</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
