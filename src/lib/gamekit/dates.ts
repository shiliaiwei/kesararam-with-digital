/**
 * Pure date + comparison helpers for the GameKit server.
 * No I/O — safe to unit/property test.
 */

import type { UserStreak } from "@/db/schema/content";

/** Compute YYYY-MM-DD for "now" in Asia/Phnom_Penh (UTC+7, no DST). */
export function todayInPhnomPenh(now: Date = new Date()): string {
    // Phnom Penh is a fixed UTC+7 offset year-round.
    const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
    const pp = new Date(utc + 7 * 60 * 60_000);
    const y = pp.getFullYear();
    const m = String(pp.getMonth() + 1).padStart(2, "0");
    const d = String(pp.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** Return the YYYY-MM-DD that is one day before the given YYYY-MM-DD. */
export function previousDay(ymd: string): string {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - 1);
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
}

/**
 * Consecutive-day streak computation (pure).
 * - lastPlayDate === yesterday  -> current = prev.currentStreak + 1
 * - lastPlayDate === today      -> unchanged (defensive; anti-replay prevents)
 * - otherwise (gap / no prior)  -> current = 1
 * longest = max(prev.longest, current).
 */
/**
 * Consecutive-day streak computation (pure).
 * - lastPlayDate === today      -> unchanged (defensive; anti-replay prevents)
 * - lastPlayDate === yesterday  -> current = prev.currentStreak + 1
 * - hasStreakShield / Freeze    -> current = prev.currentStreak + 1 (resume streak after 1 missed day)
 * - otherwise (gap / no prior)  -> current = 1
 * longest = max(prev.longest, current).
 *
 * Streak Psychology - Loss Aversion & Consistency:
 * - 3 Days: Habit Lock-In. The user has enough sunk cost that breaking the streak causes emotional pain.
 * - 7 Days: Identity Shift. The student identifies as a daily learning participant.
 * - 30 Days: Habit Crystallization. Hardwired daily routine.
 */
export function computeStreak(
    prev: Pick<UserStreak, "currentStreak" | "longestStreak" | "lastPlayDate"> | null,
    today: string,
    opts?: { hasStreakShield?: boolean }
): { current: number; longest: number; shieldUsed: boolean } {
    const prevCurrent = prev?.currentStreak ?? 0;
    const prevLongest = prev?.longestStreak ?? 0;
    const last = prev?.lastPlayDate ?? null;

    let current: number;
    let shieldUsed = false;

    if (last === today) {
        current = prevCurrent > 0 ? prevCurrent : 1; // unchanged
    } else if (last === previousDay(today)) {
        current = prevCurrent + 1;
    } else if (opts?.hasStreakShield && last && last === previousDay(previousDay(today))) {
        // Streak Shield / Freeze: missed exactly one day, shield preserves it
        current = prevCurrent + 1;
        shieldUsed = true;
    } else {
        current = 1;
    }

    const longest = Math.max(prevLongest, current);
    return { current, longest, shieldUsed };
}

/** 
 * Milestone bonus added once for reaching a consecutive-day streak.
 * 
 * Streak Psychology Milestones:
 * - Day 3 Milestone (+2): Acknowledges the "Habit Lock-In" transition threshold.
 * - Day 7 Milestone (+5): Celebrates the "Identity Integration" milestone.
 * - Day 30 Milestone (+15): Rewards complete "Habit Crystallization".
 */
export function streakMilestoneBonus(currentStreak: number): number {
    if (currentStreak >= 30) return 15;
    if (currentStreak >= 7) return 5;
    if (currentStreak >= 3) return 2;
    return 0;
}

/** True iff both arrays contain the same elements (multiset / permutation). */
export function sameMultiset(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const count = new Map<string, number>();
    for (const x of a) count.set(x, (count.get(x) ?? 0) + 1);
    for (const y of b) {
        const c = count.get(y);
        if (!c) return false;
        count.set(y, c - 1);
    }
    return true;
}

/** True iff arrays are equal element-for-element (exact order). */
export function arrayEquals(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

/** Window start (YYYY-MM-DD inclusive) for weekly/monthly leaderboards. */
export function windowStartDate(
    window: "weekly" | "monthly",
    today: string = todayInPhnomPenh()
): string {
    const [y, m, d] = today.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - (window === "weekly" ? 6 : 29));
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
}
