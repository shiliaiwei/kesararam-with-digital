import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, UserPlus, Shield, Clock, Wifi } from "lucide-react";
import { UsersTable } from "./users-table";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  // Fetch enriched users with online status, sessions, spending
  let allUsers: any[] = [];
  try {
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
        COUNT(DISTINCT s.id)::int AS "totalSessions",
        COALESCE(SUM(
          CASE WHEN s.logout_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (s.logout_at - s.login_at)) / 60
            ELSE 0
          END
        )::int, 0) AS "timeSpent",
        BOOL_OR(
          s.is_active = true
          AND s.last_activity_at > NOW() - INTERVAL '5 minutes'
        ) AS "isOnline",
        MAX(s.last_activity_at) AS "lastActivityAt",
        sub.plan         AS "plan",
        sub.status       AS "planStatus",
        sub.is_trial     AS "isTrial",
        sub.trial_ends_at AS "trialEndsAt",
        sub.ends_at      AS "planEndsAt"
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
    allUsers = rows as any[];
  } catch (err) {
    console.error("[admin users] DB error:", err);
    // Fallback to basic user list
    try {
      const basic = await db.select({
        id: users.id, username: users.username, email: users.email,
        displayName: users.displayName, role: users.role,
        isActive: users.isActive, loginAttempts: users.loginAttempts,
        createdAt: users.createdAt,
      }).from(users).orderBy(desc(users.createdAt));
      allUsers = basic as any[];
    } catch (e2) { console.error(e2); }
  }

  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(u => u.isActive).length;
  const onlineUsers = allUsers.filter(u => u.isOnline).length;
  const newUsers = allUsers.filter(u => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return new Date(u.createdAt) > d;
  }).length;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "#3b82f6" },
    { label: "Active Users", value: activeUsers, icon: UserPlus, color: "#22c55e" },
    { label: "Online Now", value: onlineUsers, icon: Wifi, color: "#10b981", pulse: true },
    { label: "New (24h)", value: newUsers, icon: Clock, color: "#f97316" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 border-2 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Users size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
              User Management
            </h1>
            <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
              Manage all platform accounts and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                style={{ backgroundColor: stat.color }}>
                <stat.icon size={20} className="text-black" />
              </div>
              <div className="flex items-center gap-2">
                {(stat as any).pulse && <span className="w-2.5 h-2.5 rounded-full bg-green-400 border border-black animate-pulse" />}
                <span className="text-3xl font-black text-black">{stat.value}</span>
              </div>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Users Table Card */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
        {/* Card Header */}
        <div className="border-b-2 border-black bg-blue-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black">
            All Users
          </h2>
          <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
            Search, filter, create, edit or remove user accounts
          </p>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <UsersTable initialUsers={allUsers} />
        </div>
      </div>
    </div>
  );
}
