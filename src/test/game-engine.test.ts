import { describe, it, expect } from "vitest";
import { calculateScore } from "../lib/game-engine";

describe("calculateScore", () => {
  describe("University target group (Standard)", () => {
    it("should calculate correct score for university student", () => {
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
        targetGroup: "university",
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
        targetGroup: "university",
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
        targetGroup: "university",
      });

      expect(res.baseScore).toBe(2);
      expect(res.speedBonus).toBe(0);
      expect(res.streakBonus).toBe(0);
      expect(res.totalPoints).toBe(2);
    });
  });

  describe("Kid target groups (Kid K-6, Kid K-12)", () => {
    it("should award generous speed bonus and double streak bonus for kids", () => {
      // Kid K-6 gets speed bonus if safeRemaining >= 15% (e.g. 2000/10000 = 20% >= 15% -> speedBonus = 1)
      // Streak = 5 -> streakBonus = 4 (instead of 2)
      const res = calculateScore({
        isCorrect: true,
        difficulty: "easy", // baseScore = 1
        scoringMode: "speed",
        remainingTimeMs: 2000,
        totalTimeMs: 10000,
        currentStreak: 5,
        targetGroup: "kid_k6",
      });

      expect(res.baseScore).toBe(1);
      expect(res.speedBonus).toBe(1);
      expect(res.streakBonus).toBe(4);
      expect(res.totalPoints).toBe(6);
    });

    it("should award no speed bonus if remaining time is less than 15% for kids", () => {
      const res = calculateScore({
        isCorrect: true,
        difficulty: "easy",
        scoringMode: "speed",
        remainingTimeMs: 1000, // 10% < 15%
        totalTimeMs: 10000,
        currentStreak: 1,
        targetGroup: "kid_k12",
      });

      expect(res.speedBonus).toBe(0);
    });
  });

  describe("Professional target group", () => {
    it("should award linear speed bonus if answered quickly", () => {
      // remaining = 80% >= 20% -> speedBonus = Math.round(0.8 * 3) = 2
      const res = calculateScore({
        isCorrect: true,
        difficulty: "hard", // baseScore = 3
        scoringMode: "speed",
        remainingTimeMs: 8000,
        totalTimeMs: 10000,
        currentStreak: 1,
        targetGroup: "professional",
      });

      expect(res.baseScore).toBe(3);
      expect(res.speedBonus).toBe(2);
      expect(res.totalPoints).toBe(5);
    });

    it("should penalize and award 0 speed bonus if answered in last 20% of time limit", () => {
      const res = calculateScore({
        isCorrect: true,
        difficulty: "hard",
        scoringMode: "speed",
        remainingTimeMs: 1500, // 15% < 20%
        totalTimeMs: 10000,
        currentStreak: 1,
        targetGroup: "professional",
      });

      expect(res.speedBonus).toBe(0);
      expect(res.totalPoints).toBe(3);
    });
  });
});
