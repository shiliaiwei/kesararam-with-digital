import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, classes, classEnrollments, inviteCodes } from "@/db/schema";
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

    const profileEditUnlockedUntil = user.profileEditUnlockedUntil
      ? user.profileEditUnlockedUntil.toISOString()
      : null;
    const profileEditUnlocked = user.profileEditUnlockedUntil
      ? user.profileEditUnlockedUntil.getTime() > Date.now()
      : false;

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
      isProfilePublic: user.isProfilePublic ?? true,
      isNamePublic: user.isNamePublic ?? true,
      isUsernamePublic: user.isUsernamePublic ?? true,
      isSchoolPublic: user.isSchoolPublic ?? true,
      isProvincePublic: user.isProvincePublic ?? true,
      isGradePublic: user.isGradePublic ?? true,
      isSectionPublic: user.isSectionPublic ?? true,
      isStatsPublic: user.isStatsPublic ?? true,
      createdAt: user.createdAt.toISOString(),
      usernameChangedAt: user.usernameChangedAt ? user.usernameChangedAt.toISOString() : null,
      displayNameChangedAt: null,
      canChangeNameOnce: user.canChangeNameOnce ?? false,
      profileEditUnlockedUntil,
      profileEditUnlocked,
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
    const { displayName, username, email, avatar, audioMuted, schoolName, province, isProfilePublic, isNamePublic, isUsernamePublic, isSchoolPublic, isProvincePublic, isGradePublic, isSectionPublic, isStatsPublic, inviteCode } = body;

    // Determine if the student currently belongs to any class. A student with no
    // enrollment (never joined, or removed/kicked by a teacher) must (re-)join
    // with a class/invite code — treated as onboarding so they can submit a code
    // even if their school/province/grade are already filled in.
    let studentHasClass = true;
    if (session.role === "student") {
      const enrollment = await db
        .select({ id: classEnrollments.id })
        .from(classEnrollments)
        .where(eq(classEnrollments.studentId, session.id))
        .limit(1);
      studentHasClass = enrollment.length > 0;
    }

    // Onboarding = a user completing their FIRST profile setup. During onboarding
    // the 60-day change cooldown does not apply; it only counts for changes made
    // AFTER the initial setup is complete. This applies to both students and
    // individual paid (teacher) accounts.
    //
    // Student onboarding: missing school details, OR must (re-)join a class and is
    // submitting an invite/class code.
    const isStudentOnboarding =
      session.role === "student" &&
      ((!currentUser.schoolName || !currentUser.province) ||
        (!studentHasClass && !!(inviteCode || body.inviteCode)));

    // Teacher (individual paid subscriber) onboarding: hasn't completed the owner
    // profile setup yet — mirrors the dashboard's "incomplete profile" gate
    // (missing school/organization name or province).
    const isTeacherOnboarding =
      session.role === "teacher" &&
      (!currentUser.schoolName || !currentUser.province);

    const isOnboarding = isStudentOnboarding || isTeacherOnboarding;

    // Detect if this is a privacy-only update (safe, no 60-day restriction)
    const PRIVACY_FIELDS = new Set(['isProfilePublic', 'isNamePublic', 'isUsernamePublic', 'isSchoolPublic', 'isProvincePublic', 'isGradePublic', 'isSectionPublic', 'isStatsPublic']);
    const isPurePrivacyUpdate = Object.keys(body).every(k => PRIVACY_FIELDS.has(k));

    // One-time name/username change allowance. When granted (canChangeNameOnce),
    // the user may change their full name and/or username ONCE, bypassing the
    // 60-day post-signup cooldown — but NOT bundled with an email change. The
    // allowance is consumed below, after which the normal cooldowns resume.
    const wantsDisplayNameChange =
      displayName !== undefined &&
      (displayName || currentUser.username) !== (currentUser.displayName || currentUser.username);
    const wantsUsernameChange =
      username !== undefined && username.trim().toLowerCase() !== currentUser.username;
    const wantsEmailChange =
      email !== undefined && email.trim().toLowerCase() !== currentUser.email;
    const isProfileEditUnlocked =
      currentUser.profileEditUnlockedUntil !== null &&
      new Date(currentUser.profileEditUnlockedUntil).getTime() > Date.now();
    const isOneTimeNameChange =
      !!currentUser.canChangeNameOnce &&
      (wantsDisplayNameChange || wantsUsernameChange) &&
      !wantsEmailChange &&
      !isProfileEditUnlocked;

    // 1. 60-Day Cooldown Gate — only for sensitive field changes, not privacy toggles
    if (!isOnboarding && !isPurePrivacyUpdate && !isOneTimeNameChange && !isProfileEditUnlocked) {
      const accountAgeMs = Date.now() - new Date(currentUser.createdAt).getTime();
      const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
      if (accountAgeMs < SIXTY_DAYS) {
        const daysLeft = Math.ceil((SIXTY_DAYS - accountAgeMs) / (24 * 60 * 60 * 1000));
        return NextResponse.json({
          error: `For security, you must wait at least 60 days after signing up before you can modify your profile settings or email (${daysLeft} days remaining). For any trouble, contact support team at kesararamwithdigital@gmail.com. / ដើម្បីសុវត្ថិភាព អ្នកត្រូវរង់ចាំយ៉ាងហោចណាស់ ៦០ ថ្ងៃ បន្ទាប់ពីចុះឈ្មោះ មុននឹងកែប្រែព័ត៌មានគណនី ឬអ៊ីមែល (នៅសល់ ${daysLeft} ថ្ងៃ)។ បើមានបញ្ហាសូមទាក់ទងមកកាន់ក្រុមការងារគាំទ្រតាមរយៈ kesararamwithdigital@gmail.com ។`
        }, { status: 400 });
      }
    }

    // 2. Locked Fields Check for students post-onboarding
    if (!isOnboarding && !isProfileEditUnlocked && currentUser.role === "student" && currentUser.schoolName) {
      if (
        (schoolName !== undefined && schoolName !== currentUser.schoolName) ||
        (province !== undefined && province !== currentUser.province)
      ) {
        return NextResponse.json({
          error: "School details are locked once onboarding is complete. Only Support Staff can make changes. / ព័ត៌មានសាលារៀនត្រូវបានចាក់សោបន្ទាប់ពីការបំពេញព័ត៌មានដំបូងរួចរាល់។ មានតែក្រុមការងារគាំទ្រប៉ុណ្ណោះដែលអាចផ្លាស់ប្តូរបាន។"
        }, { status: 400 });
      }
    }

    const newDisplayName = displayName !== undefined ? (displayName || currentUser.username) : (currentUser.displayName || currentUser.username);

    const updates: Record<string, any> = {
      displayName: newDisplayName,
      avatar: avatar !== undefined ? avatar : currentUser.avatar,
      audioMuted: audioMuted !== undefined ? audioMuted : currentUser.audioMuted,
      schoolName: schoolName !== undefined ? schoolName : currentUser.schoolName,
      province: province !== undefined ? province : currentUser.province,
      isProfilePublic: isProfilePublic !== undefined ? !!isProfilePublic : (currentUser.isProfilePublic ?? false),
      isNamePublic: isNamePublic !== undefined ? !!isNamePublic : (currentUser.isNamePublic ?? false),
      isUsernamePublic: isUsernamePublic !== undefined ? !!isUsernamePublic : (currentUser.isUsernamePublic ?? false),
      isSchoolPublic: isSchoolPublic !== undefined ? !!isSchoolPublic : (currentUser.isSchoolPublic ?? false),
      isProvincePublic: isProvincePublic !== undefined ? !!isProvincePublic : (currentUser.isProvincePublic ?? false),
      isGradePublic: isGradePublic !== undefined ? !!isGradePublic : (currentUser.isGradePublic ?? false),
      isSectionPublic: isSectionPublic !== undefined ? !!isSectionPublic : (currentUser.isSectionPublic ?? false),
      isStatsPublic: isStatsPublic !== undefined ? !!isStatsPublic : (currentUser.isStatsPublic ?? false),
      updatedAt: new Date(),
    };

    // Consume the one-time allowance once it's actually used for a name/username
    // change, so the normal cooldowns resume from here on.
    if (currentUser.canChangeNameOnce && !isProfileEditUnlocked && (wantsDisplayNameChange || wantsUsernameChange)) {
      updates.canChangeNameOnce = false;
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
      if (!isProfileEditUnlocked && currentUser.usernameChangedAt) {
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



    // Student onboarding also enrolls the student into a class via invite/class
    // code. Teacher onboarding skips this and falls through to the standard
    // update below (which saves school/organization, province, name, avatar).
    if (isStudentOnboarding) {
      const inputCode = (inviteCode || body.inviteCode || "").trim();

      // Class-less onboarding: a student can complete their profile and play
      // solo WITHOUT a teacher invite code. A class link is required only to join
      // a live teacher session (enforced at /api/game/sessions/[code]/join).
      if (!inputCode) {
        const finalSchoolName = schoolName ?? currentUser.schoolName;
        const finalProvince = province ?? currentUser.province;
        if (!finalSchoolName || !finalProvince) {
          return NextResponse.json(
            { error: "School and Province are required. / សូមបំពេញ សាលារៀន និងខេត្ត។" },
            { status: 400 }
          );
        }
        // Fall through to the standard settings update below (no class enrollment).
      } else {
      const trimmedCode = inputCode;
      let targetClassId: number | null = null;
      let isInviteCodeTableMatch = false;
      let teacherIdToEnroll: number | null = null;

      // 1. Try to find in invite_codes first
      const [inviteCodeRecord] = await db
        .select()
        .from(inviteCodes)
        .where(eq(inviteCodes.code, trimmedCode))
        .limit(1);

      if (inviteCodeRecord) {
        if (inviteCodeRecord.isUsed) {
          return NextResponse.json({ error: "This invitation code has already been used. / លេខកូដអញ្ជើញនេះត្រូវបានប្រើប្រាស់រួចហើយ។" }, { status: 400 });
        }
        isInviteCodeTableMatch = true;
        teacherIdToEnroll = inviteCodeRecord.teacherId;

        if (inviteCodeRecord.classId) {
          targetClassId = inviteCodeRecord.classId;
        } else {
          // Fallback: find the teacher's first class
          const [firstClass] = await db
            .select()
            .from(classes)
            .where(eq(classes.teacherId, inviteCodeRecord.teacherId))
            .limit(1);
          if (firstClass) {
            targetClassId = firstClass.id;
          }
        }
      } else {
        // 2. Fallback: try classes.code directly
        const [classRecord] = await db
          .select()
          .from(classes)
          .where(eq(classes.code, trimmedCode))
          .limit(1);

        if (classRecord) {
          targetClassId = classRecord.id;
          teacherIdToEnroll = classRecord.teacherId;
        }
      }

      if (!targetClassId) {
        return NextResponse.json({ error: "Invalid invitation code or class code. / លេខកូដអញ្ជើញ ឬកូដថ្នាក់រៀនមិនត្រឹមត្រូវឡើយ។" }, { status: 400 });
      }

      // Fetch class details to inherit school, province, grade, section
      const [classDetails] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, targetClassId))
        .limit(1);

      if (classDetails) {
        if (classDetails.status === "locked") {
          return NextResponse.json({ error: "This class is locked. New students cannot join. / ថ្នាក់រៀននេះត្រូវបានចាក់សោ។ សិស្សថ្មីមិនអាចចូលរួមបានទេ។" }, { status: 400 });
        }
        if (classDetails.status === "archived") {
          return NextResponse.json({ error: "This class has been archived. / ថ្នាក់រៀននេះត្រូវបានរក្សាទុកក្នុងប័ណ្ណសារហើយ។" }, { status: 400 });
        }
      }

      const finalSchoolName = classDetails?.schoolName || schoolName || currentUser.schoolName;
      const finalProvince = classDetails?.province || province || currentUser.province;

      // Neon HTTP driver does not support transactions; perform writes sequentially.
      // Grade/section live on the class now, not the student — enrollment links them.
      const [updatedUser] = await db
        .update(users)
        .set({
          ...updates,
          schoolName: finalSchoolName,
          province: finalProvince,
        })
        .where(eq(users.id, session.id))
        .returning();

      // Enforce single-class active enrollment policy
      // Delete any other active class enrollments for this student to ensure they can only be in one class at a time
      await db.delete(classEnrollments).where(eq(classEnrollments.studentId, session.id));

      await db.insert(classEnrollments).values({
        classId: targetClassId!,
        studentId: session.id,
        enrolledBy: teacherIdToEnroll || session.id,
        enrolledAt: new Date(),
      });

      // Mark invite code as used in the database
      if (isInviteCodeTableMatch) {
        await db
          .update(inviteCodes)
          .set({
            isUsed: true,
            usedById: session.id,
            usedAt: new Date(),
          })
          .where(eq(inviteCodes.code, trimmedCode));
      }

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
          isNamePublic: updatedUser.isNamePublic,
          isUsernamePublic: updatedUser.isUsernamePublic,
          isSchoolPublic: updatedUser.isSchoolPublic,
          isProvincePublic: updatedUser.isProvincePublic,
          isGradePublic: updatedUser.isGradePublic,
          isSectionPublic: updatedUser.isSectionPublic,
          isStatsPublic: updatedUser.isStatsPublic,
        }
      });
      }
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
        isNamePublic: updatedUser.isNamePublic,
        isUsernamePublic: updatedUser.isUsernamePublic,
        isSchoolPublic: updatedUser.isSchoolPublic,
        isProvincePublic: updatedUser.isProvincePublic,
        isGradePublic: updatedUser.isGradePublic,
        isSectionPublic: updatedUser.isSectionPublic,
        isStatsPublic: updatedUser.isStatsPublic,
      }
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
