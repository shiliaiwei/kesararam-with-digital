import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaResources } from "@/db/schema/content";
import { eq, desc, like, or } from "drizzle-orm";

// GET /api/staff/media - List media library
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build query
    let query = db.select().from(mediaResources);

    const conditions = [];
    if (type) {
      conditions.push(eq(mediaResources.type, type));
    }
    if (search) {
      conditions.push(
        or(
          like(mediaResources.name, `%${search}%`),
          like(mediaResources.url, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : or(...conditions));
    }

    const media = await query
      .orderBy(desc(mediaResources.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST /api/staff/media - Add media reference
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      type,
      url,
      source,
      cloudinaryId,
      fileSize,
      mimeType,
      width,
      height,
      duration,
    } = body;

    // Validate required fields
    if (!name || !type || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create media resource
    const [newMedia] = await db
      .insert(mediaResources)
      .values({
        name,
        type,
        url,
        source: source || "external",
        cloudinaryId,
        fileSize,
        mimeType,
        width,
        height,
        duration,
        createdBy: session.id,
      })
      .returning();

    return NextResponse.json({ media: newMedia }, { status: 201 });
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}
