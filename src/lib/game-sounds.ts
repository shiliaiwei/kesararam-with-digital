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

/** Synthesized noise burst — used for clap/snap effects */
function playNoise(duration: number, gain = 0.15, startDelay = 0) {
  try {
    const ac = getCtx();
    const bufferSize = ac.sampleRate * duration;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const gainNode = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ac.destination);
    gainNode.gain.setValueAtTime(gain, ac.currentTime + startDelay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startDelay + duration);
    source.start(ac.currentTime + startDelay);
    source.stop(ac.currentTime + startDelay + duration);
  } catch {}
}

/** Single clap burst */
function clap(delay = 0) {
  playNoise(0.06, 0.25, delay);
  playTone(800, 0.04, "sine", 0.05, delay);
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

  /** Crowd clapping — rapid noise bursts */
  clapping() {
    const pattern = [0, 0.12, 0.24, 0.36, 0.48, 0.65, 0.77, 0.89, 1.0, 1.12, 1.24];
    pattern.forEach((t) => clap(t));
  },

  /** "Yeah!" cheer — rising bright tones */
  cheer() {
    playTone(440, 0.08, "sine", 0.2);
    playTone(554, 0.08, "sine", 0.22, 0.07);
    playTone(659, 0.08, "sine", 0.24, 0.14);
    playTone(880, 0.15, "sine", 0.28, 0.21);
    playTone(1047, 0.25, "sine", 0.22, 0.32);
  },

  /** 1st place — full fanfare + clapping */
  rank1() {
    // Triumphant fanfare
    const fanfare = [523, 659, 784, 1047, 1319, 1568, 2093];
    fanfare.forEach((f, i) => playTone(f, 0.18, "sine", 0.28, i * 0.13));
    // Clapping starts after fanfare
    const clapPattern = [1.0, 1.12, 1.24, 1.36, 1.48, 1.6, 1.72, 1.84, 1.96, 2.08, 2.2, 2.32];
    clapPattern.forEach((t) => clap(t));
    // Final chord
    [523, 659, 784].forEach((f) => playTone(f, 0.6, "sine", 0.15, 2.5));
  },

  /** 2nd place — silver fanfare + clapping */
  rank2() {
    const notes = [392, 494, 587, 784, 988, 1175];
    notes.forEach((f, i) => playTone(f, 0.15, "sine", 0.24, i * 0.12));
    const clapPattern = [0.8, 0.92, 1.04, 1.16, 1.28, 1.4, 1.52, 1.64, 1.76];
    clapPattern.forEach((t) => clap(t));
  },

  /** 3rd place — bronze fanfare + clapping */
  rank3() {
    const notes = [349, 440, 523, 698, 880];
    notes.forEach((f, i) => playTone(f, 0.14, "sine", 0.22, i * 0.11));
    const clapPattern = [0.65, 0.77, 0.89, 1.01, 1.13, 1.25, 1.37];
    clapPattern.forEach((t) => clap(t));
  },

  /** Generic top-10 result — short positive jingle */
  result_good() {
    playTone(523, 0.1, "sine", 0.25);
    playTone(659, 0.1, "sine", 0.25, 0.1);
    playTone(784, 0.18, "sine", 0.25, 0.2);
    clap(0.35);
    clap(0.47);
    clap(0.59);
  },

  podium() {
    // Victory fanfare for podium display
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((f, i) => playTone(f, 0.2, "sine", 0.25, i * 0.15));
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
