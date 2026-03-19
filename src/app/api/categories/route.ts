import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const activeCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder);

    return NextResponse.json(activeCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
