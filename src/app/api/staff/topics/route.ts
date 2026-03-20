import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql, eq, and, desc, or, like } from "drizzle-orm";

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
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: any[] = [];

    // Staff can only see their own content unless admin
    if (session.role !== "admin") {
      conditions.push(sql`t.created_by = ${session.id}`);
    }

    if (categoryId) {
      conditions.push(sql`t.category_id = ${parseInt(categoryId)}`);
    }

    if (status) {
      conditions.push(sql`t.status = ${status}`);
    }

    if (search) {
      conditions.push(
        sql`(t.name_en ILIKE ${`%${search}%`} OR t.name_km ILIKE ${`%${search}%`} OR t.topic_code ILIKE ${`%${search}%`})`
      );
    }

    const whereClause = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

    // Get topics
    const topics = await db.execute(sql`
      SELECT 
        t.*,
        c.title_en as category_name,
        u.name as creator_name,
        (SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id) as question_count
      FROM topics t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      ${whereClause}
      ORDER BY t.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get total count
    const countResult = await db.execute(sql`
      SELECT COUNT(*)::int as total FROM topics t ${whereClause}
    `);
    const total = countResult.rows[0]?.total || 0;

    return NextResponse.json({
      topics: topics.rows,
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

    const result = await db.execute(sql`
      INSERT INTO topics (
        topic_code, category_id, name_en, name_km,
        description_en, description_km,
        primary_image_url, primary_image_source,
        law_reference, sub_group,
        audio_url_en, audio_source_en,
        audio_url_km, audio_source_km,
        status, created_by, created_at, updated_at
      ) VALUES (
        ${finalTopicCode}, ${categoryId}, ${nameEn}, ${nameKm},
        ${descriptionEn || ""}, ${descriptionKm || ""},
        ${primaryImageUrl || null}, ${primaryImageSource || "url"},
        ${lawReference || null}, ${subGroup || null},
        ${audioUrlEn || null}, ${audioSourceEn || "url"},
        ${audioUrlKm || null}, ${audioSourceKm || "url"},
        ${topicStatus || "draft"}, ${session.id}, NOW(), NOW()
      )
      RETURNING *
    `);

    return NextResponse.json({ topic: result.rows[0] }, { status: 201 });
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
