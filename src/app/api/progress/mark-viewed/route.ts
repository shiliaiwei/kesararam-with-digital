import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProgress } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json(
        { error: "contentId is required" },
        { status: 400 }
      );
    }

    // 3. Check if progress record exists
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, session.userId),
          eq(userProgress.contentId, contentId)
        )
      );

    // 4. Update or create progress record
    if (existing) {
      // Update lastViewedAt
      const [updated] = await db
        .update(userProgress)
        .set({
          lastViewedAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id))
        .returning();

      return NextResponse.json(updated);
    } else {
      // Create new progress record
      const [created] = await db
        .insert(userProgress)
        .values({
          userId: session.userId,
          contentId,
          completed: false,
          lastViewedAt: new Date(),
        })
        .returning();

      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Error marking content as viewed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
