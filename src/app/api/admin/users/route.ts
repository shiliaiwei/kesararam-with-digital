import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";


export async function GET(_request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Try enriched query with sessions + subscriptions
    let rows: any[];
    try {
      rows = await sql`
        SELECT
          u.id,
          u.username,
          u.email,
          u.display_name        AS "displayName",
          u.role,
          u.is_active           AS "isActive",
          u.is_suspended        AS "isSuspended",
          u.login_attempts      AS "loginAttempts",
          u.last_login_at       AS "lastLoginAt",
          u.created_at          AS "createdAt",
          u.lifetime_points     AS "lifetimePoints",
          u.total_games_played  AS "totalGamesPlayed",
          COUNT(DISTINCT s.id)::int AS "totalSessions",
          COALESCE(SUM(
            CASE WHEN s.logout_at IS NOT NULL
              THEN EXTRACT(EPOCH FROM (s.logout_at - s.login_at)) / 60
              ELSE 0
            END
          )::int, 0) AS "timeSpent",
          COALESCE(BOOL_OR(
            s.is_active = true
            AND s.last_activity_at > NOW() - INTERVAL '5 minutes'
          ), false) AS "isOnline",
          MAX(s.last_activity_at) AS "lastActivityAt",
          sub.plan        AS "plan",
          sub.status      AS "planStatus",
          sub.is_trial    AS "isTrial",
          sub.trial_ends_at AS "trialEndsAt",
          sub.ends_at     AS "planEndsAt"
        FROM users u
        LEFT JOIN sessions s ON s.user_id = u.id
        LEFT JOIN LATERAL (
          SELECT plan, status, is_trial, trial_ends_at, ends_at
          FROM subscriptions
          WHERE user_id = u.id
            AND status IN ('active', 'trial')
            AND (ends_at IS NULL OR ends_at > NOW())
          ORDER BY created_at DESC
          LIMIT 1
        ) sub ON true
        GROUP BY u.id, sub.plan, sub.status, sub.is_trial, sub.trial_ends_at, sub.ends_at
        ORDER BY u.created_at DESC
      `;
    } catch {
      // Fallback: sessions/subscriptions tables may not exist yet
      rows = await sql`
        SELECT
          id,
          username,
          email,
          display_name        AS "displayName",
          role,
          is_active           AS "isActive",
          is_suspended        AS "isSuspended",
          login_attempts      AS "loginAttempts",
          last_login_at       AS "lastLoginAt",
          created_at          AS "createdAt",
          lifetime_points     AS "lifetimePoints",
          total_games_played  AS "totalGamesPlayed",
          0     AS "totalSessions",
          0     AS "timeSpent",
          false AS "isOnline",
          NULL  AS "lastActivityAt",
          NULL  AS "plan",
          NULL  AS "planStatus",
          false AS "isTrial",
          NULL  AS "trialEndsAt",
          NULL  AS "planEndsAt"
        FROM users
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
