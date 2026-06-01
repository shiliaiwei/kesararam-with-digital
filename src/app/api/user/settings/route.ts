import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, classes, classEnrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
      username: user.username,
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
    const { displayName, username, email, avatar, audioMuted, schoolName, province, gradeLevel, section, isProfilePublic, inviteCode } = body;

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

    // 4. Username Update, Cooldown (1 year) & Uniqueness Validation
    if (username !== undefined && username !== currentUser.username) {
      const usernameClean = username.trim().toLowerCase();
      if (!usernameClean || usernameClean.length < 3 || !/^[a-zA-Z0-9_]+$/.test(usernameClean)) {
        return NextResponse.json({
          error: "Username must be at least 3 characters long and contain only letters, numbers, and underscores. / ឈ្មោះគណនីត្រូវតែមានយ៉ាងហោចណាស់ ៣ តួអក្សរ និងអាចប្រើបានតែអក្សរ លេខ និងសញ្ញាគូសក្រោមប៉ុណ្ណោះ។"
        }, { status: 400 });
      }

      // Check duplicate username
      const [existingUsernameUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, usernameClean))
        .limit(1);

      if (existingUsernameUser && existingUsernameUser.id !== session.id) {
        return NextResponse.json({
          error: "This username is already taken by another account. / ឈ្មោះគណនីនេះត្រូវបានប្រើប្រាស់ដោយគណនីផ្សេងរួចហើយ។"
        }, { status: 400 });
      }

      // Check 1-Year Cooldown
      if (currentUser.usernameChangedAt) {
        const usernameAgeMs = Date.now() - new Date(currentUser.usernameChangedAt).getTime();
        const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
        if (usernameAgeMs < ONE_YEAR) {
          const daysLeft = Math.ceil((ONE_YEAR - usernameAgeMs) / (24 * 60 * 60 * 1000));
          return NextResponse.json({
            error: `You can only change your username once every 1 year (${daysLeft} days remaining). / អ្នកអាចផ្លាស់ប្តូរឈ្មោះគណនីបានតែម្តងគត់ក្នុងរយៈពេល ១ ឆ្នាំ (នៅសល់ ${daysLeft} ថ្ងៃ)។`
          }, { status: 400 });
        }
      }

      updates.username = usernameClean;
      updates.usernameChangedAt = new Date();
    }

    if (isOnboarding) {
      const inputCode = inviteCode || body.inviteCode;
      if (!inputCode) {
        return NextResponse.json({ error: "Teacher invitation code / Class code is required. / លេខកូដអញ្ជើញពីគ្រូ ឬលេខកូដថ្នាក់គឺចាំបាច់ត្រូវបំពេញ។" }, { status: 400 });
      }

      // Validate class code
      const [classRecord] = await db
        .select()
        .from(classes)
        .where(eq(classes.code, inputCode.trim()))
        .limit(1);

      if (!classRecord) {
        return NextResponse.json({ error: "Class not found. Invalid teacher invitation code. / រកមិនឃើញថ្នាក់រៀននេះទេ។ លេខកូដអញ្ជើញពីគ្រូមិនត្រឹមត្រូវឡើយ។" }, { status: 400 });
      }

      // Run profile update & class auto-join enrollment inside database transaction
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

        // Check if student already enrolled in this class to avoid duplicates
        const [existingEnrollment] = await tx
          .select()
          .from(classEnrollments)
          .where(
            and(
              eq(classEnrollments.classId, classRecord.id),
              eq(classEnrollments.studentId, session.id)
            )
          )
          .limit(1);

        if (!existingEnrollment) {
          await tx.insert(classEnrollments).values({
            classId: classRecord.id,
            studentId: session.id,
            enrolledBy: classRecord.teacherId,
            enrolledAt: new Date(),
          });
        }

        return u;
      });

      return NextResponse.json({ 
        success: true,
        user: {
          displayName: updatedUser.displayName,
          username: updatedUser.username,
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
        username: updatedUser.username,
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
