import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    // Get top users by highest score
    const topUsers = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
        avatarChangedAt: users.avatarChangedAt,
        highestScore: users.highestScore,
        totalGamesPlayed: users.totalGamesPlayed,
        lifetimePoints: users.lifetimePoints,
      })
      .from(users)
      .where(sql`${users.isActive} = true AND ${users.role} = 'student'`)
      .orderBy(desc(users.highestScore), desc(users.lifetimePoints))
      .limit(limit)
      .offset(offset);

    // Add rank to each user
    const rankedUsers = topUsers.map((user, index) => ({
      ...user,
      rank: offset + index + 1,
    }));

    return NextResponse.json({
      leaderboard: rankedUsers,
      total: rankedUsers.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
