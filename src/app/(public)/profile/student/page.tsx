import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, classes, classEnrollments } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { StudentProfileStats } from "@/components/profile/student-profile-stats";
import { RankBadge as TierBadge, RankProgressBar, RankShowcase } from "@/components/shared/rank-label";
import { getRank } from "@/lib/rank-utils";
import { CompleteProfileForm } from "@/components/profile/complete-profile-form";

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
  };

  let highestScore = 0;
  let totalGamesPlayed = 0;
  let lifetimePoints = 0;

  try {
    // Try to fetch user data
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
      })
      .from(users)
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
      };
    }

    if (!user.schoolName || !user.province || !user.gradeLevel) {
      return <CompleteProfileForm />;
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
    } catch (statsError) {
      console.log("Stats columns not available yet, using defaults");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }

  // Fetch student class details
  let studentClassInfo: {
    className: string;
    section: string | null;
    gradeLevel: string | null;
    schoolName: string | null;
    province: string | null;
    teacherName: string | null;
  } | null = null;

  try {
    const classResult = await db
      .select({
        className: classes.name,
        section: classes.section,
        gradeLevel: classes.gradeLevel,
        schoolName: classes.schoolName,
        province: classes.province,
        teacherName: users.displayName,
      })
      .from(classEnrollments)
      .innerJoin(classes, eq(classEnrollments.classId, classes.id))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .where(eq(classEnrollments.studentId, session.id))
      .limit(1);

    if (classResult && classResult.length > 0) {
      studentClassInfo = {
        className: classResult[0].className,
        section: classResult[0].section,
        gradeLevel: classResult[0].gradeLevel,
        schoolName: classResult[0].schoolName,
        province: classResult[0].province,
        teacherName: classResult[0].teacherName,
      };
    }
  } catch (err) {
    console.error("Failed to fetch student class info:", err);
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

        {/* ── Public Profile Link Card ── */}
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #000",
            boxShadow: "4px 4px 0 #000",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a" }}>
            My Public Profile URL / តំណភ្ជាប់គណនីសាធារណៈ
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            <input
              type="text"
              readOnly
              value={typeof window !== "undefined" ? `${window.location.origin}/u/${user.username}` : `https://kesararamwithdigital.tech/u/${user.username}`}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "2px solid #000",
                fontSize: "12px",
                fontFamily: "monospace",
                background: "#f4f4f5",
                color: "#27272a",
                outline: "none",
              }}
            />
            <button
              onClick={() => {
                const url = typeof window !== "undefined" ? `${window.location.origin}/u/${user.username}` : `https://kesararamwithdigital.tech/u/${user.username}`;
                navigator.clipboard.writeText(url);
                alert("Profile link copied! / បានចម្លងតំណភ្ជាប់!");
              }}
              style={{
                padding: "8px 16px",
                background: "#3b82f6",
                color: "#fff",
                border: "2px solid #000",
                fontWeight: 900,
                fontSize: "11px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
              className="hover:bg-blue-600 active:translate-x-0.5 active:translate-y-0.5"
            >
              Copy
            </button>
            <a
              href={`/u/${user.username}`}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "8px 16px",
                background: "#eab308",
                color: "#000",
                border: "2px solid #000",
                fontWeight: 900,
                fontSize: "11px",
                textTransform: "uppercase",
                textDecoration: "none",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
              }}
              className="hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5"
            >
              View
            </a>
          </div>
        </div>

        {/* ── Stats ── */}
        <StudentProfileStats
          userId={session.id}
          initialHighestScore={highestScore}
          initialTotalGamesPlayed={totalGamesPlayed}
          initialLifetimePoints={lifetimePoints}
        />

        {/* ── Classroom Details ── */}
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #000",
            boxShadow: "4px 4px 0 #000",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid #000", paddingBottom: "10px" }}>
            <div style={{ background: "#eab308", border: "2px solid #000", padding: "4px 8px", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                My Classroom / ថ្នាក់រៀនរបស់ខ្ញុំ
              </span>
            </div>
          </div>
          {studentClassInfo ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f4f4f5", paddingBottom: "6px" }}>
                <span style={{ fontWeight: 900, fontSize: "16px", color: "#3b82f6" }}>
                  {studentClassInfo.className}
                  {studentClassInfo.section ? ` (${studentClassInfo.section})` : ""}
                </span>
                <span style={{
                  background: "#10b981",
                  color: "#fff",
                  padding: "2px 8px",
                  fontSize: "10px",
                  fontWeight: 900,
                  border: "1.5px solid #000",
                  textTransform: "uppercase"
                }}>
                  Enrolled / បានចូលរួម
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase" }}>School / សាលារៀន</div>
                  <div style={{ fontWeight: "bold", color: "#27272a" }}>{studentClassInfo.schoolName}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase" }}>Province / ខេត្ត</div>
                  <div style={{ fontWeight: "bold", color: "#27272a" }}>{studentClassInfo.province}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase" }}>Teacher / គ្រូបង្រៀន</div>
                  <div style={{ fontWeight: "bold", color: "#27272a" }}>{studentClassInfo.teacherName ?? "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase" }}>Grade Level / កម្រិតថ្នាក់</div>
                  <div style={{ fontWeight: "bold", color: "#27272a" }}>{studentClassInfo.gradeLevel}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "10px 0" }}>
              <p style={{ fontSize: "13px", fontWeight: "bold", color: "#71717a", margin: 0 }}>
                You are not currently enrolled in any class.
              </p>
              <p style={{ fontSize: "11px", color: "#a1a1aa", margin: 0 }}>
                Please ask your teacher to add you. Verify that your school profile details below are correct:
              </p>
              <div style={{ background: "#f4f4f5", padding: "10px", border: "1.5px solid #000", marginTop: "4px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <div>
                  <strong style={{ color: "#71717a" }}>School:</strong> {user.schoolName ?? "—"}
                </div>
                <div>
                  <strong style={{ color: "#71717a" }}>Province:</strong> {user.province ?? "—"}
                </div>
                <div>
                  <strong style={{ color: "#71717a" }}>Grade:</strong> {user.gradeLevel ?? "—"}
                </div>
                <div>
                  <strong style={{ color: "#71717a" }}>Section:</strong> {user.section ?? "—"}
                </div>
              </div>
            </div>
          )}
        </div>

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

        {/* ── Edit Profile & Settings Button ── */}
        <div style={{ marginTop: "10px" }}>
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
                Edit Profile & Settings / កែប្រែព័ត៌មាន និងការកំណត់
              </span>
            </div>
          </div>
          <a
            href="/settings"
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              padding: "16px",
              background: "#eab308",
              color: "#000",
              border: "3px solid #000",
              boxShadow: "5px 5px 0 #000",
              fontWeight: 900,
              fontSize: "15px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
            className="hover:bg-yellow-300 transition-all active:translate-x-0.5 active:translate-y-0.5 hover:shadow-[3px_3px_0_#000]"
          >
            Edit Profile & Privacy Settings / កែប្រែគណនី និងការកំណត់ឯកជនភាព
          </a>
        </div>

      </div>
    </div>
  );
}
