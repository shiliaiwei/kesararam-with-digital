import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata: Metadata = { title: "My Profile — KWD" };

export default async function StudentProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "student") redirect("/login");

  const [user] = await db
    .select({
      displayName: users.displayName,
      username: users.username,
      email: users.email,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.id, session.id));

  const name = user?.displayName ?? user?.username ?? session.name;

  return (
    <div className="min-h-screen dot-bg py-10">
      <div className="max-w-2xl mx-auto px-5 flex flex-col gap-6">
        {/* ── Profile header ── */}
        <div className="bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0_#000] overflow-hidden">
          <div className="h-3 bg-yellow-400 border-b-2 border-black" />
          <div className="p-6 flex items-center gap-5">
            <AvatarDisplay
              avatar={user?.avatar ?? null}
              name={name}
              size={80}
              radius={15}
            />
            <div>
              <h1 className="text-2xl font-black leading-tight">{name}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">{user?.email}</p>
              <span
                className="inline-block mt-2 px-3 py-0.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "#3b82f6",
                  color: "#fff",
                  borderRadius: "15px",
                }}
              >
                Student
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Score", value: "—", color: "#eab308" },
            { label: "Challenges", value: "—", color: "#22c55e" },
            { label: "Current Rank", value: "—", color: "#3b82f6" },
            { label: "Flashcards Done", value: "—", color: "#a855f7" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0_#000]"
            >
              <span className="text-2xl font-black" style={{ color }}>
                {value}
              </span>
              <p className="text-xs text-zinc-500 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Edit profile ── */}
        <div>
          <h2 className="text-base font-black mb-3 uppercase tracking-wide">
            Edit Profile
          </h2>
          <ProfileEditor
            initialName={name}
            initialAvatar={user?.avatar ?? null}
            dark={false}
          />
        </div>
      </div>
    </div>
  );
}
