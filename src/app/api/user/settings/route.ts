import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, inviteCodes } from "@/db/schema";
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
      isProfilePublic: user.isProfilePublic ?? true,
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

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { displayName, avatar, audioMuted, schoolName, province, gradeLevel, section, isProfilePublic, inviteCode } = body;

    const updates: Record<string, any> = {
      displayName: displayName || currentUser.displayName || currentUser.username,
      avatar: avatar || currentUser.avatar,
      audioMuted: audioMuted !== undefined ? audioMuted : currentUser.audioMuted,
      schoolName: schoolName || currentUser.schoolName,
      province: province || currentUser.province,
      isProfilePublic: isProfilePublic !== undefined ? isProfilePublic : currentUser.isProfilePublic,
      updatedAt: new Date(),
    };

    if (session.role === "student") {
      updates.gradeLevel = gradeLevel || currentUser.gradeLevel;
      updates.section = section || currentUser.section;
    }

    // Check if this is an onboarding student (missing school details)
    const isOnboarding = session.role === "student" && (!currentUser.schoolName || !currentUser.province || !currentUser.gradeLevel);

    if (isOnboarding) {
      const inputCode = inviteCode || body.inviteCode;
      if (!inputCode) {
        return NextResponse.json({ error: "Teacher invitation code is required." }, { status: 400 });
      }

      // Validate invite code
      const [codeRecord] = await db
        .select()
        .from(inviteCodes)
        .where(eq(inviteCodes.code, inputCode.trim()))
        .limit(1);

      if (!codeRecord) {
        return NextResponse.json({ error: "Invalid invitation code." }, { status: 400 });
      }

      if (codeRecord.isUsed) {
        return NextResponse.json({ error: "This invitation code has already been used." }, { status: 400 });
      }

      // Run profile update & invite code consumption inside database transaction
      const updatedUser = await db.transaction(async (tx) => {
        const [u] = await tx
          .update(users)
          .set({
            ...updates,
            // Override with updated onboarding fields explicitly to ensure they are set
            schoolName,
            province,
            gradeLevel,
            section: section || null,
          })
          .where(eq(users.id, session.id))
          .returning();

        await tx
          .update(inviteCodes)
          .set({
            isUsed: true,
            usedById: session.id,
            usedAt: new Date(),
          })
          .where(eq(inviteCodes.id, codeRecord.id));

        return u;
      });

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
    }

    // Standard settings update (non-onboarding)
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.id))
      .returning();

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
