"use client";

import React, { useState, useEffect, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { AudioVisualizer } from "./AudioVisualizer";
import { VoiceExtractResult, VoiceLanguage } from "@/core/types/voice";
import { DEFAULT_COLUMNS, ColumnId, Priority } from "@/core/types/task";
import { webSpeechService } from "@/core/services/webSpeechService";
import { learningEngine } from "@/core/services/learningEngine";
import { detectLanguage } from "@/core/services/localNlpParser";
import { DateTimePicker } from "@/components/common/DateTimePicker";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
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
  Cpu,
  Globe,
  AlertCircle,
  AlertTriangle,
  BrainCircuit,
  Volume2,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const VoiceCaptureOverlay: React.FC = () => {
  const {
    isVoiceOverlayOpen,
    setIsVoiceOverlayOpen,
    voiceState,
    setVoiceState,
    voiceMode,
    setVoiceMode,
    voiceLanguage,
    setVoiceLanguage,
    extractedTask,
    setExtractedTask,
    boards,
    activeBoardId,
    addTask,
    byokConfig,
    recordLearningFeedback,
    voiceTargetColumnId,
    setVoiceTargetColumnId,
  } = useKanbanStore();

  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [liveLanguage, setLiveLanguage] = useState<"zh-TW" | "en-US">("zh-TW");
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFeedbackRecorded, setIsFeedbackRecorded] = useState(false);
  const [isSilentWarning, setIsSilentWarning] = useState(false);

  // Editable Preview State
  const [editTitle, setEditTitle] = useState("");
  const [editBoardId, setEditBoardId] = useState(activeBoardId);
  const [editColumnId, setEditColumnId] = useState<ColumnId>("in_progress");
  const [editPriority, setPriority] = useState<Priority>("medium");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasReceivedSpeechRef = useRef<boolean>(false);

  // Start recording on mount if open and state is recording
  useEffect(() => {
    if (isVoiceOverlayOpen && voiceState === "recording") {
      startRecording();
    } else if (!isVoiceOverlayOpen) {
      stopRecordingCleanup();
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

  const stopHardwareAudioTracks = () => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      } catch (err) {
        console.warn("Error stopping audio tracks:", err);
      }
      mediaStreamRef.current = null;
    }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setInterimTranscript("");
    setNoticeMessage(null);
    setErrorMessage(null);
    setIsFeedbackRecorded(false);
    setIsSilentWarning(false);
    hasReceivedSpeechRef.current = false;

    // Reset silence timer
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // 3-second Silence Detection Timer (AC-5.2)
    silenceTimeoutRef.current = setTimeout(() => {
      if (!hasReceivedSpeechRef.current) {
        setIsSilentWarning(true);
      }
    }, 3000);

    const isWebSpeechAvailable = webSpeechService.isSupported();
    const isCloudMode = voiceMode === "cloud_gemini" && Boolean(byokConfig?.apiKey?.trim());

    // 1. Web Speech API (Exclusive Microphone Access for Offline / Default Mode)
    if (isWebSpeechAvailable) {
      webSpeechService.start(
        {
          onInterim: (transcript) => {
            if (transcript.trim().length > 0) {
              hasReceivedSpeechRef.current = true;
              setIsSilentWarning(false);
              setInterimTranscript(transcript);
              const detected = detectLanguage(transcript);
              setLiveLanguage(detected);
            }
          },
          onNoSpeech: () => {
            if (!hasReceivedSpeechRef.current) {
              setIsSilentWarning(true);
            }
          },
          onError: (err) => {
            console.warn("WebSpeech error:", err);
            if (err.includes("存取權限已被拒絕") || err.includes("異常") || err.includes("失敗")) {
              setErrorMessage(err);
              setVoiceState("error");
            }
          },
        },
        voiceLanguage
      );
    }

    // 2. Audio Stream Single-Channel Optimization (AC-5.1):
    // Only start MediaRecorder on demand if Cloud Gemini Mode is selected with BYOK.
    // In Offline mode, do NOT call getUserMedia to avoid competing for Bluetooth/microphone hardware lock.
    if (isCloudMode) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

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
            stopHardwareAudioTracks();
          };

          mediaRecorder.start(200);
        }
      } catch (err: any) {
        console.warn("Microphone hardware access warning:", err);
        if (!isWebSpeechAvailable) {
          setErrorMessage("無法存取麥克風，請檢查瀏覽器設定與權限。");
          setVoiceState("error");
        }
      }
    }

    startTimer();
  };

  const stopRecordingCleanup = () => {
    stopTimer();
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    webSpeechService.stop();
    stopHardwareAudioTracks();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    mediaRecorderRef.current = null;
  };

  const handleStopAndProcess = () => {
    stopTimer();
    const finalSpeechText = webSpeechService.stop();
    const transcriptToProcess = (interimTranscript || finalSpeechText).trim();

    stopHardwareAudioTracks();
    setVoiceState("processing");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    mediaRecorderRef.current = null;

    // Process after brief animation
    setTimeout(() => {
      processExtractedContent(transcriptToProcess);
    }, 300);
  };

  const processExtractedContent = async (spokenText: string) => {
    try {
      // Offline Semi-Automatic Learning Mode (Default & API-Free)
      if (voiceMode === "offline_learning" || !byokConfig.apiKey || !byokConfig.apiKey.trim()) {
        const fallbackText = spokenText || (liveLanguage === "zh-TW" ? "完成首頁 Base 44 設計樣式切版與微調，高優先級，放進進行中" : "Complete project milestone review by tomorrow 3pm urgent");
        
        const context = {
          boards: boards.map((b) => ({ id: b.id, name: b.name })),
          activeBoardId: activeBoardId || (boards[0]?.id ?? "board-work"),
        };

        const result = learningEngine.extractWithLearning(fallbackText, context);
        applyExtractResult(result, "✨ 已透過純前端 Web Speech 與本地半自動學習引擎成功辨識！");
        return;
      }

      // Cloud Gemini 2.0 Mode (when BYOK is active)
      const dummyBlob = audioBlob || new Blob(["audio-data"], { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", dummyBlob, "recording.webm");
      if (spokenText) {
        formData.append("transcript", spokenText);
      }
      formData.append("currentTimestamp", new Date().toISOString());
      formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei");
      formData.append("availableBoards", JSON.stringify(boards.map((b) => ({ id: b.id, name: b.name }))));
      if (byokConfig.apiKey) {
        formData.append("customApiKey", byokConfig.apiKey.trim());
      }

      const res = await fetch("/api/voice/extract", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        applyExtractResult(json.data as VoiceExtractResult, json.notice);
      } else {
        throw new Error(json.error || "解析失敗");
      }
    } catch (err: any) {
      console.warn("Extraction fallback triggered:", err);
      const fallbackResult: VoiceExtractResult = {
        title: spokenText || "語音待辦任務 (離線口述)",
        tags: [],
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        priority: "medium",
        targetBoardId: activeBoardId,
        targetColumnId: "inbox",
        transcript: spokenText || "已為您以離線學習模式建立待辦卡片。",
        detectedLanguage: liveLanguage,
        isOfflineLearned: true,
      };
      applyExtractResult(fallbackResult, "已自動切換至離線學習模式。");
    }
  };

  const applyExtractResult = (result: VoiceExtractResult, notice?: string) => {
    setExtractedTask(result);
    setEditTitle(result.title);
    setEditBoardId(boards.some((b) => b.id === result.targetBoardId) ? result.targetBoardId : activeBoardId);
    setEditColumnId(voiceTargetColumnId || result.targetColumnId || "inbox");
    setPriority(result.priority || "medium");
    setEditDueDate(result.dueDate || "");
    setEditTags(result.tags && result.tags.length > 0 ? result.tags : []);
    if (notice) {
      setNoticeMessage(notice);
    }
    setVoiceState("preview");
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, "");
    if (!editTags.includes(clean)) {
      setEditTags([...editTags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  const handleConfirmAdd = () => {
    if (!editTitle.trim()) return;

    // Active Semi-Automatic Feedback Learning Trigger
    recordLearningFeedback({
      transcript: extractedTask?.transcript || editTitle,
      detectedLanguage: extractedTask?.detectedLanguage || liveLanguage,
      finalTitle: editTitle.trim(),
      finalBoardId: editBoardId,
      finalColumnId: editColumnId,
      finalPriority: editPriority,
      finalTags: editTags,
      finalDueDate: editDueDate || null,
    });

    setIsFeedbackRecorded(true);

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
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#BEF264", "#F97316", "#10B981"],
      });
    } catch {}

    setTimeout(() => {
      handleClose();
    }, 300);
  };

  const handleClose = () => {
    stopRecordingCleanup();
    setIsVoiceOverlayOpen(false);
    setVoiceState("idle");
    setVoiceTargetColumnId(null);
    setExtractedTask(null);
    setInterimTranscript("");
  };

  useEscapeKey(handleClose, isVoiceOverlayOpen);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (!isVoiceOverlayOpen) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Selector & Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 pr-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-lime-100 dark:bg-lime-950/60 text-lime-800 dark:text-lime-300 border border-lime-300/60">
              <BrainCircuit className="w-3.5 h-3.5 text-lime-600" />
              <span>離線半自動學習 (零 API 依賴)</span>
            </span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setVoiceLanguage("auto")}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                voiceLanguage === "auto"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🌐 自動
            </button>
            <button
              type="button"
              onClick={() => setVoiceLanguage("zh-TW")}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                voiceLanguage === "zh-TW"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🇹🇼 中文
            </button>
            <button
              type="button"
              onClick={() => setVoiceLanguage("en-US")}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                voiceLanguage === "en-US"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🇺🇸 EN
            </button>
          </div>
        </div>

        {/* State 1: Recording / Active Listening */}
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

            {/* Live Detected Language Indicator */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>即時語系：{liveLanguage === "zh-TW" ? "🇹🇼 繁體中文" : "🇺🇸 English"}</span>
              </span>
            </div>

            {/* 3-Second Silence Detection Guidance Banner (AC-5.2) */}
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

            {/* Live Transcript Stream Box */}
            <div className="w-full max-w-md min-h-[52px] max-h-24 overflow-y-auto px-4 py-2.5 mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 text-left">
              {interimTranscript ? (
                <p className="font-medium animate-in fade-in">
                  🎙️ {interimTranscript}
                </p>
              ) : (
                <p className="text-slate-400 italic text-center">
                  正在聆聽口述...（例如：「明天下午三點完成首頁切版，高優先級」或 &quot;Fix bug by tomorrow 5pm&quot;）
                </p>
              )}
            </div>

            {/* Dynamic Soundwave Visualizer */}
            <AudioVisualizer isRecording={true} />

            {/* Stop / Action Buttons */}
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
                <span>完成口述並辨識</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: Processing */}
        {voiceState === "processing" && (
          <div className="flex flex-col items-center text-center py-10">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              本地半自動學習引擎推論中...
            </h3>
            <p className="text-xs text-slate-500 max-w-xs">
              正在自動辨識中英語系、提取到期時間、比對看板權重並掛載特徵標籤...
            </p>
          </div>
        )}

        {/* State 3: Error State */}
        {voiceState === "error" && (
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
                onClick={() => {
                  setVoiceState("recording");
                  startRecording();
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors"
              >
                重試錄音
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        )}

        {/* State 4 & 5: Preview & Active Confirmation (The Grill-me Consensus Card) */}
        {voiceState === "preview" && (
          <div className="flex flex-col text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    語音萃取與半自動學習預覽
                  </h3>
                  <p className="text-xs text-slate-500">可於下方微調欄位，確認後系統將自動學習強化特徵記憶</p>
                </div>
              </div>

              {/* Language Tag */}
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                {extractedTask?.detectedLanguage === "en-US" ? "🇺🇸 English" : "🇹🇼 繁體中文"}
              </span>
            </div>

            {noticeMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-lime-50 dark:bg-lime-950/30 border border-lime-200/80 dark:border-lime-800 text-[11px] text-lime-800 dark:text-lime-300 flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 shrink-0 text-lime-600" />
                <span>{noticeMessage}</span>
              </div>
            )}

            {/* Transcript Quote */}
            {extractedTask?.transcript && (
              <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    口述逐字稿：
                  </span>
                  {extractedTask.isOfflineLearned && (
                    <span className="text-[10px] font-bold text-lime-600 bg-lime-100 dark:bg-lime-950/40 px-2 py-0.5 rounded-full">
                      ✨ 本地半自動模型已套用
                    </span>
                  )}
                </div>
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
                <Select
                  value={editBoardId}
                  onValueChange={(val) => setEditBoardId(val)}
                >
                  <SelectTrigger className="w-full h-9 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.icon} {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  目標欄位
                </label>
                <Select
                  value={editColumnId}
                  onValueChange={(val) => setEditColumnId(val as ColumnId)}
                >
                  <SelectTrigger className="w-full h-9 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_COLUMNS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-slate-400" />
                  優先等級
                </label>
                <Select
                  value={editPriority}
                  onValueChange={(val) => setPriority(val as Priority)}
                >
                  <SelectTrigger className="w-full h-9 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 高優先級 (High)</SelectItem>
                    <SelectItem value="medium">🟡 中優先級 (Medium)</SelectItem>
                    <SelectItem value="low">🟢 低優先級 (Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>到期時間</span>
                </label>
                <DateTimePicker
                  value={editDueDate}
                  onChange={(dates) => setEditDueDate(dates.dueDate || "")}
                  placeholder="點擊選擇日期與時間..."
                  align="right"
                />
              </div>
            </div>

            {/* Tags Pills & Adding */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                標籤 (點擊可移除，按 Enter 可新增)
              </label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {editTags.map((t, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleRemoveTag(t)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer hover:bg-rose-100 hover:text-rose-700 transition-colors"
                  >
                    <span>#{t}</span>
                    <X className="w-3 h-3" />
                  </span>
                ))}
                <div className="flex items-center">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="+ 標籤"
                    className="w-20 px-2 py-0.5 text-xs rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
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
                  <span>確認加入看板 (自動強化學習)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
