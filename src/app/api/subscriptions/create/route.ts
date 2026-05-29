import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createSubscription } from "@/db/queries/subscriptions";
import { logAudit } from "@/db/queries/audit";

/**
 * POST /api/subscriptions/create
 * Create a new subscription (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("kwd_token")?.value || request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== "admin") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const body = await request.json();
        const {
            userId,
            plan,
            status = "active",
            isTrial = false,
            trialEndsAt,
            startsAt,
            endsAt,
            note,
        } = body;

        // Validation
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        if (!plan || !["free", "teacher_pro", "school"].includes(plan)) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        if (!["active", "expired", "cancelled", "trial"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Create subscription
        const subscription = await createSubscription({
            userId: parseInt(userId),
            plan,
            status,
            isTrial,
            trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : null,
            startsAt: startsAt ? new Date(startsAt) : new Date(),
            endsAt: endsAt ? new Date(endsAt) : null,
            assignedBy: payload.id,
            note: note || null,
        });

        // Log audit trail
        await logAudit({
            userId: payload.id,
            action: "subscription_created",
            targetType: "subscription",
            targetId: subscription.id.toString(),
            details: {
                targetUserId: userId,
                plan,
                status,
                isTrial,
                note,
            },
        });

        return NextResponse.json(
            {
                message: "Subscription created successfully",
                subscription,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating subscription:", error);
        return NextResponse.json(
            { error: "Failed to create subscription" },
            { status: 500 }
        );
    }
}
