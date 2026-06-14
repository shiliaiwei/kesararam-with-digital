import { describe, it, expect } from "vitest";
import { calculateScore } from "../lib/game-engine";

describe("calculateScore (Kahoot-style)", () => {
  it("scores a correct medium answer at half-time with the time curve + streak", () => {
    // base 800, answered with 5000/10000 remaining → factor 0.75 → timeScore 600
    // baseScore = 400 (floor), speedBonus = 200, streak 3 → +200
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 3,
    });

    expect(res.baseScore).toBe(400);
    expect(res.speedBonus).toBe(200);
    expect(res.streakBonus).toBe(200);
    expect(res.totalPoints).toBe(800);
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

  it("awards near-max (not full) base for an instant answer — never the clean max", () => {
    // base 800, answered at ~0ms but floored to 500ms response on a 10s timer
    // effectiveRemaining = 9500 → factor 0.975 → timeScore 780 (NOT 800)
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs: 9800, // answered in 200ms → clamped up to 500ms
      totalTimeMs: 10000,
      currentStreak: 1, // first correct → no streak bonus
    });

    expect(res.streakBonus).toBe(0);
    expect(res.totalPoints).toBe(780);
    expect(res.totalPoints).toBeLessThan(800);
  });

  it("guarantees a half-base floor for a correct answer at the last second", () => {
    const res = calculateScore({
      isCorrect: true,
      difficulty: "hard",
      scoringMode: "speed",
      remainingTimeMs: 0, // answered at the buzzer
      totalTimeMs: 10000,
      currentStreak: 1,
    });

    // hard base 1000 → floor 500
    expect(res.totalPoints).toBe(500);
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
    expect(easyRes.baseScore).toBe(600);
    expect(easyRes.speedBonus).toBe(0);
    expect(easyRes.totalPoints).toBe(600);

    const hardRes = calculateScore({
      isCorrect: true,
      difficulty: "hard",
      scoringMode: "equal",
      remainingTimeMs: 5000,
      totalTimeMs: 10000,
      currentStreak: 0,
    });
    expect(hardRes.baseScore).toBe(1000);
    expect(hardRes.totalPoints).toBe(1000);
  });

  it("caps the streak bonus at +500", () => {
    const res = calculateScore({
      isCorrect: true,
      difficulty: "medium",
      scoringMode: "equal",
      remainingTimeMs: 0,
      totalTimeMs: 10000,
      currentStreak: 9, // way past the cap
    });
    // base 800 + capped streak 500
    expect(res.streakBonus).toBe(500);
    expect(res.totalPoints).toBe(1300);
  });
});
