import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq, and, sql, desc } from "drizzle-orm";
import StudentProfileClient, { SerializableStudent } from "./StudentProfileClient";

interface Props {
  params: Promise<{ username: string }>;
}

// Generate dynamic metadata for SEO and social sharing preview
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    const result = await db
      .select({
        displayName: users.displayName,
        username: users.username,
      })
      .from(users)
      .where(and(eq(users.username, username), eq(users.isActive, true), eq(users.role, "student")))
      .limit(1);

    if (!result || result.length === 0) {
      return {
        title: "Student Profile Not Found — KWD Quiz",
      };
    }

    const student = result[0];
    const name = student.displayName || student.username;

    const desc = `View ${name}'s Student Identification Card, quiz scores, level progress, and unlocked rewards from Kesararam Primary School.`;
    const url = `https://kesararamwithdigital.tech/u/${student.username}`;
    return {
      title: `${name} — Student Profile`,
      description: desc,
      openGraph: {
        title: `${name} — KWD Student Profile`,
        description: desc,
        type: "profile",
        url,
        siteName: "KWD Quiz · Kesararam With Digital",
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} — KWD Student Profile`,
        description: desc,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for student profile:", error);
    return {
      title: "Student Profile — KWD Quiz",
    };
  }
}

export default async function PublicStudentProfilePage({ params }: Props) {
  const { username } = await params;

  // 1. Fetch student details from the database server-side
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
      schoolName: users.schoolName,
      province: users.province,
      gradeLevel: users.gradeLevel,
      section: users.section,
      claimedRewards: users.claimedRewards,
      isProfilePublic: users.isProfilePublic,
      isNamePublic: users.isNamePublic,
      isUsernamePublic: users.isUsernamePublic,
      isSchoolPublic: users.isSchoolPublic,
      isProvincePublic: users.isProvincePublic,
      isGradePublic: users.isGradePublic,
      isSectionPublic: users.isSectionPublic,
      isStatsPublic: users.isStatsPublic,
    })
    .from(users)
    .where(and(eq(users.username, username), eq(users.isActive, true), eq(users.role, "student")))
    .limit(1);

  if (!result || result.length === 0) {
    notFound();
  }

  const student = result[0];

  // 2. Fetch the ranked list to calculate the exact real-time leaderboard rank
  const activeStudents = await db
    .select({
      username: users.username,
    })
    .from(users)
    .where(sql`${users.isActive} = true AND ${users.role} = 'student'`)
    .orderBy(desc(users.lifetimePoints), desc(users.highestScore));

  const studentIndex = activeStudents.findIndex(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  const rank = studentIndex !== -1 ? studentIndex + 1 : 99;

  // 3. Serialize Date objects to strings to pass cleanly as client-side props
  const serializableStudent: SerializableStudent = {
    ...student,
    avatarChangedAt: student.avatarChangedAt ? student.avatarChangedAt.toISOString() : null,
    createdAt: student.createdAt ? student.createdAt.toISOString() : new Date().toISOString(),
  };

  return <StudentProfileClient student={serializableStudent} rank={rank} />;
}
