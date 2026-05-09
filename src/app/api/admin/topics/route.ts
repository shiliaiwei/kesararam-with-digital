import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.id || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const categoryId = searchParams.get("categoryId");

        let query = `
            SELECT 
                t.id,
                t.topic_code as "topicCode",
                t.name_en as "nameEn",
                t.name_km as "nameKm",
                t.category_id as "categoryId",
                c.title_en as "categoryName",
                c.slug as "categorySlug",
                t.status,
                t.sub_group as "subGroup",
                t.created_at as "createdAt"
            FROM topics t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ` AND t.status = $${params.length + 1}`;
            params.push(status);
        }

        if (categoryId) {
            query += ` AND t.category_id = $${params.length + 1}`;
            params.push(Number(categoryId));
        }

        query += ` ORDER BY c.sort_order ASC, t.sort_order ASC, t.name_en ASC`;

        const topics = await sql.unsafe(query, params);

        return NextResponse.json({
            topics: Array.isArray(topics) ? topics : [],
            total: Array.isArray(topics) ? topics.length : 0
        });
    } catch (error) {
        console.error("[GET /api/admin/topics]", error);
        return NextResponse.json({
            error: "Failed to fetch topics",
            topics: []
        }, { status: 500 });
    }
}
