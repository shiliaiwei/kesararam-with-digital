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
        en: `⚠️ WARNING: Daily play limit reached (9/9 guest games played). You are losing valuable progress! Register a free student account immediately to save your achievements, claim your rank, and unlock 67 daily plays!`,
        kh: `⚠️ ប្រកាសអាសន្ន៖ ដែនកំណត់លេងប្រចាំថ្ងៃត្រូវបានប្រើអស់ហើយ (បានលេង ៩/៩ ហ្គេមជាភ្ញៀវ)។ អ្នកកំពុងបាត់បង់ការរីកចម្រើនដ៏មានតម្លៃ! សូមចុះឈ្មោះគណនីសិស្សឥតគិតថ្លៃជាបន្ទាន់ ដើម្បីរក្សាទុកសមិទ្ធផលរបស់អ្នក និងលេងបាន ៦៧ ហ្គេម/ថ្ងៃ!`,
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
      en: `🛑 CRITICAL NOTICE: Student daily play limit reached (67/67 games). ALL solo practice points are locked and CANNOT be used to claim rewards. To continue playing, unlock your account, and earn REAL claimable reward points, you MUST join your teacher's class immediately!`,
      kh: `🛑 ប្រកាសអាសន្ន៖ ដែនកំណត់លេងប្រចាំថ្ងៃសម្រាប់គណនីសិស្សបានឈានដល់កម្រិតកំណត់ហើយ (៦៧/៦៧ ហ្គេម)។ រាល់ពិន្ទុហ្វឹកហាត់ទាំងអស់ត្រូវបានចាក់សោ ហើយមិនអាចប្តូរយករង្វាន់បានឡើយ។ ដើម្បីបន្តលេង និងចាប់ផ្តើមរកពិន្ទុពិតប្រាកដសម្រាប់ប្តូររង្វាន់ អ្នកត្រូវតែចូលរួមថ្នាក់រៀនរបស់គ្រូអ្នកជាបន្ទាន់!`,
    };
  } else if (tier === "studentClass") {
    nextTier = "studentPro";
    upgradeMessage = {
      en: `⚡ ATTENTION: Classroom daily limit reached (100/100 games). Solo play is restricted. To unlock unlimited play and host LIVE classroom games where you earn premium claimable points, FORCE your teacher to upgrade to a Kesararam Subscription plan today!`,
      kh: `⚡ យកចិត្តទុកដាក់៖ ដែនកំណត់លេងប្រចាំថ្ងៃសម្រាប់ថ្នាក់រៀនត្រូវបានប្រើអស់ហើយ (១០០/១០០ ហ្គេម)។ ការលេងម្នាក់ឯងត្រូវបានដាក់កម្រិត។ ដើម្បីបើកការលេងគ្មានដែនកំណត់ និងបង្កើតហ្គេមផ្ទាល់ក្នុងថ្នាក់សម្រាប់ប្រមូលពិន្ទុប្តូររង្វាន់ សូមជំរុញឱ្យលោកគ្រូអ្នកគ្រូរបស់អ្នកដំឡើងគម្រោង Kesararam Subscription ថ្ងៃនេះ!`,
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
