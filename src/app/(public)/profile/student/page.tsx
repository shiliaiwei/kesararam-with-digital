import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, classes, classEnrollments } from "@/db/schema/users";
import { pointsLedger, userStreaks } from "@/db/schema/content";
import { storePointEvents } from "@/db/schema/store-points";
import { eq, sql, desc, and } from "drizzle-orm";
import { CompleteProfileForm } from "@/components/profile/complete-profile-form";
import { StudentProfileDashboard } from "@/components/profile/student-profile-dashboard";
import { STORE_POINTS_ENABLED } from "@/lib/store-points/award";
import { getStoreBalances } from "@/lib/store-points/balance";
import { normalizeScorePlateStyle, type ScorePlateStyle } from "@/lib/score-plates";

export const metadata: Metadata = {
  title: "My Profile — Kesararam With Digital Quiz",
  description: "View your quiz statistics, game history, and manage your student profile. Track your progress, scores, and rankings.",
  openGraph: {
    title: "My Profile — Kesararam With Digital Quiz",
    description: "View your quiz statistics and manage your profile",
    type: "profile",
  },
};

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ joinClass?: string; redirect?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  if (!session || session.role !== "student") redirect("/login");

  // Initialize with default values
  let user: {
    displayName: string;
    username: string;
    email: string;
    avatar: string | null;
    avatarChangedAt: Date | null;
    schoolName: string | null;
    province: string | null;
    scorePlateStyle: ScorePlateStyle;

  } = {
    displayName: session.name,
    username: session.name,
    email: session.email || "",
    avatar: null,
    avatarChangedAt: null,
    schoolName: null,
    province: null,
    scorePlateStyle: "road",

  };

  let highestScore = 0;
  let totalGamesPlayed = 0;
  let lifetimePoints = 0;
  let livePoints = 0;

  try {
    // Try to fetch user data
    const result = await db
      .select({
        displayName: users.displayName,
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        avatarChangedAt: users.avatarChangedAt,
        schoolName: users.schoolName,
        province: users.province,
        scorePlateStyle: users.scorePlateStyle,

      })
      .from(users)
      .leftJoin(classes, eq(users.classId, classes.id))
      .where(eq(users.id, session.id))
      .limit(1);

    if (result && result.length > 0) {
      user = {
        displayName: result[0].displayName ?? session.name,
        username: result[0].username,
        email: result[0].email,
        avatar: result[0].avatar,
        avatarChangedAt: result[0].avatarChangedAt,
        schoolName: result[0].schoolName,
        province: result[0].province,
        scorePlateStyle: normalizeScorePlateStyle(result[0].scorePlateStyle),

      };
    }

    if (!user.schoolName || !user.province) {
      return <CompleteProfileForm />;
    }

    // Class membership is OPTIONAL: a student can play solo and appear on the
    // leaderboard without joining a class. A class link is only required to join
    // a live teacher session. When the student is explicitly trying to link a
    // class (e.g. redirected here after a live-join was blocked), show the
    // join-class form; otherwise fall through to their dashboard.
    if (sp?.joinClass) {
      let hasClass = false;
      try {
        const enrollment = await db
          .select({ id: classEnrollments.id })
          .from(classEnrollments)
          .where(eq(classEnrollments.studentId, session.id))
          .limit(1);
        hasClass = !!enrollment && enrollment.length > 0;
      } catch (err) {
        console.error("Failed to verify class enrollment:", err);
      }
      if (!hasClass) {
        return (
          <CompleteProfileForm
            joinOnly
            redirectTo={typeof sp.redirect === "string" ? sp.redirect : "/play"}
          />
        );
      }
    }

    // Try to get stats separately - these columns might not exist yet
    try {
      const statsResult = await db
        .select({
          highestScore: users.highestScore,
          totalGamesPlayed: users.totalGamesPlayed,
          lifetimePoints: users.lifetimePoints,
        })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);

      if (statsResult && statsResult.length > 0) {
        highestScore = statsResult[0].highestScore || 0;
        totalGamesPlayed = statsResult[0].totalGamesPlayed || 0;
        lifetimePoints = statsResult[0].lifetimePoints || 0;
      }

      // Post-cutover: the SSR points + tier come from the Store Points ledger
      // (the dashboard re-fetches /api/user/stats, but seed the correct value to
      // avoid a flash of the legacy number).
      if (STORE_POINTS_ENABLED) {
        const balances = await getStoreBalances(session.id);
        lifetimePoints = balances.lifetimeEarned;
      }

      // Calculate live points (Road Points) server-side
      try {
        if (STORE_POINTS_ENABLED) {
          const [liveRow] = await db
            .select({ total: sql<number>`COALESCE(SUM(${storePointEvents.delta}), 0)::int` })
            .from(storePointEvents)
            .where(
              sql`${storePointEvents.userId} = ${session.id} AND ${storePointEvents.delta} > 0 AND ${storePointEvents.attemptId} LIKE 'live:%'`
            );
          livePoints = liveRow?.total ?? 0;
        } else {
          const [liveRow] = await db
            .select({ total: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)::int` })
            .from(pointsLedger)
            .where(
              and(
                eq(pointsLedger.userId, session.id),
                sql`${pointsLedger.source} LIKE 'live-session:%'`
              )
            );
          livePoints = liveRow?.total ?? 0;
        }
      } catch {
        // Ledger not available yet — no live score.
      }
    } catch {
      // Stats columns not available yet — fall back to defaults
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }

  // ── Per-game stats: total points + plays per GameKit game type ──────────────
  let gameStats: { gameType: string; points: number; plays: number }[] = [];
  let currentStreak = 0;
  let longestStreak = 0;
  try {
    gameStats = await db
      .select({
        gameType: pointsLedger.gameType,
        points: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)::int`,
        plays: sql<number>`COUNT(*)::int`,
      })
      .from(pointsLedger)
      .where(eq(pointsLedger.userId, session.id))
      .groupBy(pointsLedger.gameType)
      .orderBy(desc(sql`COALESCE(SUM(${pointsLedger.points}), 0)`));
  } catch {
    // Ledger table not available yet — fall back to empty list
  }
  try {
    const streakRow = await db
      .select({
        currentStreak: userStreaks.currentStreak,
        longestStreak: userStreaks.longestStreak,
      })
      .from(userStreaks)
      .where(eq(userStreaks.userId, session.id))
      .limit(1);
    if (streakRow && streakRow.length > 0) {
      currentStreak = streakRow[0].currentStreak || 0;
      longestStreak = streakRow[0].longestStreak || 0;
    }
  } catch {
    // Streak table not available yet — fall back to defaults
  }

  // Fetch student class details
  let studentClassInfo: {
    className: string;
    schoolName: string | null;
    province: string | null;
    teacherName: string | null;
  } | null = null;

  try {
    const classResult = await db
      .select({
        className: classes.name,
        schoolName: classes.schoolName,
        province: classes.province,
        teacherName: users.displayName,
      })
      .from(classEnrollments)
      .innerJoin(classes, eq(classEnrollments.classId, classes.id))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .where(eq(classEnrollments.studentId, session.id))
      .limit(1);

    if (classResult && classResult.length > 0) {
      studentClassInfo = {
        className: classResult[0].className,
        schoolName: classResult[0].schoolName,
        province: classResult[0].province,
        teacherName: classResult[0].teacherName,
      };
    }
  } catch (err) {
    console.error("Failed to fetch student class info:", err);
  }

  return (
    <StudentProfileDashboard
      user={user}
      highestScore={highestScore}
      totalGamesPlayed={totalGamesPlayed}
      lifetimePoints={lifetimePoints}
      livePoints={livePoints}
      studentClassInfo={studentClassInfo}
      gameStats={gameStats}
      currentStreak={currentStreak}
      longestStreak={longestStreak}
    />
  );
}
