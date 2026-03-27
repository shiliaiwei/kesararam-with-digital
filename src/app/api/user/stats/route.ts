import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { gameScores, userStreaks } from "@/db/schema/content";
import { eq, desc } from "drizzle-orm";

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

    // Get streak data
    const [streakData] = await db
      .select({
        currentStreak: userStreaks.currentStreak,
        longestStreak: userStreaks.longestStreak,
      })
      .from(userStreaks)
      .where(eq(userStreaks.userId, user.id));

    // Get recent games (last 10)
    const recentGames = await db
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

    return NextResponse.json({
      stats: {
        highestScore: userProfile?.highestScore || 0,
        totalGamesPlayed: userProfile?.totalGamesPlayed || 0,
        lifetimePoints: userProfile?.lifetimePoints || 0,
        currentStreak: streakData?.currentStreak || 0,
        longestStreak: streakData?.longestStreak || 0,
        recentGames: recentGames.map((game) => ({
          ...game,
          createdAt: game.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
