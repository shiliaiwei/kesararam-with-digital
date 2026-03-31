import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { users } from "@/db/schema/users";
import { eq, desc } from "drizzle-orm";
import { SubscriptionsManager } from "./subscriptions-manager";

export const metadata = { title: "Subscriptions — Admin" };

export default async function SubscriptionsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  let rows: any[] = [];
  let allUsers: any[] = [];

  // Always fetch users — separate try/catch so it never fails due to subscriptions table
  try {
    allUsers = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        username: users.username,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .orderBy(users.username);
  } catch {
    // DB unavailable
  }

  try {
    rows = await db
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
  } catch {
    // Subscriptions table may not exist yet
  }

  return <SubscriptionsManager initialRows={rows} allUsers={allUsers} adminId={session.id} />;
}
