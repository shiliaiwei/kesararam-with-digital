import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeacherClasses } from "@/app/actions/classes";
import { ClassesClient } from "./classes-client";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const classes = await getTeacherClasses();

  return (
    <ClassesClient
      initialClasses={classes.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        createdAt: c.createdAt,
        teacherName: c.teacherName ?? null,
        teacherEmail: c.teacherEmail ?? null,
        schoolName: c.schoolName ?? null,
        province: c.province ?? null,
        status: c.status ?? null,
      }))}
      role={session.role}
    />
  );
}
