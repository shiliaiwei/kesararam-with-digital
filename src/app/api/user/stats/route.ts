import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { gameScores, userStreaks } from "@/db/schema/content";
import { storePointEvents } from "@/db/schema/store-points";
import { eq, desc, sql } from "drizzle-orm";
import { STORE_POINTS_ENABLED } from "@/lib/store-points/award";
import { getStoreBalances } from "@/lib/store-points/balance";

export async function GET() {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user profile stats
    const [userProfile] = await db
      .select({
        highestScore: users.highestScore,
        totalGamesPlayed: users.totalGamesPlayed,
        lifetimePoints: users.lifetimePoints,
      })
      .from(users)
      .where(eq(users.id, user.id));

    // Post-cutover: the displayed points + tier come from the Store Points ledger.
    if (STORE_POINTS_ENABLED && userProfile) {
      const balances = await getStoreBalances(user.id);
      userProfile.lifetimePoints = balances.lifetimeEarned;
    }

    // Live-session score (attempt_id LIKE 'live:%') — the value shown on the score plate.
    let livePoints = 0;
    try {
      const [liveRow] = await db
        .select({ total: sql<number>`COALESCE(SUM(${storePointEvents.delta}), 0)::int` })
        .from(storePointEvents)
        .where(
          sql`${storePointEvents.userId} = ${user.id} AND ${storePointEvents.delta} > 0 AND ${storePointEvents.attemptId} LIKE 'live:%'`
        );
      livePoints = liveRow?.total ?? 0;
    } catch (err) {
      console.log("Error calculating live points:", err);
    }

    // Get streak data (optional - may not exist)
    let streakData = null;
    try {
      [streakData] = await db
        .select({
          currentStreak: userStreaks.currentStreak,
          longestStreak: userStreaks.longestStreak,
        })
        .from(userStreaks)
        .where(eq(userStreaks.userId, user.id));
    } catch (err) {
      console.log("No streak data found:", err);
    }

    // Get recent games (last 10) - optional
    let recentGames: Array<Record<string, unknown>> = [];
    try {
      recentGames = await db
        .select({
          id: gameScores.id,
          gameMode: gameScores.gameMode,
          score: gameScores.score,
          correctAnswers: gameScores.correctAnswers,
          totalQuestions: gameScores.totalQuestions,
          createdAt: gameScores.createdAt,
        })
        .from(gameScores)
        .where(eq(gameScores.userId, user.id))
        .orderBy(desc(gameScores.createdAt))
        .limit(10);
    } catch (err) {
      console.log("No game scores found:", err);
    }

    // Calculate current rank on leaderboard
    let currentRank: number | null = null;
    if (userProfile && userProfile.lifetimePoints > 0) {
      try {
        // Count students strictly ahead — by Store Points lifetime-earned after
        // cutover, by legacy lifetimePoints before.
        const aheadCond = STORE_POINTS_ENABLED
          ? sql`COALESCE((SELECT SUM(spe.delta) FROM store_point_events spe WHERE spe.user_id = ${users.id} AND spe.delta > 0), 0) > ${userProfile.lifetimePoints}`
          : sql`${users.lifetimePoints} > ${userProfile.lifetimePoints}`;
        const [rankResult] = await db
          .select({
            rank: sql<number>`COUNT(*) + 1`,
          })
          .from(users)
          .where(
            sql`${aheadCond} AND ${users.isActive} = true AND ${users.role} = 'student'`
          );
        currentRank = rankResult?.rank || null;
      } catch (err) {
        console.log("Error calculating rank:", err);
      }
    }

    return NextResponse.json({
      stats: {
        highestScore: userProfile?.highestScore || 0,
        totalGamesPlayed: userProfile?.totalGamesPlayed || 0,
        lifetimePoints: userProfile?.lifetimePoints || 0,
        livePoints,
        currentStreak: streakData?.currentStreak || 0,
        longestStreak: streakData?.longestStreak || 0,
        currentRank,
        recentGames: recentGames.map((game) => ({
          ...game,
          createdAt: game.createdAt?.toISOString() || new Date().toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
