import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user preferences from database
    const [user] = await db
      .select({
        audioMuted: users.audioMuted,
      })
      .from(users)
      .where(eq(users.id, session.id));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Return preferences
    return NextResponse.json({
      audioMuted: user.audioMuted,
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { audioMuted } = body;

    // 3. Validate audioMuted is boolean
    if (typeof audioMuted !== "boolean") {
      return NextResponse.json(
        { error: "audioMuted must be a boolean" },
        { status: 400 }
      );
    }

    // 4. Update user preferences
    const [updated] = await db
      .update(users)
      .set({
        audioMuted,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.id))
      .returning({
        audioMuted: users.audioMuted,
      });

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 5. Return updated preferences
    return NextResponse.json({
      audioMuted: updated.audioMuted,
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
