import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { StudentProfileStats } from "@/components/profile/student-profile-stats";

export const metadata: Metadata = {
  title: "My Profile — KWD Quiz",
  description: "View your quiz statistics, game history, and manage your student profile. Track your progress, scores, and rankings.",
  openGraph: {
    title: "My Profile — KWD Quiz",
    description: "View your quiz statistics and manage your profile",
    type: "profile",
  },
};

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
      highestScore: users.highestScore,
      totalGamesPlayed: users.totalGamesPlayed,
      lifetimePoints: users.lifetimePoints,
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
              background:
                "repeating-linear-gradient(90deg,#eab308 0,#eab308 20px,#000 20px,#000 40px)",
            }}
          />
          <div
            style={{
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <AvatarDisplay
              avatar={user?.avatar ?? null}
              name={name}
              size={80}
              radius={0}
            />
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {name}
              </h1>
              <p
                style={{ fontSize: "13px", color: "#52525b", marginTop: "4px" }}
              >
                {user?.email}
              </p>
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
        <StudentProfileStats
          userId={session.id}
          initialHighestScore={user?.highestScore || 0}
          initialTotalGamesPlayed={user?.totalGamesPlayed || 0}
          initialLifetimePoints={user?.lifetimePoints || 0}
        />

        {/* ── Edit profile ── */}
        <div>
          {/* Section label with curb marker */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "6px",
                background:
                  "repeating-linear-gradient(180deg,#eab308 0,#eab308 6px,#000 6px,#000 12px)",
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
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 900,
                  color: "#eab308",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Edit Profile
              </span>
            </div>
          </div>
          <ProfileEditor
            initialName={name}
            initialAvatar={user?.avatar ?? null}
            initialAvatarChangedAt={
              user?.avatarChangedAt?.toISOString() ?? null
            }
            role="student"
            dark={false}
          />
        </div>
      </div>
    </div>
  );
}
