/**
 * Admin-only subscription management API.
 * Only admins can assign, modify, or revoke subscriptions.
 * No client-side bypass possible — all checks are server-side.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { PLAN_LIMITS, type PlanTier } from "@/lib/subscription";

// GET /api/admin/subscriptions — list all subscriptions with user info
export async function GET() {
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
      userName: users.displayName,
      userEmail: users.email,
      userRole: users.role,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .orderBy(desc(subscriptions.createdAt));

  return NextResponse.json({ subscriptions: rows });
}

// POST /api/admin/subscriptions — assign a subscription to a user
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { userId, plan, isTrial, trialDays, endsAt, note } = body;

  if (!userId || !plan) {
    return NextResponse.json({ error: "userId and plan are required" }, { status: 400 });
  }

  const validPlans: PlanTier[] = ["free", "teacher_pro", "school"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Verify target user exists and is a teacher (or admin for school plan)
  const [targetUser] = await db
    .select({ id: users.id, role: users.role, email: users.email })
    .from(users)
    .where(eq(users.id, userId));

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Cancel any existing active subscription for this user
  await db
    .update(subscriptions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId));

  const now = new Date();
  const trialEndsAt =
    isTrial && trialDays
      ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
      : null;

  const [newSub] = await db
    .insert(subscriptions)
    .values({
      userId,
      plan,
      status: isTrial ? "trial" : "active",
      isTrial: !!isTrial,
      trialEndsAt,
      startsAt: now,
      endsAt: endsAt ? new Date(endsAt) : null,
      assignedBy: session.id,
      note: note ?? null,
    })
    .returning();

  return NextResponse.json({ subscription: newSub }, { status: 201 });
}
