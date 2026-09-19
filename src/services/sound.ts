/**
 * Web Audio API synthesizer for ultra-lightweight sound effects (0KB assets).
 * Works offline, instant latency, zero external network downloads.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Read persisted mute state
    try {
      const saved = localStorage.getItem('gyv_sound_muted');
      if (saved !== null) {
        this.isMuted = JSON.parse(saved);
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('gyv_sound_muted', JSON.stringify(this.isMuted));
    } catch {
      // ignore
    }
    if (!this.isMuted) {
      this.play('click');
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public play(type: 'sprout' | 'bloom' | 'correct' | 'wrong' | 'click' | 'celebrate') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (type === 'click') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'correct') {
        // High pleasant ding-dong (E5 -> G5)
        const notes = [659.25, 783.99];
        notes.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = now + i * 0.1;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          osc.stop(start + 0.28);
        });
      } else if (type === 'wrong') {
        // Gentle soft thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(130, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'sprout') {
        // Playful bubbly rising pop (sprouting leaf)
        const freqs = [392.0, 523.25, 659.25]; // G4, C5, E5
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = now + idx * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.16, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          osc.stop(start + 0.2);
        });
      } else if (type === 'bloom') {
        // Radiant sparkling flower blossom chime (C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = now + idx * 0.09;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.18, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          osc.stop(start + 0.45);
        });
      } else if (type === 'celebrate') {
        // Victory fanfare
        const chordNotes = [
          { f: 523.25, d: 0.12, t: 0.0 }, // C5
          { f: 659.25, d: 0.12, t: 0.12 }, // E5
          { f: 783.99, d: 0.12, t: 0.24 }, // G5
          { f: 1046.5, d: 0.45, t: 0.36 }, // C6 long
        ];
        chordNotes.forEach(({ f, d, t }) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = now + t;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, start);
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + d);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          osc.stop(start + d + 0.05);
        });
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  }
}

export const sound = new SoundService();
