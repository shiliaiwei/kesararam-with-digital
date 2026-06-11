import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, classEnrollments } from "@/db/schema/users";
import { pointsLedger } from "@/db/schema/content";
import { eq, and, sql } from "drizzle-orm";

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
      gradeLevel: users.gradeLevel,
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

    // Fetch sum of live points from pointsLedger
    const [livePointsRow] = await db
      .select({ total: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)::integer` })
      .from(pointsLedger)
      .where(
        and(
          eq(pointsLedger.userId, user.id),
          eq(pointsLedger.source, "live")
        )
      );
    livePoints = livePointsRow?.total ?? 0;
  }

  return NextResponse.json({ ...user, hasClass, livePoints });
}
