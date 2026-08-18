import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq, and, sql, desc } from "drizzle-orm";
import { getAvatarFaceStyle } from "@/lib/utils";
import { STORE_POINTS_ENABLED } from "@/lib/store-points/award";
import { getStoreBalances } from "@/lib/store-points/balance";
import { calculateRankAndDivision } from "@/lib/ranks";

export const runtime = "nodejs";

export const alt = "Student Identification Card Cover";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kesararamwithdigital.tech";

  // 1. Fetch user credentials from database
  const result = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      username: users.username,
      avatar: users.avatar,
      avatarChangedAt: users.avatarChangedAt,
      highestScore: users.highestScore,
      totalGamesPlayed: users.totalGamesPlayed,
      lifetimePoints: users.lifetimePoints,
      createdAt: users.createdAt,
      province: users.province,
      isProfilePublic: users.isProfilePublic,
      isNamePublic: users.isNamePublic,
      isProvincePublic: users.isProvincePublic,
    })
    .from(users)
    .where(and(eq(users.username, username), eq(users.isActive, true), eq(users.role, "student")))
    .limit(1);

  if (!result || result.length === 0) {
    return new Response("Student not found", { status: 404 });
  }

  const student = result[0];

  if (!student.isProfilePublic) {
    return new ImageResponse(
      <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", background: "#18181b", color: "#fff", border: "18px solid #000", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", background: "#ef4444", color: "#fff", border: "4px solid #000", boxShadow: "8px 8px 0 #000", padding: "14px 24px", fontSize: "24px", fontWeight: 900 }}>PRIVATE PROFILE</div>
        <div style={{ display: "flex", fontSize: "54px", fontWeight: 900 }}>Kesararam With Digital STUDENT</div>
        <div style={{ display: "flex", fontSize: "22px", color: "#a1a1aa" }}>This student has hidden their public profile.</div>
      </div>,
      size
    );
  }

  // Post-cutover: the card shows Store Points lifetime-earned and ranks by it.
  let activeStudents: { username: string }[];
  if (STORE_POINTS_ENABLED) {
    const balances = await getStoreBalances(student.id);
    student.lifetimePoints = balances.lifetimeEarned;
    const lifetimeExpr = sql<number>`COALESCE((SELECT SUM(spe.delta) FROM store_point_events spe WHERE spe.user_id = ${users.id} AND spe.delta > 0), 0)::int`;
    activeStudents = await db
      .select({ username: users.username })
      .from(users)
      .where(sql`${users.isActive} = true AND ${users.role} = 'student'`)
      .orderBy(desc(lifetimeExpr), desc(users.highestScore));
  } else {
    // 2. Legacy ranked list for ranking.
    activeStudents = await db
      .select({
        username: users.username,
      })
      .from(users)
      .where(sql`${users.isActive} = true AND ${users.role} = 'student'`)
      .orderBy(desc(users.lifetimePoints), desc(users.highestScore));
  }

  const studentIndex = activeStudents.findIndex(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  const rank = studentIndex !== -1 ? studentIndex + 1 : 99;

  const name = student.isNamePublic ? (student.displayName || student.username) : "Kesararam With Digital Student";
  const joinedYear = student.createdAt ? new Date(student.createdAt).getFullYear() : 2026;

  const rankResult = calculateRankAndDivision(student.lifetimePoints);
  const tierName = rankResult.rank.label;
  const tierColor = rankResult.rank.primaryColor;

  // Parse avatar JSON
  const parsedAvatar = (() => {
    if (!student.avatar) return null;
    const trimmed = student.avatar.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const data = JSON.parse(trimmed) as { face?: string; head?: string };
        if (data && (data.face || data.head)) {
          if (data.head && !data.face) data.face = "Smile.svg";
          return data;
        }
      } catch {
        return null;
      }
    }
    return null;
  })();

  // Construct absolute avatar URL
  const absoluteAvatarUrl = student.avatar
    ? student.avatar.startsWith("https://res.cloudinary.com/")
      ? `${baseUrl}/api/profile-image?imageUrl=${encodeURIComponent(student.avatar)}`
      : student.avatar.startsWith("http")
        ? student.avatar
        : `${baseUrl}${student.avatar}`
    : null;

  const initials = (name || "?").slice(0, 2).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #09090b 0%, #1c1917 100%)",
          padding: "50px 60px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            zIndex: 1,
          }}
        />

        {/* Top-left decorative accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #eab308 0%, #3b82f6 50%, #ec4899 100%)",
            zIndex: 10,
          }}
        />

        {/* Left Side: Dynamic Info & Brand Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "520px",
            zIndex: 2,
          }}
        >
          {/* Live Rankings Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#eab308",
              color: "#000000",
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "2px",
              padding: "6px 14px",
              alignSelf: "flex-start",
              border: "2px solid #000000",
              boxShadow: "3px 3px 0px #000000",
              marginBottom: "24px",
            }}
          >
            LIVE LEADERBOARD CHAMPION
          </div>

          {/* Student Profile Headline */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: "900",
              color: "#ffffff",
              lineHeight: "1.1",
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            {name}
          </div>

          {/* School Name */}
          <div
            style={{
              fontSize: "20px",
              color: "#a1a1aa",
              fontWeight: "500",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {student.isProvincePublic && student.province ? student.province : "Kesararam With Digital Road Safety Learning"}
          </div>

          {/* Quick Stats Grid */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "20px",
            }}
          >
            {/* Rank Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#18181b",
                border: "2px solid #27272a",
                padding: "16px 20px",
                minWidth: "140px",
              }}
            >
              <span style={{ fontSize: "10px", color: "#71717a", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                RANK
              </span>
              <span style={{ fontSize: "32px", color: "#eab308", fontWeight: "900", marginTop: "4px" }}>
                #{rank}
              </span>
            </div>

            {/* Points Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#18181b",
                border: "2px solid #27272a",
                padding: "16px 20px",
                minWidth: "160px",
              }}
            >
              <span style={{ fontSize: "10px", color: "#71717a", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                POINTS
              </span>
              <span style={{ fontSize: "32px", color: "#10b981", fontWeight: "900", marginTop: "4px" }}>
                {student.lifetimePoints.toLocaleString()}
              </span>
            </div>

            {/* Tier Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#18181b",
                border: "2px solid #27272a",
                padding: "16px 20px",
                minWidth: "140px",
              }}
            >
              <span style={{ fontSize: "10px", color: "#71717a", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                TIER
              </span>
              <span style={{ fontSize: "32px", color: tierColor, fontWeight: "900", marginTop: "4px" }}>
                {tierName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Gorgeous Student ID Card Mockup */}
        <div
          style={{
            width: "480px",
            height: "530px",
            background: "#ffffff",
            border: "5px solid #000000",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          {/* ID Card Top Header Section */}
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "3px solid #000000",
              background: "#ffffff",
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
              {/* Pagoda Seal SVG */}
              <svg style={{ width: "36px", height: "36px", flexShrink: 0 }} viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="46" stroke="#d97706" strokeWidth="3" fill="#fffbeb" />
                <path d="M50 20 L57 44 L54 44 L54 74 L46 74 L46 44 L43 44 Z" fill="#b45309" />
                <path d="M37 32 L43 49 L40 49 L40 74 L34 74 L34 49 L31 49 Z" fill="#b45309" opacity="0.9" />
                <path d="M63 32 L69 49 L66 49 L66 74 L60 74 L60 49 L57 49 Z" fill="#b45309" opacity="0.9" />
                <rect x="20" y="74" width="60" height="4" fill="#b45309" />
              </svg>
              
              <div style={{ display: "flex", flexDirection: "column", lineHeight: "1" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", color: "#1e3a8a" }}>
                  Kesararam With Digital ROAD SAFETY
                </span>
                <span style={{ fontSize: "7.5px", fontWeight: "900", color: "#a1a1aa", marginTop: "2px", letterSpacing: "0.5px" }}>
                  PUBLIC STUDENT PROFILE
                </span>
              </div>
            </div>

            {/* Kesararam With Digital Logo */}
            <div style={{ display: "flex" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${baseUrl}/brand/kwd-black_nobackground.png`}
                alt="Kesararam With Digital Logo"
                style={{ height: "26px", objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Blue Stripe */}
          <div
            style={{
              background: "#0284c7",
              padding: "6px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "3px solid #000000",
            }}
          >
            <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: "900", letterSpacing: "1px" }}>
              ប័ណ្ណសម្គាល់ខ្លួនសិស្ស
            </span>
            <span style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "7px", fontWeight: "900", marginTop: "2px", letterSpacing: "0.5px" }}>
              STUDENT IDENTIFICATION CARD
            </span>
          </div>

          {/* Body Section */}
          <div
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              flex: 1,
            }}
          >
            {/* Left: Avatar portrait and ID Code */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "135px", gap: "10px" }}>
              {/* Avatar Frame */}
              <div
                style={{
                  width: "130px",
                  height: "173px",
                  border: "3px solid #000000",
                  background: "#f4f4f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "3px 3px 0px #000000",
                }}
              >
                {parsedAvatar ? (
                  <div style={{ display: "flex", width: "120px", height: "120px", position: "relative", overflow: "hidden", background: "#eab308", border: "2px solid #000", borderRadius: "50%" }}>
                    {parsedAvatar.head && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${baseUrl}/avatar/head/${encodeURIComponent(parsedAvatar.head)}`}
                        alt=""
                        style={{ position: "absolute", top: 0, left: 0, width: "120px", height: "120px" }}
                      />
                    )}
                    {parsedAvatar.face && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${baseUrl}/avatar/face/${encodeURIComponent(parsedAvatar.face)}`}
                        alt=""
                        style={getAvatarFaceStyle(parsedAvatar.head)}
                      />
                    )}
                  </div>
                ) : absoluteAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={absoluteAvatarUrl}
                    alt={name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: "#27272a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "36px",
                      fontWeight: "900",
                      border: "2px solid #000000",
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              {/* TierBadge inside Card left column */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: tierColor,
                  color: "#ffffff",
                  fontSize: "9px",
                  fontWeight: "900",
                  padding: "3px 8px",
                  border: "1.5px solid #000000",
                }}
              >
                {tierName} TIER
              </div>

              {/* ID number */}
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "900",
                  color: "#0284c7",
                  background: "rgba(2, 132, 199, 0.1)",
                  border: "1px solid rgba(2, 132, 199, 0.2)",
                  width: "100%",
                  textAlign: "center",
                  padding: "2px 0",
                }}
              >
                ID: KWD-{student.id.toString().padStart(4, "0")}
              </div>
            </div>

            {/* Right: Grid of Credentials */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                justifyContent: "space-between",
                height: "235px",
              }}
            >
              {/* Field mapping */}
              {[
                { label: "NAME", value: name },
                { label: "ROLE", value: "Student" },
                { label: "TIER", value: tierName },
                { label: "PROVINCE", value: student.isProvincePublic ? (student.province || "—") : "PRIVATE" },
                { label: "POINTS", value: `${student.lifetimePoints.toLocaleString()} PTS` },
                { label: "JOINED", value: `${joinedYear}` },
              ].map((field, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    borderBottom: idx < 6 ? "1px solid #f4f4f5" : "none",
                    paddingBottom: "4px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ width: "85px", fontSize: "9px", color: "#a1a1aa", fontWeight: "900" }}>
                    {field.label}
                  </span>
                  <span style={{ fontSize: "10px", color: "#000000", fontWeight: "900" }}>
                    : {field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Barcode & Footer line */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                background: "#0284c7",
                padding: "6px 0",
                textAlign: "center",
                color: "#ffffff",
                fontSize: "8.5px",
                fontWeight: "900",
                letterSpacing: "1px",
                borderTop: "3px solid #000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Kesararam with Digital © 2026 · kesararamwithdigital.tech
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
