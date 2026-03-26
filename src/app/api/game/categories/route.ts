import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.sortOrder);

  return NextResponse.json({ categories: rows });
}
