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
 * New scoring system based on difficulty:
 * - Easy: 1 point base
 * - Medium: 2 points base
 * - Hard: 3 points base
 * 
 * Streak bonus:
 * - 2-3 correct: +1 point
 * - 4-5 correct: +2 points
 * - 6+ correct: +3 points
 * 
 * Speed bonus (optional, based on scoring mode):
 * - Percentage of remaining time as bonus
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

  // Base score by difficulty
  const difficultyPoints: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };
  const baseScore = difficultyPoints[params.difficulty?.toLowerCase() || "medium"] || 2;

  // Speed bonus (only in speed mode)
  const speedBonus =
    params.scoringMode === "speed"
      ? Math.floor(baseScore * (params.remainingTimeMs / params.totalTimeMs))
      : 0;

  // Streak bonus
  let streakBonus = 0;
  if (params.currentStreak >= 6) {
    streakBonus = 3;
  } else if (params.currentStreak >= 4) {
    streakBonus = 2;
  } else if (params.currentStreak >= 2) {
    streakBonus = 1;
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

export const GAME_MODE_CONFIG: Record<
  string,
  { questionCount: number; timePerQuestion: number; label: string; labelKm: string; color: string }
> = {
  "quick-quiz": { questionCount: 10, timePerQuestion: 30, label: "Quick Quiz", labelKm: "សំណួរលឿន", color: "#eab308" },
  "speed-round": { questionCount: 20, timePerQuestion: 15, label: "Speed Round", labelKm: "វគ្គល្បឿន", color: "#ef4444" },
  "sign-challenge": { questionCount: 15, timePerQuestion: 20, label: "Sign Challenge", labelKm: "ប្រឡងសញ្ញា", color: "#3b82f6" },
  "mixed-battle": { questionCount: 20, timePerQuestion: 30, label: "Mixed Battle", labelKm: "ប្រយុទ្ធចម្រុះ", color: "#a855f7" },
  "daily-challenge": { questionCount: 15, timePerQuestion: 30, label: "Daily Challenge", labelKm: "បញ្ហាប្រចាំថ្ងៃ", color: "#22c55e" },
  "exam-simulation": { questionCount: 40, timePerQuestion: 45, label: "Exam Simulation", labelKm: "ត្រាប់តាមប្រឡង", color: "#f97316" },
};
