/**
 * Game Engine — server-side only
 * All scoring, validation, and state transitions live here.
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

// ── SOLO SCORE ECONOMY ──────────────────────────────────────────────────────
/**
 * Solo practice earns 20% of the raw score calculated by calculateScore().
 * This keeps solo grinding valuable for the leaderboard rank but ensures that
 * only LIVE teacher-hosted sessions produce meaningful claimable points.
 *
 * Design intent:
 *   - Students who only play solo still appear on the leaderboard (motivational)
 *   - Reward claiming REQUIRES live game participation (drives class enrollment)
 *   - Teachers must host live games → they need a subscription (business model)
 */
export const SOLO_SCORE_MULTIPLIER = 0.20; // 20% of raw score

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
 * Difficulty-based scaling (logical scaling for the rewards store):
 * - Easy: 1 point base
 * - Medium: 2 points base
 * - Hard: 3 points base
 * 
 * Streak bonus:
 * - 2-4 correct: +1 point
 * - 5+ correct: +2 points
 * 
 * Speed bonus (only in speed mode):
 * - +1 point if user answers in the first 50% of the total question time.
 * - Suspiciously fast answers (< 500ms response time) receive 0 speed/streak bonus.
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

  // 1. Base score by difficulty (Scaled for logical store rewards)
  const difficultyPoints: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };
  const baseScore = difficultyPoints[params.difficulty?.toLowerCase() || "medium"] || 2;

  // 2. Sanitize Inputs & Detect Suspicious Behavior
  // Clamp to prevent exploit values
  const safeRemaining = Math.max(0, Math.min(params.remainingTimeMs, params.totalTimeMs));
  const responseTimeMs = params.totalTimeMs - safeRemaining;

  // If answered impossibly fast (< 500ms), it's likely a script or lucky mash.
  const isSuspicious = responseTimeMs < 500;

  // 3. Speed bonus (only in speed mode, penalized if suspicious)
  let speedBonus = 0;
  if (params.scoringMode === "speed" && !isSuspicious && params.totalTimeMs > 0) {
    // Standard linear scaling speed bonus up to +3 points
    speedBonus = Math.round((safeRemaining / params.totalTimeMs) * 3);
  }

  // 4. Streak bonus (penalized if suspicious)
  let streakBonus = 0;
  if (!isSuspicious) {
    if (params.currentStreak >= 5) {
      streakBonus = 2;
    } else if (params.currentStreak >= 2) {
      streakBonus = 1;
    }
  }

  return {
    baseScore,
    speedBonus,
    streakBonus,
    totalPoints: baseScore + speedBonus + streakBonus,
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
