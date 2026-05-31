import { PLAN_FEATURES, type PlanTier } from "@/db/schema/subscriptions";
import { getUserActiveSubscription, getUserPlanTier } from "@/db/queries/subscriptions";

/**
 * Check if a plan has access to a specific feature
 */
export function planHasFeature(
    plan: PlanTier,
    feature: keyof typeof PLAN_FEATURES.free
): boolean {
    const planFeatures = PLAN_FEATURES[plan];
    const value = planFeatures[feature];

    // false or 0 means no access
    if (value === false || value === 0) return false;

    return true;
}

/**
 * Check if user can create more classes based on their plan
 */
export async function canCreateClass(
    userId: number,
    currentClassCount: number
): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await getUserPlanTier(userId);
    const maxClasses = PLAN_FEATURES[plan].maxClasses;

    if (maxClasses === -1) {
        return { allowed: true };
    }

    if (currentClassCount >= maxClasses) {
        return {
            allowed: false,
            reason: `Your ${PLAN_FEATURES[plan].name} plan allows up to ${maxClasses} classes. Upgrade to create more.`,
        };
    }

    return { allowed: true };
}

/**
 * Check if user can add more students based on their plan
 */
export async function canAddStudent(
    userId: number,
    currentStudentCount: number
): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await getUserPlanTier(userId);
    const maxStudents = PLAN_FEATURES[plan].maxStudents;

    if (maxStudents === -1) {
        return { allowed: true };
    }

    if (currentStudentCount >= maxStudents) {
        return {
            allowed: false,
            reason: `Your ${PLAN_FEATURES[plan].name} plan allows up to ${maxStudents} students. Upgrade to add more.`,
        };
    }

    return { allowed: true };
}

/**
 * Check if user has access to analytics
 */
export async function canAccessAnalytics(userId: number): Promise<boolean> {
    const plan = await getUserPlanTier(userId);
    return PLAN_FEATURES[plan].analytics;
}

/**
 * Check if user has access to custom content
 */
export async function canAccessCustomContent(userId: number): Promise<boolean> {
    const plan = await getUserPlanTier(userId);
    return PLAN_FEATURES[plan].customContent;
}

/**
 * Get remaining quota for a user
 */
export async function getUserQuota(
    userId: number,
    currentCounts: { classes: number; students: number }
) {
    const plan = await getUserPlanTier(userId);
    const features = PLAN_FEATURES[plan];

    return {
        plan: plan,
        planName: features.name,
        classes: {
            current: currentCounts.classes,
            max: features.maxClasses,
            remaining: features.maxClasses === -1
                ? "unlimited"
                : features.maxClasses - currentCounts.classes,
        },
        students: {
            current: currentCounts.students,
            max: features.maxStudents,
            remaining: features.maxStudents === -1
                ? "unlimited"
                : features.maxStudents - currentCounts.students,
        },
        features: {
            analytics: features.analytics,
            customContent: features.customContent,
        },
    };
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export async function isSubscriptionExpiringSoon(
    userId: number
): Promise<{ expiring: boolean; daysLeft?: number; endsAt?: Date }> {
    const subscription = await getUserActiveSubscription(userId);

    if (!subscription || !subscription.endsAt) {
        return { expiring: false };
    }

    const now = new Date();
    const endsAt = new Date(subscription.endsAt);
    const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 7 && daysLeft > 0) {
        return {
            expiring: true,
            daysLeft,
            endsAt,
        };
    }

    return { expiring: false };
}

/**
 * Format subscription info for display
 */
export async function getSubscriptionDisplayInfo(userId: number) {
    const subscription = await getUserActiveSubscription(userId);

    if (!subscription) {
        return {
            plan: "free",
            planName: "Free",
            status: "active",
            isTrial: false,
            endsAt: null,
            features: PLAN_FEATURES.free,
        };
    }

    const features = PLAN_FEATURES[subscription.plan];

    return {
        plan: subscription.plan,
        planName: features.name,
        status: subscription.status,
        isTrial: subscription.isTrial,
        trialEndsAt: subscription.trialEndsAt,
        startsAt: subscription.startsAt,
        endsAt: subscription.endsAt,
        features,
    };
}

/**
 * Compare two plans
 */
export function comparePlans(planA: PlanTier, planB: PlanTier): number {
    return PLAN_FEATURES[planA].priority - PLAN_FEATURES[planB].priority;
}

/**
 * Check if upgrade is available
 */
export function canUpgradeTo(currentPlan: PlanTier, targetPlan: PlanTier): boolean {
    return comparePlans(targetPlan, currentPlan) > 0;
}

/**
 * Get upgrade path suggestions
 */
export function getUpgradeSuggestions(currentPlan: PlanTier): PlanTier[] {
    const allPlans: PlanTier[] = ["free", "teacher_pro", "school"];
    return allPlans.filter((plan) => canUpgradeTo(currentPlan, plan));
}
