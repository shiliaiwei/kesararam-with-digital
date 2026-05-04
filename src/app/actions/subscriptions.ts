"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import {
    getUserActiveSubscription,
    createSubscription,
    updateSubscriptionStatus,
    cancelSubscription,
    extendSubscription,
    getUserSubscriptionHistory,
    getExpiringSubscriptions,
    markExpiredSubscriptions,
} from "@/db/queries/subscriptions";
import {
    getSubscriptionDisplayInfo,
    getUserQuota,
    canCreateClass,
    canAddStudent,
    canAccessAnalytics,
    canAccessCustomContent,
} from "@/lib/subscription-utils";
import { logAudit } from "@/db/queries/audit";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";

/**
 * Get current user's subscription info
 */
export async function getCurrentSubscription() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { error: "Unauthorized" };
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return { error: "Invalid token" };
        }

        const displayInfo = await getSubscriptionDisplayInfo(payload.userId);
        return { subscription: displayInfo };
    } catch (error) {
        console.error("Error getting subscription:", error);
        return { error: "Failed to get subscription" };
    }
}

/**
 * Get user's quota and usage
 */
export async function getUserQuotaInfo() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { error: "Unauthorized" };
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return { error: "Invalid token" };
        }

        // Get current counts
        const userClasses = await db
            .select()
            .from(classes)
            .where(eq(classes.teacherId, payload.userId));

        const userStudents = await db
            .select()
            .from(classEnrollments)
            .innerJoin(classes, eq(classEnrollments.classId, classes.id))
            .where(eq(classes.teacherId, payload.userId));

        const quota = await getUserQuota(payload.userId, {
            classes: userClasses.length,
            students: userStudents.length,
        });

        return { quota };
    } catch (error) {
        console.error("Error getting quota:", error);
        return { error: "Failed to get quota" };
    }
}

/**
 * Check if user can perform an action
 */
export async function checkSubscriptionAccess(
    action: "createClass" | "addStudent" | "analytics" | "customContent"
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { allowed: false, error: "Unauthorized" };
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return { allowed: false, error: "Invalid token" };
        }

        switch (action) {
            case "createClass": {
                const userClasses = await db
                    .select()
                    .from(classes)
                    .where(eq(classes.teacherId, payload.userId));
                const result = await canCreateClass(payload.userId, userClasses.length);
                return result;
            }

            case "addStudent": {
                const userStudents = await db
                    .select()
                    .from(classEnrollments)
                    .innerJoin(classes, eq(classEnrollments.classId, classes.id))
                    .where(eq(classes.teacherId, payload.userId));
                const result = await canAddStudent(payload.userId, userStudents.length);
                return result;
            }

            case "analytics": {
                const allowed = await canAccessAnalytics(payload.userId);
                return {
                    allowed,
                    reason: allowed ? undefined : "Upgrade to access analytics",
                };
            }

            case "customContent": {
                const allowed = await canAccessCustomContent(payload.userId);
                return {
                    allowed,
                    reason: allowed ? undefined : "Upgrade to create custom content",
                };
            }

            default:
                return { allowed: false, error: "Invalid action" };
        }
    } catch (error) {
        console.error("Error checking access:", error);
        return { allowed: false, error: "Failed to check access" };
    }
}

/**
 * Create subscription (admin only)
 */
export async function createUserSubscription(data: {
    userId: number;
    plan: "free" | "teacher_pro" | "school";
    status?: "active" | "expired" | "cancelled" | "trial";
    isTrial?: boolean;
    trialEndsAt?: Date;
    startsAt?: Date;
    endsAt?: Date;
    note?: string;
}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { error: "Unauthorized" };
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== "admin") {
            return { error: "Admin access required" };
        }

        const subscription = await createSubscription({
            userId: data.userId,
            plan: data.plan,
            status: data.status || "active",
            isTrial: data.isTrial || false,
            trialEndsAt: data.trialEndsAt || null,
            startsAt: data.startsAt || new Date(),
            endsAt: data.endsAt || null,
            assignedBy: payload.userId,
            note: data.note || null,
        });

        await logAudit({
            userId: payload.userId,
            action: "subscription_created",
            targetType: "subscription",
            targetId: subscription.id.toString(),
            details: {
                targetUserId: data.userId,
                plan: data.plan,
                status: data.status,
            },
        });

        return { subscription };
    } catch (error) {
        console.error("Error creating subscription:", error);
        return { error: "Failed to create subscription" };
    }
}

/**
 * Update subscription status (admin only)
 */
export async function updateSubscription(
    subscriptionId: number,
    action: "updateStatus" | "cancel" | "extend",
    data?: {
        status?: "active" | "expired" | "cancelled" | "trial";
        endDate?: Date;
    }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { error: "Unauthorized" };
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== "admin") {
            return { error: "Admin access required" };
        }

        let subscription;

        switch (action) {
            case "updateStatus":
                if (!data?.status) {
                    return { error: "Status is required" };
                }
                subscription = await updateSubscriptionStatus(subscriptionId, data.status);
                break;

            case "cancel":
                subscription = await cancelSubscription(subscriptionId);
                break;

            case "extend":
                if (!data?.endDate) {
                    return { error: "End date is required" };
                }
                subscription = await extendSubscription(subscriptionId, data.endDate);
                break;

            default:
                return { error: "Invalid action" };
        }

        if (!subscription) {
            return { error: "Subscription not found" };
        }

        await logAudit({
            userId: payload.userId,
            action: `subscription_${action}`,
            targetType: "subscription",
            targetId: subscriptionId.toString(),
            details: data,
        });

        return { subscription };
    } catch (error) {
        console.error("Error updating subscription:", error);
        return { error: "Failed to update subscription" };
    }
}

/**
 * Get subscription history (own or admin)
 */
export async function getSubscriptionHistory(userId?: number) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { error: "Unauthorized" };
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return { error: "Invalid token" };
        }

        // If userId provided, check admin access
        const targetUserId = userId || payload.userId;
        if (targetUserId !== payload.userId && payload.role !== "admin") {
            return { error: "Forbidden" };
        }

        const history = await getUserSubscriptionHistory(targetUserId);
        return { history };
    } catch (error) {
        console.error("Error getting subscription history:", error);
        return { error: "Failed to get subscription history" };
    }
}

/**
 * Get expiring subscriptions (admin only)
 */
export async function getExpiringSubscriptionsList(daysAhead: number = 7) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { error: "Unauthorized" };
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== "admin") {
            return { error: "Admin access required" };
        }

        const expiring = await getExpiringSubscriptions(daysAhead);
        return { subscriptions: expiring };
    } catch (error) {
        console.error("Error getting expiring subscriptions:", error);
        return { error: "Failed to get expiring subscriptions" };
    }
}

/**
 * Process expired subscriptions (admin only, cron job)
 */
export async function processExpiredSubscriptions() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { error: "Unauthorized" };
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== "admin") {
            return { error: "Admin access required" };
        }

        const count = await markExpiredSubscriptions();

        await logAudit({
            userId: payload.userId,
            action: "subscriptions_expired_batch",
            details: { count },
        });

        return { count };
    } catch (error) {
        console.error("Error processing expired subscriptions:", error);
        return { error: "Failed to process expired subscriptions" };
    }
}
