import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { School, Users, Calendar, Plus } from "lucide-react";
import { getTeacherClasses } from "@/app/actions/classes";
import { ClassesTable } from "./classes-table";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const classes = await getTeacherClasses();

  // Calculate stats
  const totalClasses = classes.length;
  const activeClasses = classes.filter(c => c.code).length; // Classes with codes are active

  const stats = [
    { label: "Total Classes", value: totalClasses.toString(), icon: School, color: "#3b82f6" },
    { label: "Active Classes", value: activeClasses.toString(), icon: Calendar, color: "#22c55e" },
    { label: "Join Codes", value: activeClasses.toString(), icon: Users, color: "#f97316" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-black bg-green-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <School size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
                Classes
              </h1>
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                Manage your classes and share join codes with students
              </p>
            </div>
          </div>
          
          {/* Create Class Button */}
          <button className="flex items-center gap-2 px-4 py-3 bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100">
            <Plus size={20} className="text-black" />
            <span className="font-black text-sm uppercase tracking-wide text-black">
              New Class
            </span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex flex-col gap-3"
            style={{ borderRadius: "0px" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                style={{ backgroundColor: stat.color, borderRadius: "0px" }}
              >
                <stat.icon size={20} className="text-black" />
              </div>
              <span className="text-3xl font-black text-black">
                {stat.value}
              </span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Classes Table Card */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
        {/* Card Header */}
        <div className="border-b-2 border-black bg-green-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black">
            My Classes
          </h2>
          <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
            Students use the join code to enroll in a class
          </p>
        </div>

        {/* Card Content */}
        <div className="p-6">
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
        </div>
      </div>
    </div>
  );
}
