import { db } from "../../lib/db";
import { subscriptions, type Subscription, type NewSubscription, PLAN_FEATURES } from "../schema/subscriptions";
import { users } from "../schema/users";
import { eq, and, or, lt, gt, isNull, desc } from "drizzle-orm";

/**
 * Get active subscription for a user
 */
export async function getUserActiveSubscription(userId: number): Promise<Subscription | null> {
    const now = new Date();

    const result = await db
        .select()
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.userId, userId),
                or(
                    eq(subscriptions.status, "active"),
                    eq(subscriptions.status, "trial")
                ),
                or(
                    isNull(subscriptions.endsAt),
                    gt(subscriptions.endsAt, now)
                )
            )
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);

    const sub = result[0];
    if (!sub) return null;

    // Auto-expire trial if past trialEndsAt
    if (sub.isTrial && sub.trialEndsAt && new Date(sub.trialEndsAt) < now) {
        db.update(subscriptions)
            .set({ status: "expired", updatedAt: now })
            .where(eq(subscriptions.id, sub.id))
            .catch(console.error);
        return null;
    }

    return sub;
}

/**
 * Get subscription with user details
 */
export async function getSubscriptionWithUser(subscriptionId: number) {
    const result = await db
        .select({
            subscription: subscriptions,
            user: {
                id: users.id,
                username: users.username,
                email: users.email,
                displayName: users.displayName,
                role: users.role,
            },
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.userId, users.id))
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

    return result[0] || null;
}

/**
 * Get all subscriptions for a user (history)
 */
export async function getUserSubscriptionHistory(userId: number) {
    return await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(desc(subscriptions.createdAt));
}

/**
 * Create a new subscription (admin only)
 */
export async function createSubscription(data: NewSubscription): Promise<Subscription> {
    const result = await db
        .insert(subscriptions)
        .values({
            ...data,
            updatedAt: new Date(),
        })
        .returning();

    return result[0];
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
    subscriptionId: number,
    status: "active" | "expired" | "cancelled" | "trial"
): Promise<Subscription | null> {
    const result = await db
        .update(subscriptions)
        .set({
            status,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

    return result[0] || null;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: number): Promise<Subscription | null> {
    const result = await db
        .update(subscriptions)
        .set({
            status: "cancelled",
            endsAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

    return result[0] || null;
}

/**
 * Extend subscription end date
 */
export async function extendSubscription(
    subscriptionId: number,
    newEndDate: Date
): Promise<Subscription | null> {
    const result = await db
        .update(subscriptions)
        .set({
            endsAt: newEndDate,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

    return result[0] || null;
}

/**
 * Get expiring subscriptions (within next N days)
 */
export async function getExpiringSubscriptions(daysAhead: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await db
        .select({
            subscription: subscriptions,
            user: {
                id: users.id,
                username: users.username,
                email: users.email,
                displayName: users.displayName,
            },
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.userId, users.id))
        .where(
            and(
                or(
                    eq(subscriptions.status, "active"),
                    eq(subscriptions.status, "trial")
                ),
                or(
                    and(
                        eq(subscriptions.isTrial, true),
                        gt(subscriptions.trialEndsAt, now),
                        lt(subscriptions.trialEndsAt, futureDate)
                    ),
                    and(
                        eq(subscriptions.isTrial, false),
                        gt(subscriptions.endsAt, now),
                        lt(subscriptions.endsAt, futureDate)
                    )
                )
            )
        )
        .orderBy(subscriptions.endsAt);
}

/**
 * Get expired subscriptions that need status update
 */
export async function getExpiredSubscriptions() {
    const now = new Date();

    return await db
        .select()
        .from(subscriptions)
        .where(
            and(
                or(
                    eq(subscriptions.status, "active"),
                    eq(subscriptions.status, "trial")
                ),
                or(
                    and(
                        eq(subscriptions.isTrial, true),
                        lt(subscriptions.trialEndsAt, now)
                    ),
                    and(
                        eq(subscriptions.isTrial, false),
                        lt(subscriptions.endsAt, now)
                    )
                )
            )
        );
}

/**
 * Batch update expired subscriptions
 */
export async function markExpiredSubscriptions(): Promise<number> {
    const now = new Date();

    const result = await db
        .update(subscriptions)
        .set({
            status: "expired",
            updatedAt: now,
        })
        .where(
            and(
                or(
                    eq(subscriptions.status, "active"),
                    eq(subscriptions.status, "trial")
                ),
                or(
                    and(
                        eq(subscriptions.isTrial, true),
                        lt(subscriptions.trialEndsAt, now)
                    ),
                    and(
                        eq(subscriptions.isTrial, false),
                        lt(subscriptions.endsAt, now)
                    )
                )
            )
        )
        .returning();

    return result.length;
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: number): Promise<boolean> {
    const subscription = await getUserActiveSubscription(userId);
    return subscription !== null;
}

/**
 * Get user's current plan tier
 */
export async function getUserPlanTier(userId: number): Promise<"free" | "teacher_pro" | "school"> {
    const subscription = await getUserActiveSubscription(userId);
    return subscription?.plan || "free";
}

/**
 * Check if user can access feature based on plan
 */
export async function canAccessFeature(
    userId: number,
    feature: keyof typeof PLAN_FEATURES.free
): Promise<boolean> {
    const planTier = await getUserPlanTier(userId);
    const planFeatures = PLAN_FEATURES[planTier];

    return planFeatures[feature] !== false && planFeatures[feature] !== 0;
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats() {
    const allSubs = await db.select().from(subscriptions);

    const stats = {
        total: allSubs.length,
        active: allSubs.filter((s) => s.status === "active").length,
        expired: allSubs.filter((s) => s.status === "expired").length,
        cancelled: allSubs.filter((s) => s.status === "cancelled").length,
        trial: allSubs.filter((s) => s.isTrial).length,
        byPlan: {
            free: allSubs.filter((s) => s.plan === "free").length,
            teacher_pro: allSubs.filter((s) => s.plan === "teacher_pro").length,
            school: allSubs.filter((s) => s.plan === "school").length,
        },
    };

    return stats;
}

/**
 * Get all active subscriptions with user details
 */
export async function getAllActiveSubscriptions() {
    const now = new Date();

    return await db
        .select({
            subscription: subscriptions,
            user: {
                id: users.id,
                username: users.username,
                email: users.email,
                displayName: users.displayName,
                role: users.role,
            },
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.userId, users.id))
        .where(
            and(
                or(
                    eq(subscriptions.status, "active"),
                    eq(subscriptions.status, "trial")
                ),
                or(
                    isNull(subscriptions.endsAt),
                    gt(subscriptions.endsAt, now)
                )
            )
        )
        .orderBy(desc(subscriptions.createdAt));
}
