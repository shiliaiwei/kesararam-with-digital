import { db } from "@/lib/db";
import { PLAY_LIMITS } from "@/lib/game-engine";
import { gameScores } from "@/db/schema/content";
import { classEnrollments, classes } from "@/db/schema/users";
import { eq, and, gte, count } from "drizzle-orm";
import { getUserSubscription } from "@/lib/subscription";

/**
 * Determine the play-limit tier for an authenticated student.
 * Joins classEnrollments → classes to get the teacher, then checks subscription.
 */
export async function getStudentPlayLimit(userId: number): Promise<{
  limit: number;
  tier: "student" | "studentClass" | "studentPro";
}> {
  // Check if enrolled in any class
  const [row] = await db
    .select({ teacherId: classes.teacherId })
    .from(classEnrollments)
    .innerJoin(classes, eq(classes.id, classEnrollments.classId))
    .where(eq(classEnrollments.studentId, userId))
    .limit(1);

  if (!row) {
    // Independent student (not in any class) → free student limit (5/day)
    return { limit: PLAY_LIMITS.student, tier: "student" };
  }

  // Enrolled in a class → check the teacher's subscription plan
  try {
    const { plan } = await getUserSubscription(row.teacherId);
    if (!plan || plan === "free" || (plan as string) === "trial") {
      return { limit: PLAY_LIMITS.studentClass, tier: "studentClass" };
    }
    // Pro teacher → student gets full studentPro limit (50/day)
    return { limit: PLAY_LIMITS.studentPro, tier: "studentPro" };
  } catch {
    return { limit: PLAY_LIMITS.studentClass, tier: "studentClass" };
  }
}

/**
 * Count how many solo games this user has already submitted today (UTC+7 / Phnom Penh).
 */
export async function getSoloPlaysToday(userId: number): Promise<number> {
  const now = new Date();
  const todayOffset = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const dateStr = todayOffset.toISOString().slice(0, 10);
  const startOfDayUTC = new Date(`${dateStr}T00:00:00+07:00`);

  const [res] = await db
    .select({ count: count() })
    .from(gameScores)
    .where(
      and(
        eq(gameScores.userId, userId),
        gte(gameScores.createdAt, startOfDayUTC)
      )
    );

  return Number(res?.count ?? 0);
}
