import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, classes, classEnrollments } from "@/db/schema";
import { eq, or } from "drizzle-orm";

function canAccess(role: string) {
  return role === "staff" || role === "admin";
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

    // Insert enrollment (ignore duplicate via ON CONFLICT)
    await db
      .insert(classEnrollments)
      .values({ classId, studentId: student.id, enrolledBy: session.id })
      .onConflictDoNothing();

    return NextResponse.json({
      success: true,
      student: { id: student.id, email: student.email, username: student.username, displayName: student.displayName },
      class: { id: cls.id, name: cls.name, code: cls.code },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
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
      })
      .from(classEnrollments)
      .leftJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classId));

    return NextResponse.json({ students: enrolled });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
