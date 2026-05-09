import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { classes, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { School, Users, UserPlus } from "lucide-react";
import { StaffClassesTable } from "./staff-classes-table";

export const dynamic = "force-dynamic";

export default async function StaffClassesPage() {
  const session = await getSession();
  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    redirect("/login");
  }

  // Staff can see all classes (to assign students), but cannot create/delete
  let allClasses: {
    id: number;
    name: string;
    code: string;
    createdAt: Date;
    teacherName: string | null;
    teacherEmail: string | null;
  }[] = [];

  try {
    const rows = await db
      .select({
        id: classes.id,
        name: classes.name,
        code: classes.code,
        createdAt: classes.createdAt,
        teacherName: users.displayName,
        teacherEmail: users.email,
      })
      .from(classes)
      .leftJoin(users, eq(classes.teacherId, users.id))
      .orderBy(desc(classes.createdAt));
    allClasses = rows;
  } catch (e) {
    console.error("[staff classes]", e);
  }

  return (
    <div className="space-y-6">
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <School size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Classes</h1>
            <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
              View all classes and assign students
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-400 border-2 border-black flex items-center justify-center">
            <School size={18} className="text-black" />
          </div>
          <div>
            <p className="text-2xl font-black">{allClasses.length}</p>
            <p className="text-xs font-black uppercase text-zinc-500">Total Classes</p>
          </div>
        </div>
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex items-center gap-3">
          <div className="w-10 h-10 bg-green-400 border-2 border-black flex items-center justify-center">
            <UserPlus size={18} className="text-black" />
          </div>
          <div>
            <p className="text-2xl font-black">—</p>
            <p className="text-xs font-black uppercase text-zinc-500">Assign Students</p>
          </div>
        </div>
      </div>

      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]">
        <div className="border-b-2 border-black bg-blue-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter">All Classes</h2>
          <p className="text-sm font-bold text-black/70 uppercase">Staff can assign students to any class</p>
        </div>
        <div className="p-6">
          <StaffClassesTable classes={allClasses} />
        </div>
      </div>
    </div>
  );
}
