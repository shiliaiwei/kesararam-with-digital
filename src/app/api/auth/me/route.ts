import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, classEnrollments } from "@/db/schema/users";
import { pointsLedger } from "@/db/schema/content";
import { eq, and, sql } from "drizzle-orm";
import { STORE_POINTS_ENABLED } from "@/lib/store-points/award";
import { getStoreBalances } from "@/lib/store-points/balance";
import { getClaimBalance } from "@/lib/claims";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch live data from DB so lifetimePoints is always current
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      displayName: users.displayName,
      avatar: users.avatar,
      lifetimePoints: users.lifetimePoints,
      highestScore: users.highestScore,
      totalGamesPlayed: users.totalGamesPlayed,
      claimedRewards: users.claimedRewards,
      schoolName: users.schoolName,
      province: users.province,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // For students, report whether they currently belong to a class. A student
  // who was kicked/removed has no enrollment and must re-join before playing.
  let hasClass = true;
  let livePoints = 0;

  if (user.role === "student") {
    const enrollment = await db
      .select({ id: classEnrollments.id })
      .from(classEnrollments)
      .where(eq(classEnrollments.studentId, user.id))
      .limit(1);
    hasClass = enrollment.length > 0;

    if (STORE_POINTS_ENABLED) {
      // Post-cutover: points = Store Points lifetime-earned; the spendable
      // `livePoints` = claimable balance (lifetime earned − non-rejected claims).
      const [balances, claim] = await Promise.all([
        getStoreBalances(user.id),
        getClaimBalance(user.id),
      ]);
      user.lifetimePoints = balances.lifetimeEarned;
      livePoints = claim.available;
    } else {
      // Fetch sum of claimable live points. Live sessions write
      // source="live-session:{sessionId}", so match the prefix (must stay in sync
      // with the claim API and leaderboard, which use the same LIKE filter).
      const [livePointsRow] = await db
        .select({ total: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)::integer` })
        .from(pointsLedger)
        .where(
          and(
            eq(pointsLedger.userId, user.id),
            sql`${pointsLedger.source} LIKE 'live-session:%'`
          )
        );
      livePoints = livePointsRow?.total ?? 0;
    }
  }

  return NextResponse.json({ ...user, hasClass, livePoints });
}
