import { db } from "@/lib/db";
import { users, classes } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

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

  return {
    totalUsers: totalUsers.c,
    students: students.c,
    teachers: teachers.c,
    admins: admins.c,
    totalClasses: totalClasses.c,
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
      color: "bg-yellow-400",
    },
    {
      label: "Students",
      value: stats.students,
      color: "bg-blue-500",
    },
    {
      label: "Teachers",
      value: stats.teachers,
      color: "bg-green-500",
    },
    {
      label: "Admins",
      value: stats.admins,
      color: "bg-red-500",
    },
    {
      label: "Classes",
      value: stats.totalClasses,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-black">Admin Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Kesararam With Digital — platform at a glance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`${s.color} border-2 border-black rounded-xl shadow-[4px_4px_0_#000] p-4 flex flex-col gap-1`}
          >
            <span className="text-3xl font-black text-black">{s.value}</span>
            <span className="text-xs font-bold text-black/70 uppercase tracking-wide">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-4">
        <h2 className="text-lg font-black text-black mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: "Manage Users",
              desc: "Create, edit, and deactivate user accounts",
              href: "/admin/users",
              color: "bg-yellow-400",
            },
            {
              title: "Manage Content",
              desc: "Add or update quiz questions and learning materials",
              href: "/admin/content",
              color: "bg-blue-500",
            },
            {
              title: "Audit Logs",
              desc: "Review system activity and security events",
              href: "/admin/logs",
              color: "bg-zinc-200",
            },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              className={`${a.color} border-2 border-black rounded-xl shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-75 p-5 flex flex-col gap-1`}
            >
              <span className="font-black text-black">{a.title}</span>
              <span className="text-xs text-black/70">{a.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
