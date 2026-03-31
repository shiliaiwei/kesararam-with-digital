/**
 * Admin-only subscription management API.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import type { NewSubscription } from "@/db/schema/subscriptions";

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
    return NextResponse.json({ subscriptions: [] }, { status: 200 });
  }
}

// POST /api/admin/subscriptions — assign a subscription to a user
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const userId = Number(body.userId);
    const plan = String(body.plan ?? "");
    const isTrial = Boolean(body.isTrial);
    const trialDays = Number(body.trialDays ?? 7);
    const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

    if (!userId || isNaN(userId))
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    if (!VALID_PLANS.includes(plan as PlanTier))
      return NextResponse.json({ error: `Invalid plan: ${plan}` }, { status: 400 });

    // Verify user exists
    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId));
    if (!targetUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();

    // Cancel existing subscriptions
    try {
      await db.update(subscriptions)
        .set({ status: "cancelled" })
        .where(eq(subscriptions.userId, userId));
    } catch { /* non-fatal */ }

    // Build typed insert — explicit null for optional timestamps
    const trialEndsAt: Date | null = isTrial
      ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
      : null;

    // Parse endsAt only when not a trial and value is provided
    let endsAt: Date | null = null;
    if (!isTrial && typeof body.endsAt === "string" && body.endsAt.length > 4) {
      const d = new Date(body.endsAt);
      if (!isNaN(d.getTime())) endsAt = d;
    }

    const newRow: NewSubscription = {
      userId,
      plan: plan as PlanTier,
      status: isTrial ? "trial" : "active",
      isTrial,
      trialEndsAt,
      startsAt: now,
      endsAt,
      assignedBy: session.id,
      note,
    };

    const [inserted] = await db
      .insert(subscriptions)
      .values(newRow)
      .returning();

    return NextResponse.json({ subscription: inserted }, { status: 201 });

  } catch (err) {
    console.error("[POST /api/admin/subscriptions]", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
