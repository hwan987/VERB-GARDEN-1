/**
 * Web Speech Synthesis (TTS) service for crisp English pronunciation.
 * Works natively without downloading massive audio files.
 * Accurately tracks when speech starts and finishes so options unlock right after.
 */

class TTSService {
  private isSupported: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isSupported = true;
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.isSupported) return;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural English US voices
    const preferred = voices.find(
      (v) => (v.lang === 'en-US' || v.lang.startsWith('en')) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferred) {
      this.selectedVoice = preferred;
    }
  }

  public speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      rate?: number;
    }
  ) {
    if (!this.isSupported) {
      options?.onStart?.();
      // Graceful fallback for environments with no audio synthesizer
      setTimeout(() => {
        options?.onEnd?.();
      }, 500);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = options?.rate || 0.85; // Clean & clear for elementary students
      utterance.pitch = 1.05;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      let completed = false;
      const finish = () => {
        if (!completed) {
          completed = true;
          this.isSpeaking = false;
          this.currentUtterance = null;
          options?.onEnd?.();
        }
      };

      utterance.onstart = () => {
        this.isSpeaking = true;
        options?.onStart?.();
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = () => {
        finish();
      };

      // Safety timeout: Unlock if browser freezes the speech event
      setTimeout(() => {
        if (!completed) {
          finish();
        }
      }, 3000);

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      options?.onEnd?.();
    }
  }

  public cancel() {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public getSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const tts = new TTSService();
