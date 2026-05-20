import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { topics, categories, users } from "@/db/schema";
import { eq, desc, ilike, and, or, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.id || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conditions: any[] = [];

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

        const rows = await db
            .select({
                id: topics.id,
                topicCode: topics.topicCode,
                categoryId: topics.categoryId,
                nameEn: topics.nameEn,
                nameKm: topics.nameKm,
                primaryImageUrl: topics.primaryImageUrl,
                subGroup: topics.subGroup,
                status: topics.status,
                createdAt: topics.createdAt,
                categoryName: categories.titleEn,
                categorySlug: categories.slug,
                creatorName: users.displayName,
            })
            .from(topics)
            .leftJoin(categories, eq(topics.categoryId, categories.id))
            .leftJoin(users, eq(topics.createdBy, users.id))
            .where(where)
            .orderBy(categories.sortOrder, topics.sortOrder, topics.nameEn);

        return NextResponse.json({
            topics: rows,
            total: rows.length,
        });
    } catch (error) {
        console.error("[GET /api/admin/topics]", error);
        return NextResponse.json({ error: "Failed to fetch topics", topics: [] }, { status: 500 });
    }
}
