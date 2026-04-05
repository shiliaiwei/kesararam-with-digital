import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, sql } from "@/lib/db";
import { topics, users } from "@/db/schema";
import { eq, desc, ilike, and, or, count } from "drizzle-orm";

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
    const userId = Number(session.id);
    const isAdmin = session.role === "admin";
    const scope = searchParams.get("scope") || "all";
    const ownOnly = !isAdmin && scope === "mine";

    // Build conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = [];
    if (ownOnly) conditions.push(eq(topics.createdBy, userId));
    if (categoryId) conditions.push(eq(topics.categoryId, parseInt(categoryId)));
    if (status) conditions.push(eq(topics.status, status as "draft" | "pending" | "approved" | "rejected"));
    if (search) {
      conditions.push(
        or(
          ilike(topics.nameEn, `%${search}%`),
          ilike(topics.nameKm, `%${search}%`),
          ilike(topics.topicCode, `%${search}%`),
        )
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const creator = { id: users.id, displayName: users.displayName };

    const rows = await db
      .select({
        id: topics.id,
        topicCode: topics.topicCode,
        categoryId: topics.categoryId,
        nameEn: topics.nameEn,
        nameKm: topics.nameKm,
        descriptionEn: topics.descriptionEn,
        descriptionKm: topics.descriptionKm,
        primaryImageUrl: topics.primaryImageUrl,
        primaryImageSource: topics.primaryImageSource,
        lawReference: topics.lawReference,
        subGroup: topics.subGroup,
        audioUrlEn: topics.audioUrlEn,
        audioSourceEn: topics.audioSourceEn,
        audioUrlKm: topics.audioUrlKm,
        audioSourceKm: topics.audioSourceKm,
        status: topics.status,
        createdBy: topics.createdBy,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
        creatorName: creator.displayName,
      })
      .from(topics)
      .leftJoin(users, eq(topics.createdBy, users.id))
      .where(where)
      .orderBy(desc(topics.updatedAt), desc(topics.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(topics)
      .where(where);

    return NextResponse.json({
      topics: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/staff/topics]", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
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
      topicCode, categoryId, nameEn, nameKm,
      descriptionEn, descriptionKm,
      primaryImageUrl, primaryImageSource,
      lawReference, subGroup,
      audioUrlEn, audioSourceEn,
      audioUrlKm, audioSourceKm,
      status: topicStatus,
    } = body;

    if (!categoryId || !nameEn || !nameKm) {
      return NextResponse.json(
        { error: "Missing required fields: categoryId, nameEn, nameKm" },
        { status: 400 }
      );
    }

    const finalTopicCode = topicCode || `T-${Date.now()}`;
    const userId = Number(session.id);

    // Use simple tagged template — no nested fragments
    const result = await sql`
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
        ${topicStatus || "pending"}, ${userId}, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ topic: result[0] }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/staff/topics]", error);
    const e = error as { code?: string; message?: string };
    if (e.code === "23505") {
      return NextResponse.json({ error: "Topic code already exists" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create topic", detail: e.message ?? "unknown" },
      { status: 500 }
    );
  }
}
