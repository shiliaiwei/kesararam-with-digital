import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema";

export type TrialPlan = "teacher_pro" | "school" | "family" | "driving_school" | "individual";

const VALID_PLANS: TrialPlan[] = ["teacher_pro", "school", "family", "driving_school", "individual"];

export function normalizePlan(plan: string | null | undefined): TrialPlan {
    return VALID_PLANS.includes(plan as TrialPlan) ? (plan as TrialPlan) : "teacher_pro";
}

/**
 * Grant a new account a 7-day free trial of the given plan.
 * Self-assigned (assignedBy = the user) on account creation. Non-fatal.
 */
export async function assignSignupTrial(
    userId: number,
    plan: TrialPlan = "teacher_pro",
    days = 7,
): Promise<void> {
    try {
        const now = new Date();
        const trialEndsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        await db.insert(subscriptions).values({
            userId,
            plan,
            status: "trial",
            isTrial: true,
            trialEndsAt,
            startsAt: now,
            endsAt: null,
            assignedBy: userId,
            note: `Auto ${days}-day trial on account creation`,
        });
    } catch (e) {
        console.warn("[assignSignupTrial] skipped:", e);
    }
}
