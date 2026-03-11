import { db } from "@/lib/db";
import { classes, users } from "@/db/schema";
import { count, eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherOverviewPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) redirect("/login");
  const myClasses = await db.select({ id: classes.id, name: classes.name, code: classes.code, createdAt: classes.createdAt }).from(classes).where(eq(classes.teacherId, session.id)).orderBy(desc(classes.createdAt)).limit(5);
  const [{ c: totalStudents }] = await db.select({ c: count() }).from(users).where(eq(users.role, "student"));
  const [{ c: totalClasses }] = await db.select({ c: count() }).from(classes).where(eq(classes.teacherId, session.id));
  const statCards = [
    { label: "My Classes", value: totalClasses, icon: School, color: "text-blue-600" },
    { label: "Total Students", value: totalStudents, icon: Users, color: "text-green-600" },
  ];
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.name}.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`size-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Classes</CardTitle>
          <CardDescription>Your 5 most recently created classes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Class Name</TableHead><TableHead>Join Code</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
            <TableBody>
              {myClasses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><code className="bg-muted px-2 py-0.5 rounded text-sm font-mono tracking-widest">{c.code}</code></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {myClasses.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8 text-sm">No classes yet. Create your first class in Classes.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
