import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTeacherClasses } from "@/app/actions/classes";
import { ClassesTable } from "./classes-table";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const classes = await getTeacherClasses();

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
        <p className="text-muted-foreground">
          Manage your classes and share join codes with students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>
            Students use the join code to enroll in a class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClassesTable
            initialClasses={classes.map((c) => ({
              id: c.id,
              name: c.name,
              code: c.code,
              createdAt: c.createdAt,
              teacherName: c.teacherName ?? null,
              teacherEmail: c.teacherEmail ?? null,
            }))}
            showTeacher={session.role === "admin"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
