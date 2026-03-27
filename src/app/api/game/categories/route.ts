import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  // Allow both authenticated and non-authenticated users to get categories
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.sortOrder);

  return NextResponse.json({ categories: rows });
}
