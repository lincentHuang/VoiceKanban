import { useState, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ColumnId, Priority, DEFAULT_COLUMNS } from "@/core/types/task";
import { webSpeechService } from "@/core/services/webSpeechService";
import { learningEngine } from "@/core/services/learningEngine";
import { detectLanguage } from "@/core/services/localNlpParser";
import confetti from "canvas-confetti";

export function useVoiceCapture() {
  const store = useKanbanStore();
  const { isVoiceOverlayOpen, setIsVoiceOverlayOpen, voiceState, setVoiceState, voiceLanguage, extractedTask, setExtractedTask, boards, activeBoardId, addTask, recordLearningFeedback, voiceTargetColumnId, setVoiceTargetColumnId } = store;

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

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    if (silenceTimeoutRef.current) { clearTimeout(silenceTimeoutRef.current); silenceTimeoutRef.current = null; }
    webSpeechService.stop();
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
    setRecordingDuration(0);
    timerIntervalRef.current = setInterval(() => setRecordingDuration((p) => p + 1), 1000);
  };

  const handleStopAndProcess = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const text = (interimTranscript || webSpeechService.stop()).trim();
    setVoiceState("processing");
    setTimeout(() => {
      const activeBoard = boards.find((b) => b.id === activeBoardId);
      const context = { boards: boards.map((b) => ({ id: b.id, name: b.name })), activeBoardId: activeBoardId || boards[0]?.id || "board-work", columns: (activeBoard?.columns || DEFAULT_COLUMNS).map((c) => ({ id: c.id, title: c.title })) };
      const res = learningEngine.extractWithLearning(text || "語音待辦任務", context);
      setExtractedTask(res);
      setEditTitle(res.title);
      setEditBoardId(boards.some((b) => b.id === res.targetBoardId) ? res.targetBoardId : activeBoardId || boards[0]?.id || "board-work");
      setEditColumnId((res.targetColumnId && res.targetColumnId !== "inbox" ? res.targetColumnId : voiceTargetColumnId || "inbox") as ColumnId);
      setPriority(res.priority || "medium");
      setEditDueDate(res.dueDate || "");
      setEditTags(res.tags || []);
      setVoiceState("preview");
    }, 300);
  };

  const handleConfirmAdd = () => {
    if (!editTitle.trim()) return;
    recordLearningFeedback({ transcript: extractedTask?.transcript || editTitle, detectedLanguage: extractedTask?.detectedLanguage || liveLanguage, finalTitle: editTitle.trim(), finalBoardId: editBoardId, finalColumnId: editColumnId, finalPriority: editPriority, finalTags: editTags, finalDueDate: editDueDate || null });
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
