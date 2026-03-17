import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

function canAccess(role: string) {
  return role === "staff" || role === "admin";
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !canAccess(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const categorySlug = req.nextUrl.searchParams.get("category");

  try {
    // Find category id from slug
    let items;
    if (categorySlug) {
      const cat = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
      if (!cat.length) return NextResponse.json({ items: [] });
      items = await db.select().from(contentItems).where(eq(contentItems.categoryId, cat[0].id));
    } else {
      items = await db.select().from(contentItems);
    }
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canAccess(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { categorySlug, ...rest } = body;

    // Resolve category id
    let categoryId = rest.categoryId;
    if (categorySlug) {
      const cat = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
      if (cat.length) categoryId = cat[0].id;
    }

    const [created] = await db.insert(contentItems).values({
      ...rest,
      categoryId,
      createdBy: session.id,
    }).returning();

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
