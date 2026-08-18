import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, staffActivityMetrics } from "@/db/schema/content";
import { eq, and, desc, sql, or, like } from "drizzle-orm";
import { z } from "zod";

const contentSchema = z.object({
  categoryId: z.union([z.string(), z.number()]).transform(v => parseInt(String(v))),
  type: z.string().min(1),
  titleEn: z.string().min(1),
  titleKm: z.string().optional().default(""),
  descriptionEn: z.string().optional().default(""),
  descriptionKm: z.string().optional().default(""),
  imageUrl: z.string().optional().nullable(),
  audioUrlEn: z.string().optional().nullable(),
  audioUrlKm: z.string().optional().nullable(),
  questionEn: z.string().optional().default(""),
  questionKm: z.string().optional().default(""),
  answerEn: z.string().optional().default(""),
  answerKm: z.string().optional().default(""),
  scorePoints: z.number().optional().default(10),
  timeLimit: z.number().optional().default(30),
  difficulty: z.string().optional().nullable(),
  subtopic: z.string().optional().nullable(),
  sortOrder: z.number().optional().default(0),
  videoUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  brandUrl: z.string().optional().nullable(),
  resourceType: z.string().optional().default("qa"),
  tags: z.array(z.string()).optional().default([]),
  metadata: z.any().optional().nullable(),
});

// GET /api/staff/content - List staff's own content
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions: any[] = [eq(contentItems.createdBy, session.id)];
    
    if (status) {
      conditions.push(eq(contentItems.status, status));
    }
    
    if (categoryId) {
      conditions.push(eq(contentItems.categoryId, parseInt(categoryId)));
    }
    
    if (search) {
      const searchCond = or(
        like(contentItems.titleEn, `%${search}%`),
        like(contentItems.titleKm, `%${search}%`),
        like(contentItems.questionEn, `%${search}%`)
      );
      if (searchCond) conditions.push(searchCond);
    }

    // Fetch content
    const content = await db
      .select()
      .from(contentItems)
      .where(and(...conditions))
      .orderBy(desc(contentItems.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentItems)
      .where(and(...conditions));
    
    const totalCount = countResult[0]?.count || 0;

    return NextResponse.json({
      content: content || [],
      pagination: {
        page,
        limit,
        total: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch content",
        content: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/staff/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = contentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const data = result.data;

    // Create content
    const [newContent] = await db
      .insert(contentItems)
      .values({
        categoryId: data.categoryId,
        type: data.type,
        status: "pending",
        titleEn: data.titleEn,
        titleKm: data.titleKm,
        descriptionEn: data.descriptionEn,
        descriptionKm: data.descriptionKm,
        imageUrl: data.imageUrl,
        audioUrlEn: data.audioUrlEn,
        audioUrlKm: data.audioUrlKm,
        questionEn: data.questionEn,
        questionKm: data.questionKm,
        answerEn: data.answerEn,
        answerKm: data.answerKm,
        scorePoints: data.scorePoints,
        timeLimit: data.timeLimit,
        difficulty: data.difficulty,
        subtopic: data.subtopic,
        sortOrder: data.sortOrder,
        isActive: false,
        createdBy: session.id,
      })
      .returning();

    // Log activity
    await db.insert(staffActivityMetrics).values({
      staffId: session.id,
      actionType: "create",
      contentId: newContent.id,
      categoryId: data.categoryId,
      metadata: JSON.stringify({ type: data.type, titleEn: data.titleEn }),
    });

    return NextResponse.json({ content: newContent }, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}
