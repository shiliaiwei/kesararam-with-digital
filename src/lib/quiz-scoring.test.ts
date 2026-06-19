import { describe, it, expect } from "vitest";
import {
    calculateQuestionScore,
    calculateQuizScore,
    applyQuizScoreToUser,
    type QuizAnswer,
} from "@/lib/quiz-scoring";

// Speed bonus removed (2026-06-19): each question is base (+1 correct) + streak
// (+1 if already on a run), max 2. Timing never affects the score.

describe("calculateQuestionScore", () => {
    it("correct + no streak → 1 pt (no speed bonus regardless of time)", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 1, // ultra fast — must NOT add points
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 0,
        });
        expect(r.baseScore).toBe(1);
        expect(r.speedBonus).toBe(0);
        expect(r.streakBonus).toBe(0);
        expect(r.questionScore).toBe(1);
        expect(r.newCorrectStreak).toBe(1);
    });

    it("correct + streak → 2 pts (max)", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 12,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 1,
        });
        expect(r.questionScore).toBe(2);
        expect(r.speedBonus).toBe(0);
        expect(r.streakBonus).toBe(1);
        expect(r.wasStreakBonusApplied).toBe(true);
        expect(r.newCorrectStreak).toBe(2);
    });

    it("wrong answer → 0 pts and streak reset", () => {
        const r = calculateQuestionScore({
            isCorrect: false,
            answerTimeSeconds: 8,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 3,
        });
        expect(r.questionScore).toBe(0);
        expect(r.baseScore).toBe(0);
        expect(r.speedBonus).toBe(0);
        expect(r.streakBonus).toBe(0);
        expect(r.newCorrectStreak).toBe(0);
    });

    it("correct + slow + no streak → 1 pt", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 20,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 0,
        });
        expect(r.questionScore).toBe(1);
    });

    it("correct + slow + streak → 2 pts", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 25,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 5,
        });
        expect(r.questionScore).toBe(2);
        expect(r.streakBonus).toBe(1);
    });

    it("timing is irrelevant — fast and slow correct answers score the same", () => {
        const fast = calculateQuestionScore({
            isCorrect: true, answerTimeSeconds: 1, questionTimeLimitSeconds: 30, currentCorrectStreak: 0,
        });
        const slow = calculateQuestionScore({
            isCorrect: true, answerTimeSeconds: 29, questionTimeLimitSeconds: 30, currentCorrectStreak: 0,
        });
        expect(fast.questionScore).toBe(slow.questionScore);
        expect(fast.speedBonus).toBe(0);
        expect(slow.speedBonus).toBe(0);
    });

    it("never exceeds 2 points per question", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 1,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 99,
        });
        expect(r.questionScore).toBe(2);
        expect(r.speedBonus).toBe(0);
        expect(r.streakBonus).toBe(1);
    });
});

describe("calculateQuizScore", () => {
    it("tracks streak, reset, counts and highest streak", () => {
        const answers: QuizAnswer[] = [
            { isCorrect: true, answerTimeSeconds: 5, questionTimeLimitSeconds: 30 }, // 1, streak 1
            { isCorrect: true, answerTimeSeconds: 5, questionTimeLimitSeconds: 30 }, // 2, streak 2
            { isCorrect: false, answerTimeSeconds: 5, questionTimeLimitSeconds: 30 }, // 0, reset
            { isCorrect: true, answerTimeSeconds: 20, questionTimeLimitSeconds: 30 }, // 1, streak 1
        ];
        const q = calculateQuizScore(answers);
        expect(q.totalScore).toBe(4);
        expect(q.correctAnswers).toBe(3);
        expect(q.wrongAnswers).toBe(1);
        expect(q.finalStreak).toBe(1);
        expect(q.highestStreak).toBe(2);
    });

    it("40 questions, all correct → 79 (intended max = 1 + 39×2)", () => {
        const answers: QuizAnswer[] = Array.from({ length: 40 }, () => ({
            isCorrect: true,
            answerTimeSeconds: 5,
            questionTimeLimitSeconds: 30,
        }));
        expect(calculateQuizScore(answers).totalScore).toBe(79);
    });

    it("timing does not change the quiz total → still 79 when slow", () => {
        const answers: QuizAnswer[] = Array.from({ length: 40 }, () => ({
            isCorrect: true,
            answerTimeSeconds: 29,
            questionTimeLimitSeconds: 30,
        }));
        expect(calculateQuizScore(answers).totalScore).toBe(79);
    });
});

describe("robustness — junk input can never mistake or bypass the cap", () => {
    const junk = [NaN, Infinity, -Infinity, -5, 1.7];
    for (const streak of junk) {
        it(`non-finite/invalid streak (${streak}) → score in 0..2, finite streak`, () => {
            const r = calculateQuestionScore({
                isCorrect: true,
                answerTimeSeconds: 5,
                questionTimeLimitSeconds: 30,
                currentCorrectStreak: streak,
            });
            expect(r.questionScore).toBeGreaterThanOrEqual(0);
            expect(r.questionScore).toBeLessThanOrEqual(2);
            expect(Number.isInteger(r.newCorrectStreak)).toBe(true);
            expect(r.newCorrectStreak).toBeGreaterThanOrEqual(0);
        });
    }

    it("speed bonus is always 0, even with a non-finite clock", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: NaN,
            questionTimeLimitSeconds: Infinity,
            currentCorrectStreak: 0,
        });
        expect(r.speedBonus).toBe(0);
        expect(r.questionScore).toBe(1);
    });
});

describe("applyQuizScoreToUser", () => {
    it("adds quiz total to existing score and recomputes the 6-tier rank", () => {
        const a = applyQuizScoreToUser(950, 79); // 950 + 79 = 1029 → Rising IV
        expect(a.newScore).toBe(1029);
        expect(a.rank.rank.name).toBe("Rising");
        expect(a.rank.division).toBe("IV");
    });

    it("never restarts from zero", () => {
        const a = applyQuizScoreToUser(2400, 79); // 2400 + 79 = 2479 → Rising I
        expect(a.newScore).toBe(2479);
        expect(a.rank.rank.name).toBe("Rising");
        expect(a.rank.division).toBe("I");
    });
});
