import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/db/schema/users";
import { getUserActiveSubscription } from "@/db/queries/subscriptions";
import { and, eq } from "drizzle-orm";
import type { PlanTier } from "@/lib/subscription-plans";

const SCORE_PLATE_PLANS = new Set<PlanTier>(["teacher_pro", "family", "school"]);

export type ScorePlateEntitlement = {
  premiumUnlocked: boolean;
  plan: PlanTier | null;
  source: "own" | "teacher" | null;
};

function allowsPremiumScorePlates(plan: PlanTier | undefined): plan is PlanTier {
  return !!plan && SCORE_PLATE_PLANS.has(plan);
}

/** Server-authoritative premium plate access for a student account. */
export async function getScorePlateEntitlement(studentId: number): Promise<ScorePlateEntitlement> {
  const ownSubscription = await getUserActiveSubscription(studentId);
  if (allowsPremiumScorePlates(ownSubscription?.plan as PlanTier | undefined)) {
    return { premiumUnlocked: true, plan: ownSubscription!.plan as PlanTier, source: "own" };
  }

  const [enrollment] = await db
    .select({ teacherId: classes.teacherId })
    .from(classEnrollments)
    .innerJoin(classes, eq(classEnrollments.classId, classes.id))
    .where(and(eq(classEnrollments.studentId, studentId), eq(classes.status, "active")))
    .limit(1);

  if (!enrollment) return { premiumUnlocked: false, plan: null, source: null };

  const teacherSubscription = await getUserActiveSubscription(enrollment.teacherId);
  if (allowsPremiumScorePlates(teacherSubscription?.plan as PlanTier | undefined)) {
    return { premiumUnlocked: true, plan: teacherSubscription!.plan as PlanTier, source: "teacher" };
  }

  return { premiumUnlocked: false, plan: null, source: null };
}
