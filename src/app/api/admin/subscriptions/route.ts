/**
 * Admin-only subscription management API.
 * Uses raw Neon SQL client directly to avoid ORM null-timestamp serialization bug.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql as neonSql } from "@/lib/db"; // raw neon client, not drizzle
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { computeEndsAt, type BillingCycle } from "@/lib/pricing";

const VALID_PLANS = ["free", "teacher_pro", "school", "family", "driving_school"] as const;
type PlanTier = typeof VALID_PLANS[number];
const VALID_CYCLES = ["monthly", "yearly"] as const;

// GET — uses drizzle (reads are fine, no null timestamp issue)
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
        billingCycle: subscriptions.billingCycle,
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
    console.error("[GET subscriptions]", err);
    return NextResponse.json({ subscriptions: [] }, { status: 200 });
  }
}

// POST — uses raw neon SQL to avoid null timestamp bug in neon-http driver
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

    // Billing cycle is only meaningful for paid (non-trial) licenses.
    const rawCycle = String(body.billingCycle ?? "");
    const billingCycle: BillingCycle | null =
      !isTrial && VALID_CYCLES.includes(rawCycle as BillingCycle) ? (rawCycle as BillingCycle) : null;
    // "Lifetime" (∞) = explicitly no end date, even on a paid license.
    const lifetime = Boolean(body.lifetime);

    if (!userId || isNaN(userId))
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    if (!VALID_PLANS.includes(plan as PlanTier))
      return NextResponse.json({ error: `Invalid plan: ${plan}` }, { status: 400 });

    // Verify user exists
    const [targetUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
    if (!targetUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date().toISOString();
    const status = isTrial ? "trial" : "active";
    const trialEndsAt = isTrial
      ? new Date(Date.now() + trialDays * 86400000).toISOString()
      : null;

    // End date resolution (paid licenses only):
    //  1. explicit endsAt from admin override
    //  2. otherwise auto-compute from the billing cycle (monthly → +1mo, yearly → +1yr)
    //  3. lifetime → null (never expires)
    let endsAt: string | null = null;
    if (!isTrial && !lifetime) {
      if (typeof body.endsAt === "string" && body.endsAt.length > 4) {
        const d = new Date(body.endsAt);
        if (!isNaN(d.getTime())) endsAt = d.toISOString();
      } else if (billingCycle) {
        endsAt = computeEndsAt(now, billingCycle);
      }
    }

    // Ensure the billing_cycle column exists (idempotent — no-op once migrated).
    // Guards against environments that pre-date the Stripe migration.
    await neonSql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT`;

    // Cancel existing — raw SQL
    await neonSql`
      UPDATE subscriptions SET status = 'cancelled'
      WHERE user_id = ${userId}
    `;

    // Insert — raw Neon SQL template tag handles null correctly
    const rows = await neonSql`
      INSERT INTO subscriptions
        (user_id, plan, status, is_trial, trial_ends_at, starts_at, ends_at, billing_cycle, assigned_by, note)
      VALUES (
        ${userId},
        ${plan}::"plan_tier",
        ${status}::"subscription_status",
        ${isTrial},
        ${trialEndsAt}::timestamptz,
        ${now}::timestamptz,
        ${endsAt}::timestamptz,
        ${billingCycle},
        ${session.id},
        ${note}
      )
      RETURNING *
    `;

    return NextResponse.json({ subscription: rows[0] ?? null }, { status: 201 });

  } catch (err) {
    console.error("[POST subscriptions]", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
