/**
 * Store Points award path — spec docs/store-points-economy.md (§1.1, §6).
 *
 * The SINGLE writer for earned Store Points. Enforces, server-side:
 *   - LIVE games only — solo/practice plays write NO spendable event (source guard)
 *   - students only (role = 'student'); any other role writes NO event
 *   - daily best-difference (a replay only earns the positive improvement)
 *   - weekly cap (default 150)
 *   - idempotency (a unique key per attempt; retries never double-award)
 *
 * Gated behind STORE_POINTS_ENABLED so it stays inert until cutover. No speed,
 * no streak — points come only from calculateStorePoints().
 */
import { db } from "@/lib/db";
import { storePointEvents, users, STORE_SCORE_VERSION } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { calculateStorePoints } from "./score";
import { resolveUnits } from "./units";
import { getStoreBalances } from "./balance";
import { windowStartDate, todayInPhnomPenh } from "@/lib/gamekit/dates";

export const STORE_POINTS_ENABLED = process.env.STORE_POINTS_ENABLED === "true";
// v3 scale (1 pt / correct answer * 10): ~150 correct answers/week is a healthy ceiling
// that blocks grinding a tier in days without binding ordinary daily play.
export const STORE_POINTS_WEEKLY_CAP = 1500;

/** Where the play came from. Only "live" creates spendable Store Points. */
export type AwardSource = "live" | "solo";

export type AwardReason =
  | "ok"
  | "disabled"
  | "not_live"
  | "not_student"
  | "no_points"
  | "duplicate";

export interface AwardResult {
  awarded: boolean;
  reason: AwardReason;
  grossPoints: number; // what this play was worth (0..30), pre daily-diff / cap
  delta: number; // Store Points actually credited
  accuracy: number;
  storeBalanceAfter?: number;
}

/**
 * Pure: the delta to credit, given this play's gross worth, the best gross
 * already earned today for this game type, and this week's earned total.
 * Daily best-difference, then weekly cap. Spec §6.
 */
export function resolveDelta(opts: {
  grossPoints: number;
  todayBestForGame: number;
  weeklyEarned: number;
  weeklyCap?: number;
}): number {
  const cap = opts.weeklyCap ?? STORE_POINTS_WEEKLY_CAP;
  const dailyImprovement = Math.max(0, opts.grossPoints - opts.todayBestForGame);
  const weeklyRemaining = Math.max(0, cap - opts.weeklyEarned);
  return Math.min(dailyImprovement, weeklyRemaining);
}

/**
 * Award Store Points for one validated play. Always supply a stable
 * `idempotencyKey` (e.g. `${userId}:${gameType}:${attemptId}`).
 */
export async function awardStorePoints(ctx: {
  userId: number;
  gameType: string;
  source: AwardSource;
  attemptId?: string | null;
  totalUnits: number;
  correctUnits: number;
  valid: boolean;
  idempotencyKey: string;
  validatedUnits?: number | null;
}): Promise<AwardResult> {
  if (!STORE_POINTS_ENABLED) {
    return { awarded: false, reason: "disabled", grossPoints: 0, delta: 0, accuracy: 0 };
  }

  // 0. Allow both live sessions and solo/practice modes.
  if (ctx.source !== "live" && ctx.source !== "solo") {
    return { awarded: false, reason: "not_live", grossPoints: 0, delta: 0, accuracy: 0 };
  }

  // 1. Students only — decided from the stored role, never the client.
  const [account] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, ctx.userId))
    .limit(1);
  if (!account || account.role !== "student") {
    return { awarded: false, reason: "not_student", grossPoints: 0, delta: 0, accuracy: 0 };
  }

  // 2. Compute the play's worth (no speed/streak input).
  const units = ctx.totalUnits > 0 ? ctx.totalUnits : resolveUnits(ctx.gameType, ctx.validatedUnits);
  const r = calculateStorePoints({ valid: ctx.valid, totalUnits: units, correctUnits: ctx.correctUnits });
  if (r.points <= 0) {
    // Below the 40% threshold / invalid: learning history records it elsewhere;
    // no spendable currency, no economy row.
    return { awarded: false, reason: "no_points", grossPoints: 0, delta: 0, accuracy: r.accuracy };
  }

  const today = todayInPhnomPenh();
  const weekStart = windowStartDate("weekly");

  // 3. Today's best gross for this game type + this week's earned total.
  const [agg] = await db
    .select({
      todayBest: sql<number>`COALESCE(MAX(CASE WHEN ${storePointEvents.playDate} = ${today} AND ${storePointEvents.gameType} = ${ctx.gameType} AND ${storePointEvents.reason} = 'play' THEN LEAST(30, ${storePointEvents.performancePoints} + ${storePointEvents.completionBonus} + ${storePointEvents.qualityBonus}) ELSE 0 END), 0)::int`,
      weeklyEarned: sql<number>`COALESCE(SUM(CASE WHEN ${storePointEvents.delta} > 0 AND ${storePointEvents.playDate} >= ${weekStart} THEN ${storePointEvents.delta} ELSE 0 END), 0)::int`,
    })
    .from(storePointEvents)
    .where(eq(storePointEvents.userId, ctx.userId));

  const delta = resolveDelta({
    grossPoints: r.points,
    todayBestForGame: agg?.todayBest ?? 0,
    weeklyEarned: agg?.weeklyEarned ?? 0,
  });

  // 4. Write exactly one row for this attempt (idempotent).
  try {
    await db.insert(storePointEvents).values({
      userId: ctx.userId,
      gameType: ctx.gameType,
      attemptId: ctx.attemptId ?? null,
      playDate: today,
      validUnits: units,
      correctUnits: Math.min(ctx.correctUnits, units),
      accuracy: r.accuracy,
      performancePoints: r.performance,
      completionBonus: r.completionBonus,
      qualityBonus: r.qualityBonus,
      delta,
      reason: "play",
      scoreVersion: STORE_SCORE_VERSION,
      idempotencyKey: ctx.idempotencyKey,
    });
  } catch (e: unknown) {
    // Unique idempotency_key violation → this attempt was already awarded.
    const msg = e instanceof Error ? e.message : String(e);
    if (/duplicate key|unique/i.test(msg)) {
      return { awarded: false, reason: "duplicate", grossPoints: r.points, delta: 0, accuracy: r.accuracy };
    }
    throw e;
  }

  const balances = await getStoreBalances(ctx.userId);
  return {
    awarded: true,
    reason: "ok",
    grossPoints: r.points,
    delta,
    accuracy: r.accuracy,
    storeBalanceAfter: balances.storeBalance,
  };
}
