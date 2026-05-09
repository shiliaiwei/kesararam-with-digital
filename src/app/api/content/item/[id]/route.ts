import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const contentId = parseInt(id);

    if (isNaN(contentId)) {
      return NextResponse.json(
        { error: "Invalid content ID" },
        { status: 400 }
      );
    }

    // Fetch content item
    const item = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, contentId))
      .limit(1);

    if (!item.length) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    const content = item[0];

    // Check permissions
    // Students can only see active content
    if (!session || session.role === "student") {
      if (content.status !== "active" || !content.isActive) {
        return NextResponse.json(
          { error: "Content not found" },
          { status: 404 }
        );
      }
    }
    // Staff can see their own content or active content
    else if (session.role === "staff") {
      if (
        content.createdBy !== session.id &&
        (content.status !== "active" || !content.isActive)
      ) {
        return NextResponse.json(
          { error: "Content not found" },
          { status: 404 }
        );
      }
    }
    // Admin can see all content

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching content item:", error);
    return NextResponse.json(
      { error: "Failed to fetch content item" },
      { status: 500 }
    );
  }
}
