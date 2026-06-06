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
        schoolName: users.schoolName,
        province: users.province,
        gradeLevel: users.gradeLevel,
        section: users.section,
        isNamePublic: users.isNamePublic,
        isUsernamePublic: users.isUsernamePublic,
        isSchoolPublic: users.isSchoolPublic,
        isProvincePublic: users.isProvincePublic,
        isGradePublic: users.isGradePublic,
        isSectionPublic: users.isSectionPublic,
      })
      .from(users)
      .where(sql`${users.isActive} = true AND ${users.role} = 'student' AND ${users.schoolName} IS NOT NULL AND ${users.province} IS NOT NULL AND ${users.gradeLevel} IS NOT NULL AND ${users.isStatsPublic} = true`)
      .orderBy(desc(users.lifetimePoints), desc(users.highestScore))
      .limit(limit)
      .offset(offset);

    // Add rank to each user and mask details based on settings
    const rankedUsers = topUsers.map((user, index) => {
      const isNamePublic = user.isNamePublic ?? true;
      const isUsernamePublic = user.isUsernamePublic ?? true;
      
      return {
        id: user.id,
        rank: offset + index + 1,
        displayName: isNamePublic ? (user.displayName || user.username) : (isUsernamePublic ? user.username : "Private Student / សិស្សឯកជន"),
        username: isUsernamePublic ? user.username : `student_${user.id}`,
        avatar: user.avatar,
        avatarChangedAt: user.avatarChangedAt,
        highestScore: user.highestScore,
        totalGamesPlayed: user.totalGamesPlayed,
        lifetimePoints: user.lifetimePoints,
        schoolName: (user.isSchoolPublic ?? true) ? user.schoolName : "Private / ឯកជន",
        province: (user.isProvincePublic ?? true) ? user.province : "Private / ឯកជន",
        gradeLevel: (user.isGradePublic ?? true) ? user.gradeLevel : "Private / ឯកជន",
        section: (user.isSectionPublic ?? true) ? user.section : "Private / ឯកជន",
      };
    });

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
