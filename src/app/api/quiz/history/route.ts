import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizAttempts } from "@/db/schema/quizzes";
import { getSession } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/quiz/history
 * 
 * Returns paginated quiz attempt history for a user.
 * Can be filtered by categoryId.
 * 
 * Requirements validated: 18.3
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to view quiz history" },
        { status: 401 }
      );
    }

    const userId = session.id;

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "10");

    // 3. Check permissions
    // Users can view their own history, admins can view any user's history
    let targetUserId = userId;
    if (requestedUserId && parseInt(requestedUserId) !== userId) {
      if (session.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden", message: "You can only view your own quiz history" },
          { status: 403 }
        );
      }
      targetUserId = parseInt(requestedUserId);
    }

    // 4. Build query conditions
    const conditions = [eq(quizAttempts.userId, targetUserId)];
    
    if (categoryId) {
      conditions.push(eq(quizAttempts.categoryId, parseInt(categoryId)));
    }

    // 5. Query quiz attempts
    const attempts = await db
      .select({
        id: quizAttempts.id,
        categoryId: quizAttempts.categoryId,
        mode: quizAttempts.mode,
        totalQuestions: quizAttempts.totalQuestions,
        correctAnswers: quizAttempts.correctAnswers,
        score: quizAttempts.score,
        percentage: quizAttempts.percentage,
        timeSpent: quizAttempts.timeSpent,
        completedAt: quizAttempts.completedAt,
      })
      .from(quizAttempts)
      .where(and(...conditions))
      .orderBy(desc(quizAttempts.completedAt))
      .limit(limit);

    // 6. Return history
    return NextResponse.json({
      attempts,
      count: attempts.length,
    });
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching quiz history",
      },
      { status: 500 }
    );
  }
}
