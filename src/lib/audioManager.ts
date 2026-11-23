import type { SpeechLang } from "@/types/content";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

class AudioManager {
  private ctx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private muted = false;
  private slowMode = false;

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopSpeech();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setSlowMode(slow: boolean) {
    this.slowMode = slow;
  }

  public isSlowMode(): boolean {
    return this.slowMode;
  }

  /**
   * Unlocks Web Audio on iPadOS Safari during a user tap gesture.
   */
  public unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public stopSpeech() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore Safari speechSynthesis cancel errors
      }
    }
  }

  public async speak(
    text: string,
    options?: { audioKey?: string; lang?: SpeechLang; slow?: boolean }
  ): Promise<void> {
    if (typeof window === "undefined") return;
    this.unlock();
    this.stopSpeech();

    const lang = options?.lang ?? "en-GB";
    const rate = options?.slow ?? this.slowMode ? 0.74 : 1.0;

    if (options?.audioKey && lang === "en-GB") {
      const url = `${BASE_PATH}/audio/en-GB/${options.audioKey}.mp3`;
      try {
        await this.playAudioFile(url, rate);
        return;
      } catch {
        // Gracefully fall back to Web Speech API if MP3 missing or blocked
      }
    }

    this.speakWithWebSpeech(text, lang, rate);
  }

  private playAudioFile(url: string, rate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.playbackRate = rate;
      // Preserve natural pitch on iPad Safari when slowing down
      const safariAudio = audio as HTMLAudioElement & {
        preservesPitch?: boolean;
        webkitPreservesPitch?: boolean;
      };
      safariAudio.preservesPitch = true;
      safariAudio.webkitPreservesPitch = true;

      this.currentAudio = audio;
      audio.onended = () => {
        if (this.currentAudio === audio) this.currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        if (this.currentAudio === audio) this.currentAudio = null;
        reject(new Error(`Failed to load audio: ${url}`));
      };

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((err) => {
          if (this.currentAudio === audio) this.currentAudio = null;
          reject(err);
        });
      }
    });
  }

  private speakWithWebSpeech(text: string, lang: SpeechLang, rate: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) =>
            v.lang.toLowerCase() === lang.toLowerCase() &&
            /serena|daniel|kate|martha|sonia|samantha|zosia/i.test(v.name)
        ) ||
        voices.find((v) =>
          v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())
        );
      if (preferred) {
        utterance.voice = preferred;
      }
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors on restricted browsers
    }
  }

  private playTone(
    freq: number,
    startOffset: number,
    duration: number,
    type: OscillatorType = "sine",
    gainPeak = 0.16
  ) {
    if (this.muted || typeof window === "undefined") return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + startOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.playTone(540, 0, 0.06, "triangle", 0.08);
  }

  public playFlip() {
    this.playTone(420, 0, 0.07, "sine", 0.08);
    this.playTone(620, 0.04, 0.08, "sine", 0.08);
  }

  public playSuccess() {
    // Warm cheerful major triad chime (C5 -> E5 -> G5)
    this.playTone(523.25, 0, 0.16, "triangle", 0.15);
    this.playTone(659.25, 0.09, 0.18, "triangle", 0.16);
    this.playTone(783.99, 0.18, 0.28, "triangle", 0.18);
  }

  public playGentleTryAgain() {
    // Soft, encouraging two-note nudge (never harsh)
    this.playTone(349.23, 0, 0.14, "sine", 0.11);
    this.playTone(311.13, 0.11, 0.18, "sine", 0.09);
  }

  public playFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx * 0.1, idx === notes.length - 1 ? 0.45 : 0.16, "triangle", 0.17);
    });
  }
}

export const audioManager = new AudioManager();
