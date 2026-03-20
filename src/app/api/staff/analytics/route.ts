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
    const totalContentResult = await db
      .select({ totalContent: sql<number>`count(*)::int` })
      .from(contentItems)
      .where(eq(contentItems.createdBy, staffId));
    const totalContent = totalContentResult[0]?.totalContent || 0;

    // Get pending count
    const pendingResult = await db
      .select({ pendingApproval: sql<number>`count(*)::int` })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.createdBy, staffId),
          eq(contentItems.status, "pending")
        )
      );
    const pendingApproval = pendingResult[0]?.pendingApproval || 0;

    // Get approved count
    const approvedResult = await db
      .select({ approved: sql<number>`count(*)::int` })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.createdBy, staffId),
          eq(contentItems.status, "active")
        )
      );
    const approved = approvedResult[0]?.approved || 0;

    // Get rejected count
    const rejectedResult = await db
      .select({ rejected: sql<number>`count(*)::int` })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.createdBy, staffId),
          eq(contentItems.status, "rejected")
        )
      );
    const rejected = rejectedResult[0]?.rejected || 0;

    // Get this week's count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekResult = await db
      .select({ thisWeek: sql<number>`count(*)::int` })
      .from(contentItems)
      .where(
        and(
          eq(contentItems.createdBy, staffId),
          gte(contentItems.createdAt, oneWeekAgo)
        )
      );
    const thisWeek = thisWeekResult[0]?.thisWeek || 0;

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
        count: sql<number>`count(*)::int`,
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
      recentActivity: recentActivity || [],
      contentByCategory: contentByCategory || [],
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics",
        stats: {
          totalContent: 0,
          pendingApproval: 0,
          approved: 0,
          rejected: 0,
          thisWeek: 0,
          approvalRate: 0,
        },
        recentActivity: [],
        contentByCategory: [],
      },
      { status: 500 }
    );
  }
}
