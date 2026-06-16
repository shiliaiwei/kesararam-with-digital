import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, sql } from "@/lib/db";
import { topics, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Admin-only: delete any topic regardless of status (unless inserted by staff and approved by admin)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const topicId = parseInt(id);

    const existing = await db
      .select({
        id: topics.id,
        status: topics.status,
        createdBy: topics.createdBy,
        approvedBy: topics.approvedBy,
      })
      .from(topics)
      .where(eq(topics.id, topicId));

    if (!existing[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const topic = existing[0];
    if (topic.createdBy) {
      const creator = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, topic.createdBy))
        .then((r) => r[0]);

      if (
        creator?.role === "staff" &&
        (topic.status === "approved" || topic.approvedBy !== null)
      ) {
        return NextResponse.json(
          { error: "Cannot delete topics created by staff and approved by admin" },
          { status: 400 }
        );
      }
    }

    await sql`DELETE FROM topics WHERE id = ${topicId}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/topics/[id]]", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// Admin-only: edit any topic regardless of status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const topicId = parseInt(id);
    const existing = await db.select().from(topics).where(eq(topics.id, topicId));
    if (!existing[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const t = existing[0];
    const body = await req.json();
    const {
      topicCode, categoryId, nameEn, nameKm,
      descriptionEn, descriptionKm,
      primaryImageUrl, primaryImageSource,
      lawReference, subGroup,
      audioUrlEn, audioSourceEn,
      audioUrlKm, audioSourceKm,
      status: topicStatus,
    } = body;

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
        status = ${topicStatus || t.status},
        updated_at = NOW()
      WHERE id = ${topicId}
      RETURNING *
    `;
    return NextResponse.json({ topic: result[0] });
  } catch (error: unknown) {
    console.error("[PUT /api/admin/topics/[id]]", error);
    const e = error as { code?: string };
    if (e.code === "23505") return NextResponse.json({ error: "Topic code already exists" }, { status: 400 });
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
