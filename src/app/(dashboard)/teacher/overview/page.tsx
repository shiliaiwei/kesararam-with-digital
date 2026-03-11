import { db } from "@/lib/db";
import { classes, users } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getTeacherStats(teacherId: number) {
  const [myClasses] = await db
    .select({ c: count() })
    .from(classes)
    .where(eq(classes.teacherId, teacherId));

  const [totalStudents] = await db
    .select({ c: count() })
    .from(users)
    .where(eq(users.role, "student"));

  return {
    myClasses: myClasses.c,
    totalStudents: totalStudents.c,
  };
}

export default async function TeacherOverviewPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const stats = await getTeacherStats(session.id);

  const statCards = [
    { label: "My Classes", value: stats.myClasses, color: "bg-blue-500" },
    {
      label: "Total Students",
      value: stats.totalStudents,
      color: "bg-yellow-400",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-black">Teacher Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Welcome back, {session.name}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
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

      <div className="mb-4">
        <h2 className="text-lg font-black text-black mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "My Classes",
              desc: "View and manage your classes and students",
              href: "/teacher/classes",
              color: "bg-blue-500",
            },
            {
              title: "Start Session",
              desc: "Launch a live quiz or play session",
              href: "/teacher/sessions",
              color: "bg-yellow-400",
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
