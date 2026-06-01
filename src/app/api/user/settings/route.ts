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
      createdAt: user.createdAt.toISOString(),
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
    const { displayName, email, avatar, audioMuted, schoolName, province, gradeLevel, section, isProfilePublic, inviteCode } = body;

    // Check if this is an onboarding student (missing school details)
    const isOnboarding = session.role === "student" && (!currentUser.schoolName || !currentUser.province || !currentUser.gradeLevel);

    // 1. 60-Day Cooldown Gate for non-onboarding updates
    if (!isOnboarding) {
      const accountAgeMs = Date.now() - new Date(currentUser.createdAt).getTime();
      const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
      if (accountAgeMs < SIXTY_DAYS) {
        const daysLeft = Math.ceil((SIXTY_DAYS - accountAgeMs) / (24 * 60 * 60 * 1000));
        return NextResponse.json({
          error: `For security, you must wait at least 60 days after signing up before you can modify your profile settings or email (${daysLeft} days remaining). For any trouble, contact admin at kesararamwithdigital@gmail.com. / ដើម្បីសុវត្ថិភាព អ្នកត្រូវរង់ចាំយ៉ាងហោចណាស់ ៦០ ថ្ងៃ បន្ទាប់ពីចុះឈ្មោះ មុននឹងកែប្រែព័ត៌មានគណនី ឬអ៊ីមែល (នៅសល់ ${daysLeft} ថ្ងៃ)។ បើមានបញ្ហាសូមទាក់ទងមកកាន់ kesararamwithdigital@gmail.com ។`
        }, { status: 400 });
      }
    }

    // 2. Locked Fields Check for students post-onboarding
    if (!isOnboarding && currentUser.role === "student" && currentUser.schoolName) {
      if (
        (schoolName !== undefined && schoolName !== currentUser.schoolName) ||
        (province !== undefined && province !== currentUser.province) ||
        (gradeLevel !== undefined && gradeLevel !== currentUser.gradeLevel) ||
        (section !== undefined && section !== currentUser.section)
      ) {
        return NextResponse.json({
          error: "School and grade details are locked once onboarding is complete. Only Administrators can make changes. / ព័ត៌មានសាលារៀន និងកម្រិតថ្នាក់ត្រូវបានចាក់សោបន្ទាប់ពីការបំពេញព័ត៌មានដំបូងរួចរាល់។ មានតែអ្នកគ្រប់គ្រងប្រព័ន្ធប៉ុណ្ណោះដែលអាចផ្លាស់ប្តូរបាន។"
        }, { status: 400 });
      }
    }

    const updates: Record<string, any> = {
      displayName: displayName !== undefined ? (displayName || currentUser.username) : (currentUser.displayName || currentUser.username),
      avatar: avatar !== undefined ? avatar : currentUser.avatar,
      audioMuted: audioMuted !== undefined ? audioMuted : currentUser.audioMuted,
      schoolName: schoolName !== undefined ? schoolName : currentUser.schoolName,
      province: province !== undefined ? province : currentUser.province,
      isProfilePublic: isProfilePublic !== undefined ? isProfilePublic : currentUser.isProfilePublic,
      updatedAt: new Date(),
    };

    if (session.role === "student") {
      updates.gradeLevel = gradeLevel !== undefined ? gradeLevel : currentUser.gradeLevel;
      updates.section = section !== undefined ? section : currentUser.section;
    }

    // 3. Email Update & Uniqueness Validation
    if (email !== undefined && email !== currentUser.email) {
      const emailTrimmed = email.trim().toLowerCase();
      if (!emailTrimmed || !emailTrimmed.includes("@")) {
        return NextResponse.json({
          error: "Please enter a valid email address. / សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលមានសុពលភាព។"
        }, { status: 400 });
      }

      const [existingEmailUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, emailTrimmed))
        .limit(1);

      if (existingEmailUser && existingEmailUser.id !== session.id) {
        return NextResponse.json({
          error: "This email is already registered by another account. / អ៊ីមែលនេះត្រូវបានចុះឈ្មោះដោយគណនីផ្សេងរួចហើយ។"
        }, { status: 400 });
      }

      updates.email = emailTrimmed;
    }

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
          email: updatedUser.email,
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
        email: updatedUser.email,
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
