import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

// GET /api/staff/analytics - Get staff performance metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.id;

    // Get total content count
    const totalContentResult = await sql`
      SELECT COUNT(*)::int as total_content FROM topics WHERE created_by = ${staffId}
    `;
    const totalContent = totalContentResult[0]?.total_content || 0;

    // Get pending count
    const pendingResult = await sql`
      SELECT COUNT(*)::int as pending_approval FROM topics 
      WHERE created_by = ${staffId} AND status = 'pending'
    `;
    const pendingApproval = pendingResult[0]?.pending_approval || 0;

    // Get approved count
    const approvedResult = await sql`
      SELECT COUNT(*)::int as approved FROM topics 
      WHERE created_by = ${staffId} AND status = 'approved'
    `;
    const approved = approvedResult[0]?.approved || 0;

    // Get rejected count
    const rejectedResult = await sql`
      SELECT COUNT(*)::int as rejected FROM topics 
      WHERE created_by = ${staffId} AND status = 'rejected'
    `;
    const rejected = rejectedResult[0]?.rejected || 0;

    // Get this week's count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekResult = await sql`
      SELECT COUNT(*)::int as this_week FROM topics 
      WHERE created_by = ${staffId} AND created_at >= ${oneWeekAgo.toISOString()}
    `;
    const thisWeek = thisWeekResult[0]?.this_week || 0;

    // Calculate approval rate
    const totalReviewed = Number(approved) + Number(rejected);
    const approvalRate =
      totalReviewed > 0
        ? Math.round((Number(approved) / totalReviewed) * 100)
        : 0;

    // Get content by category
    const contentByCategory = await sql`
      SELECT 
        category_id,
        COUNT(*)::int as count
      FROM topics
      WHERE created_by = ${staffId}
      GROUP BY category_id
    `;

    return NextResponse.json({
      stats: {
        totalContent: Number(totalContent),
        pendingApproval: Number(pendingApproval),
        approved: Number(approved),
        rejected: Number(rejected),
        thisWeek: Number(thisWeek),
        approvalRate,
      },
      recentActivity: [],
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
