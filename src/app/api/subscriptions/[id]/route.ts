import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
    getSubscriptionWithUser,
    updateSubscriptionStatus,
    cancelSubscription,
    extendSubscription,
} from "@/db/queries/subscriptions";

/**
 * GET /api/subscriptions/[id]
 * Get subscription details
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { id } = await params;
        const subscriptionId = parseInt(id);

        if (isNaN(subscriptionId)) {
            return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 });
        }

        const subscription = await getSubscriptionWithUser(subscriptionId);

        if (!subscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        // Only admin or the subscription owner can view
        if (payload.role !== "admin" && subscription.subscription.userId !== payload.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ subscription });
    } catch (error) {
        console.error("Error fetching subscription:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/subscriptions/[id]
 * Update subscription (admin only)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== "admin") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const { id } = await params;
        const subscriptionId = parseInt(id);

        if (isNaN(subscriptionId)) {
            return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 });
        }

        const body = await request.json();
        const { action, status, endDate } = body;

        let updatedSubscription;

        switch (action) {
            case "updateStatus":
                if (!status || !["active", "expired", "cancelled", "trial"].includes(status)) {
                    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
                }
                updatedSubscription = await updateSubscriptionStatus(subscriptionId, status);
                break;

            case "cancel":
                updatedSubscription = await cancelSubscription(subscriptionId);
                break;

            case "extend":
                if (!endDate) {
                    return NextResponse.json({ error: "End date required" }, { status: 400 });
                }
                updatedSubscription = await extendSubscription(
                    subscriptionId,
                    new Date(endDate)
                );
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        if (!updatedSubscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Subscription updated successfully",
            subscription: updatedSubscription,
        });
    } catch (error) {
        console.error("Error updating subscription:", error);
        return NextResponse.json(
            { error: "Failed to update subscription" },
            { status: 500 }
        );
    }
}
