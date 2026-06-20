import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { pointsLedger } from "@/db/schema/content";
import { storePointEvents } from "@/db/schema/store-points";
import { desc, asc, sql, eq, and, gte } from "drizzle-orm";
import { windowStartDate } from "@/lib/gamekit/dates";
import { STORE_POINTS_ENABLED } from "@/lib/store-points/award";

export const dynamic = "force-dynamic";

type Window = "weekly" | "monthly" | "all";

/**
 * Store Points leaderboard (post-cutover). Ranks active students by EARNED Store
 * Points (delta > 0) within the window — all plays count, so the live/solo source
 * split is gone. `priorityPoints` carries the claimable store balance (lifetime
 * earn − spend); `soloPoints` is retired (0). Response shape mirrors the legacy
 * path so the page renders unchanged, just with small numbers.
 */
async function storePointsLeaderboard(opts: {
  limit: number;
  offset: number;
  windowParam: Window;
  province: string;
  gameType: string;
  source?: string;
}): Promise<NextResponse | null> {
  const { limit, offset, windowParam, province, gameType, source = "all" } = opts;
  const start =
    windowParam === "all"
      ? "1970-01-01"
      : windowStartDate(windowParam === "weekly" ? "weekly" : "monthly");
  const gameTypeCond =
    gameType !== "all" ? sql` AND spe.game_type = ${gameType}` : sql``;

  // Ranking metric: earned (delta>0) within the window, optionally one game type.
  const windowExpr = sql<number>`COALESCE((SELECT SUM(spe.delta) FROM store_point_events spe WHERE spe.user_id = users.id AND spe.delta > 0 AND spe.play_date >= ${start}${gameTypeCond}), 0)::int`;
  // Claimable store balance = lifetime SUM of every delta (earn − spend/hold).
  const balanceExpr = sql<number>`COALESCE((SELECT SUM(spe.delta) FROM store_point_events spe WHERE spe.user_id = users.id), 0)::int`;
  // Live-session Store Points = the "priority" subtotal (attempt_id like 'live:%').
  const liveExpr = sql<number>`COALESCE((SELECT SUM(spe.delta) FROM store_point_events spe WHERE spe.user_id = users.id AND spe.delta > 0 AND spe.attempt_id LIKE 'live:%'${gameTypeCond}), 0)::int`;
  // Average accuracy across recorded plays (0..100).
  const accuracyExpr = sql<number>`COALESCE((SELECT ROUND(AVG(spe.accuracy) * 100) FROM store_point_events spe WHERE spe.user_id = users.id AND spe.reason = 'play'${gameTypeCond}), 0)::int`;
  // The single game type this student has played most (by play count) — drives the
  // "Top game" leaderboard column. NULL when they have no recorded plays.
  const bestGameExpr = sql<string | null>`(SELECT spe.game_type FROM store_point_events spe WHERE spe.user_id = users.id AND spe.reason = 'play'${gameTypeCond} GROUP BY spe.game_type ORDER BY COUNT(*) DESC LIMIT 1)`;
  const classNameExpr = sql<string | null>`(SELECT c.name FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id WHERE ce.student_id = users.id ORDER BY ce.enrolled_at DESC LIMIT 1)`;
  const classProvinceExpr = sql<string | null>`(SELECT c.province FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id WHERE ce.student_id = users.id ORDER BY ce.enrolled_at DESC LIMIT 1)`;
  const gamesPlayedExpr = gameType !== "all"
    ? sql<number>`(
        COALESCE((SELECT COUNT(*) FROM game_scores gs WHERE gs.user_id = users.id AND gs.game_mode = ${gameType}), 0) +
        COALESCE((SELECT COUNT(*) FROM game_participants gp JOIN game_sessions gs ON gs.id = gp.session_id WHERE gp.user_id = users.id AND gs.game_mode = ${gameType}), 0)
      )::int`
    : users.totalGamesPlayed;

  const provinceFilter =
    province !== "all" ? sql` AND ${users.province} = ${province} AND ${users.isProvincePublic} = true` : sql``;
  const publicFilter = sql`${users.isActive} = true AND ${users.role} = 'student' AND ${users.isProfilePublic} = true`;

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatar: users.avatar,
      avatarChangedAt: users.avatarChangedAt,
      scorePlateStyle: users.scorePlateStyle,
      highestScore: users.highestScore,
      totalGamesPlayed: gamesPlayedExpr,
      windowPoints: windowExpr,
      storeBalance: balanceExpr,
      livePoints: liveExpr,
      accuracy: accuracyExpr,
      bestGame: bestGameExpr,
      schoolName: users.schoolName,
      province: users.province,
      isNamePublic: users.isNamePublic,
      isUsernamePublic: users.isUsernamePublic,
      isProvincePublic: users.isProvincePublic,
      className: classNameExpr,
      isClassPublic: users.isClassPublic,
      classProvince: classProvinceExpr,
      lifetimePoints: users.lifetimePoints,
    })
    .from(users)
    .where(sql`${publicFilter}${provinceFilter} AND ${source === "live" ? liveExpr : windowExpr} > 0`)
    // Rank by priority road points first if source === "live", otherwise by window total points.
    .orderBy(
      desc(source === "live" ? liveExpr : windowExpr),
      desc(source === "live" ? windowExpr : liveExpr),
      desc(users.highestScore),
      asc(users.id)
    )
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) {
    // The feature flag can be enabled before the Store Points cutover has
    // produced its first earned event. Treat that state as "not ready" instead
    // of returning an empty board and hiding the top-three podium. Once any
    // student earns Store Points, the new ledger becomes authoritative.
    const [earnedEvent] = await db
      .select({ id: storePointEvents.id })
      .from(storePointEvents)
      .where(gte(storePointEvents.delta, 1))
      .limit(1);

    if (!earnedEvent) return null;
  }

  const rankedUsers = rows.map((user, index) => ({
    id: user.id,
    rank: offset + index + 1,
    displayName: (user.isNamePublic ?? true) ? (user.displayName || user.username) : "Private Student",
    username: (user.isUsernamePublic ?? true) ? user.username : "",
    isUsernamePublic: user.isUsernamePublic ?? true,
    avatar: user.avatar,
    avatarChangedAt: user.avatarChangedAt,
    scorePlateStyle: user.scorePlateStyle,
    highestScore: user.highestScore,
    totalGamesPlayed: user.totalGamesPlayed,
    lifetimePoints: user.lifetimePoints ?? user.windowPoints,
    priorityPoints: user.livePoints,
    soloPoints: 0,
    accuracy: user.accuracy,
    bestGame: user.bestGame,
    schoolName: null,
    province: (user.isProvincePublic ?? false) ? (user.classProvince || user.province) : null,
    className: null,
  }));

  return NextResponse.json({
    leaderboard: rankedUsers,
    total: rankedUsers.length,
    window: windowParam,
    province,
    gameType,
    source: "all",
  });
}

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
    // Post-cutover: rank by the Store Points ledger (all plays, small numbers).
    if (STORE_POINTS_ENABLED) {
      const storePointsResponse = await storePointsLeaderboard({
        limit,
        offset,
        windowParam,
        province,
        gameType,
        source,
      });
      if (storePointsResponse) return storePointsResponse;
    }

    // Any active student who has scored shows up. Profile completeness
    // (school/province/grade) and isStatsPublic are NOT required — students who
    // played any game appear even with a bare profile. Per-field privacy flags
    // (isNamePublic, isSchoolPublic, …) still anonymize the displayed values below.
    const publicFilter = sql`${users.isActive} = true AND ${users.role} = 'student' AND ${users.isProfilePublic} = true AND ${users.lifetimePoints} > 0`;
    const provinceFilter =
      province !== "all" ? sql` AND ${users.province} = ${province} AND ${users.isProvincePublic} = true` : sql``;

    const gameTypeCondPl =
      gameType !== "all" ? sql` AND pl.game_type = ${gameType}` : sql``;
    const gameTypeCondGs =
      gameType !== "all" ? sql` AND gs.game_mode = ${gameType}` : sql``;

    // Per-user point buckets from the single ledger:
    //   priority (live) = the rank + claimable currency
    //   solo            = separate practice currency (not claimable yet)
    const priorityExpr = sql<number>`COALESCE((SELECT SUM(pl.points) FROM points_ledger pl WHERE pl.user_id = users.id AND pl.source LIKE 'live-session:%'${gameTypeCondPl}), 0)::int`;
    const soloExpr = sql<number>`COALESCE((SELECT SUM(pl.points) FROM points_ledger pl WHERE pl.user_id = users.id AND pl.source = 'solo'${gameTypeCondPl}), 0)::int`;
    // Average accuracy across recorded solo plays (0..100).
    const accuracyExpr = sql<number>`COALESCE((SELECT ROUND(AVG(CASE WHEN gs.total_questions > 0 THEN gs.correct_answers::numeric / gs.total_questions END) * 100) FROM game_scores gs WHERE gs.user_id = users.id${gameTypeCondGs}), 0)::int`;
    // Most-played game mode (by play count) — drives the "Top game" column.
    const bestGameExpr = sql<string | null>`(SELECT gs.game_mode FROM game_scores gs WHERE gs.user_id = users.id${gameTypeCondGs} GROUP BY gs.game_mode ORDER BY COUNT(*) DESC LIMIT 1)`;
    const classNameExpr = sql<string | null>`(SELECT c.name FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id WHERE ce.student_id = users.id ORDER BY ce.enrolled_at DESC LIMIT 1)`;
    const classProvinceExpr = sql<string | null>`(SELECT c.province FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id WHERE ce.student_id = users.id ORDER BY ce.enrolled_at DESC LIMIT 1)`;
    const gamesPlayedExpr = gameType !== "all"
      ? sql<number>`(
          COALESCE((SELECT COUNT(*) FROM game_scores gs WHERE gs.user_id = users.id AND gs.game_mode = ${gameType}), 0) +
          COALESCE((SELECT COUNT(*) FROM game_participants gp JOIN game_sessions gs ON gs.id = gp.session_id WHERE gp.user_id = users.id AND gs.game_mode = ${gameType}), 0)
        )::int`
      : users.totalGamesPlayed;

    let rows: {
      id: number;
      username: string;
      displayName: string | null;
      avatar: string | null;
      avatarChangedAt: Date | null;
      scorePlateStyle: string;
      highestScore: number;
      totalGamesPlayed: number;
      windowPoints: number;
      priorityPoints: number;
      soloPoints: number;
      accuracy: number;
      bestGame: string | null;
      schoolName: string | null;
      province: string | null;
      className: string | null;
      classProvince: string | null;
      isNamePublic: boolean | null;
      isUsernamePublic: boolean | null;
      isSchoolPublic: boolean | null;
      isProvincePublic: boolean | null;
      isClassPublic: boolean | null;
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
          scorePlateStyle: users.scorePlateStyle,
          highestScore: users.highestScore,
          totalGamesPlayed: users.totalGamesPlayed,
          windowPoints: sql<number>`COALESCE(${users.lifetimePoints} + (SELECT SUM(pl.points) FROM points_ledger pl WHERE pl.user_id = users.id AND pl.source = 'solo'), ${users.lifetimePoints})::int`,
          priorityPoints: priorityExpr,
          soloPoints: soloExpr,
          accuracy: accuracyExpr,
          bestGame: bestGameExpr,
          schoolName: users.schoolName,
          province: users.province,
          className: classNameExpr,
          isNamePublic: users.isNamePublic,
          isUsernamePublic: users.isUsernamePublic,
          isSchoolPublic: users.isSchoolPublic,
          isProvincePublic: users.isProvincePublic,
          isClassPublic: users.isClassPublic,
          isGradePublic: users.isGradePublic,
          isSectionPublic: users.isSectionPublic,
          classProvince: classProvinceExpr,
          lifetimePoints: users.lifetimePoints,
        })
        .from(users)
        .where(sql`${publicFilter}${provinceFilter}`)
        // Combined total points (solo + live) are the primary ranking metric;
        // live total + highest score break ties. This path is source=all only.
        .orderBy(desc(users.lifetimePoints), desc(priorityExpr), desc(users.highestScore), asc(users.id))
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
          scorePlateStyle: users.scorePlateStyle,
          highestScore: users.highestScore,
          totalGamesPlayed: gamesPlayedExpr,
          windowPoints: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)::int`,
          priorityPoints: priorityExpr,
          soloPoints: soloExpr,
          accuracy: accuracyExpr,
          bestGame: bestGameExpr,
          schoolName: users.schoolName,
          province: users.province,
          className: classNameExpr,
          isNamePublic: users.isNamePublic,
          isUsernamePublic: users.isUsernamePublic,
          isSchoolPublic: users.isSchoolPublic,
          isProvincePublic: users.isProvincePublic,
          isClassPublic: users.isClassPublic,
          isGradePublic: users.isGradePublic,
          isSectionPublic: users.isSectionPublic,
          classProvince: classProvinceExpr,
          lifetimePoints: users.lifetimePoints,
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
          users.scorePlateStyle,
          users.highestScore,
          users.totalGamesPlayed,
          users.schoolName,
          users.province,
          users.isNamePublic,
          users.isUsernamePublic,
          users.isSchoolPublic,
          users.isProvincePublic,
          users.isClassPublic,
          users.isGradePublic,
          users.isSectionPublic,
          users.lifetimePoints
        )
        .having(sql`COALESCE(SUM(${pointsLedger.points}), 0) > 0`)
        // Rank by window total first (solo + live points for source=all), then live.
        .orderBy(
          desc(sql`COALESCE(SUM(${pointsLedger.points}), 0)`),
          desc(priorityExpr),
          desc(users.highestScore),
          asc(users.id)
        )
        .limit(limit)
        .offset(offset);
    }

    // Rank is assigned by position in the sorted result + offset.
    // Because results are ordered DESC by points and we paginate with offset,
    // rank = offset + index + 1 is correct for the page slice.
    const rankedUsers = rows.map((user, index) => {
      return {
        id: user.id,
        rank: offset + index + 1,
        displayName: (user.isNamePublic ?? true) ? (user.displayName || user.username) : "Private Student",
        username: (user.isUsernamePublic ?? true) ? user.username : "",
        isUsernamePublic: user.isUsernamePublic ?? true,
        avatar: user.avatar,
        avatarChangedAt: user.avatarChangedAt,
        scorePlateStyle: user.scorePlateStyle,
        highestScore: user.highestScore,
        totalGamesPlayed: user.totalGamesPlayed,
        lifetimePoints: user.lifetimePoints ?? user.windowPoints,
        priorityPoints: user.priorityPoints,
        soloPoints: user.soloPoints,
        accuracy: user.accuracy,
        bestGame: user.bestGame,
        schoolName: null,
        province: (user.isProvincePublic ?? false) ? (user.classProvince || user.province) : null,
        className: null,
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
