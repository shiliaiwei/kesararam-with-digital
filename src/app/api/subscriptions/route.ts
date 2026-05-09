import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
    getAllActiveSubscriptions,
    getUserSubscriptionHistory,
    getSubscriptionStats,
} from "@/db/queries/subscriptions";

/**
 * GET /api/subscriptions
 * Get subscriptions (admin: all, user: own history)
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

        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");

        // Admin: Get all active subscriptions or stats
        if (payload.role === "admin") {
            if (action === "stats") {
                const stats = await getSubscriptionStats();
                return NextResponse.json({ stats });
            }

            const subscriptions = await getAllActiveSubscriptions();
            return NextResponse.json({ subscriptions });
        }

        // Regular user: Get own subscription history
        const history = await getUserSubscriptionHistory(payload.userId);
        return NextResponse.json({ subscriptions: history });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscriptions" },
            { status: 500 }
        );
    }
}
