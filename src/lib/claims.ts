/**
 * Reward-claim accounting — the SINGLE source of truth for a student's claimable
 * balance and the class/teacher a claim routes to.
 *
 * Currency model (see [[scoring-model]]): only LIVE teacher-session points
 * (pointsLedger source LIKE 'live-session:%') are claimable. A student's spent
 * total is the cost of every claim that is NOT rejected (pending/accepted/
 * fulfilled all hold the points); rejecting a claim refunds it automatically.
 */
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/db/schema/users";
import { pointsLedger, rewardClaims } from "@/db/schema/content";
import { eq, and, sql, ne } from "drizzle-orm";

/** Claim statuses that hold (spend) points. Rejected is the only refunding state. */
export const CLAIM_HELD_STATUSES = ["pending", "accepted", "fulfilled"] as const;
export type ClaimStatus = "pending" | "accepted" | "fulfilled" | "rejected";

/**
 * Resolve the class + teacher a student's claim should be sent to. Uses the
 * student's first class enrollment. Returns null when the student is in no class
 * (they cannot claim — there is no teacher to fulfil it).
 */
export async function resolveStudentClass(
  studentId: number
): Promise<{ classId: number; teacherId: number } | null> {
  const [row] = await db
    .select({ classId: classes.id, teacherId: classes.teacherId })
    .from(classEnrollments)
    .innerJoin(classes, eq(classes.id, classEnrollments.classId))
    .where(eq(classEnrollments.studentId, studentId))
    .limit(1);
  return row ? { classId: row.classId, teacherId: row.teacherId } : null;
}

/** Live priority points earned (the only claimable currency). */
export async function getLivePoints(studentId: number): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`COALESCE(SUM(${pointsLedger.points}),0)::int` })
    .from(pointsLedger)
    .where(
      and(
        eq(pointsLedger.userId, studentId),
        sql`${pointsLedger.source} LIKE 'live-session:%'`
      )
    );
  return row?.total ?? 0;
}

/** Points committed to non-rejected claims. */
export async function getSpentPoints(studentId: number): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`COALESCE(SUM(${rewardClaims.cost}),0)::int` })
    .from(rewardClaims)
    .where(
      and(eq(rewardClaims.studentId, studentId), ne(rewardClaims.status, "rejected"))
    );
  return row?.total ?? 0;
}

/** Full balance snapshot: earned live points, spent, and what's left to claim. */
export async function getClaimBalance(studentId: number): Promise<{
  live: number;
  spent: number;
  available: number;
}> {
  const [live, spent] = await Promise.all([
    getLivePoints(studentId),
    getSpentPoints(studentId),
  ]);
  return { live, spent, available: Math.max(0, live - spent) };
}
