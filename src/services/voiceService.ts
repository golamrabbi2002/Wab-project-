// Web Speech Recognition & Natural Speech Synthesis Service

export class VoiceService {
  private static recognition: any = null;
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static isSpeakingNow = false;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Check if speech recognition is supported in current browser
   */
  static isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Start listening via Microphone
   */
  static startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      onError('আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট করে না। অনুগ্রহ করে ক্রোম ব্রাউজার ব্যবহার করুন বা লিখে মেসেজ পাঠান।');
      return false;
    }

    try {
      this.stopListening();
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'bn-BD'; // Bengali (Bangladesh) primary

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          onResult(final.trim(), true);
        } else if (interim) {
          onResult(interim.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          onError('মাইক্রোফোনের পারমিশন দেওয়া হয়নি। ব্রাউজার সেটিংসে গিয়ে মাইক্রোফোন এলাও করুন।');
        } else if (event.error === 'no-speech') {
          onError('কোনো কথা শোনা যায়নি। আবার মাইক্রোফোন চেপে বলুন।');
        } else {
          onError('কথা বুঝতে সাময়িক অসুবিধা হয়েছে। আবার বলুন।');
        }
      };

      this.recognition.onend = () => {
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      onError(err?.message || 'মাইক্রোফোন চালু করতে সমস্যা হয়েছে।');
      return false;
    }
  }

  /**
   * Stop listening
   */
  static stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
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

    // Clean markdown and non-verbal tokens for crisp audio
    const cleanText = text
      .replace(/[*_#`~>\[\]]/g, '')
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

      // Detect Bengali voice if available
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
}
