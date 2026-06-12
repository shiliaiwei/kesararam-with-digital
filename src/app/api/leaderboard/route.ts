import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { pointsLedger } from "@/db/schema/content";
import { desc, sql, eq, and, gte } from "drizzle-orm";
import { windowStartDate } from "@/lib/gamekit/dates";

export const dynamic = "force-dynamic";

type Window = "weekly" | "monthly" | "all";

/**
 * GET /api/leaderboard
 *
 * Query params:
 *   window      = "weekly" | "monthly" | "all"   (default: "all")
 *   province    = province name | "all"            (default: "all")
 *   gameType    = game mode key | "all"            (default: "all")
 *   source      = "live" | "solo" | "daily" | "all" (default: "all")
 *   limit       = number (default: 50)
 *   offset      = number (default: 0)
 *
 * Ranks are computed server-side by scanning ALL active student users
 * with lifetimePoints > 0 (all-time) or pointsLedger rows within the
 * time window (weekly/monthly). Ranks are dense (1, 2, 3 …).
 *
 * Live teacher sessions (source="live") count at FULL value for ranking.
 * Solo practice sessions (source="solo") also count at full value.
 * The `source` filter lets the client show "Live-only" or "Practice-only"
 * leaderboards — but the default "all" mixes everything for the global rank.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const windowParam = (searchParams.get("window") || "all") as Window;
  const province = searchParams.get("province") || "all";
  const gameType = searchParams.get("gameType") || "all";
  const source = searchParams.get("source") || "all";

  try {
    // Any active student who has scored shows up. Profile completeness
    // (school/province/grade) and isStatsPublic are NOT required — students who
    // played any game appear even with a bare profile. Per-field privacy flags
    // (isNamePublic, isSchoolPublic, …) still anonymize the displayed values below.
    const publicFilter = sql`${users.isActive} = true AND ${users.role} = 'student' AND ${users.lifetimePoints} > 0`;
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

    if (windowParam === "all" && gameType === "all" && source === "all") {
      // ── All-time, no filter — rank by lifetimePoints (fastest path) ───────
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
      // ── Windowed or filtered — SUM(pointsLedger.points) within constraints ─
      // For all-time with gameType/source filter we still use pointsLedger
      // so we can filter by gameType and source columns.
      const start =
        windowParam !== "all"
          ? windowStartDate(windowParam === "weekly" ? "weekly" : "monthly")
          : "1970-01-01";

      const gameTypeFilter =
        gameType !== "all" ? sql` AND ${pointsLedger.gameType} = ${gameType}` : sql``;
      const sourceFilter =
        source !== "all"
          ? source === "live"
            ? sql` AND ${pointsLedger.source} LIKE 'live-session:%'`
            : sql` AND ${pointsLedger.source} = ${source}`
          : sql``;

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
        .where(sql`${publicFilter}${provinceFilter}${gameTypeFilter}${sourceFilter}`)
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

    // Rank is assigned by position in the sorted result + offset.
    // Because results are ordered DESC by points and we paginate with offset,
    // rank = offset + index + 1 is correct for the page slice.
    const rankedUsers = rows.map((user, index) => {
      // Name + username are ALWAYS public on the leaderboard — students cannot
      // privatize their identity here. School/province/grade still respect their
      // privacy flags, but when private we omit them (null) rather than show a
      // "Private" placeholder label.
      return {
        id: user.id,
        rank: offset + index + 1,
        displayName: user.displayName || user.username,
        username: user.username,
        // Always a real, profile-resolvable handle now — every row links to /u/.
        isUsernamePublic: true,
        avatar: user.avatar,
        avatarChangedAt: user.avatarChangedAt,
        highestScore: user.highestScore,
        totalGamesPlayed: user.totalGamesPlayed,
        lifetimePoints: user.windowPoints,
        schoolName: (user.isSchoolPublic ?? true) ? user.schoolName : null,
        province: (user.isProvincePublic ?? true) ? user.province : null,
        gradeLevel: (user.isGradePublic ?? true) ? user.gradeLevel : null,
        section: (user.isSectionPublic ?? true) ? user.section : null,
      };
    });

    return NextResponse.json({
      leaderboard: rankedUsers,
      total: rankedUsers.length,
      window: windowParam,
      province,
      gameType,
      source,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
