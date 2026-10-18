/**
 * Tiny synth for UI blips plus the round-end buzzer sample. The AudioContext is created lazily
 * on the first user gesture so browsers' autoplay rules never block it.
 */
let ctx: AudioContext | null = null;
let enabled = true;
let buzzer: HTMLAudioElement | null = null;

function audio() {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, { at = 0, duration = 0.12, type = 'sine' as OscillatorType, gain = 0.18, slideTo = 0 } = {}) {
  const ac = audio();
  if (!ac || !enabled) return;
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export const sound = {
  setEnabled(on: boolean) {
    enabled = on;
  },
  /** Call from a click/keydown handler once, so later sounds are allowed to play. */
  unlock() {
    audio();
    buzzer ??= Object.assign(new Audio('/round-end-dramatic.mp3'), { preload: 'auto' });
  },
  correct() {
    tone(660, { duration: 0.1, type: 'triangle' });
    tone(990, { at: 0.08, duration: 0.18, type: 'triangle' });
  },
  /** A golden card: a brighter three-note run. */
  golden() {
    tone(784, { duration: 0.1, type: 'triangle' });
    tone(1046, { at: 0.08, duration: 0.1, type: 'triangle' });
    tone(1568, { at: 0.16, duration: 0.28, type: 'triangle' });
  },
  /** A golden card comes up: a quick sparkle. */
  goldenReveal() {
    [1318, 1568, 2093, 2637].forEach((f, i) => tone(f, { at: i * 0.06, duration: 0.22, type: 'sine', gain: 0.1 }));
  },
  skip() {
    tone(220, { duration: 0.22, type: 'sawtooth', gain: 0.08, slideTo: 110 });
  },
  undo() {
    tone(520, { duration: 0.08, type: 'triangle', gain: 0.1, slideTo: 380 });
  },
  tick(urgent: boolean) {
    tone(urgent ? 1180 : 880, { duration: 0.06, type: 'square', gain: urgent ? 0.09 : 0.05 });
  },
  count(final: boolean) {
    tone(final ? 1046 : 523, { duration: final ? 0.35 : 0.15, type: 'triangle', gain: 0.2 });
  },
  buzzer() {
    if (!enabled) return;
    if (buzzer) {
      buzzer.currentTime = 0;
      void buzzer.play().catch(() => undefined);
    } else {
      tone(150, { duration: 0.8, type: 'sawtooth', gain: 0.15 });
    }
  },
};

export const vibrate = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // unsupported
  }
};
