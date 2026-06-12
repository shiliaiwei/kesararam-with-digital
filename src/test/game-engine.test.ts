import { describe, it, expect } from "vitest";
import { calculateScore } from "../lib/game-engine";

describe("calculateScore", () => {
  it("should calculate correct score for standard correct answer", () => {
    // Base score = 2 for medium difficulty
    // Speed bonus = Math.round(5000 / 10000 * 3) = Math.round(1.5) = 2
    // Streak bonus = 1 for streak 3
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 3,
    });

    expect(res.baseScore).toBe(2);
    expect(res.speedBonus).toBe(2);
    expect(res.streakBonus).toBe(1);
    expect(res.totalPoints).toBe(5);
  });

  it("should return 0 score for incorrect answer", () => {
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

  it("should award 0 speed/streak bonus for suspicious fast answers (<500ms)", () => {
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs: 9800, // answered in 200ms
      totalTimeMs: 10000,
      currentStreak: 5,
    });

    expect(res.baseScore).toBe(2);
    expect(res.speedBonus).toBe(0);
    expect(res.streakBonus).toBe(0);
    expect(res.totalPoints).toBe(2);
  });

  it("should calculate correct score for different difficulties", () => {
    const easyRes = calculateScore({
      isCorrect: true,
      difficulty: "easy",
      scoringMode: "equal",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 0,
    });
    expect(easyRes.baseScore).toBe(1);
    expect(easyRes.totalPoints).toBe(1);

    const hardRes = calculateScore({
      isCorrect: true,
      difficulty: "hard",
      scoringMode: "equal",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 0,
    });
    expect(hardRes.baseScore).toBe(3);
    expect(hardRes.totalPoints).toBe(3);
  });
});
