import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { rewardClaims } from "@/db/schema/content";
import { users, classes } from "@/db/schema/users";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * GET /api/teacher/claims — every reward claim routed to this teacher, newest
 * first, with the student + class context the teacher needs to hand over the item.
 * Optional ?status=pending|accepted|fulfilled|rejected filter.
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "teacher" && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const where = status
    ? and(eq(rewardClaims.teacherId, session.id), eq(rewardClaims.status, status))
    : eq(rewardClaims.teacherId, session.id);

  const claims = await db
    .select({
      id: rewardClaims.id,
      itemId: rewardClaims.itemId,
      itemName: rewardClaims.itemName,
      cost: rewardClaims.cost,
      status: rewardClaims.status,
      studentNote: rewardClaims.studentNote,
      teacherNote: rewardClaims.teacherNote,
      createdAt: rewardClaims.createdAt,
      decidedAt: rewardClaims.decidedAt,
      fulfilledAt: rewardClaims.fulfilledAt,
      studentId: rewardClaims.studentId,
      studentUsername: users.username,
      studentName: users.displayName,
      studentAvatar: users.avatar,
      className: classes.name,
    })
    .from(rewardClaims)
    .leftJoin(users, eq(users.id, rewardClaims.studentId))
    .leftJoin(classes, eq(classes.id, rewardClaims.classId))
    .where(where)
    .orderBy(desc(rewardClaims.createdAt));

  // Lightweight per-status counts for the page header / badges.
  const counts = await db
    .select({ status: rewardClaims.status, n: sql<number>`COUNT(*)::int` })
    .from(rewardClaims)
    .where(eq(rewardClaims.teacherId, session.id))
    .groupBy(rewardClaims.status);

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c.n]));

  return NextResponse.json({ claims, countByStatus });
}
