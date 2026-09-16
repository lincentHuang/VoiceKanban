import { useState, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ColumnId, Priority, DEFAULT_COLUMNS } from "@/core/types/task";
import { VoiceExtractResult } from "@/core/types/voice";
import { webSpeechService } from "@/core/services/webSpeechService";
import { audioRecorderService } from "@/core/services/audioRecorderService";
import { detectLanguage, parseTranscriptLocally } from "@/core/services/localNlpParser";
import confetti from "canvas-confetti";

export function useVoiceCapture() {
  const store = useKanbanStore();
  const { isVoiceOverlayOpen, setIsVoiceOverlayOpen, voiceState, setVoiceState, voiceLanguage, extractedTask, setExtractedTask, boards, activeBoardId, addTask, voiceTargetColumnId, setVoiceTargetColumnId, byokConfig } = store;

  const [recordingDuration, setRecordingDuration] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [liveLanguage, setLiveLanguage] = useState<"zh-TW" | "en-US">("zh-TW");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSilentWarning, setIsSilentWarning] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editBoardId, setEditBoardId] = useState(activeBoardId);
  const [editColumnId, setEditColumnId] = useState<ColumnId>("in_progress");
  const [editPriority, setPriority] = useState<Priority>("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasReceivedSpeechRef = useRef(false);
  const cloudRecordingActiveRef = useRef(false);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    if (silenceTimeoutRef.current) { clearTimeout(silenceTimeoutRef.current); silenceTimeoutRef.current = null; }
    webSpeechService.stop();
    if (cloudRecordingActiveRef.current) { audioRecorderService.stop(); cloudRecordingActiveRef.current = false; }
  };

  const startRecording = async () => {
    setInterimTranscript(""); setErrorMessage(null); setIsSilentWarning(false); hasReceivedSpeechRef.current = false;
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = setTimeout(() => { if (!hasReceivedSpeechRef.current) setIsSilentWarning(true); }, 3000);

    if (webSpeechService.isSupported()) {
      webSpeechService.start({
        onInterim: (t) => { if (t.trim()) { hasReceivedSpeechRef.current = true; setIsSilentWarning(false); setInterimTranscript(t); setLiveLanguage(detectLanguage(t)); } },
        onNoSpeech: () => { if (!hasReceivedSpeechRef.current) setIsSilentWarning(true); },
        onError: (err) => { if (err.includes("存取權限") || err.includes("異常")) { setErrorMessage(err); setVoiceState("error"); } },
      }, voiceLanguage);
    }

    // When the user has an active Gemini key, also capture raw audio so the
    // final transcript/extraction can go through cloud multimodal reasoning
    // instead of the local browser recognizer, which is what "更好的雲端語音辨識" needs.
    if (byokConfig.isCustomKeyActive && byokConfig.apiKey && audioRecorderService.isSupported()) {
      cloudRecordingActiveRef.current = await audioRecorderService.start();
    } else {
      cloudRecordingActiveRef.current = false;
    }

    setRecordingDuration(0);
    timerIntervalRef.current = setInterval(() => setRecordingDuration((p) => p + 1), 1000);
  };

  const applyExtractedResult = (res: VoiceExtractResult) => {
    setExtractedTask(res);
    setEditTitle(res.title);
    const boardId = boards.some((b) => b.id === res.targetBoardId) ? res.targetBoardId : activeBoardId || boards[0]?.id || "board-work";
    setEditBoardId(boardId);
    const suggested = (res.targetColumnId && res.targetColumnId !== "inbox" ? res.targetColumnId : voiceTargetColumnId || "inbox") as ColumnId;
    // The board may not have the suggested column (e.g. a three-column board that never had
    // "waiting"), which would otherwise drop the card into a column that does not exist.
    const boardColumns = boards.find((b) => b.id === boardId)?.columns || DEFAULT_COLUMNS;
    const columnExists = suggested === "inbox" || boardColumns.some((c) => c.id === suggested);
    setEditColumnId(columnExists ? suggested : (boardColumns[0]?.id || "inbox") as ColumnId);
    setPriority(res.priority || "medium");
    setEditDueDate(res.dueDate || "");
    setEditTags(res.tags || []);
    setVoiceState("preview");
  };

  const runLocalExtraction = (text: string) => {
    setTimeout(() => {
      const activeBoard = boards.find((b) => b.id === activeBoardId);
      const context = { boards: boards.map((b) => ({ id: b.id, name: b.name })), activeBoardId: activeBoardId || boards[0]?.id || "board-work", columns: (activeBoard?.columns || DEFAULT_COLUMNS).map((c) => ({ id: c.id, title: c.title })) };
      const res = parseTranscriptLocally(text || "語音待辦任務", context);
      applyExtractedResult(res);
    }, 300);
  };

  const handleStopAndProcess = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const text = (interimTranscript || webSpeechService.stop()).trim();
    const wasCloudRecording = cloudRecordingActiveRef.current;
    cloudRecordingActiveRef.current = false;
    setVoiceState("processing");

    const audioBlob = wasCloudRecording ? await audioRecorderService.stop() : null;

    if (audioBlob && byokConfig.apiKey) {
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "voice-input.webm");
        formData.append("currentTimestamp", new Date().toISOString());
        formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei");
        formData.append("availableBoards", JSON.stringify(boards.map((b) => ({ id: b.id, name: b.name }))));
        formData.append("customApiKey", byokConfig.apiKey);

        const response = await fetch("/api/voice/extract", { method: "POST", body: formData });
        const json = await response.json();
        if (json.success && json.data) {
          applyExtractedResult(json.data as VoiceExtractResult);
          return;
        }
        console.warn("Cloud voice extraction returned no data, falling back to local parser:", json.error);
      } catch (e) {
        console.warn("Cloud voice extraction failed, falling back to local parser:", e);
      }
    }

    runLocalExtraction(text);
  };

  const handleConfirmAdd = () => {
    if (!editTitle.trim()) return;
    addTask({ title: editTitle.trim(), description: "", boardId: editBoardId, columnId: editColumnId, priority: editPriority, tags: editTags, dueDate: editDueDate || null, completed: false });
    try { confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 }, colors: ["#BEF264", "#F97316", "#10B981"] }); } catch {}
    setTimeout(() => handleClose(), 300);
  };

  const handleClose = () => {
    stopRecordingCleanup(); setIsVoiceOverlayOpen(false); setVoiceState("idle"); setVoiceTargetColumnId(null); setExtractedTask(null); setInterimTranscript("");
  };

  return {
    isVoiceOverlayOpen, voiceState, setVoiceState, recordingDuration, isSilentWarning, interimTranscript, errorMessage,
    extractedTask, editTitle, setEditTitle, editBoardId, setEditBoardId, editColumnId, setEditColumnId, editPriority, setPriority,
    editDueDate, setEditDueDate, editTags, setEditTags, tagInput, setTagInput, boards, startRecording, stopRecordingCleanup,
    handleStopAndProcess, handleConfirmAdd, handleClose,
  };
}
