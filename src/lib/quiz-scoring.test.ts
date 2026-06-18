import { describe, it, expect } from "vitest";
import {
    calculateQuestionScore,
    calculateQuizScore,
    applyQuizScoreToUser,
    type QuizAnswer,
} from "@/lib/quiz-scoring";

describe("calculateQuestionScore", () => {
    it("correct + fast + no streak → 2 pts (spec example 1)", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 10,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 0,
        });
        expect(r.baseScore).toBe(1);
        expect(r.speedBonus).toBe(1);
        expect(r.streakBonus).toBe(0);
        expect(r.questionScore).toBe(2);
        expect(r.newCorrectStreak).toBe(1);
        expect(r.answeredInFirstHalf).toBe(true);
    });

    it("correct + fast + streak → 3 pts (spec example 2)", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 12,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 1,
        });
        expect(r.questionScore).toBe(3);
        expect(r.streakBonus).toBe(1);
        expect(r.wasStreakBonusApplied).toBe(true);
        expect(r.newCorrectStreak).toBe(2);
    });

    it("wrong answer → 0 pts and streak reset (spec example 3)", () => {
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
        expect(r.answeredInFirstHalf).toBe(false);
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

    it("timeout (answer time >= limit) gives no speed bonus", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 30,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 0,
        });
        expect(r.speedBonus).toBe(0);
        expect(r.questionScore).toBe(1);
    });

    it("exactly at the half mark still counts as first half", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 15,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 0,
        });
        expect(r.answeredInFirstHalf).toBe(true);
        expect(r.speedBonus).toBe(1);
    });

    it("never exceeds 3 points per question", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: 1,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 99,
        });
        expect(r.questionScore).toBe(3);
        expect(r.streakBonus).toBe(1);
    });
});

describe("calculateQuizScore", () => {
    it("tracks streak, reset, counts and highest streak", () => {
        const answers: QuizAnswer[] = [
            { isCorrect: true, answerTimeSeconds: 5, questionTimeLimitSeconds: 30 }, // 2, streak 1
            { isCorrect: true, answerTimeSeconds: 5, questionTimeLimitSeconds: 30 }, // 3, streak 2
            { isCorrect: false, answerTimeSeconds: 5, questionTimeLimitSeconds: 30 }, // 0, reset
            { isCorrect: true, answerTimeSeconds: 20, questionTimeLimitSeconds: 30 }, // 1, streak 1
        ];
        const q = calculateQuizScore(answers);
        expect(q.totalScore).toBe(6);
        expect(q.correctAnswers).toBe(3);
        expect(q.wrongAnswers).toBe(1);
        expect(q.finalStreak).toBe(1);
        expect(q.highestStreak).toBe(2);
    });

    it("40 questions, all correct + fast → 119 (intended max)", () => {
        const answers: QuizAnswer[] = Array.from({ length: 40 }, () => ({
            isCorrect: true,
            answerTimeSeconds: 5,
            questionTimeLimitSeconds: 30,
        }));
        expect(calculateQuizScore(answers).totalScore).toBe(119);
    });

    it("40 questions, all correct + slow → 79", () => {
        const answers: QuizAnswer[] = Array.from({ length: 40 }, () => ({
            isCorrect: true,
            answerTimeSeconds: 20,
            questionTimeLimitSeconds: 30,
        }));
        expect(calculateQuizScore(answers).totalScore).toBe(79);
    });
});

describe("robustness — junk input can never mistake or bypass the cap", () => {
    const junk = [NaN, Infinity, -Infinity, -5, 1.7];
    for (const streak of junk) {
        it(`non-finite/invalid streak (${streak}) → score in 0..3, finite streak`, () => {
            const r = calculateQuestionScore({
                isCorrect: true,
                answerTimeSeconds: 5,
                questionTimeLimitSeconds: 30,
                currentCorrectStreak: streak,
            });
            expect(r.questionScore).toBeGreaterThanOrEqual(0);
            expect(r.questionScore).toBeLessThanOrEqual(3);
            expect(Number.isInteger(r.newCorrectStreak)).toBe(true);
            expect(r.newCorrectStreak).toBeGreaterThanOrEqual(0);
        });
    }

    it("non-finite clock never grants a speed bonus", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: NaN,
            questionTimeLimitSeconds: Infinity,
            currentCorrectStreak: 0,
        });
        expect(r.speedBonus).toBe(0);
        expect(r.questionScore).toBe(1);
    });

    it("negative answer time never grants a speed bonus", () => {
        const r = calculateQuestionScore({
            isCorrect: true,
            answerTimeSeconds: -100,
            questionTimeLimitSeconds: 30,
            currentCorrectStreak: 0,
        });
        expect(r.speedBonus).toBe(0);
    });
});

describe("applyQuizScoreToUser", () => {
    it("adds quiz total to existing score and recomputes the 6-tier rank", () => {
        const a = applyQuizScoreToUser(950, 119); // 950 + 119 = 1069 → Rising
        expect(a.newScore).toBe(1069);
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
