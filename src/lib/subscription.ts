/**
 * Subscription system — plan definitions, limits, and enforcement.
 * Security: All plan checks happen server-side only.
 * Admins are the ONLY ones who can assign/modify subscriptions.
 */

import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq, and, or, isNull, gt } from "drizzle-orm";

// ─── Plan Definitions ────────────────────────────────────────────────────────

export type PlanTier = "free" | "teacher_pro" | "school";

export interface PlanLimits {
  /** Max players per live session */
  maxPlayersPerSession: number;
  /** Max live sessions per month (null = unlimited) */
  maxSessionsPerMonth: number | null;
  /** Access to all question categories */
  allCategories: boolean;
  /** Max categories accessible (if not allCategories) */
  maxCategories: number;
  /** Session analytics & reports */
  analytics: boolean;
  /** Export results as CSV/PDF */
  exportResults: boolean;
  /** Advanced game modes (marathon, team battle) */
  advancedGameModes: boolean;
  /** Remove "Powered by KWD" branding */
  removeBranding: boolean;
  /** Max teacher accounts (for school plan) */
  maxTeacherAccounts: number;
  /** Max students per session */
  maxStudentsPerSession: number;
  /** Admin class management dashboard */
  classManagement: boolean;
  /** Priority support */
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxPlayersPerSession: 10,
    maxSessionsPerMonth: 1,
    allCategories: false,
    maxCategories: 1,
    analytics: false,
    exportResults: false,
    advancedGameModes: false,
    removeBranding: false,
    maxTeacherAccounts: 1,
    maxStudentsPerSession: 10,
    classManagement: false,
    prioritySupport: false,
  },
  teacher_pro: {
    maxPlayersPerSession: 50,
    maxSessionsPerMonth: null, // unlimited
    allCategories: true,
    maxCategories: 999,
    analytics: true,
    exportResults: true,
    advancedGameModes: true,
    removeBranding: true,
    maxTeacherAccounts: 1,
    maxStudentsPerSession: 50,
    classManagement: false,
    prioritySupport: false,
  },
  school: {
    maxPlayersPerSession: 200,
    maxSessionsPerMonth: null,
    allCategories: true,
    maxCategories: 999,
    analytics: true,
    exportResults: true,
    advancedGameModes: true,
    removeBranding: true,
    maxTeacherAccounts: 10,
    maxStudentsPerSession: 200,
    classManagement: true,
    prioritySupport: true,
  },
};

export const PLAN_DISPLAY = {
  free: {
    name: "Free",
    nameKh: "ឥតគិតថ្លៃ",
    price: 0,
    priceLabel: "$0",
    color: "#6b7280",
    badge: null,
  },
  teacher_pro: {
    name: "Teacher Pro",
    nameKh: "គ្រូ Pro",
    price: 10,
    priceLabel: "$10",
    color: "#f59e0b",
    badge: "Most Popular",
  },
  school: {
    name: "School",
    nameKh: "សាលា",
    price: 49,
    priceLabel: "$49",
    color: "#8b5cf6",
    badge: "Best Value",
  },
} as const;

// ─── Subscription Resolver ────────────────────────────────────────────────────

/**
 * Get the active subscription for a user.
 * Falls back to "free" if none found or expired.
 * This is the SINGLE source of truth — never trust client-side plan data.
 */
export async function getUserSubscription(userId: number): Promise<{
  plan: PlanTier;
  limits: PlanLimits;
  isTrial: boolean;
  trialEndsAt: Date | null;
  endsAt: Date | null;
  status: string;
}> {
  const now = new Date();

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        or(
          eq(subscriptions.status, "active"),
          eq(subscriptions.status, "trial")
        ),
        or(isNull(subscriptions.endsAt), gt(subscriptions.endsAt, now))
      )
    )
    .orderBy(subscriptions.createdAt)
    .limit(1);

  if (!sub) {
    return {
      plan: "free",
      limits: PLAN_LIMITS.free,
      isTrial: false,
      trialEndsAt: null,
      endsAt: null,
      status: "active",
    };
  }

  // Check trial expiry
  if (sub.isTrial && sub.trialEndsAt && sub.trialEndsAt < now) {
    // Auto-expire trial — mark as expired in background (fire-and-forget)
    db.update(subscriptions)
      .set({ status: "expired", updatedAt: now })
      .where(eq(subscriptions.id, sub.id))
      .catch(console.error);

    return {
      plan: "free",
      limits: PLAN_LIMITS.free,
      isTrial: false,
      trialEndsAt: null,
      endsAt: null,
      status: "expired",
    };
  }

  const plan = sub.plan as PlanTier;
  return {
    plan,
    limits: PLAN_LIMITS[plan],
    isTrial: sub.isTrial,
    trialEndsAt: sub.trialEndsAt,
    endsAt: sub.endsAt,
    status: sub.status,
  };
}

/**
 * Count sessions hosted by a user this calendar month.
 */
export async function countSessionsThisMonth(
  hostId: number
): Promise<number> {
  const { gameSessions } = await import("@/db/schema/game");
  const { gte, count } = await import("drizzle-orm");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [row] = await db
    .select({ total: count() })
    .from(gameSessions)
    .where(
      and(
        eq(gameSessions.hostId, hostId),
        gte(gameSessions.createdAt, startOfMonth)
      )
    );

  return row?.total ?? 0;
}

/**
 * Enforce subscription limits before creating a session.
 * Returns null if allowed, or an error message string if blocked.
 */
export async function enforceSessionCreation(
  hostId: number,
  requestedMaxPlayers: number
): Promise<string | null> {
  const { plan, limits } = await getUserSubscription(hostId);

  // Monthly session cap
  if (limits.maxSessionsPerMonth !== null) {
    const used = await countSessionsThisMonth(hostId);
    if (used >= limits.maxSessionsPerMonth) {
      return plan === "free"
        ? `Free plan allows ${limits.maxSessionsPerMonth} session/month. Upgrade to Teacher Pro for unlimited sessions.`
        : `You've reached your monthly session limit (${limits.maxSessionsPerMonth}).`;
    }
  }

  // Player cap
  if (requestedMaxPlayers > limits.maxPlayersPerSession) {
    return `Your ${plan} plan supports up to ${limits.maxPlayersPerSession} players per session. Upgrade to allow more.`;
  }

  return null;
}
