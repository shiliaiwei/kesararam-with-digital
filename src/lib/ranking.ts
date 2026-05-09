/**
 * Ranking System Utility Functions
 * 
 * Provides utilities for calculating rankings, managing leaderboards,
 * and handling period-based scoring.
 */

import { db } from "@/lib/db";
import { leaderboardEntries } from "@/db/schema/quizzes";
import { eq, and, isNull, or, desc } from "drizzle-orm";

/**
 * Period types for leaderboard rankings
 */
export type RankingPeriod = "weekly" | "monthly" | "all-time";

/**
 * Get the start date for a given period
 */
export function getPeriodStart(period: RankingPeriod, date: Date = new Date()): string {
  if (period === "weekly") {
    // Week starts on Sunday (day 0)
    const d = new Date(date);
    const day = d.getUTCDay();
    const currentDate = d.getUTCDate();
    const diff = currentDate - day;
    d.setUTCDate(diff);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }
  
  if (period === "monthly") {
    // Month starts on the 1st
    const d = new Date(date);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().split('T')[0];
  }
  
  // all-time uses epoch
  return "1970-01-01";
}

/**
 * Update leaderboard entry for a student
 * Creates new entry if it doesn't exist, updates existing entry otherwise
 */
export async function updateLeaderboardEntry(
  studentId: number,
  categoryId: number | null,
  scoreChange: number,
  correctAnswersChange: number,
  period: RankingPeriod,
  periodStart: string
): Promise<void> {
  // Build where conditions
  const conditions = [
    eq(leaderboardEntries.studentId, studentId),
    eq(leaderboardEntries.period, period),
    eq(leaderboardEntries.periodStart, periodStart),
  ];

  // Handle categoryId which can be null
  if (categoryId === null) {
    conditions.push(isNull(leaderboardEntries.categoryId));
  } else {
    conditions.push(eq(leaderboardEntries.categoryId, categoryId));
  }

  // Check if entry exists
  const [existingEntry] = await db
    .select()
    .from(leaderboardEntries)
    .where(and(...conditions));

  if (existingEntry) {
    // Update existing entry
    await db
      .update(leaderboardEntries)
      .set({
        score: existingEntry.score + scoreChange,
        correctAnswers: existingEntry.correctAnswers + correctAnswersChange,
        totalAttempts: existingEntry.totalAttempts + 1,
        updatedAt: new Date(),
      })
      .where(eq(leaderboardEntries.id, existingEntry.id));
  } else {
    // Create new entry
    await db.insert(leaderboardEntries).values({
      studentId,
      categoryId: categoryId ?? null,
      score: scoreChange,
      correctAnswers: correctAnswersChange,
      totalAttempts: 1,
      period,
      periodStart,
    });
  }
}

/**
 * Recalculate ranks for a specific leaderboard
 * Ranks are ordered by score DESC, then correctAnswers DESC
 */
export async function recalculateRanks(
  categoryId: number | null,
  period: RankingPeriod,
  periodStart: string
): Promise<void> {
  // Build where conditions
  const conditions = [
    eq(leaderboardEntries.period, period),
    eq(leaderboardEntries.periodStart, periodStart),
  ];

  // Handle categoryId which can be null
  if (categoryId === null) {
    conditions.push(isNull(leaderboardEntries.categoryId));
  } else {
    conditions.push(eq(leaderboardEntries.categoryId, categoryId));
  }

  // Get all entries for this leaderboard
  const entries = await db
    .select()
    .from(leaderboardEntries)
    .where(and(...conditions))
    .orderBy(
      desc(leaderboardEntries.score),
      desc(leaderboardEntries.correctAnswers)
    );

  // Update ranks
  for (let i = 0; i < entries.length; i++) {
    await db
      .update(leaderboardEntries)
      .set({
        rank: i + 1,
      })
      .where(eq(leaderboardEntries.id, entries[i].id));
  }
}

/**
 * Update rankings for all three periods (weekly, monthly, all-time)
 * Called after quiz or challenge completion
 */
export async function updateRankingsForAllPeriods(
  studentId: number,
  categoryId: number | null,
  scoreChange: number,
  correctAnswersChange: number
): Promise<void> {
  const now = new Date();
  const periods: RankingPeriod[] = ["weekly", "monthly", "all-time"];

  for (const period of periods) {
    const periodStart = getPeriodStart(period, now);
    
    // Update leaderboard entry
    await updateLeaderboardEntry(
      studentId,
      categoryId,
      scoreChange,
      correctAnswersChange,
      period,
      periodStart
    );

    // Recalculate ranks for this leaderboard
    await recalculateRanks(categoryId, period, periodStart);
  }
}
