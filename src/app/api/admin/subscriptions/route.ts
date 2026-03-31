/**
 * Admin-only subscription management API.
 * Only admins can assign, modify, or revoke subscriptions.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

const VALID_PLANS = ["free", "teacher_pro", "school"] as const;
type PlanTier = typeof VALID_PLANS[number];

// GET /api/admin/subscriptions
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const rows = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        plan: subscriptions.plan,
        status: subscriptions.status,
        isTrial: subscriptions.isTrial,
        trialEndsAt: subscriptions.trialEndsAt,
        startsAt: subscriptions.startsAt,
        endsAt: subscriptions.endsAt,
        note: subscriptions.note,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        userName: users.displayName,
        userEmail: users.email,
        userRole: users.role,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .orderBy(desc(subscriptions.createdAt));

    return NextResponse.json({ subscriptions: rows });
  } catch (err) {
    console.error("[GET /api/admin/subscriptions]", err);
    return NextResponse.json({ error: "Failed to fetch subscriptions", subscriptions: [] }, { status: 200 });
  }
}

// POST /api/admin/subscriptions — assign a subscription to a user
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { userId, plan, isTrial, trialDays, endsAt, note } = body ?? {};

    if (!userId || !plan)
      return NextResponse.json({ error: "userId and plan are required" }, { status: 400 });

    if (!VALID_PLANS.includes(plan as PlanTier))
      return NextResponse.json({ error: `Invalid plan. Must be one of: ${VALID_PLANS.join(", ")}` }, { status: 400 });

    // Verify target user exists
    const [targetUser] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, Number(userId)));

    if (!targetUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();

    // Cancel any existing active/trial subscriptions for this user
    try {
      await db
        .update(subscriptions)
        .set({ status: "cancelled" })
        .where(eq(subscriptions.userId, Number(userId)));
    } catch (cancelErr) {
      console.warn("[subscriptions] cancel existing failed:", cancelErr);
    }

    const trialEndsAt =
      isTrial && trialDays
        ? new Date(now.getTime() + Number(trialDays) * 24 * 60 * 60 * 1000)
        : null;

    // Sanitize endsAt — must be a valid date string or null
    let parsedEndsAt: Date | null = null;
    if (!isTrial && endsAt && typeof endsAt === "string" && endsAt.trim().length > 4) {
      const d = new Date(endsAt);
      if (!isNaN(d.getTime())) parsedEndsAt = d;
    }

    const insertValues: Record<string, unknown> = {
      userId: Number(userId),
      plan: plan as PlanTier,
      status: isTrial ? "trial" : "active",
      isTrial: Boolean(isTrial),
      startsAt: now,
      assignedBy: session.id,
    };

    // Only include timestamp fields when they have actual values
    if (trialEndsAt instanceof Date) insertValues.trialEndsAt = trialEndsAt;
    if (parsedEndsAt instanceof Date) insertValues.endsAt = parsedEndsAt;

    // Only include note if non-empty
    const cleanNote = note && typeof note === "string" && note.trim() ? note.trim() : null;
    if (cleanNote) insertValues.note = cleanNote;

    const [newSub] = await db
      .insert(subscriptions)
      .values(insertValues as any)
      .returning();

    return NextResponse.json({ subscription: newSub }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/subscriptions]", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
