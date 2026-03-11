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
      <div className="border-b-2 border-[#a8a8a8] pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Dashboard</h1>
        <p className="text-black font-medium mt-1">Welcome back, {session.name}.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label} className="rounded-none border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-black uppercase">{s.label}</CardTitle>
              <s.icon className={`size-6 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-none border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000] bg-white">
        <CardHeader className="border-b-2 border-[#a8a8a8] bg-[#eab308] text-black">
          <CardTitle className="uppercase font-black">Recent Classes</CardTitle>
          <CardDescription className="text-black font-medium">Your 5 most recently created classes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-100 border-b-2 border-[#a8a8a8]"><TableRow className="border-none hover:bg-transparent"><TableHead className="font-bold text-black uppercase">Class Name</TableHead><TableHead className="font-bold text-black uppercase">Join Code</TableHead><TableHead className="font-bold text-black uppercase">Created</TableHead></TableRow></TableHeader>
            <TableBody>
              {myClasses.map((c) => (
                <TableRow key={c.id} className="border-b-2 border-[#a8a8a8] hover:bg-gray-50">
                  <TableCell className="border-r-2 border-[#a8a8a8] p-4 text-black font-bold uppercase">{c.name}</TableCell>
                  <TableCell className="border-r-2 border-[#a8a8a8] p-4"><code className="bg-[#a8a8a8] px-2 py-1 rounded-none border-2 border-black font-bold text-black text-sm tracking-widest shadow-[2px_2px_0_#000]">{c.code}</code></TableCell>
                  <TableCell className="p-4 text-black font-medium text-sm">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {myClasses.length === 0 && <TableRow><TableCell colSpan={3} className="text-center font-bold text-black py-8 text-sm bg-gray-50">No classes yet. Create your first class in Classes.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
