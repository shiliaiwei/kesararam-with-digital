import { describe, it, expect } from "vitest";
import { calculateScore } from "../lib/game-engine";

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
});
