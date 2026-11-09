// Web Speech Recognition & Natural Multi-Engine Speech Synthesis Service
// Provides fluent, human-like Bengali speech playback on desktop, mobile, Chrome, Edge, and Safari.

export class VoiceService {
  private static recognition: any = null;
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static voices: SpeechSynthesisVoice[] = [];
  private static isSpeakingNow = false;
  private static isListeningNow = false;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static currentAudio: HTMLAudioElement | null = null;
  private static autoRestartOnEnd = false;
  private static isAudioUnlocked = false;

  private static activeCallbacks: {
    onResult?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  } = {};

  static {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
    }
  }

  private static initVoices() {
    if (!this.synth) return;
    const updateVoices = () => {
      try {
        const v = this.synth?.getVoices() || [];
        if (v && v.length > 0) {
          this.voices = v;
        }
      } catch {
        // ignore
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  /**
   * Unlock AudioContext / HTML5 audio on first user gesture (click/tap)
   */
  static unlockAudio() {
    if (this.isAudioUnlocked) return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }
      // Create a tiny silent audio unlock
      const unlockAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      unlockAudio.volume = 0.01;
      unlockAudio.play().then(() => {
        unlockAudio.pause();
      }).catch(() => {});
      this.isAudioUnlocked = true;
    } catch {
      // ignore
    }
  }

  /**
   * Check if speech recognition is supported in current browser
   */
  static isSpeechRecognitionSupported(): boolean {
    return false;
  }

  /**
   * Speech recognition disabled per user requirement - text AI only.
   */
  static startListening(
    _onResult: (transcript: string, isFinal: boolean) => void,
    _onError: (error: string) => void,
    _onEnd: () => void,
    _continuousLiveMode = false
  ): boolean {
    this.isListeningNow = false;
    return false;
  }

  /**
   * Stop listening
   */
  static stopListening() {
    this.autoRestartOnEnd = false;
    this.isListeningNow = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }

  /**
   * Clean text for spoken output (removes markdown, urls, emojis, brackets)
   */
  static cleanForSpeech(raw: string): string {
    return (raw || '')
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/[*_#`~>\[\]\(\)\{\}\|=+]/g, ' ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[•●▪■◆★☆✓✔✕✖]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Speak text out loud in natural Bengali using dual-engine fallback:
   * 1. High-fidelity Bengali Audio Stream (fluent native pronunciation, no OS voice pack required)
   * 2. Browser SpeechSynthesis with loaded Bengali voice or resilient system voice
   */
  static speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    this.unlockAudio();
    this.stopSpeaking();

    const cleanText = this.cleanForSpeech(text);
    if (!cleanText) {
      onEnd?.();
      return;
    }

    // Limit chunk size for speech synthesis audio to first 180 characters for crisp, prompt playback
    const spokenChunk = cleanText.length > 200 ? cleanText.slice(0, 195) + '...' : cleanText;

    this.isSpeakingNow = true;
    onStart?.();

    let hasEnded = false;
    const safeEnd = () => {
      if (hasEnded) return;
      hasEnded = true;
      this.isSpeakingNow = false;
      onEnd?.();
    };

    // Primary Engine: High-Quality Bengali Audio Stream
    // Google TTS stream provides native, smooth Bengali pronunciation without requiring installed voice packs
    try {
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(spokenChunk)}&tl=bn&client=tw-ob`;
      const audio = new Audio();
      this.currentAudio = audio;
      audio.crossOrigin = 'anonymous';

      let fallbackTimeout: any = setTimeout(() => {
        // If audio stream doesn't play within 2.5s, fall back to browser speech synthesis
        if (this.isSpeakingNow && !hasEnded) {
          try {
            audio.pause();
          } catch {}
          this.speakViaSpeechSynthesis(spokenChunk, safeEnd);
        }
      }, 2500);

      audio.onplaying = () => {
        clearTimeout(fallbackTimeout);
      };

      audio.onended = () => {
        clearTimeout(fallbackTimeout);
        this.currentAudio = null;
        safeEnd();
      };

      audio.onerror = () => {
        clearTimeout(fallbackTimeout);
        this.currentAudio = null;
        // Fallback to browser SpeechSynthesis
        this.speakViaSpeechSynthesis(spokenChunk, safeEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          clearTimeout(fallbackTimeout);
          this.speakViaSpeechSynthesis(spokenChunk, safeEnd);
        });
      }
    } catch {
      this.speakViaSpeechSynthesis(spokenChunk, safeEnd);
    }
  }

  /**
   * Resilient Browser SpeechSynthesis Engine with Chrome paused-queue unfreeze & GC anchor
   */
  private static speakViaSpeechSynthesis(text: string, onEnd: () => void) {
    if (typeof window === 'undefined' || !this.synth) {
      onEnd();
      return;
    }

    try {
      // Unfreeze paused speech synthesis in Chrome
      if (this.synth.paused) {
        this.synth.resume();
      }

      this.initVoices();
      const voices = this.voices.length > 0 ? this.voices : (this.synth.getVoices() || []);

      // Find authentic Bengali voice if available
      const bnVoice = voices.find(
        (v) =>
          (v.lang && (v.lang.toLowerCase().startsWith('bn') || v.lang.toLowerCase().includes('bengali') || v.lang.toLowerCase().includes('bangla'))) ||
          (v.name && (v.name.toLowerCase().includes('bengali') || v.name.toLowerCase().includes('bangla') || v.name.includes('বাংলা')))
      );

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      // Anchor to global window to prevent Chrome's Garbage Collection bug mid-speech
      (window as any).__auraActiveUtterance = utterance;

      if (bnVoice) {
        utterance.voice = bnVoice;
        utterance.lang = bnVoice.lang || 'bn-BD';
      } else {
        // If NO Bengali voice is installed on user's OS, do NOT set utterance.lang = 'bn-BD'
        // Because setting 'bn-BD' without an installed voice causes Chrome to throw 'language-unavailable' and remain silent!
        // Instead, find Indian multilingual voice or system default voice
        const regionalVoice = voices.find((v) => v.lang && (v.lang.startsWith('hi') || v.lang.includes('IN')));
        if (regionalVoice) {
          utterance.voice = regionalVoice;
          utterance.lang = regionalVoice.lang;
        } else if (voices.length > 0) {
          utterance.voice = voices[0];
          utterance.lang = voices[0].lang;
        }
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onend = () => {
        (window as any).__auraActiveUtterance = null;
        this.currentUtterance = null;
        onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis event error (handled smoothly):', e);
        (window as any).__auraActiveUtterance = null;
        this.currentUtterance = null;
        onEnd();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis call failed:', err);
      onEnd();
    }
  }

  /**
   * Stop any active speech (both audio stream and synthesis)
   */
  static stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }

    this.isSpeakingNow = false;
    (window as any).__auraActiveUtterance = null;
  }

  static isSpeaking(): boolean {
    return this.isSpeakingNow;
  }

  static isListening(): boolean {
    return this.isListeningNow;
  }
}
