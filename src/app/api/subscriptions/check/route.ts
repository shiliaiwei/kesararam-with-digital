import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserActiveSubscription } from "@/db/queries/subscriptions";
import { getSubscriptionDisplayInfo } from "@/lib/subscription-utils";

export const dynamic = "force-dynamic";


/**
 * GET /api/subscriptions/check
 * Check current user's subscription status and features
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const subscription = await getUserActiveSubscription(payload.userId);
        const displayInfo = await getSubscriptionDisplayInfo(payload.userId);

        return NextResponse.json({
            hasActiveSubscription: subscription !== null,
            subscription: displayInfo,
        });
    } catch (error) {
        console.error("Error checking subscription:", error);
        return NextResponse.json(
            { error: "Failed to check subscription" },
            { status: 500 }
        );
    }
}
