import { describe, it, expect } from "vitest";
import { computeStreak, streakMilestoneBonus, previousDay } from "../lib/gamekit/dates";

describe("Streak calculation and milestone bonuses", () => {
  it("increments the streak for consecutive days", () => {
    const today = "2026-06-17";
    const yesterday = previousDay(today); // 2026-06-16
    
    const prev = { currentStreak: 3, longestStreak: 3, lastPlayDate: yesterday };
    const res = computeStreak(prev, today);
    
    expect(res.current).toBe(4);
    expect(res.longest).toBe(4);
    expect(res.shieldUsed).toBe(false);
  });

  it("resets streak to 1 if there is a multi-day gap and no shield is active", () => {
    const today = "2026-06-17";
    const twoDaysAgo = previousDay(previousDay(today)); // 2026-06-15
    
    const prev = { currentStreak: 5, longestStreak: 5, lastPlayDate: twoDaysAgo };
    const res = computeStreak(prev, today);
    
    expect(res.current).toBe(1);
    expect(res.longest).toBe(5);
    expect(res.shieldUsed).toBe(false);
  });

  it("uses streak shield to preserve the streak if the user missed exactly one day", () => {
    const today = "2026-06-17";
    const twoDaysAgo = previousDay(previousDay(today)); // 2026-06-15
    
    const prev = { currentStreak: 5, longestStreak: 5, lastPlayDate: twoDaysAgo };
    const res = computeStreak(prev, today, { hasStreakShield: true });
    
    expect(res.current).toBe(6); // Resumes streak as if they played
    expect(res.longest).toBe(6);
    expect(res.shieldUsed).toBe(true);
  });

  it("does not use streak shield if the gap is larger than 1 day", () => {
    const today = "2026-06-17";
    const threeDaysAgo = previousDay(previousDay(previousDay(today))); // 2026-06-14
    
    const prev = { currentStreak: 5, longestStreak: 5, lastPlayDate: threeDaysAgo };
    const res = computeStreak(prev, today, { hasStreakShield: true });
    
    expect(res.current).toBe(1); // Gap is too large, reset streak
    expect(res.longest).toBe(5);
    expect(res.shieldUsed).toBe(false);
  });

  it("returns correct streak milestone bonuses based on habit formation thresholds", () => {
    expect(streakMilestoneBonus(0)).toBe(0);
    expect(streakMilestoneBonus(1)).toBe(0);
    expect(streakMilestoneBonus(2)).toBe(0);
    
    // Day 3 (Habit Lock-In)
    expect(streakMilestoneBonus(3)).toBe(2);
    expect(streakMilestoneBonus(5)).toBe(2);
    
    // Day 7 (Identity Shift)
    expect(streakMilestoneBonus(7)).toBe(5);
    expect(streakMilestoneBonus(15)).toBe(5);
    
    // Day 30 (Habit Crystallization)
    expect(streakMilestoneBonus(30)).toBe(15);
    expect(streakMilestoneBonus(45)).toBe(15);
  });
});
