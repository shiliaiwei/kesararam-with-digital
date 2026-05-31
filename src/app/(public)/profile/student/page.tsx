import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, classes } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { StudentProfileStats } from "@/components/profile/student-profile-stats";
import { RankBadge as TierBadge, RankProgressBar, RankShowcase } from "@/components/shared/rank-label";
import { getRank } from "@/lib/rank-utils";

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

  // Initialize with default values
  let user: {
    displayName: string;
    username: string;
    email: string;
    avatar: string | null;
    avatarChangedAt: Date | null;
    schoolName: string | null;
    province: string | null;
    gradeLevel: string | null;
    section: string | null;
    className: string | null;
  } = {
    displayName: session.name,
    username: session.name,
    email: session.email || "",
    avatar: null,
    avatarChangedAt: null,
    schoolName: null,
    province: null,
    gradeLevel: null,
    section: null,
    className: null,
  };

  let highestScore = 0;
  let totalGamesPlayed = 0;
  let lifetimePoints = 0;

  try {
    // Try to fetch user data - only select columns that definitely exist
    const result = await db
      .select({
        displayName: users.displayName,
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        avatarChangedAt: users.avatarChangedAt,
        schoolName: users.schoolName,
        province: users.province,
        gradeLevel: users.gradeLevel,
        section: users.section,
        className: classes.name,
      })
      .from(users)
      .leftJoin(classes, eq(users.classId, classes.id))
      .where(eq(users.id, session.id))
      .limit(1);

    if (result && result.length > 0) {
      user = {
        displayName: result[0].displayName ?? session.name,
        username: result[0].username,
        email: result[0].email,
        avatar: result[0].avatar,
        avatarChangedAt: result[0].avatarChangedAt,
        schoolName: result[0].schoolName,
        province: result[0].province,
        gradeLevel: result[0].gradeLevel,
        section: result[0].section,
        className: result[0].className,
      };
    }

    // Try to get stats separately - these columns might not exist yet
    try {
      const statsResult = await db
        .select({
          highestScore: users.highestScore,
          totalGamesPlayed: users.totalGamesPlayed,
          lifetimePoints: users.lifetimePoints,
        })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);

      if (statsResult && statsResult.length > 0) {
        highestScore = statsResult[0].highestScore || 0;
        totalGamesPlayed = statsResult[0].totalGamesPlayed || 0;
        lifetimePoints = statsResult[0].lifetimePoints || 0;
      }
    } catch {
      console.log("Stats columns not available yet, using defaults");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }

  const name = user?.displayName ?? user?.username ?? session.name;
  const tier = getRank(lifetimePoints);

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
          {/* Tier-colored top stripe */}
          <div
            style={{
              height: "6px",
              background: tier.borderGradient,
              backgroundSize: "300% 300%",
              animation: tier.animated ? "rankShimmer 2s ease infinite" : undefined,
            }}
          />
          <style>{`
            @keyframes rankShimmer {
              0%   { background-position: 0% 50%; }
              50%  { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
          <div
            style={{
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* Avatar with tier ring */}
            <div
              style={{
                padding: 4,
                borderRadius: "50%",
                background: tier.borderGradient,
                backgroundSize: tier.animated ? "300% 300%" : "100%",
                animation: tier.animated ? "rankShimmer 2s ease infinite" : undefined,
                flexShrink: 0,
                boxShadow: tier.animated ? `0 0 16px ${tier.glow}88` : undefined,
              }}
            >
              <div style={{ borderRadius: "50%", overflow: "hidden", background: "#fff", padding: 2 }}>
                <AvatarDisplay
                  avatar={user?.avatar ?? null}
                  name={name}
                  size={80}
                  radius={0}
                />
              </div>
            </div>
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-block",
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
                {user.schoolName && (
                  <span style={{ display: "inline-block", padding: "2px 10px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "#ffffff", color: "#000", border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}>
                    {user.schoolName}
                  </span>
                )}
                {user.province && (
                  <span style={{ display: "inline-block", padding: "2px 10px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "#3b82f6", color: "#fff", border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}>
                    {user.province}
                  </span>
                )}
                {user.gradeLevel && (
                  <span style={{ display: "inline-block", padding: "2px 10px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "#22c55e", color: "#000", border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}>
                    {user.gradeLevel}
                  </span>
                )}
                {user.className && (
                  <span style={{ display: "inline-block", padding: "2px 10px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "#facc15", color: "#000", border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}>
                    {user.className}
                  </span>
                )}
                {/* Tier badge */}
                <TierBadge lifetimePoints={lifetimePoints} size="sm" />
              </div>
              {/* Progress to next tier */}
              <div style={{ marginTop: "10px", width: "200px" }}>
                <RankProgressBar lifetimePoints={lifetimePoints} compact />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <StudentProfileStats
          userId={session.id}
          initialHighestScore={highestScore}
          initialTotalGamesPlayed={totalGamesPlayed}
          initialLifetimePoints={lifetimePoints}
        />

        {/* ── Rank Tier Map ── */}
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #000",
            boxShadow: "4px 4px 0 #000",
            padding: "20px",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a" }}>
                Rank Tiers
              </span>
              <TierBadge lifetimePoints={lifetimePoints} size="xs" />
            </div>
            <p style={{ fontSize: "11px", color: "#71717a", margin: 0 }}>
              Earn more points in live games to unlock higher tiers and exclusive profile effects.
            </p>
          </div>
          <RankProgressBar lifetimePoints={lifetimePoints} />
          <div style={{ marginTop: "16px" }}>
            <RankShowcase lifetimePoints={lifetimePoints} />
          </div>
        </div>

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
