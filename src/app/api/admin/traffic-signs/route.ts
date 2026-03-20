import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trafficSigns, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET /api/admin/traffic-signs - Admin: Get all signs with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let query = db
      .select({
        sign: trafficSigns,
        creator: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
      .from(trafficSigns)
      .leftJoin(users, eq(trafficSigns.createdBy, users.id))
      .orderBy(desc(trafficSigns.createdAt));

    const results = await query;

    let filtered = results;
    if (status) {
      filtered = results.filter((r) => r.sign.status === status);
    }

    return NextResponse.json({ signs: filtered });
  } catch (error) {
    console.error("Error fetching traffic signs:", error);
    return NextResponse.json(
      { error: "Failed to fetch traffic signs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/traffic-signs - Admin/Staff: Create new sign
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["admin", "staff"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      titleEn,
      titleKm,
      descriptionEn,
      descriptionKm,
      imageUrl,
      audioUrlEn,
      audioUrlKm,
      signType,
      category,
    } = body;

    // Validation
    if (!titleEn || !titleKm || !descriptionEn || !descriptionKm || !imageUrl || !signType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newSign] = await db
      .insert(trafficSigns)
      .values({
        titleEn,
        titleKm,
        descriptionEn,
        descriptionKm,
        imageUrl,
        audioUrlEn: audioUrlEn || null,
        audioUrlKm: audioUrlKm || null,
        signType,
        category: category || null,
        status: "pending",
        isActive: false,
        createdBy: session.id,
      })
      .returning();

    return NextResponse.json({ sign: newSign }, { status: 201 });
  } catch (error) {
    console.error("Error creating traffic sign:", error);
    return NextResponse.json(
      { error: "Failed to create traffic sign" },
      { status: 500 }
    );
  }
}
