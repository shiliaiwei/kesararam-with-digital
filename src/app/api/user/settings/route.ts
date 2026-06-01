import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET /api/user/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user settings
    const settings = {
      displayName: user.displayName || user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      audioMuted: user.audioMuted || false,
      schoolName: user.schoolName || "",
      province: user.province || "",
      gradeLevel: user.gradeLevel || "",
      section: user.section || "",
      language: "en", // Default, can be stored in user table
      theme: "light", // Default, can be stored in user table
      notifications: {
        email: true,
        push: true,
        contentApproved: true,
        contentRejected: true,
        newAssignments: true,
      },
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/user/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, avatar, audioMuted, schoolName, province, gradeLevel, section } = body;

    const updates: Record<string, any> = {
      displayName: displayName || null,
      avatar: avatar || null,
      audioMuted: audioMuted || false,
      schoolName: schoolName || null,
      province: province || null,
      updatedAt: new Date(),
    };

    if (session.role === "student") {
      updates.gradeLevel = gradeLevel || null;
      updates.section = section || null;
    }

    // Update user settings
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      user: {
        displayName: updatedUser.displayName,
        avatar: updatedUser.avatar,
        audioMuted: updatedUser.audioMuted,
        schoolName: updatedUser.schoolName,
        province: updatedUser.province,
        gradeLevel: updatedUser.gradeLevel,
        section: updatedUser.section,
      }
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
