import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, staffActivityMetrics } from "@/db/schema/content";
import { eq, and, gte, sql } from "drizzle-orm";

// GET /api/staff/analytics - Get staff performance metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.id;

    // Get total content count
    const [{ totalContent }] = await db
      .select({ totalContent: sql<number>`count(*)` })
      .from(contentItems)
      .where(eq(contentItems.createdBy, staffId));

    // Get pending count
    const [{ pendingApproval }] = await db
      .select({ pendingApproval: sql<number>`count(*)` })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.createdBy, staffId),
          eq(contentItems.status, "pending")
        )
      );

    // Get approved count
    const [{ approved }] = await db
      .select({ approved: sql<number>`count(*)` })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.createdBy, staffId),
          eq(contentItems.status, "active")
        )
      );

    // Get rejected count
    const [{ rejected }] = await db
      .select({ rejected: sql<number>`count(*)` })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.createdBy, staffId),
          eq(contentItems.status, "rejected")
        )
      );

    // Get this week's count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [{ thisWeek }] = await db
      .select({ thisWeek: sql<number>`count(*)` })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.createdBy, staffId),
          gte(contentItems.createdAt, oneWeekAgo)
        )
      );

    // Calculate approval rate
    const totalReviewed = Number(approved) + Number(rejected);
    const approvalRate =
      totalReviewed > 0
        ? Math.round((Number(approved) / totalReviewed) * 100)
        : 0;

    // Get recent activity
    const recentActivity = await db
      .select()
      .from(staffActivityMetrics)
      .where(eq(staffActivityMetrics.staffId, staffId))
      .orderBy(sql`${staffActivityMetrics.createdAt} DESC`)
      .limit(10);

    // Get content by category
    const contentByCategory = await db
      .select({
        categoryId: contentItems.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(contentItems)
      .where(eq(contentItems.createdBy, staffId))
      .groupBy(contentItems.categoryId);

    return NextResponse.json({
      stats: {
        totalContent: Number(totalContent),
        pendingApproval: Number(pendingApproval),
        approved: Number(approved),
        rejected: Number(rejected),
        thisWeek: Number(thisWeek),
        approvalRate,
      },
      recentActivity,
      contentByCategory,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
