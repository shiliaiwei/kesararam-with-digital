import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserPlanTier, canAccessFeature } from "@/lib/subscription-utils";
import { PLAN_FEATURES } from "@/db/schema/subscriptions";

/**
 * Middleware to check subscription access
 * Use this to protect routes that require specific subscription tiers
 */
export async function requireSubscription(
    request: NextRequest,
    minPlan: "free" | "teacher_pro" | "school" = "free"
) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userPlan = await getUserPlanTier(payload.userId);
    const userPriority = PLAN_FEATURES[userPlan].priority;
    const requiredPriority = PLAN_FEATURES[minPlan].priority;

    if (userPriority < requiredPriority) {
        return NextResponse.json(
            {
                error: "Subscription upgrade required",
                currentPlan: userPlan,
                requiredPlan: minPlan,
            },
            { status: 403 }
        );
    }

    return null; // Access granted
}

/**
 * Check if user has access to a specific feature
 */
export async function requireFeature(
    request: NextRequest,
    feature: keyof typeof PLAN_FEATURES.free
) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const hasAccess = await canAccessFeature(payload.userId, feature);

    if (!hasAccess) {
        return NextResponse.json(
            {
                error: `Feature '${feature}' requires subscription upgrade`,
            },
            { status: 403 }
        );
    }

    return null; // Access granted
}

/**
 * Helper to get user from token
 */
export async function getUserFromRequest(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return null;
    }

    const payload = await verifyToken(token);
    return payload || null;
}
