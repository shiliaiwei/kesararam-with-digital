import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { gameScores } from "@/db/schema/content";
import { classEnrollments, classes } from "@/db/schema/users";
import { PLAY_LIMITS } from "@/lib/game-engine";
import { and, eq, gte, count } from "drizzle-orm";
import { getUserSubscription } from "@/lib/subscription";

/**
 * GET /api/game/solo/limits
 *
 * Returns the current solo play limit state for the logged-in student.
 * Used by the UI BEFORE starting a game to show the limit widget and
 * appropriate upgrade CTA.
 *
 * Response:
 * {
 *   tier:            "guest" | "student" | "studentClass" | "studentPro"
 *   playsToday:      number   (0 for guests — tracked client-side)
 *   playsAllowed:    number
 *   remaining:       number
 *   isLimitReached:  boolean
 *   nextTier:        string | null  (next tier name for upgrade CTA)
 *   upgradeMessage:  { en: string; kh: string } | null
 * }
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  // ── Guest (no session) ──────────────────────────────────────────────────────
  if (!session || session.role !== "student") {
    return NextResponse.json({
      tier: "guest",
      playsToday: 0,           // tracked client-side via localStorage
      playsAllowed: PLAY_LIMITS.guest,
      remaining: PLAY_LIMITS.guest,
      isLimitReached: false,
      nextTier: "student",
      upgradeMessage: {
        en: `Create a free account to play ${PLAY_LIMITS.student} games per day and keep your scores on the leaderboard!`,
        kh: `បង្កើតគណនីឥតគិតថ្លៃ ដើម្បីលេង ${PLAY_LIMITS.student} ហ្គេម/ថ្ងៃ ហើយរក្សាពិន្ទុលើ Leaderboard!`,
      },
    });
  }

  // ── Determine tier ──────────────────────────────────────────────────────────
  let tier: "student" | "studentClass" | "studentPro" = "student";
  let teacherId: number | null = null;

  const [enrollment] = await db
    .select({ classId: classEnrollments.classId, teacherId: classes.teacherId })
    .from(classEnrollments)
    .innerJoin(classes, eq(classes.id, classEnrollments.classId))
    .where(eq(classEnrollments.studentId, session.id))
    .limit(1);

  if (enrollment) {
    teacherId = enrollment.teacherId;
    try {
      const { plan } = await getUserSubscription(enrollment.teacherId);
      tier = (plan !== "free" && plan !== "trial") ? "studentPro" : "studentClass";
    } catch {
      tier = "studentClass";
    }
  }

  const playsAllowed = PLAY_LIMITS[tier];

  // ── Count today's solo plays ────────────────────────────────────────────────
  const now = new Date();
  const todayPP = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const dateStr = todayPP.toISOString().slice(0, 10);
  const startOfDay = new Date(`${dateStr}T00:00:00+07:00`);

  const [row] = await db
    .select({ cnt: count() })
    .from(gameScores)
    .where(
      and(
        eq(gameScores.userId, session.id),
        gte(gameScores.createdAt, startOfDay)
      )
    );

  const playsToday = Number(row?.cnt ?? 0);
  const remaining = Math.max(0, playsAllowed - playsToday);
  const isLimitReached = playsToday >= playsAllowed;

  // ── Upgrade message per tier ────────────────────────────────────────────────
  let nextTier: string | null = null;
  let upgradeMessage: { en: string; kh: string } | null = null;

  if (tier === "student") {
    nextTier = "studentClass";
    upgradeMessage = {
      en: `Join your teacher's class to unlock ${PLAY_LIMITS.studentClass} solo games per day — and earn claimable reward points by playing live sessions!`,
      kh: `ចូលរៀនក្នុងថ្នាក់គ្រូរបស់អ្នក ដើម្បីបើក ${PLAY_LIMITS.studentClass} ហ្គេម/ថ្ងៃ — ហើយរង្វាន់ពិតប្រាកដតាមរយៈហ្គេមផ្ទាល់!`,
    };
  } else if (tier === "studentClass") {
    nextTier = "studentPro";
    upgradeMessage = {
      en: `Your teacher can upgrade their plan to give you ${PLAY_LIMITS.studentPro} games per day and unlock LIVE sessions where you earn real reward points!`,
      kh: `គ្រូរបស់អ្នកអាចដំឡើងផែនការ ដើម្បីផ្ដល់ ${PLAY_LIMITS.studentPro} ហ្គេម/ថ្ងៃ ហើយបើកហ្គេមផ្ទាល់ ដែលអ្នកបានពិន្ទុរង្វាន់ពិត!`,
    };
  }
  // studentPro — no upgrade needed, they're at the top

  return NextResponse.json({
    tier,
    playsToday,
    playsAllowed,
    remaining,
    isLimitReached,
    nextTier,
    upgradeMessage,
    // Extra context for UI
    hasClass: !!enrollment,
    teacherHasPro: tier === "studentPro",
    teacherId,
  });
}
