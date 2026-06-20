"use client";

/**
 * Web Audio API sound engine for the quiz game.
 * No external files needed — all sounds are synthesized.
 */

let ctx: AudioContext | null = null;

// Audio engine settings
let _muted = false;
let _sfxMuted = false;
let _bgmMuted = false;
let _sfxVolume = 0.5;
let _bgmVolume = 0.15;

if (typeof window !== "undefined") {
  try {
    _muted = localStorage.getItem("kwd_global_muted") === "1";
    _sfxMuted = localStorage.getItem("kwd_sfx_muted") === "1";
    _bgmMuted = localStorage.getItem("kwd_bgm_muted") === "1";
    
    const savedSfxVol = localStorage.getItem("kwd_sfx_volume");
    if (savedSfxVol !== null) _sfxVolume = parseFloat(savedSfxVol);
    
    const savedBgmVol = localStorage.getItem("kwd_bgm_volume");
    if (savedBgmVol !== null) _bgmVolume = parseFloat(savedBgmVol);
  } catch { /* ignore local storage errors */ }
}

export function setSoundsMuted(m: boolean) {
  _muted = m;
  if (typeof window !== "undefined") {
    try { localStorage.setItem("kwd_global_muted", m ? "1" : "0"); } catch {}
  }
}
export function getSoundsMuted(): boolean {
  return _muted;
}

export function setSFXMuted(m: boolean) {
  _sfxMuted = m;
  if (typeof window !== "undefined") {
    try { localStorage.setItem("kwd_sfx_muted", m ? "1" : "0"); } catch {}
  }
}
export function getSFXMuted(): boolean {
  return _sfxMuted;
}

export function setBGMMuted(m: boolean) {
  _bgmMuted = m;
  if (typeof window !== "undefined") {
    try { localStorage.setItem("kwd_bgm_muted", m ? "1" : "0"); } catch {}
  }
}
export function getBGMMuted(): boolean {
  return _bgmMuted;
}

export function setSFXVolume(v: number) {
  _sfxVolume = Math.max(0, Math.min(1, v));
  if (typeof window !== "undefined") {
    try { localStorage.setItem("kwd_sfx_volume", _sfxVolume.toString()); } catch {}
  }
}
export function getSFXVolume(): number {
  return _sfxVolume;
}

export function setBGMVolume(v: number) {
  _bgmVolume = Math.max(0, Math.min(1, v));
  if (typeof window !== "undefined") {
    try { localStorage.setItem("kwd_bgm_volume", _bgmVolume.toString()); } catch {}
  }
}
export function getBGMVolume(): number {
  return _bgmVolume;
}

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
  if (_muted || _sfxMuted) return;
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + startDelay);
    
    // Scale tone volume by sfxVolume setting
    gainNode.gain.setValueAtTime(gain * _sfxVolume, ac.currentTime + startDelay);
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
  if (_muted || _sfxMuted) return;
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
    
    // Scale noise volume by sfxVolume setting
    gainNode.gain.setValueAtTime(gain * _sfxVolume, ac.currentTime + startDelay);
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

function midiToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// BGM loops data
const THEME_TEMPO = {
  lobby: 110,
  quiz: 125,
  victory: 135
};

const MELODIES: Record<string, number[]> = {
  lobby: [
    72, 0, 76, 0, 79, 0, 81, 0,
    79, 0, 76, 0, 74, 0, 72, 0,
    76, 0, 79, 0, 81, 0, 84, 0,
    79, 0, 76, 0, 74, 0, 72, 0
  ],
  quiz: [
    76, 0, 77, 0, 79, 79, 81, 0,
    79, 0, 77, 0, 76, 0, 74, 0,
    74, 0, 75, 0, 77, 77, 79, 0,
    77, 0, 76, 0, 74, 0, 72, 0
  ],
  victory: [
    72, 72, 79, 79, 84, 84, 79, 79,
    81, 84, 79, 84, 88, 86, 84, 84
  ]
};

const BASSLINES: Record<string, number[]> = {
  lobby: [
    48, 48, 48, 48, 55, 55, 55, 55,
    53, 53, 53, 53, 55, 55, 55, 55,
    48, 48, 48, 48, 55, 55, 55, 55,
    53, 53, 53, 53, 48, 48, 48, 48
  ],
  quiz: [
    48, 48, 55, 55, 41, 41, 48, 48,
    50, 50, 57, 57, 43, 43, 50, 50
  ],
  victory: [
    48, 48, 48, 48, 41, 41, 41, 41,
    43, 43, 43, 43, 48, 48, 48, 48
  ]
};

let bgmSequencerId: any = null;
let currentBgmTheme: string | null = null;
let bgmNextNoteTime = 0.0;
let bgmStep = 0;

function scheduleBgmStep(step: number, time: number, theme: string) {
  if (_bgmMuted || _muted) return;
  try {
    const ac = getCtx();
    const melody = MELODIES[theme];
    const bass = BASSLINES[theme];
    const tempo = THEME_TEMPO[theme as keyof typeof THEME_TEMPO] ?? 100;
    const stepDuration = 60 / tempo / 4; // 16th notes
    
    // 1. Play bass note
    const bassNote = bass[step % bass.length];
    if (bassNote > 0) {
      const osc = ac.createOscillator();
      const gainNode = ac.createGain();
      osc.connect(gainNode);
      gainNode.connect(ac.destination);
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(midiToFreq(bassNote), time);
      
      // Soft bass sound
      gainNode.gain.setValueAtTime(0.06 * _bgmVolume, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 1.5);
      
      osc.start(time);
      osc.stop(time + stepDuration * 1.5);
    }
    
    // 2. Play melody note
    const melNote = melody[step % melody.length];
    if (melNote > 0) {
      const osc = ac.createOscillator();
      const gainNode = ac.createGain();
      osc.connect(gainNode);
      gainNode.connect(ac.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(midiToFreq(melNote), time);
      
      // Bouncy melody sound
      gainNode.gain.setValueAtTime(0.04 * _bgmVolume, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.8);
      
      osc.start(time);
      osc.stop(time + stepDuration * 0.8);
    }
  } catch {}
}

export function startBGM(theme: 'lobby' | 'quiz' | 'victory') {
  if (typeof window === "undefined") return;
  try {
    const ac = getCtx();
    if (currentBgmTheme === theme && bgmSequencerId !== null) return;
    
    stopBGM();
    
    currentBgmTheme = theme;
    bgmStep = 0;
    bgmNextNoteTime = ac.currentTime;
    
    const tempo = THEME_TEMPO[theme] ?? 100;
    const stepDuration = 60 / tempo / 4;
    
    const scheduler = () => {
      const scheduleAheadTime = 0.1;
      while (bgmNextNoteTime < ac.currentTime + scheduleAheadTime) {
        scheduleBgmStep(bgmStep, bgmNextNoteTime, theme);
        bgmNextNoteTime += stepDuration;
        bgmStep++;
      }
    };
    
    bgmSequencerId = setInterval(scheduler, 25);
  } catch (e) {
    console.error("Failed to start BGM:", e);
  }
}

export function stopBGM() {
  if (bgmSequencerId !== null) {
    clearInterval(bgmSequencerId);
    bgmSequencerId = null;
  }
  currentBgmTheme = null;
}

export function getCurrentBGMTheme(): string | null {
  return currentBgmTheme;
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
    const fanfare = [523, 659, 784, 1047, 1319, 1568, 2093];
    fanfare.forEach((f, i) => playTone(f, 0.18, "sine", 0.28, i * 0.13));
    const clapPattern = [1.0, 1.12, 1.24, 1.36, 1.48, 1.6, 1.72, 1.84, 1.96, 2.08, 2.2, 2.32];
    clapPattern.forEach((t) => clap(t));
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
  if (!url || _muted || _sfxMuted) return;
  try {
    const audio = new Audio(url);
    audio.volume = 0.8 * _sfxVolume;
    audio.play().catch(() => {});
  } catch {}
}

if (typeof window !== "undefined") {
  const unlockAudio = () => {
    try {
      const ac = getCtx();
      if (ac.state === "suspended") {
        ac.resume();
      }
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    } catch {}
  };
  window.addEventListener("click", unlockAudio, { passive: true });
  window.addEventListener("touchstart", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
}
