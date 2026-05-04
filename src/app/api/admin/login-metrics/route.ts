import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessions } from "@/db/schema/sessions";
import { users } from "@/db/schema/users";
import { desc, gte, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let recentSessions: any[] = [];
    try {
      recentSessions = await db
        .select({
          id: sessions.id,
          userId: sessions.userId,
          username: users.username,
          email: users.email,
          displayName: users.displayName,
          role: users.role,
          ipAddress: sessions.ipAddress,
          userAgent: sessions.userAgent,
          isActive: sessions.isActive,
          loginAt: sessions.loginAt,
          logoutAt: sessions.logoutAt,
          lastActivityAt: sessions.lastActivityAt,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(gte(sessions.loginAt, thirtyDaysAgo))
        .orderBy(desc(sessions.loginAt))
        .limit(50);
    } catch (sessionErr) {
      // sessions table may not exist yet — return empty metrics gracefully
      console.warn("[login-metrics] sessions table unavailable:", sessionErr);
    }

    // Calculate metrics
    const totalLogins = recentSessions.length;
    const uniqueUsers = new Set(recentSessions.map((s) => s.userId)).size;
    const activeSessions = recentSessions.filter((s) => s.isActive).length;
    const todayLogins = recentSessions.filter(
      (s) => new Date(s.loginAt) >= today
    ).length;

    // Logins by role
    const loginsByRole: Record<string, number> = {};
    recentSessions.forEach((s) => {
      loginsByRole[s.role] = (loginsByRole[s.role] || 0) + 1;
    });

    // 7-day login trend
    const loginTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const logins = recentSessions.filter((s) => {
        const loginDate = new Date(s.loginAt);
        return loginDate >= date && loginDate < nextDate;
      }).length;

      loginTrend.push({
        date: date.toISOString().split("T")[0],
        logins,
      });
    }

    return NextResponse.json({
      metrics: {
        totalLogins,
        uniqueUsers,
        activeSessions,
        todayLogins,
        loginsByRole,
        loginTrend,
      },
      recentSessions: recentSessions.slice(0, 10),
    });
  } catch (error) {
    console.error("Failed to fetch login metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
