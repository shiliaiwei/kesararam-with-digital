import { db } from "@/lib/db";
import { users, classes, auditLogs } from "@/db/schema";
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
import { Users, School, ShieldCheck, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
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
  } catch (err) {
    console.error("[admin overview] DB error:", err);
    return {
      totalUsers: 0,
      students: 0,
      teachers: 0,
      admins: 0,
      totalClasses: 0,
      recentUsers: [],
      recentLogs: [],
    };
  }
}

const STAT_CARDS = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    accent: "#3b82f6",
    bar: "#3b82f6",
  },
  {
    key: "students",
    label: "Students",
    icon: UserCheck,
    accent: "#006747",
    bar: "#006747",
  },
  {
    key: "teachers",
    label: "Teachers",
    icon: School,
    accent: "#f97316",
    bar: "#f97316",
  },
  {
    key: "admins",
    label: "Admins",
    icon: ShieldCheck,
    accent: "#a855f7",
    bar: "#a855f7",
  },
] as const;

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const stats = await getStats();

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page header */}
      <div className="border-b-[3px] border-black pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
            Dashboard
          </h1>
          <p className="text-sm font-bold text-[#a8a8a8] uppercase tracking-widest mt-1">
            Overview of the KWD platform.
          </p>
        </div>
        <div className="flex gap-1 items-center border-2 border-black bg-white shadow-[4px_4px_0_#000] px-3 py-1.5">
          <div className="w-3 h-3 bg-[#ef4444] border border-black" />
          <div className="w-3 h-3 bg-[#eab308] border border-black" />
          <div className="w-3 h-3 bg-[#006747] border border-black" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          const value = stats[s.key];
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
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="border-2 border-[#a8a8a8] bg-[#ffffff] shadow-[4px_4px_0_#000]">
          <div className="border-b-2 border-black bg-[#006747] px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="font-black uppercase tracking-widest text-white text-sm">
                Recent Users
              </h2>
              <p className="text-white/80 text-xs font-medium mt-0.5">
                The 5 most recently created accounts.
              </p>
            </div>
            <Users className="size-5 text-white/70" />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-[#a8a8a8] bg-[#f5f5f0] hover:bg-[#f5f5f0]">
                <TableHead className="font-black text-black uppercase text-xs tracking-widest py-3">
                  Name
                </TableHead>
                <TableHead className="font-black text-black uppercase text-xs tracking-widest">
                  Role
                </TableHead>
                <TableHead className="font-black text-black uppercase text-xs tracking-widest">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentUsers.map((u) => (
                <TableRow
                  key={u.id}
                  className="border-b-2 border-[#a8a8a8] hover:bg-[#f5f5f0]"
                >
                  <TableCell className="border-r-2 border-[#a8a8a8] p-3">
                    <div className="font-black text-black text-sm">
                      {u.displayName ?? u.username}
                    </div>
                    <div className="text-xs text-[#a8a8a8] font-medium mt-0.5">
                      {u.email}
                    </div>
                  </TableCell>
                  <TableCell className="border-r-2 border-[#a8a8a8] p-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-black uppercase tracking-widest border-2 border-[#a8a8a8] bg-white text-black shadow-[2px_2px_0_#000]">
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-black uppercase tracking-widest border-2 border-black ${
                        u.isActive
                          ? "bg-[#22c55e] text-black"
                          : "bg-[#a8a8a8] text-white"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {stats.recentUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-[#a8a8a8] text-sm font-bold py-10 uppercase tracking-widest"
                  >
                    No users yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Recent Activity */}
        <div className="border-2 border-[#a8a8a8] bg-[#ffffff] shadow-[4px_4px_0_#000]">
          <div className="border-b-2 border-black bg-[#3b82f6] px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="font-black uppercase tracking-widest text-white text-sm">
                Recent Activity
              </h2>
              <p className="text-white/80 text-xs font-medium mt-0.5">
                Latest audit log entries.
              </p>
            </div>
            <ShieldCheck className="size-5 text-white/70" />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-[#a8a8a8] bg-[#f5f5f0] hover:bg-[#f5f5f0]">
                <TableHead className="font-black text-black uppercase text-xs tracking-widest py-3">
                  Action
                </TableHead>
                <TableHead className="font-black text-black uppercase text-xs tracking-widest">
                  Entity
                </TableHead>
                <TableHead className="font-black text-black uppercase text-xs tracking-widest">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentLogs.map((l) => (
                <TableRow
                  key={l.id}
                  className="border-b-2 border-[#a8a8a8] hover:bg-[#f5f5f0]"
                >
                  <TableCell className="border-r-2 border-[#a8a8a8] p-3 font-bold text-sm text-black">
                    {l.action}
                  </TableCell>
                  <TableCell className="border-r-2 border-[#a8a8a8] p-3 text-sm text-[#a8a8a8] font-medium">
                    {l.entityType ?? "-"}
                  </TableCell>
                  <TableCell className="p-3 text-xs text-[#a8a8a8] font-medium">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {stats.recentLogs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-[#a8a8a8] text-sm font-bold py-10 uppercase tracking-widest"
                  >
                    No activity yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
