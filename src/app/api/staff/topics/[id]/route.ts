import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.execute(sql`
      SELECT 
        t.*,
        c.title_en as category_name,
        c.slug as category_slug,
        u.name as creator_name
      FROM topics t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ${params.id}
    `);

    const topic = result.rows[0];

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Staff can only view their own content unless admin
    if (
      session.role !== "admin" &&
      topic.created_by !== session.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get linked questions
    const questionsResult = await db.execute(sql`
      SELECT 
        q.*,
        (SELECT COUNT(*)::int FROM answers WHERE question_id = q.id) as answer_count
      FROM questions q
      WHERE q.topic_id = ${params.id}
      ORDER BY q.sort_order, q.created_at
    `);

    return NextResponse.json({ topic, questions: questionsResult.rows });
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingResult = await db.execute(sql`
      SELECT * FROM topics WHERE id = ${params.id}
    `);
    const existing = existingResult.rows[0];

    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Staff can only edit their own content unless admin
    if (
      session.role !== "admin" &&
      existing.created_by !== session.id
    ) {
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

    const result = await db.execute(sql`
      UPDATE topics SET
        topic_code = ${topicCode || existing.topic_code},
        category_id = ${categoryId || existing.category_id},
        name_en = ${nameEn || existing.name_en},
        name_km = ${nameKm || existing.name_km},
        description_en = ${descriptionEn !== undefined ? descriptionEn : existing.description_en},
        description_km = ${descriptionKm !== undefined ? descriptionKm : existing.description_km},
        primary_image_url = ${primaryImageUrl !== undefined ? primaryImageUrl : existing.primary_image_url},
        primary_image_source = ${primaryImageSource || existing.primary_image_source},
        law_reference = ${lawReference !== undefined ? lawReference : existing.law_reference},
        sub_group = ${subGroup !== undefined ? subGroup : existing.sub_group},
        audio_url_en = ${audioUrlEn !== undefined ? audioUrlEn : existing.audio_url_en},
        audio_source_en = ${audioSourceEn || existing.audio_source_en},
        audio_url_km = ${audioUrlKm !== undefined ? audioUrlKm : existing.audio_url_km},
        audio_source_km = ${audioSourceKm || existing.audio_source_km},
        status = ${topicStatus || existing.status},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `);

    return NextResponse.json({ topic: result.rows[0] });
  } catch (error: any) {
    console.error("Error updating topic:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Topic code already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update topic" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingResult = await db.execute(sql`
      SELECT * FROM topics WHERE id = ${params.id}
    `);
    const existing = existingResult.rows[0];

    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Staff can only delete their own content unless admin
    if (
      session.role !== "admin" &&
      existing.created_by !== session.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cannot delete if published
    if (existing.status === "published") {
      return NextResponse.json(
        { error: "Cannot delete published topic" },
        { status: 400 }
      );
    }

    await db.execute(sql`DELETE FROM topics WHERE id = ${params.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
