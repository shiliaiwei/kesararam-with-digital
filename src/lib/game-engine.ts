/**
 * Game Engine — shared scoring plus server-side state helpers.
 * Authoritative writes still happen on the server; client imports are cosmetic.
 */

export type ScoringMode = "speed" | "equal";
export type GameStatus = "lobby" | "active" | "paused" | "ended";
export type Difficulty = "easy" | "medium" | "hard";

export interface ScoreResult {
  baseScore: number;
  speedBonus: number;
  streakBonus: number;
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
 * puzzle, and kid arcade games.
 *
 * ⚠️ One legacy path does NOT use it — the old quiz/challenge routes
 * (src/app/api/quiz/answer + src/app/api/challenge/answer) compute points from
 * `content.scorePoints` + a separate time-bonus formula, and feed `leaderboardEntries`
 * via src/lib/ranking.ts (read by /api/leaderboard/user/[userId]). Do NOT add a third
 * scoring formula; route new game types through calculateScore instead.
 *
 * ── Simple time scoring ──────────────────────────────────────────────────────
 * Each correct answer starts with its difficulty base:
 *
 *   easy +2 · medium +4 · hard +6
 *
 * Speed mode adds a small fast-answer bonus on top:
 *
 *   speedBonus = round((base / 2) × effectiveRemaining / totalTime)
 *              → easy up to +1 · medium up to +2 · hard up to +3
 *
 * Equal mode ignores time. Streak adds +1 per consecutive correct answer beyond
 * the first, capped at +5. Wrong answers are always 0 and reset streak upstream.
 *
 * Returned breakdown keeps the existing columns meaningful:
 *   baseScore = difficulty base (2 / 4 / 6)
 *   speedBonus = fast-answer bonus (0 … base / 2)
 *   streakBonus = consecutive-correct bonus (0 … 5)
 *   totalPoints = baseScore + speedBonus + streakBonus
 */
export function calculateScore(params: {
  isCorrect: boolean;
  difficulty?: string | null;
  scoringMode: ScoringMode;
  remainingTimeMs: number;
  totalTimeMs: number;
  currentStreak: number;
}): ScoreResult {
  if (!params.isCorrect) return { baseScore: 0, speedBonus: 0, streakBonus: 0, totalPoints: 0 };

  // 1. Base value by difficulty.
  const base = DIFFICULTY_BASE[params.difficulty?.toLowerCase() || "medium"] || DIFFICULTY_BASE.medium;

  // 2. Streak bonus: 1st correct = 0, then +1 per extra consecutive correct, cap +5.
  const streakBonus = Math.min(
    Math.max(params.currentStreak - 1, 0) * STREAK_BONUS_STEP,
    STREAK_BONUS_MAX
  );

  // 3. Equal mode → flat base for a correct answer (no time component).
  const totalTimeMs = Math.max(0, params.totalTimeMs);
  if (params.scoringMode !== "speed" || totalTimeMs === 0) {
    return { baseScore: base, speedBonus: 0, streakBonus, totalPoints: base + streakBonus };
  }

  // 4. Sanitize the clock. remaining ∈ [0, total]; response time gets a 500ms floor.
  const safeRemaining = Math.max(0, Math.min(params.remainingTimeMs, totalTimeMs));
  const responseTimeMs = Math.max(MIN_RESPONSE_MS, totalTimeMs - safeRemaining);
  const effectiveRemaining = Math.max(0, totalTimeMs - responseTimeMs);

  // 5. Fast-answer bonus: 0 … half of the difficulty base.
  const speedBonusMax = Math.round(base / 2);
  const speedBonus = Math.round(speedBonusMax * (effectiveRemaining / totalTimeMs));

  return {
    baseScore: base,
    speedBonus,
    streakBonus,
    totalPoints: base + speedBonus + streakBonus,
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
