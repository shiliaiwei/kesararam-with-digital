import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, classes, classEnrollments } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { canManageTeacherOwnedClass, classFieldsMatch } from "@/lib/class-control";

function canAccess(role: string) {
  return role === "staff" || role === "admin" || role === "teacher";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !canAccess(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const classId = Number(id);
  if (isNaN(classId)) {
    return NextResponse.json({ error: "Invalid class id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { identifier } = body; // email or username

    if (!identifier?.trim()) {
      return NextResponse.json({ error: "Student email or username required" }, { status: 400 });
    }

    // Find the class
    const [cls] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
    if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    if (!canManageTeacherOwnedClass(session, cls.teacherId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (cls.isLocked) {
      return NextResponse.json({ error: "Class is locked" }, { status: 400 });
    }

    // Find the student
    const [student] = await db
      .select({ id: users.id, email: users.email, username: users.username, role: users.role, displayName: users.displayName })
      .from(users)
      .where(or(eq(users.email, identifier.trim()), eq(users.username, identifier.trim())))
      .limit(1);

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    if (student.role !== "student") {
      return NextResponse.json({ error: `User is a ${student.role}, not a student` }, { status: 400 });
    }

    const [profile] = await db
      .select({
        schoolName: users.schoolName,
        province: users.province,
        gradeLevel: users.gradeLevel,
        section: users.section,
      })
      .from(users)
      .where(eq(users.id, student.id))
      .limit(1);

    if (!profile || !classFieldsMatch(cls, profile)) {
      return NextResponse.json({ error: "Student profile does not match this class" }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: classEnrollments.id })
      .from(classEnrollments)
      .where(and(eq(classEnrollments.classId, classId), eq(classEnrollments.studentId, student.id)))
      .limit(1);

    if (!existing) {
      await db.insert(classEnrollments).values({ classId, studentId: student.id, enrolledBy: session.id });
    }

    await db.update(users).set({ classId, updatedAt: new Date() }).where(eq(users.id, student.id));

    return NextResponse.json({
      success: true,
      student: { id: student.id, email: student.email, username: student.username, displayName: student.displayName },
      class: { id: cls.id, name: cls.name, code: cls.code },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET enrolled students for a class
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !canAccess(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const classId = Number(id);
  if (isNaN(classId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const enrolled = await db
      .select({
        enrollmentId: classEnrollments.id,
        enrolledAt: classEnrollments.enrolledAt,
        studentId: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        schoolName: users.schoolName,
        province: users.province,
        gradeLevel: users.gradeLevel,
        section: users.section,
      })
      .from(classEnrollments)
      .leftJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classId));

    return NextResponse.json({ students: enrolled });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
