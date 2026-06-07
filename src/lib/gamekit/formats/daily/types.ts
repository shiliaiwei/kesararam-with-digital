import type { KitCompletionResult } from "@/lib/gamekit/types";

/** Per-round data for the Daily Challenge (one question). */
export interface DailyRound {
    questionId: number;
    questionEn: string;
    questionKm: string;
    topicCode: string | null;
    imageUrl: string | null; // Cloudinary; optimized via cloudinaryOptimize
    gameType: "mcq" | "true_false" | "image_pick";
    difficulty: string | null;
    answers: {
        id: number;
        answerEn: string;
        answerKm: string;
        imageUrl: string | null;
    }[];
}

export interface DailyCompletionResult extends KitCompletionResult {
    currentStreak: number;
    longestStreak: number;
    streakBonusAwarded: number; // milestone bonus on top of per-question score
    alreadyPlayed: boolean;
}
