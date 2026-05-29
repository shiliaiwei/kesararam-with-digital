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

/**
 * New scoring system based on difficulty (Logical scaling for rewards store):
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
    // If they answer within the first half of the time limit, they get a +1 speed point
    if (safeRemaining / params.totalTimeMs >= 0.5) {
      speedBonus = 1;
    }
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
  "mixed-battle": ["mcq", "true_false", "image_pick"],
  "daily-challenge": ["mcq", "true_false", "image_pick"],
  "exam-simulation": ["mcq", "true_false"],
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
    timePerQuestion: 30,
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
    timePerQuestion: 20,
    label: "Sign Challenge",
    labelKm: "ប្រឡងសញ្ញា",
    color: "#3b82f6",
    description: "Traffic sign image questions only.",
    descriptionKm: "សំណួរតែសញ្ញាចរាចរណ៍",
  },
  "mixed-battle": {
    defaultQuestionCount: 20,
    allowedQuestionCounts: [10, 20, 30, 40],
    timePerQuestion: 30,
    label: "Mixed Battle",
    labelKm: "ប្រយុទ្ធចម្រុះ",
    color: "#a855f7",
    description: "All question types mixed together.",
    descriptionKm: "ចម្រុះប្រភេទសំណួរទាំងអស់",
  },
  "daily-challenge": {
    defaultQuestionCount: 15,
    allowedQuestionCounts: [10, 15, 20],
    timePerQuestion: 30,
    label: "Daily Challenge",
    labelKm: "បញ្ហាប្រចាំថ្ងៃ",
    color: "#22c55e",
    description: "A fresh set of questions every day.",
    descriptionKm: "សំណួរថ្មីរៀងរាល់ថ្ងៃ",
  },
  "exam-simulation": {
    defaultQuestionCount: 40,
    allowedQuestionCounts: [20, 30, 40],
    timePerQuestion: 45,
    label: "Exam Simulation",
    labelKm: "ត្រាប់តាមប្រឡង",
    color: "#f97316",
    description: "Simulate the real driving licence exam.",
    descriptionKm: "ហ្វឹកប្រឡងបណ្ណបើកបរពិតប្រាកដ",
  },
};
