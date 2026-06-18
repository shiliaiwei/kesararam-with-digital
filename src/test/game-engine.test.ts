import { describe, it, expect } from "vitest";
import { calculateScore, calculateSpeedTapPacing, getDeterministicDopamineBonus } from "../lib/game-engine";

describe("calculateScore (KWD small-score method, 0–3 per question)", () => {
  it("correct + fast (first half) + on a streak → base 1, speed 1, streak 1 = 3", () => {
    // answered at exactly half-time (response 5s of 10s) → first half; streak 3 (>1).
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 3,
    });
    expect(res.baseScore).toBe(1);
    expect(res.speedBonus).toBe(1);
    expect(res.streakBonus).toBe(1);
    expect(res.totalPoints).toBe(3);
  });

  it("returns 0 for an incorrect answer", () => {
    const res = calculateScore({
      isCorrect: false,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 3,
    });
    expect(res.totalPoints).toBe(0);
  });

  it("correct + fast + no streak → 2 (first correct gets no streak bonus)", () => {
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs: 9800, // answered in 200ms → clamped to 500ms, still first half
      totalTimeMs: 10000,
      currentStreak: 1, // first correct in the run
    });
    expect(res.streakBonus).toBe(0);
    expect(res.baseScore).toBe(1);
    expect(res.speedBonus).toBe(1);
    expect(res.totalPoints).toBe(2);
  });

  it("no speed bonus when answered after the first half (at the buzzer)", () => {
    const res = calculateScore({
      isCorrect: true,
      difficulty: "hard", // difficulty no longer changes the base
      scoringMode: "speed",
      remainingTimeMs: 0,
      totalTimeMs: 10000,
      currentStreak: 1,
    });
    expect(res.baseScore).toBe(1);
    expect(res.speedBonus).toBe(0);
    expect(res.totalPoints).toBe(1);
  });

  it("equal mode: flat 1 base, no speed regardless of difficulty/time", () => {
    const easyRes = calculateScore({
      isCorrect: true,
      difficulty: "easy",
      scoringMode: "equal",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 0,
    });
    expect(easyRes.baseScore).toBe(1);
    expect(easyRes.speedBonus).toBe(0);
    expect(easyRes.totalPoints).toBe(1);

    const hardRes = calculateScore({
      isCorrect: true,
      difficulty: "hard",
      scoringMode: "equal",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 4, // on a streak → +1 even in equal mode
    });
    expect(hardRes.baseScore).toBe(1);
    expect(hardRes.streakBonus).toBe(1);
    expect(hardRes.totalPoints).toBe(2);
  });

  it("streak bonus is capped at +1 (never grows past one point)", () => {
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "equal",
      remainingTimeMs: 0,
      totalTimeMs: 10000,
      currentStreak: 9, // way past any streak
    });
    expect(res.streakBonus).toBe(1);
    expect(res.totalPoints).toBe(2);
  });

  it("streak bonus is 0 on the first correct, then 1 for every following correct", () => {
    const expected: [number, number][] = [
      [1, 0],
      [2, 1],
      [3, 1],
      [4, 1],
      [5, 1],
      [7, 1],
    ];
    for (const [currentStreak, streakBonus] of expected) {
      const res = calculateScore({
        isCorrect: true,
        difficulty: "easy",
        scoringMode: "equal",
        remainingTimeMs: 0,
        totalTimeMs: 10000,
        currentStreak,
      });
      expect(res.streakBonus).toBe(streakBonus);
    }
  });

  it("never exceeds 3 points, even with variable-reward seeds present", () => {
    const res = calculateScore({
      isCorrect: true,
      difficulty: "hard",
      scoringMode: "speed",
      remainingTimeMs: 9000, // fast
      totalTimeMs: 10000,
      currentStreak: 5, // streak
      attemptId: "att-123",
      questionId: "q-456",
      enableVariableReward: true,
    });
    expect(res.totalPoints).toBe(3);
    expect(res.variableDopamineBonus).toBe(0); // variable reward no longer scores
  });
});

describe("Speed-Tap pacing and dopamine helper (unchanged utilities)", () => {
  it("calculates dynamic pacing based on difficulty and streak", () => {
    expect(calculateSpeedTapPacing({ currentStreak: 0, difficulty: "easy", baseTimeMs: 10000 })).toBe(8000);
    expect(calculateSpeedTapPacing({ currentStreak: 5, difficulty: "medium", baseTimeMs: 10000 })).toBe(15000);
    expect(calculateSpeedTapPacing({ currentStreak: 10, difficulty: "hard", baseTimeMs: 10000 })).toBe(26000);
  });

  it("generates deterministic dopamine bonuses based on seed", () => {
    const bonus1 = getDeterministicDopamineBonus("attempt-123", "q-456");
    const bonus2 = getDeterministicDopamineBonus("attempt-123", "q-456");
    expect(bonus1).toBeGreaterThanOrEqual(1);
    expect(bonus1).toBeLessThanOrEqual(5);
    expect(bonus1).toBe(bonus2); // deterministic
    const fallback = getDeterministicDopamineBonus(null, null);
    expect(fallback).toBeGreaterThanOrEqual(1);
    expect(fallback).toBeLessThanOrEqual(5);
  });
});
