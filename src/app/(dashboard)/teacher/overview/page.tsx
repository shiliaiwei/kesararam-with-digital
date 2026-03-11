import { db } from "@/lib/db";
import { classes, users } from "@/db/schema";
import { count, eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { School, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherOverviewPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin"))
    redirect("/login");

  const myClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      code: classes.code,
      createdAt: classes.createdAt,
    })
    .from(classes)
    .where(eq(classes.teacherId, session.id))
    .orderBy(desc(classes.createdAt))
    .limit(5);

  const [{ c: totalStudents }] = await db
    .select({ c: count() })
    .from(users)
    .where(eq(users.role, "student"));

  const [{ c: totalClasses }] = await db
    .select({ c: count() })
    .from(classes)
    .where(eq(classes.teacherId, session.id));

  const statCards = [
    {
      key: "classes",
      label: "My Classes",
      value: totalClasses,
      icon: School,
      accent: "#3b82f6",
    },
    {
      key: "students",
      label: "Total Students",
      value: totalStudents,
      icon: Users,
      accent: "#006747",
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page header */}
      <div className="border-b-[3px] border-black pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
            Dashboard
          </h1>
          <p className="text-sm font-bold text-[#a8a8a8] uppercase tracking-widest mt-1">
            Welcome back, {session.name}.
          </p>
        </div>
        <div className="flex gap-1 items-center border-2 border-black bg-white shadow-[4px_4px_0_#000] px-3 py-1.5">
          <div className="w-3 h-3 bg-[#ef4444] border border-black" />
          <div className="w-3 h-3 bg-[#eab308] border border-black" />
          <div className="w-3 h-3 bg-[#006747] border border-black" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className="border-2 border-[#a8a8a8] bg-[#ffffff] shadow-[4px_4px_0_#000] flex flex-col"
            >
              <div className="h-1.5 w-full" style={{ background: s.accent }} />
              <div className="flex items-start justify-between p-4 pb-2">
                <p className="text-xs font-black uppercase tracking-widest text-[#a8a8a8]">
                  {s.label}
                </p>
                <div
                  className="border-2 border-[#a8a8a8] p-1"
                  style={{ color: s.accent }}
                >
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="px-4 pb-4">
                <span className="text-5xl font-black text-black leading-none">
                  {s.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Classes table */}
      <div className="border-2 border-[#a8a8a8] bg-[#ffffff] shadow-[4px_4px_0_#000]">
        <div className="border-b-2 border-black bg-[#eab308] px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-black uppercase tracking-widest text-black text-sm">
              Recent Classes
            </h2>
            <p className="text-black/70 text-xs font-bold mt-0.5 uppercase tracking-wide">
              Your 5 most recently created classes.
            </p>
          </div>
          <School className="size-5 text-black/60" />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-[#a8a8a8] bg-[#f5f5f0] hover:bg-[#f5f5f0]">
              <TableHead className="font-black text-black uppercase text-xs tracking-widest py-3">
                Class Name
              </TableHead>
              <TableHead className="font-black text-black uppercase text-xs tracking-widest">
                Join Code
              </TableHead>
              <TableHead className="font-black text-black uppercase text-xs tracking-widest">
                Created
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myClasses.map((c) => (
              <TableRow
                key={c.id}
                className="border-b-2 border-[#a8a8a8] hover:bg-[#f5f5f0]"
              >
                <TableCell className="border-r-2 border-[#a8a8a8] p-3 font-black text-black uppercase tracking-wide text-sm">
                  {c.name}
                </TableCell>
                <TableCell className="border-r-2 border-[#a8a8a8] p-3">
                  <code className="border-2 border-black bg-[#eab308] px-2 py-1 font-black text-black text-sm tracking-widest shadow-[2px_2px_0_#000]">
                    {c.code}
                  </code>
                </TableCell>
                <TableCell className="p-3 text-sm text-[#a8a8a8] font-bold">
                  {new Date(c.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {myClasses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-[#a8a8a8] font-black py-12 text-sm uppercase tracking-widest"
                >
                  No classes yet. Create your first class in Classes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
