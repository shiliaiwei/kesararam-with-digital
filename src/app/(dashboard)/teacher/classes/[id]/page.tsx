import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { classes, classEnrollments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ClassRosterClient } from "./class-roster-client";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const { id } = await params;
  const classId = Number(id);
  if (isNaN(classId)) {
    return notFound();
  }

  // Fetch Class details
  const [cls] = await db
    .select()
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls) {
    return notFound();
  }

  // Ensure authorization
  if (session.role === "teacher" && cls.teacherId !== session.id) {
    return notFound();
  }

  // Fetch enrolled students
  const roster = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
      schoolName: users.schoolName,
      province: users.province,
      gradeLevel: users.gradeLevel,
      section: users.section,
      lifetimePoints: users.lifetimePoints,
      enrolledAt: classEnrollments.enrolledAt,
    })
    .from(classEnrollments)
    .innerJoin(users, eq(classEnrollments.studentId, users.id))
    .where(eq(classEnrollments.classId, classId));

  return (
    <ClassRosterClient
      classDetails={{
        id: cls.id,
        name: cls.name,
        code: cls.code,
        schoolName: cls.schoolName ?? "",
        province: cls.province ?? "",
        gradeLevel: cls.gradeLevel ?? "",
        section: cls.section ?? "",
        status: cls.status ?? "active",
        createdAt: cls.createdAt,
        nameChangedCount: cls.nameChangedCount ?? 0,
      }}
      initialRoster={roster.map((s) => ({
        id: s.id,
        username: s.username,
        displayName: s.displayName ?? s.username,
        email: s.email,
        schoolName: s.schoolName ?? "",
        province: s.province ?? "",
        gradeLevel: s.gradeLevel ?? "",
        section: s.section ?? "",
        lifetimePoints: s.lifetimePoints,
        enrolledAt: s.enrolledAt,
      }))}
    />
  );
}
