/**
 * Derived Store Points balances (spec §8). Balances are NEVER stored as a mutable
 * column — they are always summed from the immutable store_point_events ledger:
 *
 *   store balance   = SUM(delta)                                  (earn − spend)
 *   lifetime earned = SUM(delta) WHERE delta > 0                  (drives levels)
 *   weekly earned   = SUM(delta) WHERE delta > 0 AND this week    (class board / cap)
 *
 * Read-only. The earning/spending writer lives in Phase 3 (award.ts).
 */
import { db } from "@/lib/db";
import { storePointEvents } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { windowStartDate } from "@/lib/gamekit/dates";

export interface StoreBalances {
  storeBalance: number;
  lifetimeEarned: number;
  weeklyEarned: number;
}

export async function getStoreBalances(userId: number): Promise<StoreBalances> {
  const weekStart = windowStartDate("weekly"); // YYYY-MM-DD, Asia/Phnom_Penh (7-day window)

  const rows = await db
    .select({
      storeBalance: sql<number>`COALESCE(SUM(${storePointEvents.delta}), 0)::int`,
      lifetimeEarned: sql<number>`COALESCE(SUM(CASE WHEN ${storePointEvents.delta} > 0 THEN ${storePointEvents.delta} ELSE 0 END), 0)::int`,
      weeklyEarned: sql<number>`COALESCE(SUM(CASE WHEN ${storePointEvents.delta} > 0 AND ${storePointEvents.playDate} >= ${weekStart} THEN ${storePointEvents.delta} ELSE 0 END), 0)::int`,
    })
    .from(storePointEvents)
    .where(eq(storePointEvents.userId, userId));

  return rows[0] ?? { storeBalance: 0, lifetimeEarned: 0, weeklyEarned: 0 };
}
