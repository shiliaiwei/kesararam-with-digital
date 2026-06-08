import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { pointsLedger } from "@/db/schema/content";
import { desc, sql, eq, and, gte } from "drizzle-orm";
import { windowStartDate } from "@/lib/gamekit/dates";

export const dynamic = "force-dynamic";

type Window = "weekly" | "monthly" | "all";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const windowParam = (searchParams.get("window") || "all") as Window;
  const province = searchParams.get("province") || "all";
  const gameType = searchParams.get("gameType") || "all";

  try {
    const publicFilter = sql`${users.isActive} = true AND ${users.role} = 'student' AND ${users.schoolName} IS NOT NULL AND ${users.province} IS NOT NULL AND ${users.gradeLevel} IS NOT NULL AND ${users.isStatsPublic} = true AND ${users.lifetimePoints} > 0`;
    const provinceFilter =
      province !== "all" ? sql` AND ${users.province} = ${province}` : sql``;

    let rows: {
      id: number;
      username: string;
      displayName: string | null;
      avatar: string | null;
      avatarChangedAt: Date | null;
      highestScore: number;
      totalGamesPlayed: number;
      windowPoints: number;
      schoolName: string | null;
      province: string | null;
      gradeLevel: string | null;
      section: string | null;
      isNamePublic: boolean | null;
      isUsernamePublic: boolean | null;
      isSchoolPublic: boolean | null;
      isProvincePublic: boolean | null;
      isGradePublic: boolean | null;
      isSectionPublic: boolean | null;
    }[];

    if (windowParam === "all") {
      // All-time — rank by lifetimePoints (existing behavior).
      rows = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
          avatarChangedAt: users.avatarChangedAt,
          highestScore: users.highestScore,
          totalGamesPlayed: users.totalGamesPlayed,
          windowPoints: users.lifetimePoints,
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
        .where(sql`${publicFilter}${provinceFilter}`)
        .orderBy(desc(users.lifetimePoints), desc(users.highestScore))
        .limit(limit)
        .offset(offset);
    } else {
      // Weekly / monthly — rank by SUM(pointsLedger.points) within the window.
      const start = windowStartDate(windowParam === "weekly" ? "weekly" : "monthly");
      const gameTypeFilter =
        gameType !== "all" ? sql` AND ${pointsLedger.gameType} = ${gameType}` : sql``;

      rows = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
          avatarChangedAt: users.avatarChangedAt,
          highestScore: users.highestScore,
          totalGamesPlayed: users.totalGamesPlayed,
          windowPoints: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)::int`,
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
        .innerJoin(
          pointsLedger,
          and(
            eq(pointsLedger.userId, users.id),
            gte(pointsLedger.createdAt, new Date(`${start}T00:00:00+07:00`))
          )
        )
        .where(sql`${publicFilter}${provinceFilter}${gameTypeFilter}`)
        .groupBy(
          users.id,
          users.username,
          users.displayName,
          users.avatar,
          users.avatarChangedAt,
          users.highestScore,
          users.totalGamesPlayed,
          users.schoolName,
          users.province,
          users.gradeLevel,
          users.section,
          users.isNamePublic,
          users.isUsernamePublic,
          users.isSchoolPublic,
          users.isProvincePublic,
          users.isGradePublic,
          users.isSectionPublic
        )
        .orderBy(desc(sql`COALESCE(SUM(${pointsLedger.points}), 0)`))
        .limit(limit)
        .offset(offset);
    }

    const rankedUsers = rows.map((user, index) => {
      const isNamePublic = user.isNamePublic ?? true;
      const isUsernamePublic = user.isUsernamePublic ?? true;
      return {
        id: user.id,
        rank: offset + index + 1,
        displayName: isNamePublic
          ? user.displayName || user.username
          : isUsernamePublic
            ? user.username
            : "Private Student / សិស្សឯកជន",
        username: isUsernamePublic ? user.username : `student_${user.id}`,
        avatar: user.avatar,
        avatarChangedAt: user.avatarChangedAt,
        highestScore: user.highestScore,
        totalGamesPlayed: user.totalGamesPlayed,
        lifetimePoints: user.windowPoints,
        schoolName: (user.isSchoolPublic ?? true) ? user.schoolName : "Private / ឯកជន",
        province: (user.isProvincePublic ?? true) ? user.province : "Private / ឯកជន",
        // Grade is an academic ranking field shown on the public leaderboard.
        // Appearing here already requires public stats, so always show the real grade.
        gradeLevel: user.gradeLevel,
        section: (user.isSectionPublic ?? true) ? user.section : "Private / ឯកជន",
      };
    });

    return NextResponse.json({
      leaderboard: rankedUsers,
      total: rankedUsers.length,
      window: windowParam,
      province,
      gameType,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
