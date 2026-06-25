import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, sql } from "@/lib/db";
import { topics, categories, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const topicId = parseInt(id);

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
        categoryName: categories.titleEn,
        categorySlug: categories.slug,
      })
      .from(topics)
      .leftJoin(categories, eq(topics.categoryId, categories.id))
      .where(eq(topics.id, topicId));

    const topic = rows[0];
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    // Staff can view their own topics OR any approved/published topic
    if (
      session.role !== "admin" &&
      topic.createdBy !== Number(session.id) &&
      topic.status !== "approved" &&
      topic.status !== "published"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get questions via raw sql (simple, no nested fragments)
    const questions = await sql`
      SELECT q.*, (SELECT COUNT(*)::int FROM answers WHERE question_id = q.id) as answer_count
      FROM questions q WHERE q.topic_id = ${topicId}
      ORDER BY q.sort_order, q.created_at
    `;

    // Fetch answers for each question
    for (const question of questions) {
      const answers = await sql`
        SELECT id, answer_en, answer_km, is_correct, image_url, sort_order
        FROM answers
        WHERE question_id = ${question.id}
        ORDER BY sort_order
      `;
      (question as any).answers = answers;
    }

    return NextResponse.json({ topic, questions });
  } catch (error) {
    console.error("[GET /api/staff/topics/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const topicId = parseInt(id);

    const existing = await db.select().from(topics).where(eq(topics.id, topicId));
    if (!existing[0]) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    const t = existing[0];

    // Admin can edit anything
    // Staff can edit:
    // - Their own content (any status)
    // - ANY rejected content (even if created by disabled staff)
    // - ANY draft content (even if created by disabled staff)
    if (session.role !== "admin") {
      const isOwner = t.createdBy === Number(session.id);
      const isRejected = t.status === "rejected";
      const isDraft = t.status === "draft";

      if (!isOwner && !isRejected && !isDraft) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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

    const isAdmin = session.role === "admin";
    const newStatus = isAdmin
      ? (topicStatus || t.status)
      : (t.status === "approved") ? "pending" : (topicStatus || t.status);

    const result = await sql`
      UPDATE topics SET
        topic_code = ${topicCode || t.topicCode},
        category_id = ${categoryId || t.categoryId},
        name_en = ${nameEn || t.nameEn},
        name_km = ${nameKm || t.nameKm},
        description_en = ${descriptionEn !== undefined ? descriptionEn : t.descriptionEn},
        description_km = ${descriptionKm !== undefined ? descriptionKm : t.descriptionKm},
        primary_image_url = ${primaryImageUrl !== undefined ? primaryImageUrl : t.primaryImageUrl},
        primary_image_source = ${primaryImageSource || t.primaryImageSource},
        law_reference = ${lawReference !== undefined ? lawReference : t.lawReference},
        sub_group = ${subGroup !== undefined ? subGroup : t.subGroup},
        audio_url_en = ${audioUrlEn !== undefined ? audioUrlEn : t.audioUrlEn},
        audio_source_en = ${audioSourceEn || t.audioSourceEn},
        audio_url_km = ${audioUrlKm !== undefined ? audioUrlKm : t.audioUrlKm},
        audio_source_km = ${audioSourceKm || t.audioSourceKm},
        status = ${newStatus},
        updated_at = NOW()
      WHERE id = ${topicId}
      RETURNING *
    `;

    return NextResponse.json({ topic: result[0] });
  } catch (error: unknown) {
    console.error("[PUT /api/staff/topics/[id]]", error);
    const e = error as { code?: string };
    if (e.code === "23505") return NextResponse.json({ error: "Topic code already exists" }, { status: 400 });
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const topicId = parseInt(id);

    const existing = await db.select().from(topics).where(eq(topics.id, topicId));
    if (!existing[0]) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    const t = existing[0];

    // Check if inserted by staff and approved by admin
    if (t.createdBy) {
      const creator = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, t.createdBy))
        .then((r) => r[0]);

      if (
        creator?.role === "staff" &&
        (t.status === "approved" || t.approvedBy !== null)
      ) {
        return NextResponse.json(
          { error: "Cannot delete topics created by staff and approved by admin" },
          { status: 400 }
        );
      }
    }

    // Admin can delete anything
    // Staff can delete:
    // - Their own draft/rejected content
    // - ANY rejected content (even if created by disabled staff)
    // - ANY draft content (even if created by disabled staff)
    if (session.role !== "admin") {
      const isOwner = t.createdBy === Number(session.id);
      const isRejected = t.status === "rejected";
      const isDraft = t.status === "draft";

      if (!isOwner && !isRejected && !isDraft) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (isOwner && !isDraft && !isRejected) {
        return NextResponse.json({ error: "Can only delete draft or rejected content" }, { status: 400 });
      }
    }

    await sql`DELETE FROM topics WHERE id = ${topicId}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/staff/topics/[id]]", error);
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}
