import { VoiceLanguage } from "../types/voice";

export interface SpeechRecognitionHandlers {
  onInterim?: (transcript: string) => void;
  onFinal?: (transcript: string, detectedLang: "zh-TW" | "en-US") => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onAudioLevel?: (level: number) => void;
}

export class WebSpeechService {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: VoiceLanguage = "auto";
  private finalTranscript = "";

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public start(
    handlers: SpeechRecognitionHandlers,
    preferredLang: VoiceLanguage = "auto"
  ): boolean {
    if (!this.isSupported()) {
      handlers.onError?.("您的瀏覽器尚未支援 Web Speech API，建議使用 Chrome 或 Edge 瀏覽器。");
      return false;
    }

    this.stop();
    this.finalTranscript = "";
    this.currentLanguage = preferredLang;

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      const recognition = new SpeechRecognitionClass();
      this.recognition = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Set recognition language
      if (preferredLang === "en-US") {
        recognition.lang = "en-US";
      } else {
        recognition.lang = "zh-TW";
      }

      recognition.onstart = () => {
        this.isListening = true;
      };

      recognition.onresult = (event: any) => {
        let interimText = "";
        let accumulatedFinal = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptChunk = result[0]?.transcript || "";

          if (result.isFinal) {
            accumulatedFinal += transcriptChunk;
          } else {
            interimText += transcriptChunk;
          }
        }

        if (accumulatedFinal) {
          this.finalTranscript += (this.finalTranscript ? " " : "") + accumulatedFinal.trim();
        }

        const currentDisplay = (this.finalTranscript + " " + interimText).trim();
        handlers.onInterim?.(currentDisplay);
      };

      recognition.onerror = (event: any) => {
        console.warn("Web Speech API Error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          handlers.onError?.("麥克風存取權限已被拒絕，請於瀏覽器網址列解除限制。");
        } else if (event.error === "no-speech") {
          // Keep listening or ignore
        } else if (event.error === "network") {
          handlers.onError?.("語音辨識網路中斷，請重試。");
        } else {
          handlers.onError?.(`語音辨識異常: ${event.error}`);
        }
      };

      recognition.onend = () => {
        this.isListening = false;
        handlers.onEnd?.();
      };

      recognition.start();
      return true;
    } catch (e: any) {
      console.error("Failed to start SpeechRecognition:", e);
      handlers.onError?.(e.message || "無法啟動語音辨識");
      return false;
    }
  }

  public stop(): string {
    const text = this.finalTranscript.trim();
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
        if (typeof this.recognition.abort === "function") {
          this.recognition.abort();
        }
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
      this.recognition = null;
    }
    this.isListening = false;
    return text;
  }

  public getFinalTranscript(): string {
    return this.finalTranscript.trim();
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const webSpeechService = new WebSpeechService();
