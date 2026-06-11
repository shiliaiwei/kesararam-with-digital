"use server";

import { db } from "@/lib/db";
import { users, classes, classEnrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/db/queries/audit";
import { headers } from "next/headers";

export interface VerificationDetails {
  school: { student: string; class: string; match: boolean };
  province: { student: string; class: string; match: boolean };
  grade: { student: string; class: string; match: boolean };
}

export async function assignStudentAction(classId: number, username: string) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    return { error: "Unauthorized" };
  }

  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) return { error: "Username is required." };

  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // 1. Get the class
    const [cls] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
    if (!cls) return { error: "Class not found." };

    // Ensure teacher owns this class (unless admin)
    if (session.role === "teacher" && cls.teacherId !== session.id) {
      return { error: "You do not own this class." };
    }

    // Check if class is locked
    if (cls.status === "locked") {
      return { error: "This class is locked. Unlock it to add students." };
    }

    // 2. Find the student
    const [student] = await db
      .select()
      .from(users)
      .where(eq(users.username, cleanUsername))
      .limit(1);

    if (!student) {
      return { error: `Student username "${cleanUsername}" not found.` };
    }

    if (student.role !== "student") {
      return { error: `User "${cleanUsername}" is a ${student.role}, not a student.` };
    }

    // 3. Match rules (exact case-insensitive string comparisons)
    const schoolMatch = (student.schoolName || "").trim().toLowerCase() === (cls.schoolName || "").trim().toLowerCase();
    const provinceMatch = (student.province || "").trim().toLowerCase() === (cls.province || "").trim().toLowerCase();
    const gradeMatch = (student.gradeLevel || "").trim() === (cls.gradeLevel || "").trim();

    const isMatch = schoolMatch && provinceMatch && gradeMatch;

    if (!isMatch) {
      return {
        error: "Verification failed. Student details do not match the classroom rules.",
        details: {
          school: { student: student.schoolName ?? "—", class: cls.schoolName ?? "—", match: schoolMatch },
          province: { student: student.province ?? "—", class: cls.province ?? "—", match: provinceMatch },
          grade: { student: student.gradeLevel ?? "—", class: cls.gradeLevel ?? "—", match: gradeMatch }
        } as VerificationDetails
      };
    }

    // 4. Check if already enrolled in this class
    const [existing] = await db
      .select()
      .from(classEnrollments)
      .where(and(eq(classEnrollments.classId, classId), eq(classEnrollments.studentId, student.id)))
      .limit(1);

    if (existing) {
      return { error: "Student is already enrolled in this class." };
    }

    // 5. Single-class policy: a student may only belong to ONE class.
    // Only add the student if they have NO class yet. Teachers cannot pull a
    // student out of another teacher's class — the student must be removed
    // there first (or use a teacher-provided join code to switch).
    const [otherEnrollment] = await db
      .select({
        classId: classEnrollments.classId,
        className: classes.name,
      })
      .from(classEnrollments)
      .innerJoin(classes, eq(classEnrollments.classId, classes.id))
      .where(eq(classEnrollments.studentId, student.id))
      .limit(1);

    if (otherEnrollment) {
      return {
        error: `Student already belongs to another class ("${otherEnrollment.className}"). A student can only be in one class. Remove them from that class first.`,
      };
    }

    // 6. Enroll student
    await db.insert(classEnrollments).values({
      classId,
      studentId: student.id,
      enrolledBy: session.id,
    });

    // 7. Audit log enrollment
    await logAudit({
      userId: session.id,
      action: "ENROLL_STUDENT",
      targetType: "class",
      targetId: String(classId),
      ipAddress,
      userAgent,
      details: { studentId: student.id, username: student.username, enrolledBy: session.id }
    });

    revalidatePath(`/teacher/classes/${classId}`);
    return { success: true, name: student.displayName || student.username };
  } catch (e: any) {
    console.error("[assignStudentAction] error:", e);
    return { error: "Failed to assign student." };
  }
}

export async function removeStudentAction(classId: number, studentId: number) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    return { error: "Unauthorized" };
  }

  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const [cls] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
    if (!cls) return { error: "Class not found." };

    if (session.role === "teacher" && cls.teacherId !== session.id) {
      return { error: "You do not own this class." };
    }

    await db
      .delete(classEnrollments)
      .where(and(eq(classEnrollments.classId, classId), eq(classEnrollments.studentId, studentId)));

    // Audit log removal
    await logAudit({
      userId: session.id,
      action: "DISENROLL_STUDENT",
      targetType: "class",
      targetId: String(classId),
      ipAddress,
      userAgent,
      details: { studentId, disenrolledBy: session.id }
    });

    revalidatePath(`/teacher/classes/${classId}`);
    return { success: true };
  } catch (e) {
    console.error("[removeStudentAction] error:", e);
    return { error: "Failed to remove student." };
  }
}

export async function updateClassControlAction(classId: number, field: "status" | "code", value: string) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    return { error: "Unauthorized" };
  }

  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const [cls] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
    if (!cls) return { error: "Class not found." };

    if (session.role === "teacher" && cls.teacherId !== session.id) {
      return { error: "You do not own this class." };
    }

    const updates: Record<string, any> = {};
    let auditAction = "";

    if (field === "status") {
      if (value !== "active" && value !== "locked" && value !== "archived") {
        return { error: "Invalid status value." };
      }
      updates.status = value;
      auditAction = `CLASS_${value.toUpperCase()}`;
    } else if (field === "code") {
      // Regenerate code (6 uppercase alphanumeric)
      updates.code = Math.random()
        .toString(36)
        .toUpperCase()
        .slice(2, 8)
        .padEnd(6, "0");
      auditAction = "CLASS_CODE_REGENERATED";
    }

    await db.update(classes).set(updates).where(eq(classes.id, classId));

    // Audit log class controls
    await logAudit({
      userId: session.id,
      action: auditAction,
      targetType: "class",
      targetId: String(classId),
      ipAddress,
      userAgent,
      details: { field, value: updates.status ?? updates.code, updatedBy: session.id }
    });

    revalidatePath(`/teacher/classes/${classId}`);
    revalidatePath("/teacher/classes");
    return { success: true, updates };
  } catch (e) {
    console.error("[updateClassControlAction] error:", e);
    return { error: "Failed to update class." };
  }
}

export async function updateClassDetailsAction(
  classId: number,
  details: { name?: string; gradeLevel?: string; schoolName?: string; province?: string; section?: string }
) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    return { error: "Unauthorized" };
  }

  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const [cls] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
    if (!cls) return { error: "Class not found." };

    if (session.role === "teacher" && cls.teacherId !== session.id) {
      return { error: "You do not own this class." };
    }

    const updates: Record<string, string> = {};
    const name = details.name?.trim();
    const gradeLevel = details.gradeLevel?.trim();
    const schoolName = details.schoolName?.trim();
    const province = details.province?.trim();
    const section = details.section?.trim();

    // Maximum number of times a teacher may rename a class.
    const MAX_NAME_CHANGES = 2;
    let bumpNameCount = false;

    if (name !== undefined && name !== cls.name) {
      if (name.length < 1 || name.length > 80) {
        return { error: "Class name must be 1–80 characters." };
      }
      // Teachers are limited to MAX_NAME_CHANGES renames; admins are exempt.
      if (session.role !== "admin" && (cls.nameChangedCount ?? 0) >= MAX_NAME_CHANGES) {
        return {
          error: `You can only rename a class ${MAX_NAME_CHANGES} times. This limit has been reached.`,
        };
      }
      updates.name = name;
      bumpNameCount = session.role !== "admin";
    }
    if (gradeLevel !== undefined) {
      if (gradeLevel.length > 40) return { error: "Grade level is too long." };
      updates.gradeLevel = gradeLevel;
    }
    if (schoolName !== undefined) {
      if (schoolName.length > 120) return { error: "School name is too long." };
      updates.schoolName = schoolName;
    }
    if (province !== undefined) {
      if (province.length > 80) return { error: "Location is too long." };
      updates.province = province;
    }
    if (section !== undefined) {
      if (section.length > 40) return { error: "Section is too long." };
      updates.section = section;
    }

    if (Object.keys(updates).length === 0) {
      return { error: "Nothing to update." };
    }

    if (Object.keys(updates).length === 0) {
      return { error: "Nothing to update." };
    }

    const dbUpdates: Record<string, any> = { ...updates };
    if (bumpNameCount) {
      dbUpdates.nameChangedCount = (cls.nameChangedCount ?? 0) + 1;
    }

    await db.update(classes).set(dbUpdates).where(eq(classes.id, classId));

    await logAudit({
      userId: session.id,
      action: "CLASS_DETAILS_UPDATED",
      targetType: "class",
      targetId: String(classId),
      ipAddress,
      userAgent,
      details: { ...updates, updatedBy: session.id },
    });

    revalidatePath(`/teacher/classes/${classId}`);
    revalidatePath("/teacher/classes");
    return {
      success: true,
      updates,
      nameChangesRemaining:
        session.role === "admin"
          ? null
          : Math.max(0, MAX_NAME_CHANGES - ((cls.nameChangedCount ?? 0) + (bumpNameCount ? 1 : 0))),
    };
  } catch (e) {
    console.error("[updateClassDetailsAction] error:", e);
    return { error: "Failed to update class details." };
  }
}
