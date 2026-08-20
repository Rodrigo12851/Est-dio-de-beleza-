// Audio notification & ringtone generator using Web Audio API
// 100% reliable on mobile and desktop without external audio file dependencies

class NotificationSoundService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('AudioContext not available:', e);
      return null;
    }
  }

  // Play a pleasant, multi-tone chime melody for new bookings
  public playBookingRingtone() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Melody notes: D5 (587.33Hz), F#5 (739.99Hz), A5 (880.00Hz), D6 (1174.66Hz)
      const notes = [
        { freq: 587.33, start: now + 0.0, duration: 0.22, gain: 0.3 },
        { freq: 739.99, start: now + 0.18, duration: 0.22, gain: 0.35 },
        { freq: 880.00, start: now + 0.36, duration: 0.28, gain: 0.4 },
        { freq: 1174.66, start: now + 0.58, duration: 0.55, gain: 0.45 },
        // Harmonic echo
        { freq: 880.00, start: now + 0.85, duration: 0.3, gain: 0.25 },
        { freq: 1174.66, start: now + 1.05, duration: 0.65, gain: 0.35 },
      ];

      notes.forEach(({ freq, start, duration, gain: peakGain }) => {
        // Oscillator 1 (Sine - pure tone)
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        // Gentle envelope (attack -> decay)
        gainNode.gain.setValueAtTime(0.001, start);
        gainNode.gain.exponentialRampToValueAtTime(peakGain, start + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration + 0.05);

        // Oscillator 2 (Soft triangle for warmth)
        const osc2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 0.5, start); // sub octave

        gainNode2.gain.setValueAtTime(0.001, start);
        gainNode2.gain.exponentialRampToValueAtTime(peakGain * 0.25, start + 0.04);
        gainNode2.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc2.connect(gainNode2);
        gainNode2.connect(ctx.destination);

        osc2.start(start);
        osc2.stop(start + duration + 0.05);
      });

      // Mobile device vibration if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200, 100, 300]);
        } catch {
          // ignore vibration error
        }
      }
    } catch (e) {
      console.warn('Erro ao tocar som de notificação:', e);
    }
  }

  // Request browser notification permission
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      if (Notification.permission === 'granted') {
        return true;
      }
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    } catch {
      // ignore
    }
    return false;
  }

  // Show native system/browser notification if permitted
  public showSystemNotification(title: string, body: string, icon?: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: icon || '/vite.svg',
          tag: 'salon-appointment',
        });
      }
    } catch {
      // ignore
    }
  }
}

export const notificationSound = new NotificationSoundService();
