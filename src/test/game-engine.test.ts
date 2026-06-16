import { describe, it, expect } from "vitest";
import { calculateScore, calculateSpeedTapPacing, getDeterministicDopamineBonus } from "../lib/game-engine";

describe("calculateScore (simple live scale)", () => {
  it("scores a correct medium answer at half-time with speed + streak", () => {
    // medium base +4, half-time speed +1, streak 3 -> +2.
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 3,
    });

    expect(res.baseScore).toBe(4);
    expect(res.speedBonus).toBe(1);
    expect(res.streakBonus).toBe(2);
    expect(res.totalPoints).toBe(7);
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

  it("adds the fast-answer bonus for a quick correct answer", () => {
    // medium base +4, fast bonus reaches +2 on the small display scale.
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs: 9800, // answered in 200ms → clamped up to 500ms
      totalTimeMs: 10000,
      currentStreak: 1, // first correct → no streak bonus
    });

    expect(res.streakBonus).toBe(0);
    expect(res.baseScore).toBe(4);
    expect(res.speedBonus).toBe(2);
    expect(res.totalPoints).toBe(6);
  });

  it("keeps the difficulty base for a correct answer at the last second", () => {
    const res = calculateScore({
      isCorrect: true,
      difficulty: "hard",
      scoringMode: "speed",
      remainingTimeMs: 0, // answered at the buzzer
      totalTimeMs: 10000,
      currentStreak: 1,
    });

    expect(res.baseScore).toBe(6);
    expect(res.speedBonus).toBe(0);
    expect(res.totalPoints).toBe(6);
  });

  it("uses flat base per difficulty in equal mode (time ignored)", () => {
    const easyRes = calculateScore({
      isCorrect: true,
      difficulty: "easy",
      scoringMode: "equal",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 0,
    });
    expect(easyRes.baseScore).toBe(2);
    expect(easyRes.speedBonus).toBe(0);
    expect(easyRes.totalPoints).toBe(2);

    const hardRes = calculateScore({
      isCorrect: true,
      difficulty: "hard",
      scoringMode: "equal",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 0,
    });
    expect(hardRes.baseScore).toBe(6);
    expect(hardRes.totalPoints).toBe(6);
  });

  it("caps the streak bonus at +5", () => {
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "equal",
      remainingTimeMs: 0,
      totalTimeMs: 10000,
      currentStreak: 9, // way past the cap
    });
    expect(res.streakBonus).toBe(5);
    expect(res.totalPoints).toBe(9);
  });

  it("uses the requested streak labels", () => {
    const expected = [
      [1, 0],
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4],
      [6, 5],
      [7, 5],
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

  describe("Speed-Tap pacing and Variable Dopamine Bonus", () => {
    it("calculates dynamic pacing based on difficulty and streak", () => {
      // Easy difficulty (0.8 scale), streak 0 (1.0 factor)
      const easyPace = calculateSpeedTapPacing({
        currentStreak: 0,
        difficulty: "easy",
        baseTimeMs: 10000,
      });
      expect(easyPace).toBe(8000); // 10000 * 0.8 * 1.0

      // Medium difficulty (1.0 scale), streak 5 (1.5 factor)
      const medPace = calculateSpeedTapPacing({
        currentStreak: 5,
        difficulty: "medium",
        baseTimeMs: 10000,
      });
      expect(medPace).toBe(15000); // 10000 * 1.0 * 1.5

      // Hard difficulty (1.3 scale), streak 10 (2.0 factor)
      const hardPace = calculateSpeedTapPacing({
        currentStreak: 10,
        difficulty: "hard",
        baseTimeMs: 10000,
      });
      expect(hardPace).toBe(26000); // 10000 * 1.3 * 2.0
    });

    it("generates deterministic dopamine bonuses based on seed", () => {
      const bonus1 = getDeterministicDopamineBonus("attempt-123", "q-456");
      const bonus2 = getDeterministicDopamineBonus("attempt-123", "q-456");
      const bonus3 = getDeterministicDopamineBonus("attempt-123", "q-789");

      expect(bonus1).toBeGreaterThanOrEqual(1);
      expect(bonus1).toBeLessThanOrEqual(5);
      expect(bonus1).toBe(bonus2); // deterministic
      
      // Should yield a number even with nulls or empty parameters
      const fallback = getDeterministicDopamineBonus(null, null);
      expect(fallback).toBeGreaterThanOrEqual(1);
      expect(fallback).toBeLessThanOrEqual(5);
    });

    it("adds variable reward when enabled or when seeds are present", () => {
      const baseRes = calculateScore({
        isCorrect: true,
        difficulty: "medium",
        scoringMode: "equal",
        remainingTimeMs: 0,
        totalTimeMs: 10000,
        currentStreak: 0,
      });

      const variableRes = calculateScore({
        isCorrect: true,
        difficulty: "medium",
        scoringMode: "equal",
        remainingTimeMs: 0,
        totalTimeMs: 10000,
        currentStreak: 0,
        attemptId: "att-123",
        questionId: "q-456",
      });

      expect(variableRes.variableDopamineBonus).toBeGreaterThan(0);
      expect(variableRes.totalPoints).toBe(baseRes.totalPoints + variableRes.variableDopamineBonus!);
    });
  });
});
