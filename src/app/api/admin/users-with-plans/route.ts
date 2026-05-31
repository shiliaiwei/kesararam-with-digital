/**
 * Returns all users with their current active subscription plan.
 * Admin-only.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { subscriptions } from "@/db/schema/subscriptions";
import { getSession } from "@/lib/auth";
import { eq, and, or, isNull, gt, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let allUsers: { id: number; displayName: string | null; username: string; email: string; role: string }[] = [];
  try {
    allUsers = await db
      .select({ id: users.id, displayName: users.displayName, username: users.username, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.role, "teacher"))
      .orderBy(users.username);
  } catch (err) {
    console.error("[users-with-plans] users query failed:", err);
    return NextResponse.json({ users: [] });
  }

  // Get active subscriptions — non-fatal if table missing
  let subMap: Record<number, { plan: string; status: string; isTrial: boolean; trialEndsAt: Date | null }> = {};
  try {
    const now = new Date();
    const subs = await db
      .select({ userId: subscriptions.userId, plan: subscriptions.plan, status: subscriptions.status, isTrial: subscriptions.isTrial, trialEndsAt: subscriptions.trialEndsAt })
      .from(subscriptions)
      .where(and(
        or(eq(subscriptions.status, "active"), eq(subscriptions.status, "trial")),
        or(isNull(subscriptions.endsAt), gt(subscriptions.endsAt, now))
      ))
      .orderBy(desc(subscriptions.createdAt));
    for (const s of subs) {
      if (!subMap[s.userId]) subMap[s.userId] = s;
    }
  } catch { /* subscriptions table may not exist yet */ }

  const result = allUsers.map(u => ({
    ...u,
    currentPlan: subMap[u.id]?.plan ?? "free",
    planStatus: subMap[u.id]?.status ?? "none",
    isTrial: subMap[u.id]?.isTrial ?? false,
    trialEndsAt: subMap[u.id]?.trialEndsAt ?? null,
  }));

  return NextResponse.json({ users: result });
}
