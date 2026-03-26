"use client";

/**
 * Web Audio API sound engine for the quiz game.
 * No external files needed — all sounds are synthesized.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.3,
  startDelay = 0
) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + startDelay);
    gainNode.gain.setValueAtTime(gain, ac.currentTime + startDelay);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ac.currentTime + startDelay + duration
    );
    osc.start(ac.currentTime + startDelay);
    osc.stop(ac.currentTime + startDelay + duration);
  } catch {}
}

export const sounds = {
  correct() {
    playTone(523, 0.1, "sine", 0.3);
    playTone(659, 0.1, "sine", 0.3, 0.1);
    playTone(784, 0.2, "sine", 0.3, 0.2);
  },

  incorrect() {
    playTone(200, 0.15, "sawtooth", 0.2);
    playTone(150, 0.2, "sawtooth", 0.2, 0.15);
  },

  countdown_tick() {
    playTone(880, 0.05, "square", 0.1);
  },

  urgent_tick() {
    playTone(1100, 0.08, "square", 0.2);
  },

  question_start() {
    playTone(392, 0.08, "sine", 0.2);
    playTone(523, 0.08, "sine", 0.2, 0.1);
    playTone(659, 0.15, "sine", 0.25, 0.2);
  },

  question_end() {
    playTone(523, 0.1, "sine", 0.2);
    playTone(440, 0.1, "sine", 0.2, 0.1);
    playTone(349, 0.2, "sine", 0.2, 0.2);
  },

  game_end() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => playTone(f, 0.15, "sine", 0.3, i * 0.12));
  },

  warning() {
    playTone(660, 0.08, "sine", 0.15);
    playTone(880, 0.12, "sine", 0.15, 0.08);
  },

  streak() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      playTone(f, 0.1, "sine", 0.25, i * 0.07)
    );
  },
};

export function playSound(name: keyof typeof sounds) {
  sounds[name]?.();
}

export function playAudioUrl(url: string | null) {
  if (!url) return;
  try {
    const audio = new Audio(url);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch {}
}
