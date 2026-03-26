/**
 * Game Engine — server-side only
 * All scoring, validation, and state transitions live here.
 */

export type ScoringMode = "speed" | "equal";
export type GameStatus = "lobby" | "active" | "paused" | "ended";

export interface ScoreResult {
  speedScore: number;
  streakBonus: number;
  totalPoints: number;
}

export function calculateScore(params: {
  isCorrect: boolean;
  scoringMode: ScoringMode;
  basePoints: number;
  remainingTimeMs: number;
  totalTimeMs: number;
  currentStreak: number;
}): ScoreResult {
  if (!params.isCorrect) return { speedScore: 0, streakBonus: 0, totalPoints: 0 };

  const speedScore =
    params.scoringMode === "equal"
      ? params.basePoints
      : params.basePoints +
        Math.floor(params.basePoints * (params.remainingTimeMs / params.totalTimeMs));

  const streakMultiplier = Math.min(Math.max(params.currentStreak - 1, 0), 5) * 0.1;
  const streakBonus = Math.floor(params.basePoints * streakMultiplier);

  return { speedScore, streakBonus, totalPoints: speedScore + streakBonus };
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
