/**
 * Game Engine — shared scoring plus server-side state helpers.
 * Authoritative writes still happen on the server; client imports are cosmetic.
 */

import { calculateQuestionScore } from "@/lib/quiz-scoring";

export type ScoringMode = "speed" | "equal";
export type GameStatus = "lobby" | "active" | "paused" | "ended";
export type Difficulty = "easy" | "medium" | "hard";

export interface ScoreResult {
  baseScore: number;
  speedBonus: number;
  streakBonus: number;
  variableDopamineBonus?: number;
  totalPoints: number;
}

// ── SIMPLE LIVE SCORING CONSTANTS ───────────────────────────────────────────
/**
 * Base labels shown to learners. Harder questions start higher, then speed and
 * streak add small bonuses on top.
 */
export const DIFFICULTY_BASE: Record<string, number> = {
  easy: 2,
  medium: 4,
  hard: 6,
};

/** Streak bonus: +1 per consecutive correct answer beyond the first, capped at +5. */
export const STREAK_BONUS_STEP = 1;
export const STREAK_BONUS_MAX = 5;

/**
 * Minimum response time (ms) ever credited. Answers faster than this are clamped
 * up before the speed bonus is calculated.
 */
export const MIN_RESPONSE_MS = 500;

/**
 * Daily solo play limits per user tier.
 * These create psychological pressure to move up the funnel:
 *   Guest → Register (free) → Join Class → Teacher subscribes
 */
export const PLAY_LIMITS = {
  /** No account (guest) — tracked via localStorage on client */
  guest: 9,
  /** Registered student, NOT in any class */
  student: 67,
  /** Registered student, in a class whose teacher is on the free plan */
  studentClass: 100,
  /** Registered student, in a class whose teacher has an active subscription */
  studentPro: 200,
} as const;

export type PlayLimitTier = keyof typeof PLAY_LIMITS;

/** Banner text shown on all solo game mode cards. */
export const SOLO_COMING_SOON_NOTE = {
  en: "Practice mode — scores are for ranking only. Join a live class game to earn claimable reward points.",
  kh: "របៀបអនុវត្ត — ពិន្ទុសម្រាប់តែចំណាត់ថ្នាក់ប៉ុណ្ណោះ។ ចូលរួមហ្គេមផ្ទាល់ក្នុងថ្នាក់ ដើម្បីទទួលពិន្ទុដែលអាចដូររង្វាន់បាន។",
} as const;

/**
 * calculateScore is the SINGLE SOURCE OF TRUTH for scoring. Every modern game
 * type scores through it: live sessions, solo practice, daily challenge, priority
 * puzzle, and kid arcade games — so solo and live share ONE formula.
 *
 * ── KWD small-score method (0–2 per question) ────────────────────────────────
 * Delegates to `calculateQuestionScore` in src/lib/quiz-scoring.ts (the locked
 * research method — see .claude/skills/kwd-brand-design/references/quiz-scoring.md):
 *
 *   baseScore   = correct ? 1 : 0
 *   streakBonus = correct AND already on a run (currentStreak ≥ 2) → 1   (max +1)
 *   totalPoints = base + streak  →  0, 1, or 2
 *
 * Difficulty no longer changes the base (every correct answer = 1). The SPEED BONUS
 * was removed (2026-06-19) — timing/scoringMode no longer affect the score, so
 * "speed" and "equal" modes score identically. Wrong answers are 0 and reset the
 * streak upstream. There is NO variable/dopamine bonus in the score anymore — both
 * fields are kept at 0 for shape compatibility. Points accumulate into the user's
 * rank score (6-tier system, src/lib/ranks.ts).
 *
 * ⚠️ One legacy path does NOT use it — the old quiz/challenge routes
 * (src/app/api/quiz/answer + src/app/api/challenge/answer); those are not wired to
 * any current game UI. Do NOT add a third scoring formula; route games through here.
 */
export function getDeterministicDopamineBonus(
  attemptId?: string | number | null,
  questionId?: string | number | null
): number {
  if (!attemptId && !questionId) {
    return Math.floor(Math.random() * 5) + 1;
  }
  const seedStr = `${attemptId || ""}:${questionId || ""}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 5) + 1;
}

/**
 * Speed-Tap Pacing Algorithm
 * Calculates the recommended response window (ms) to balance points/hour,
 * streak growth, low mistake rate, and low fatigue based on the Yerkes-Dodson focus curve.
 */
export function calculateSpeedTapPacing(params: {
  currentStreak: number;
  difficulty: Difficulty;
  baseTimeMs?: number;
}): number {
  const baseTime = params.baseTimeMs || 15000;
  const diffScale: Record<Difficulty, number> = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3,
  };
  const difficultyFactor = diffScale[params.difficulty] || 1.0;
  const pacingConstant = 10;
  const streakFactor = 1 + (Math.min(params.currentStreak, 10) / pacingConstant);
  const rawWindow = baseTime * difficultyFactor * streakFactor;
  return Math.max(5000, Math.min(30000, Math.round(rawWindow)));
}

export function calculateScore(params: {
  isCorrect: boolean;
  difficulty?: string | null;
  scoringMode: ScoringMode;
  remainingTimeMs: number;
  totalTimeMs: number;
  currentStreak: number;
  attemptId?: string | number | null;
  questionId?: string | number | null;
  enableVariableReward?: boolean;
}): ScoreResult {
  // Speed bonus removed (2026-06-19): timing and scoringMode no longer affect the
  // score. Pass non-timed values so the shared method scores base + streak only.
  // currentStreak is 1-based (1 = first correct); the shared method wants the
  // streak BEFORE this answer, so subtract one.
  const q = calculateQuestionScore({
    isCorrect: params.isCorrect,
    answerTimeSeconds: Number.POSITIVE_INFINITY,
    questionTimeLimitSeconds: 0,
    currentCorrectStreak: Math.max(0, params.currentStreak - 1),
  });

  return {
    baseScore: q.baseScore,
    speedBonus: q.speedBonus, // always 0 now
    streakBonus: q.streakBonus,
    variableDopamineBonus: 0, // variable/dopamine bonus no longer affects the score
    totalPoints: q.questionScore, // 0 | 1 | 2
  };
}

export function generateSessionCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Valid state machine transitions */
const VALID_TRANSITIONS: Record<GameStatus, GameStatus[]> = {
  lobby: ["active", "ended"],
  active: ["paused", "ended"],
  paused: ["active", "ended"],
  ended: [],
};

export function isValidTransition(from: GameStatus, to: GameStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Map question answer count + image to game type */
export function mapContentToGameType(params: {
  answerCount: number;
  hasImage: boolean;
  hasAudio: boolean;
}): "mcq" | "true_false" | "image_pick" {
  if (params.answerCount === 2) return "true_false";
  if (params.hasImage && params.answerCount >= 2 && params.answerCount <= 4) return "image_pick";
  return "mcq";
}

/** Game mode → allowed question types */
export const GAME_MODE_TYPES: Record<string, string[]> = {
  "quick-quiz": ["mcq", "true_false"],
  "speed-round": ["mcq"],
  "sign-challenge": ["image_pick"],
  "mixed-practice": ["mcq", "true_false", "image_pick"],
};

export interface GameModeConfig {
  /** Default question count shown when user first picks this mode */
  defaultQuestionCount: number;
  /** Options the user can choose from */
  allowedQuestionCounts: number[];
  timePerQuestion: number;
  label: string;
  labelKm: string;
  color: string;
  description: string;
  descriptionKm: string;
}

export const GAME_MODE_CONFIG: Record<string, GameModeConfig> = {
  "quick-quiz": {
    defaultQuestionCount: 10,
    allowedQuestionCounts: [5, 10, 15, 20],
    // Kid-paced: ~15-18s to read a short Q + 3-4 answers + ~7-10s to decide.
    // 30s felt too long (disengagement); 25s fits a child's read+decide window.
    timePerQuestion: 25,
    label: "Quick Quiz",
    labelKm: "សំណួរលឿន",
    color: "#eab308",
    description: "Pick any number of questions at your own pace.",
    descriptionKm: "ជ្រើសសំណួរតាមចិត្ត ហ្វឹកហាត់ស្ងប់ស្ងាត់",
  },
  "speed-round": {
    defaultQuestionCount: 20,
    allowedQuestionCounts: [10, 15, 20, 30],
    timePerQuestion: 15,
    label: "Speed Round",
    labelKm: "វគ្គល្បឿន",
    color: "#ef4444",
    description: "Fast answers only — 15 seconds per question.",
    descriptionKm: "ឆ្លើយលឿន ១៥វិនាទីក្នុងមួយសំណួរ",
  },
  "sign-challenge": {
    defaultQuestionCount: 15,
    allowedQuestionCounts: [5, 10, 15, 20, 30],
    // Image recognition + 3 short answers: faster than text, but kids still need
    // to scan the sign. 18s is a comfortable recognise+pick window.
    timePerQuestion: 18,
    label: "Sign Challenge",
    labelKm: "ប្រឡងសញ្ញា",
    color: "#3b82f6",
    description: "Traffic sign image questions only.",
    descriptionKm: "សំណួរតែសញ្ញាចរាចរណ៍",
  },
  "mixed-practice": {
    defaultQuestionCount: 20,
    allowedQuestionCounts: [10, 20, 30, 40],
    timePerQuestion: 25,
    label: "Mixed Practice",
    labelKm: "ហ្វឹកហាត់ចម្រុះ",
    color: "#a855f7",
    description: "All question types mixed together.",
    descriptionKm: "ចម្រុះប្រភេទសំណួរទាំងអស់",
  },
};
