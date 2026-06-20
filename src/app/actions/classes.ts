"use server";

import { db } from "@/lib/db";
import { classes, classEnrollments, users } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { canManageTeacherOwnedClass, classFieldsMatch, normalizeClassValue } from "@/lib/class-control";

function randomCode(len = 6) {
  return Math.random()
    .toString(36)
    .toUpperCase()
    .slice(2, 2 + len)
    .padEnd(len, "0");
}

function readText(formData: FormData, key: string) {
  return ((formData.get(key) as string) ?? "").trim();
}

async function fetchStudentProfile(studentId: number) {
  const [student] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      displayName: users.displayName,
      schoolName: users.schoolName,
      province: users.province,
      classId: users.classId,
    })
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  return student ?? null;
}

async function fetchClassProfile(classId: number) {
  const [cls] = await db
    .select({
      id: classes.id,
      name: classes.name,
      schoolName: classes.schoolName,
      province: classes.province,
      teacherId: classes.teacherId,
      code: classes.code,
      status: classes.status,
      createdAt: classes.createdAt,
    })
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1);

  return cls ?? null;
}

async function linkStudentToClass(studentId: number, classId: number, enrolledBy: number) {
  const student = await fetchStudentProfile(studentId);
  const cls = await fetchClassProfile(classId);

  if (!student || !cls) {
    return { error: "Student or class not found." };
  }

  if (student.role !== "student") {
    return { error: "Only student accounts can be assigned to classes." };
  }

  if (!classFieldsMatch(cls, student)) {
    return { error: "School, province, grade, or section does not match this class." };
  }

  if (cls.status === "locked") {
    return { error: "This class is locked." };
  }

  await db
    .update(users)
    .set({ classId: cls.id, updatedAt: new Date() })
    .where(eq(users.id, student.id));

  const [existing] = await db
    .select({ id: classEnrollments.id })
    .from(classEnrollments)
    .where(and(eq(classEnrollments.classId, cls.id), eq(classEnrollments.studentId, student.id)))
    .limit(1);

  if (!existing) {
    await db.insert(classEnrollments).values({
      classId: cls.id,
      studentId: student.id,
      enrolledBy,
    });
  }

  return { success: true, class: cls, student };
}

export async function createClass(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const name = readText(formData, "name");
  const schoolName = readText(formData, "schoolName");
  const province = readText(formData, "province");

  if (!name || !schoolName || !province) {
    return { error: "Class name, school, and province are required." };
  }

  const code = randomCode(6);

  try {
    await db.insert(classes).values({
      name,
      schoolName,
      province,
      teacherId: session.id,
      code,
      status: "active",
    });
    revalidatePath("/teacher/classes");
    revalidatePath("/staff/classes");
    return { success: true, code };
  } catch (e: any) {
    console.error("[createClass] error:", e);
    return { error: "Failed to create class." };
  }
}

export async function deleteClass(id: number) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin" && session.role !== "staff")) {
    throw new Error("Unauthorized");
  }

  const cls = await fetchClassProfile(id);
  if (!cls) return { error: "Class not found." };
  if (!canManageTeacherOwnedClass(session, cls.teacherId)) {
    return { error: "You cannot delete this class." };
  }

  try {
    await db.delete(classes).where(eq(classes.id, id));
    revalidatePath("/teacher/classes");
    revalidatePath("/staff/classes");
    return { success: true };
  } catch {
    return { error: "Failed to delete class." };
  }
}

export async function getTeacherClasses() {
  const session = await getSession();
  if (!session) return [];

  const baseSelect = {
    id: classes.id,
    name: classes.name,
    schoolName: classes.schoolName,
    province: classes.province,
    code: classes.code,
    createdAt: classes.createdAt,
    status: classes.status,
    teacherName: users.displayName,
    teacherEmail: users.email,
  } as const;

  if (session.role === "admin") {
    return db
      .select(baseSelect)
      .from(classes)
      .leftJoin(users, eq(classes.teacherId, users.id))
      .orderBy(desc(classes.createdAt));
  }

  return db
    .select(baseSelect)
    .from(classes)
    .leftJoin(users, eq(classes.teacherId, users.id))
    .where(eq(classes.teacherId, session.id))
    .orderBy(desc(classes.createdAt));
}

export async function searchStudents(query: string) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin" && session.role !== "staff")) {
    throw new Error("Unauthorized");
  }

  const q = normalizeClassValue(query);

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      schoolName: users.schoolName,
      province: users.province,
      classId: users.classId,
      className: classes.name,
    })
    .from(users)
    .leftJoin(classes, eq(users.classId, classes.id))
    .where(
      and(
        eq(users.role, "student"),
        q
          ? or(
              ilike(users.username, `%${q}%`),
              ilike(users.email, `%${q}%`),
              ilike(users.displayName, `%${q}%`)
            )
          : undefined
      )
    )
    .orderBy(desc(users.createdAt))
    .limit(12);

  return rows;
}

export async function getClassStudents(classId: number) {
  const session = await getSession();
  if (!session) return [];

  const cls = await fetchClassProfile(classId);
  if (!cls) return [];
  if (!canManageTeacherOwnedClass(session, cls.teacherId)) {
    return [];
  }

  return db
    .select({
      enrollmentId: classEnrollments.id,
      enrolledAt: classEnrollments.enrolledAt,
      studentId: users.id,
      username: users.username,
      email: users.email,
      displayName: users.displayName,
      schoolName: users.schoolName,
      province: users.province,
      classId: users.classId,
    })
    .from(classEnrollments)
    .leftJoin(users, eq(classEnrollments.studentId, users.id))
    .where(eq(classEnrollments.classId, classId))
    .orderBy(desc(classEnrollments.enrolledAt));
}

export async function assignStudentToClass(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin" && session.role !== "staff")) {
    throw new Error("Unauthorized");
  }

  const classId = Number(readText(formData, "classId"));
  const identifier = readText(formData, "identifier").toLowerCase();

  if (!classId || !identifier) {
    return { error: "Class and student username are required." };
  }

  const cls = await fetchClassProfile(classId);
  if (!cls) return { error: "Class not found." };
  if (!canManageTeacherOwnedClass(session, cls.teacherId)) {
    return { error: "You cannot manage this class." };
  }

  const [student] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      displayName: users.displayName,
      schoolName: users.schoolName,
      province: users.province,
      classId: users.classId,
    })
    .from(users)
    .where(or(eq(users.username, identifier), eq(users.email, identifier)))
    .limit(1);

  if (!student) return { error: "Student not found." };

  const result = await linkStudentToClass(student.id, cls.id, session.id);
  if ("error" in result) return result;

  revalidatePath("/teacher/classes");
  revalidatePath("/staff/classes");
  revalidatePath("/leaderboard");
  revalidatePath("/profile/student");

  return { success: true, student: result.student, class: result.class };
}

export async function autoAssignStudentToMatchingClass(studentId: number, enrolledBy: number) {
  const student = await fetchStudentProfile(studentId);
  if (!student || student.role !== "student") return null;

  const [matchingClass] = await db
    .select({
      id: classes.id,
      name: classes.name,
      schoolName: classes.schoolName,
      province: classes.province,
      teacherId: classes.teacherId,
      code: classes.code,
      status: classes.status,
      createdAt: classes.createdAt,
      teacherName: users.displayName,
      teacherEmail: users.email,
    })
    .from(classes)
    .leftJoin(users, eq(classes.teacherId, users.id))
    .where(
      and(
        ilike(classes.schoolName, student.schoolName ?? ""),
        ilike(classes.province, student.province ?? "")
      )
    )
    .orderBy(desc(classes.createdAt))
    .limit(1);

  if (!matchingClass) return null;
  if (!classFieldsMatch(matchingClass, student)) return null;

  const result = await linkStudentToClass(student.id, matchingClass.id, enrolledBy);
  if ("error" in result) return null;

  return result;
}