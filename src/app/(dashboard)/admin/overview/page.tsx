import { db } from "@/lib/db";
import { users, classes, auditLogs } from "@/db/schema";
import { count, eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, School, ShieldCheck, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalUsers] = await db.select({ c: count() }).from(users);
  const [students] = await db
    .select({ c: count() })
    .from(users)
    .where(eq(users.role, "student"));
  const [teachers] = await db
    .select({ c: count() })
    .from(users)
    .where(eq(users.role, "teacher"));
  const [admins] = await db
    .select({ c: count() })
    .from(users)
    .where(eq(users.role, "admin"));
  const [totalClasses] = await db.select({ c: count() }).from(classes);
  const recentUsers = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(5);
  const recentLogs = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(5);
  return {
    totalUsers: totalUsers.c,
    students: students.c,
    teachers: teachers.c,
    admins: admins.c,
    totalClasses: totalClasses.c,
    recentUsers,
    recentLogs,
  };
}

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const stats = await getStats();
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Students",
      value: stats.students,
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      label: "Teachers",
      value: stats.teachers,
      icon: School,
      color: "text-orange-600",
    },
    {
      label: "Admins",
      value: stats.admins,
      icon: ShieldCheck,
      color: "text-purple-600",
    },
  ];
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="border-b-2 border-[#a8a8a8] pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Dashboard</h1>
        <p className="text-black font-medium mt-1">Overview of the KWD platform.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="rounded-none border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-black uppercase">
                {s.label}
              </CardTitle>
              <s.icon className={`size-6 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-none border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000] bg-white">
          <CardHeader className="border-b-2 border-[#a8a8a8] bg-[#f97316] text-white">
            <CardTitle className="uppercase font-black">Recent Users</CardTitle>
            <CardDescription className="text-white/90 font-medium">
              The 5 most recently created accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-100 border-b-2 border-[#a8a8a8]">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="font-bold text-black uppercase">Name</TableHead>
                  <TableHead className="font-bold text-black uppercase">Role</TableHead>
                  <TableHead className="font-bold text-black uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentUsers.map((u) => (
                  <TableRow key={u.id} className="border-b-2 border-[#a8a8a8] hover:bg-gray-50">
                    <TableCell className="border-r-2 border-[#a8a8a8] p-4 text-black font-medium">
                      <div className="font-bold text-base">
                        {u.displayName ?? u.username}
                      </div>
                      <div className="text-xs text-gray-700 mt-1 font-medium">
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell className="border-r-2 border-[#a8a8a8] p-4">
                      <Badge variant="outline" className="capitalize rounded-none border-2 border-[#a8a8a8] font-bold text-black drop-shadow-[2px_2px_0_#000]">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge className={`capitalize rounded-none border-2 border-black font-bold text-black shadow-[2px_2px_0_#000] ${u.isActive ? "bg-[#22c55e] hover:bg-[#22c55e]" : "bg-[#a8a8a8] hover:bg-[#a8a8a8]"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {stats.recentUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground text-sm py-6"
                    >
                      No users yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="rounded-none border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000] bg-white">
          <CardHeader className="border-b-2 border-[#a8a8a8] bg-[#3b82f6] text-white">
            <CardTitle className="uppercase font-black">Recent Activity</CardTitle>
            <CardDescription className="text-white/90 font-medium">Latest audit log entries.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-100 border-b-2 border-[#a8a8a8]">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="font-bold text-black uppercase">Action</TableHead>
                  <TableHead className="font-bold text-black uppercase">Entity</TableHead>
                  <TableHead className="font-bold text-black uppercase">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentLogs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium text-sm">
                      {l.action}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {l.entityType ?? "�"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {stats.recentLogs.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-black font-bold text-sm py-6 bg-gray-50"
                    >
                      No activity yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
