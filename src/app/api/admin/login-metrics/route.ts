import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessions, users } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get login metrics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all sessions from the last 30 days
    const recentSessions = await db
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
      .orderBy(desc(sessions.loginAt));

    // Calculate metrics
    const totalLogins = recentSessions.length;
    const uniqueUsers = new Set(recentSessions.map((s) => s.userId)).size;
    const activeSessions = recentSessions.filter((s) => s.isActive).length;

    // Group by role
    const loginsByRole = recentSessions.reduce(
      (acc, session) => {
        const role = session.role;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get today's logins
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogins = recentSessions.filter(
      (s) => new Date(s.loginAt).getTime() >= today.getTime()
    ).length;

    // Get last 7 days login trend
    const loginTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = recentSessions.filter((s) => {
        const sessionDate = new Date(s.loginAt);
        return sessionDate >= date && sessionDate < nextDate;
      }).length;

      loginTrend.push({
        date: date.toISOString().split("T")[0],
        logins: count,
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
      recentSessions: recentSessions.slice(0, 50), // Last 50 sessions
    });
  } catch (error: any) {
    console.error("Error fetching login metrics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
