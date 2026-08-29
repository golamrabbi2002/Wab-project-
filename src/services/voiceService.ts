// Web Speech Recognition & Natural Speech Synthesis Service for Continuous Gemini Live Experience

export class VoiceService {
  private static recognition: any = null;
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static isSpeakingNow = false;
  private static isListeningNow = false;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static autoRestartOnEnd = false;
  private static activeCallbacks: {
    onResult?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  } = {};

  /**
   * Check if speech recognition is supported in current browser
   */
  static isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Start listening via Microphone with automatic live stream handling
   */
  static startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    continuousLiveMode = true
  ): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      onError('আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট করে না। দয়া করে ক্রোম (Chrome) বা এজ (Edge) ব্রাউজার ব্যবহার করুন।');
      return false;
    }

    this.activeCallbacks = { onResult, onError, onEnd };
    this.autoRestartOnEnd = continuousLiveMode;

    try {
      this.stopListening();
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // We use session-by-session for crisp final transcript locks
      this.recognition.interimResults = true;
      this.recognition.lang = 'bn-BD'; // Bengali (Bangladesh) primary with fallback recognition

      this.recognition.onstart = () => {
        this.isListeningNow = true;
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        if (event && event.results) {
          for (let i = event.resultIndex || 0; i < event.results.length; ++i) {
            const resultItem = event.results[i];
            if (resultItem && resultItem[0]) {
              if (resultItem.isFinal) {
                final += resultItem[0].transcript || '';
              } else {
                interim += resultItem[0].transcript || '';
              }
            }
          }
        }
        if (final && final.trim()) {
          onResult(final.trim(), true);
        } else if (interim && interim.trim()) {
          onResult(interim.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        const errType = event?.error;
        // no-speech, aborted, and audio-capture are expected browser lifecycle events in live continuous voice mode
        if (errType === 'no-speech' || errType === 'aborted') {
          // Do not log or show error - let onend smoothly re-arm if active
          return;
        }

        if (errType === 'not-allowed') {
          this.autoRestartOnEnd = false;
          this.isListeningNow = false;
          onError('মাইক্রোফোন পারমিশন এলাও (Allow) করুন। ব্রাউজারের অ্যাড্রেস বার থেকে মাইক পারমিশন অন করুন।');
        } else {
          if (!this.autoRestartOnEnd) {
            this.isListeningNow = false;
            onError('কথা বুঝতে সাময়িক অসুবিধা হয়েছে। আবার বলুন।');
          }
        }
      };

      this.recognition.onend = () => {
        this.isListeningNow = false;
        onEnd();
      };

      this.recognition.start();
      this.isListeningNow = true;
      return true;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      this.isListeningNow = false;
      onError(err?.message || 'মাইক্রোফোন চালু করতে সমস্যা হয়েছে।');
      return false;
    }
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
   * Speak text out loud in natural Bengali/English
   */
  static speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !this.synth) {
      onEnd?.();
      return;
    }

    this.stopSpeaking();

    // Clean markdown and non-verbal tokens for crisp audio speech
    const cleanText = text
      .replace(/[*_#`~>\[\]\(\)\{\}]/g, ' ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      onEnd?.();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;

      // Detect Bengali or high quality voice if available
      const voices = this.synth.getVoices() || [];
      const bnVoice = voices.find((v) => v.lang.includes('bn') || v.name.includes('Bangla') || v.name.includes('Bengali'));
      if (bnVoice) {
        utterance.voice = bnVoice;
      }
      utterance.lang = 'bn-BD';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        this.isSpeakingNow = true;
        onStart?.();
      };

      utterance.onend = () => {
        this.isSpeakingNow = false;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.isSpeakingNow = false;
        onEnd?.();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
      this.isSpeakingNow = false;
      onEnd?.();
    }
  }

  /**
   * Stop any active speech synthesis
   */
  static stopSpeaking() {
    if (typeof window !== 'undefined' && this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeakingNow = false;
  }

  static isSpeaking(): boolean {
    return this.isSpeakingNow;
  }

  static isListening(): boolean {
    return this.isListeningNow;
  }
}
