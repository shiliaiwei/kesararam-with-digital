import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { users, classes, classEnrollments } from "@/db/schema/users";
import { pointsLedger, rewardClaims } from "@/db/schema/content";
import { storePointEvents } from "@/db/schema/store-points";
import { eq, and, sql, desc, ne } from "drizzle-orm";
import { STORE_POINTS_ENABLED } from "@/lib/store-points/award";
import { getStoreBalances } from "@/lib/store-points/balance";
import { normalizeScorePlateStyle } from "@/lib/score-plates";
import StudentProfileClient, { SerializableStudent } from "./StudentProfileClient";

interface Props {
  params: Promise<{ username: string }>;
}

// Generate dynamic metadata for SEO and social sharing preview
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    const result = await db
      .select({
        displayName: users.displayName,
        username: users.username,
        isProfilePublic: users.isProfilePublic,
        isNamePublic: users.isNamePublic,
      })
      .from(users)
      .where(and(eq(users.username, username), eq(users.isActive, true), eq(users.role, "student")))
      .limit(1);

    if (!result || result.length === 0) {
      return {
        title: "Student Profile Not Found — Kesararam With Digital Quiz",
      };
    }

    const student = result[0];
    if (!student.isProfilePublic) {
      return {
        title: "Private Student Profile — Kesararam With Digital",
        description: "This Kesararam With Digital student has chosen to keep their profile private.",
      };
    }

    const name = student.isNamePublic ? (student.displayName || student.username) : "Kesararam With Digital Student";

    const desc = `View ${name}'s public Kesararam With Digital profile, game scores, rank progress, and claimed rewards.`;
    const url = `https://kesararamwithdigital.tech/u/${student.username}`;
    return {
      title: `${name} — Student Profile`,
      description: desc,
      openGraph: {
        title: `${name} — Kesararam With Digital Student Profile`,
        description: desc,
        type: "profile",
        url,
        siteName: "Kesararam With Digital Quiz · Kesararam With Digital",
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} — Kesararam With Digital Student Profile`,
        description: desc,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for student profile:", error);
    return {
      title: "Student Profile — Kesararam With Digital Quiz",
    };
  }
}

export default async function PublicStudentProfilePage({ params }: Props) {
  const { username } = await params;

  // 1. Fetch student details from the database server-side
  const result = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      username: users.username,
      avatar: users.avatar,
      avatarChangedAt: users.avatarChangedAt,
      highestScore: users.highestScore,
      totalGamesPlayed: users.totalGamesPlayed,
      lifetimePoints: users.lifetimePoints,
      scorePlateStyle: users.scorePlateStyle,
      createdAt: users.createdAt,
      schoolName: users.schoolName,
      province: users.province,
      claimedRewards: users.claimedRewards,
      isProfilePublic: users.isProfilePublic,
      isNamePublic: users.isNamePublic,
      isUsernamePublic: users.isUsernamePublic,
      isSchoolPublic: users.isSchoolPublic,
      isProvincePublic: users.isProvincePublic,
      isClassPublic: users.isClassPublic,
      isStatsPublic: users.isStatsPublic,
    })
    .from(users)
    .where(and(eq(users.username, username), eq(users.isActive, true), eq(users.role, "student")))
    .limit(1);

  if (!result || result.length === 0) {
    notFound();
  }

  const student = result[0];

  const [classRows, claimRows] = await Promise.all([
    db
      .select({ name: classes.name })
      .from(classEnrollments)
      .innerJoin(classes, eq(classes.id, classEnrollments.classId))
      .where(eq(classEnrollments.studentId, student.id))
      .orderBy(desc(classEnrollments.enrolledAt))
      .limit(1),
    db
      .select({ id: rewardClaims.itemId, claimedAt: rewardClaims.createdAt })
      .from(rewardClaims)
      .where(and(eq(rewardClaims.studentId, student.id), ne(rewardClaims.status, "rejected")))
      .orderBy(desc(rewardClaims.createdAt)),
  ]);

  // Post-cutover: the public number is Store Points lifetime-earned, the rank is
  // by that same ledger, and the breakdown comes from store_point_events.
  let rank = 99;
  let gameStats: { gameType: string; points: number; plays: number }[] = [];

  if (STORE_POINTS_ENABLED) {
    // Show the small Store Points number instead of the legacy thousands.
    const balances = await getStoreBalances(student.id);
    student.lifetimePoints = balances.lifetimeEarned;

    // Rank by lifetime-earned Store Points (delta > 0), students only.
    const lifetimeExpr = sql<number>`COALESCE((SELECT SUM(spe.delta) FROM store_point_events spe WHERE spe.user_id = ${users.id} AND spe.delta > 0), 0)::int`;
    const ranked = await db
      .select({ username: users.username })
      .from(users)
      .where(sql`${users.isActive} = true AND ${users.role} = 'student'`)
      .orderBy(desc(lifetimeExpr), desc(users.highestScore));
    const idx = ranked.findIndex(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    rank = idx !== -1 ? idx + 1 : 99;

    try {
      gameStats = await db
        .select({
          gameType: storePointEvents.gameType,
          points: sql<number>`COALESCE(SUM(CASE WHEN ${storePointEvents.delta} > 0 THEN ${storePointEvents.delta} ELSE 0 END), 0)::int`,
          plays: sql<number>`COUNT(*)::int`,
        })
        .from(storePointEvents)
        .where(and(eq(storePointEvents.userId, student.id), eq(storePointEvents.reason, "play")))
        .groupBy(storePointEvents.gameType)
        .orderBy(desc(sql`COALESCE(SUM(CASE WHEN ${storePointEvents.delta} > 0 THEN ${storePointEvents.delta} ELSE 0 END), 0)`));
    } catch {
      // Ledger not available yet — empty breakdown.
    }
  } else {
    // 2. Legacy ranked list for the exact real-time leaderboard rank.
    const activeStudents = await db
      .select({
        username: users.username,
      })
      .from(users)
      .where(sql`${users.isActive} = true AND ${users.role} = 'student'`)
      .orderBy(desc(users.lifetimePoints), desc(users.highestScore));

    const studentIndex = activeStudents.findIndex(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    rank = studentIndex !== -1 ? studentIndex + 1 : 99;

    // 2b. Per-game-mode breakdown (points + plays per GameKit game type)
    try {
      gameStats = await db
        .select({
          gameType: pointsLedger.gameType,
          points: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)::int`,
          plays: sql<number>`COUNT(*)::int`,
        })
        .from(pointsLedger)
        .where(eq(pointsLedger.userId, student.id))
        .groupBy(pointsLedger.gameType)
        .orderBy(desc(sql`COALESCE(SUM(${pointsLedger.points}), 0)`));
    } catch {
      // Ledger table not available yet — fall back to empty list
    }
  }

  // Live-session score (attempt_id LIKE 'live:%' or source LIKE 'live-session:%') — the value shown on the score plate.
  let livePoints = 0;
  try {
    if (STORE_POINTS_ENABLED) {
      const [liveRow] = await db
        .select({ total: sql<number>`COALESCE(SUM(${storePointEvents.delta}), 0)::int` })
        .from(storePointEvents)
        .where(
          sql`${storePointEvents.userId} = ${student.id} AND ${storePointEvents.delta} > 0 AND ${storePointEvents.attemptId} LIKE 'live:%'`
        );
      livePoints = liveRow?.total ?? 0;
    } else {
      const [liveRow] = await db
        .select({ total: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)::int` })
        .from(pointsLedger)
        .where(
          and(
            eq(pointsLedger.userId, student.id),
            sql`${pointsLedger.source} LIKE 'live-session:%'`
          )
        );
      livePoints = liveRow?.total ?? 0;
    }
  } catch {
    // Ledger not available yet — no live score.
  }

  // 3. Serialize Date objects to strings to pass cleanly as client-side props
  const serializableStudent: SerializableStudent = {
    ...student,
    livePoints,
    scorePlateStyle: normalizeScorePlateStyle(student.scorePlateStyle),
    className: null,
    claimedRewards: JSON.stringify(
      claimRows.map((claim) => ({ id: claim.id, claimedAt: claim.claimedAt.getTime() }))
    ),
    avatarChangedAt: student.avatarChangedAt ? student.avatarChangedAt.toISOString() : null,
    createdAt: student.createdAt ? student.createdAt.toISOString() : new Date().toISOString(),
  };

  return <StudentProfileClient student={serializableStudent} rank={rank} gameStats={gameStats} />;
}
