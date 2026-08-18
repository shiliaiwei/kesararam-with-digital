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
        en: `You've used today's 9 free guest games. Create a free student account to save your progress, keep your rank, and unlock up to 67 plays a day.`,
        kh: `អ្នកបានលេងគ្រប់ ៩ ហ្គេមជាភ្ញៀវសម្រាប់ថ្ងៃនេះហើយ។ បង្កើតគណនីសិស្សឥតគិតថ្លៃ ដើម្បីរក្សាទុកការរីកចម្រើនរបស់អ្នក រក្សាចំណាត់ថ្នាក់ និងលេងបានរហូតដល់ ៦៧ ហ្គេម/ថ្ងៃ។`,
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
      tier = (plan && (plan as string) !== "free" && (plan as string) !== "trial") ? "studentPro" : "studentClass";
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
      en: `You've reached today's 67 plays. Solo practice helps you learn, but those points can't be redeemed for rewards — join your teacher's class to earn claimable points in live games.`,
      kh: `អ្នកបានលេងគ្រប់ ៦៧ ហ្គេមសម្រាប់ថ្ងៃនេះហើយ។ ការហ្វឹកហាត់ម្នាក់ឯងជួយឱ្យអ្នករៀន ប៉ុន្តែពិន្ទុទាំងនោះមិនអាចប្តូររង្វាន់បានទេ — ចូលរួមថ្នាក់របស់គ្រូអ្នក ដើម្បីប្រមូលពិន្ទុដែលអាចប្តូររង្វាន់នៅក្នុងហ្គេមផ្ទាល់។`,
    };
  } else if (tier === "studentClass") {
    nextTier = "studentPro";
    upgradeMessage = {
      en: `Your class has reached today's 100 plays. To unlock unlimited play and host live classroom games with premium claimable points, ask your teacher about a Kesararam plan.`,
      kh: `ថ្នាក់របស់អ្នកបានលេងគ្រប់ ១០០ ហ្គេមសម្រាប់ថ្ងៃនេះហើយ។ ដើម្បីលេងបានគ្មានដែនកំណត់ និងបង្កើតហ្គេមផ្ទាល់ក្នុងថ្នាក់ដែលមានពិន្ទុប្តូររង្វាន់ សូមសួរលោកគ្រូ/អ្នកគ្រូអំពីគម្រោង Kesararam។`,
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
