import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { topics, trafficSigns } from "@/db/schema";
import { eq, ne, and, isNotNull, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.id || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const exclude = searchParams.get("exclude") || "";

        let images: string[] = [];

        // Try traffic signs first (road-sign & priority categories have these)
        try {
            const signs = await db
                .select({ imageUrl: trafficSigns.imageUrl })
                .from(trafficSigns)
                .where(
                    and(
                        isNotNull(trafficSigns.imageUrl),
                        exclude ? ne(trafficSigns.imageUrl, exclude) : undefined
                    )
                )
                .orderBy(sql`RANDOM()`)
                .limit(6);

            images = signs.map(s => s.imageUrl).filter(Boolean) as string[];
        } catch { }

        // Fallback: use other topic images from same category
        if (images.length < 3 && categoryId) {
            try {
                const topicImgs = await db
                    .select({ imageUrl: topics.primaryImageUrl })
                    .from(topics)
                    .where(
                        and(
                            eq(topics.categoryId, parseInt(categoryId)),
                            isNotNull(topics.primaryImageUrl),
                            exclude ? ne(topics.primaryImageUrl, exclude) : undefined
                        )
                    )
                    .orderBy(sql`RANDOM()`)
                    .limit(6);

                const extra = topicImgs.map(t => t.imageUrl).filter(Boolean) as string[];
                images = [...images, ...extra].slice(0, 6);
            } catch { }
        }

        return NextResponse.json({ images: images.slice(0, 6) });
    } catch (error) {
        console.error("[GET /api/admin/distractor-images]", error);
        return NextResponse.json({ images: [] });
    }
}
