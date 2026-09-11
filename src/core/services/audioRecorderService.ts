const CANDIDATE_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private mimeType = "";

  public isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof MediaRecorder !== "undefined"
    );
  }

  public async start(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mimeType = CANDIDATE_MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || "";
      this.mediaRecorder = this.mimeType
        ? new MediaRecorder(this.stream, { mimeType: this.mimeType })
        : new MediaRecorder(this.stream);

      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      this.mediaRecorder.start();
      return true;
    } catch (e) {
      console.warn("Failed to start audio recording for cloud transcription:", e);
      this.cleanup();
      return false;
    }
  }

  public stop(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        this.cleanup();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = this.chunks.length > 0 ? new Blob(this.chunks, { type: this.mimeType || "audio/webm" }) : null;
        this.cleanup();
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.mediaRecorder = null;
  }
}

export const audioRecorderService = new AudioRecorderService();
