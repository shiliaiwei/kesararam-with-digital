import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login");

  const [user] = await db
    .select({ displayName: users.displayName, username: users.username, email: users.email, avatar: users.avatar })
    .from(users)
    .where(eq(users.id, session.id));

  const name = user?.displayName ?? user?.username ?? session.name;

  return (
    <>
      <DashboardHeader title="My Profile" />
      <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">

        {/* ── Header card ── */}
        <div
          className="flex items-center gap-5 p-5"
          style={{
            background: "#252d3d",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "15px",
          }}
        >
          <AvatarDisplay avatar={user?.avatar ?? null} name={name} size={80} radius={15} />
          <div>
            <h1 className="text-xl font-black" style={{ color: "#f0f2f5" }}>{name}</h1>
            <p className="text-sm mt-0.5" style={{ color: "#8E8E8E" }}>{user?.email}</p>
            <span
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-0.5 text-xs font-bold uppercase tracking-widest"
              style={{ background: "rgba(0,103,71,0.2)", color: "#006747", borderRadius: "15px", border: "1px solid rgba(0,103,71,0.4)" }}
            >
              <GraduationCap style={{ width: "11px", height: "11px" }} />
              Teacher
            </span>
          </div>
        </div>

        {/* ── Editor ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8E8E8E" }}>
            Edit Profile
          </p>
          <ProfileEditor initialName={name} initialAvatar={user?.avatar ?? null} dark />
        </div>

      </div>
    </>
  );
}
