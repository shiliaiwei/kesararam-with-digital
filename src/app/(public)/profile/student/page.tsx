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
      avatarChangedAt: users.avatarChangedAt,
    })
    .from(users)
    .where(eq(users.id, session.id));

  const name = user?.displayName ?? user?.username ?? session.name;

  return (
    <div className="min-h-screen dot-bg py-10">
      <div className="max-w-2xl mx-auto px-5 flex flex-col gap-6">
        {/* ── Profile header ── */}
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #000",
            boxShadow: "6px 6px 0 #000",
            overflow: "hidden",
          }}
        >
          {/* Road curb stripe */}
          <div
            style={{
              height: "6px",
              background: "repeating-linear-gradient(90deg,#eab308 0,#eab308 20px,#000 20px,#000 40px)",
            }}
          />
          <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
            <AvatarDisplay
              avatar={user?.avatar ?? null}
              name={name}
              size={80}
              radius={0}
            />
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 900, lineHeight: 1.2, margin: 0 }}>{name}</h1>
              <p style={{ fontSize: "13px", color: "#52525b", marginTop: "4px" }}>{user?.email}</p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  padding: "2px 10px",
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "2px solid #000",
                  boxShadow: "2px 2px 0 #000",
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
            { label: "Total Score",    value: "—", color: "#eab308" },
            { label: "Challenges",     value: "—", color: "#22c55e" },
            { label: "Current Rank",   value: "—", color: "#3b82f6" },
            { label: "Flashcards Done",value: "—", color: "#a855f7" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: "#ffffff",
                border: "2px solid #000",
                boxShadow: "3px 3px 0 #000",
                padding: "16px",
              }}
            >
              <span style={{ fontSize: "24px", fontWeight: 900, color }}>{value}</span>
              <p style={{ fontSize: "12px", color: "#71717a", fontWeight: 600, marginTop: "4px" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Edit profile ── */}
        <div>
          {/* Section label with curb marker */}
          <div style={{ display: "flex", alignItems: "stretch", marginBottom: "12px" }}>
            <div
              style={{
                width: "6px",
                background: "repeating-linear-gradient(180deg,#eab308 0,#eab308 6px,#000 6px,#000 12px)",
              }}
            />
            <div
              style={{
                background: "#000",
                padding: "5px 14px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 900, color: "#eab308", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Edit Profile
              </span>
            </div>
          </div>
          <ProfileEditor
            initialName={name}
            initialAvatar={user?.avatar ?? null}
            initialAvatarChangedAt={user?.avatarChangedAt?.toISOString() ?? null}
            role="student"
            dark={false}
          />
        </div>
      </div>
    </div>
  );
}
