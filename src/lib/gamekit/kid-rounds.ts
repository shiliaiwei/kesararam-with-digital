/**
 * Server helper: build rounds for the arcade-style kid games from DB sign topics.
 * Pulls published road-sign topics (category 1) with images + bilingual names.
 */

import { db } from "@/lib/db";
import { sql, and, eq, isNotNull } from "drizzle-orm";
import { topics } from "@/db/schema/content";

export interface SignItem {
    id: number;
    nameEn: string;
    nameKm: string;
    imageUrl: string;
}

const ROAD_SIGN_CATEGORY_ID = 1;

/** Fetch N random published road-sign topics that have an image. */
export async function getSignItems(count: number): Promise<SignItem[]> {
    const rows = await db
        .select({
            id: topics.id,
            nameEn: topics.nameEn,
            nameKm: topics.nameKm,
            imageUrl: topics.primaryImageUrl,
        })
        .from(topics)
        .where(
            and(
                eq(topics.categoryId, ROAD_SIGN_CATEGORY_ID),
                eq(topics.status, "published"),
                isNotNull(topics.primaryImageUrl)
            )
        )
        .orderBy(sql`RANDOM()`)
        .limit(Math.max(1, Math.min(count, 40)));

    return rows
        .filter((r): r is SignItem => !!r.imageUrl)
        .map((r) => ({
            id: r.id,
            nameEn: r.nameEn,
            nameKm: r.nameKm,
            imageUrl: r.imageUrl,
        }));
}
