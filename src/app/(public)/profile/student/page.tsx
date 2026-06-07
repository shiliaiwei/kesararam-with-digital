import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, classes, classEnrollments } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { CompleteProfileForm } from "@/components/profile/complete-profile-form";
import { StudentProfileDashboard } from "@/components/profile/student-profile-dashboard";

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
    } catch {
      // Stats columns not available yet — fall back to defaults
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

  return (
    <StudentProfileDashboard
      user={user}
      highestScore={highestScore}
      totalGamesPlayed={totalGamesPlayed}
      lifetimePoints={lifetimePoints}
      studentClassInfo={studentClassInfo}
    />
  );
}
