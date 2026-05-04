import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all users with session stats, online status, and subscription info
        const rows = await sql`
      SELECT
        u.id,
        u.username,
        u.email,
        u.display_name   AS "displayName",
        u.role,
        u.is_active      AS "isActive",
        u.is_suspended   AS "isSuspended",
        u.login_attempts AS "loginAttempts",
        u.last_login_at  AS "lastLoginAt",
        u.created_at     AS "createdAt",
        u.lifetime_points AS "lifetimePoints",
        u.total_games_played AS "totalGamesPlayed",

        -- Session stats
        COUNT(DISTINCT s.id)::int                          AS "totalSessions",
        COALESCE(SUM(
          CASE WHEN s.logout_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (s.logout_at - s.login_at)) / 60
            ELSE 0
          END
        )::int, 0)                                         AS "timeSpent",

        -- Online: any session with last_activity_at within last 5 minutes
        BOOL_OR(
          s.is_active = true
          AND s.last_activity_at > NOW() - INTERVAL '5 minutes'
        )                                                  AS "isOnline",

        -- Last activity across all sessions
        MAX(s.last_activity_at)                            AS "lastActivityAt",

        -- Subscription
        sub.plan                                           AS "plan",
        sub.status                                         AS "planStatus",
        sub.is_trial                                       AS "isTrial",
        sub.trial_ends_at                                  AS "trialEndsAt",
        sub.ends_at                                        AS "planEndsAt"

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

        return NextResponse.json({ users: rows });
    } catch (error) {
        console.error("[GET /api/admin/users]", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
