/**
 * ── KWD Quiz Scoring Logic ────────────────────────────────────────────────────
 * Small-score, per-question scoring for the KWD road-safety quiz, feeding the
 * 6-tier Road Safety Rank System (see `src/lib/ranks.ts`).
 *
 * DESIGN INTENT — keep points SMALL and scarce. Each question gives 0–2 points:
 *   base (correct)      +1
 *   streak (correct, already on a run of ≥1)         +1   (never more than +1)
 *
 * NOTE: the speed bonus was REMOVED (2026-06-19) — timing no longer affects the
 * score on any game type. `speedBonus` stays in the result shape but is always 0
 * for backward compatibility with stored columns. Max per question = 2.
 *
 * Pure TypeScript, no UI, no DB — reusable anywhere. Rank lookup is delegated to
 * `ranks.ts` so thresholds live in exactly one place.
 */

import { calculateRankAndDivision, type UserRankResult } from "@/lib/ranks";

/* ───────────────────────────────── Types ──────────────────────────────── */

export interface QuestionScoreInput {
    /** was the submitted answer correct? */
    isCorrect: boolean;
    /** seconds taken to answer (use >= limit for timeout / no answer) */
    answerTimeSeconds: number;
    /** total time allowed for the question, in seconds */
    questionTimeLimitSeconds: number;
    /** the player's current run of correct answers BEFORE this question */
    currentCorrectStreak: number;
}

export interface QuestionScoreResult {
    /** +1 if correct, else 0 */
    baseScore: number;
    /** DEPRECATED — speed bonus removed; always 0 (kept for column compatibility) */
    speedBonus: number;
    /** +1 if correct AND already on a streak (currentCorrectStreak ≥ 1), else 0 */
    streakBonus: number;
    /** 0 | 1 | 2 — base + streak (0 if wrong) */
    questionScore: number;
    /** streak AFTER this question (currentStreak + 1 if correct, else 0) */
    newCorrectStreak: number;
    /** did the answer arrive within the first half of the time limit? (informational only — no longer scored) */
    answeredInFirstHalf: boolean;
    /** was the +1 streak bonus actually applied? */
    wasStreakBonusApplied: boolean;
}

/** One answered question fed into the whole-quiz calculator. */
export interface QuizAnswer {
    isCorrect: boolean;
    answerTimeSeconds: number;
    questionTimeLimitSeconds: number;
}

export interface QuizScoreResult {
    /** sum of every questionScore (0–2 each) */
    totalScore: number;
    correctAnswers: number;
    wrongAnswers: number;
    /** streak at the end of the quiz */
    finalStreak: number;
    /** longest streak reached during the quiz */
    highestStreak: number;
    /** per-question breakdown, in order */
    questionResults: QuestionScoreResult[];
}

/* ─────────────────────────── Per-question score ────────────────────────── */

/**
 * Score a single question. 0–2 points:
 *   baseScore   = isCorrect ? 1 : 0
 *   streakBonus = isCorrect && currentCorrectStreak >= 1 ? 1 : 0  (max +1)
 *   questionScore = isCorrect ? base + streak : 0
 *   newCorrectStreak = isCorrect ? currentCorrectStreak + 1 : 0
 *
 * Speed bonus removed (2026-06-19): timing never affects the score. `speedBonus`
 * is always 0 and `answeredInFirstHalf` is informational only.
 */
export function calculateQuestionScore(input: QuestionScoreInput): QuestionScoreResult {
    const { isCorrect, answerTimeSeconds, questionTimeLimitSeconds } = input;

    // Sanitize the streak to a finite, non-negative integer. NaN / Infinity /
    // negatives all collapse to 0 so they can never poison `newCorrectStreak`
    // or grant a bonus.
    const currentCorrectStreak = Number.isFinite(input.currentCorrectStreak)
        ? Math.max(0, Math.floor(input.currentCorrectStreak))
        : 0;

    // First half = answered at or before half the time limit. Informational only —
    // it no longer changes the score (the speed bonus was removed).
    const safeLimit = Number.isFinite(questionTimeLimitSeconds) ? questionTimeLimitSeconds : 0;
    const safeAnswerTime = Number.isFinite(answerTimeSeconds) ? answerTimeSeconds : Infinity;
    const answeredInFirstHalf =
        safeLimit > 0 && safeAnswerTime >= 0 && safeAnswerTime <= safeLimit / 2;

    // Rule 1 — base answer score.
    const baseScore = isCorrect ? 1 : 0;

    // Rule 2 — speed bonus REMOVED. Always 0 (kept for result-shape compatibility).
    const speedBonus = 0;

    // Rule 3 — streak bonus (only for correct answers already on a run; max +1).
    const streakBonus = isCorrect && currentCorrectStreak >= 1 ? 1 : 0;

    // Rule 4 — final question score (0 if wrong). Max 2 = base + streak.
    const questionScore = isCorrect ? baseScore + streakBonus : 0;

    // Streak grows on correct, resets to 0 on wrong.
    const newCorrectStreak = isCorrect ? currentCorrectStreak + 1 : 0;

    return {
        baseScore,
        speedBonus,
        streakBonus,
        questionScore,
        newCorrectStreak,
        answeredInFirstHalf,
        wasStreakBonusApplied: streakBonus === 1,
    };
}

/* ──────────────────────────── Whole-quiz score ─────────────────────────── */

/**
 * Run a full quiz: thread the streak through every answer, summing question
 * scores and tracking correct/wrong counts and the highest streak reached.
 */
export function calculateQuizScore(answers: readonly QuizAnswer[]): QuizScoreResult {
    let totalScore = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let streak = 0;
    let highestStreak = 0;
    const questionResults: QuestionScoreResult[] = [];

    for (const answer of answers) {
        const result = calculateQuestionScore({
            isCorrect: answer.isCorrect,
            answerTimeSeconds: answer.answerTimeSeconds,
            questionTimeLimitSeconds: answer.questionTimeLimitSeconds,
            currentCorrectStreak: streak,
        });

        totalScore += result.questionScore;
        if (answer.isCorrect) correctAnswers += 1;
        else wrongAnswers += 1;

        streak = result.newCorrectStreak;
        if (streak > highestStreak) highestStreak = streak;

        questionResults.push(result);
    }

    return {
        totalScore,
        correctAnswers,
        wrongAnswers,
        finalStreak: streak,
        highestStreak,
        questionResults,
    };
}

/* ───────────────────────── Rank connection helper ──────────────────────── */

export interface AppliedQuizScore {
    previousScore: number;
    /** the quiz's totalScore that was added */
    addedScore: number;
    /** previousScore + addedScore — store THIS as the user's new permanent score */
    newScore: number;
    /** rank + division derived from newScore (6-tier system in ranks.ts) */
    rank: UserRankResult;
}

/**
 * After a quiz finishes: add the quiz total to the user's existing score and
 * recompute their rank + division from the new total. Never starts from zero;
 * only `newScore` should be persisted (rank/division are always derived).
 */
export function applyQuizScoreToUser(currentScore: number, quizTotalScore: number): AppliedQuizScore {
    const previousScore = Math.max(0, Math.floor(currentScore));
    const addedScore = Math.max(0, Math.floor(quizTotalScore));
    const newScore = previousScore + addedScore;

    return {
        previousScore,
        addedScore,
        newScore,
        rank: calculateRankAndDivision(newScore),
    };
}
