import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];

    // Staff can only see their own content unless admin
    if (session.role !== "admin") {
      conditions.push(`created_by = ${session.id}`);
    }

    if (categoryId) {
      conditions.push(`category_id = ${parseInt(categoryId)}`);
    }

    if (status) {
      conditions.push(`status = '${status}'`);
    }

    if (search) {
      conditions.push(`(name_en ILIKE '%${search}%' OR name_km ILIKE '%${search}%' OR topic_code ILIKE '%${search}%')`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get topics with creator and updater names
    const topics = await sql`
      SELECT 
        t.*,
        creator.full_name as creator_name,
        updater.full_name as updater_name,
        (SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id) as question_count
      FROM topics t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users updater ON t.updated_by = updater.id
      ${sql.unsafe(whereClause)}
      ORDER BY t.updated_at DESC, t.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*)::int as total FROM topics ${sql.unsafe(whereClause)}
    `;
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      topics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "staff" && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const {
      topicCode,
      categoryId,
      nameEn,
      nameKm,
      descriptionEn,
      descriptionKm,
      primaryImageUrl,
      primaryImageSource,
      lawReference,
      subGroup,
      audioUrlEn,
      audioSourceEn,
      audioUrlKm,
      audioSourceKm,
      status: topicStatus,
    } = body;

    // Validate required fields
    if (!categoryId || !nameEn || !nameKm) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate topic code if not provided
    const finalTopicCode = topicCode || `T-${Date.now()}`;

    const result = await sql`
      INSERT INTO topics (
        topic_code, category_id, name_en, name_km,
        description_en, description_km,
        primary_image_url, primary_image_source,
        law_reference, sub_group,
        audio_url_en, audio_source_en,
        audio_url_km, audio_source_km,
        status, created_by, updated_by, created_at, updated_at
      ) VALUES (
        ${finalTopicCode}, ${categoryId}, ${nameEn}, ${nameKm},
        ${descriptionEn || ""}, ${descriptionKm || ""},
        ${primaryImageUrl || null}, ${primaryImageSource || "url"},
        ${lawReference || null}, ${subGroup || null},
        ${audioUrlEn || null}, ${audioSourceEn || "url"},
        ${audioUrlKm || null}, ${audioSourceKm || "url"},
        ${topicStatus || "draft"}, ${session.id}, ${session.id}, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ topic: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating topic:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Topic code already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
