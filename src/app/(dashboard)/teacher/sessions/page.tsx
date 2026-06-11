import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { gameSessions } from "@/db/schema/game";
import { eq, desc } from "drizzle-orm";
import { SessionsContent } from "./sessions-content";

export const dynamic = "force-dynamic";

export default async function TeacherSessionsPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const mySessions = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.hostId, session.id))
    .orderBy(desc(gameSessions.createdAt))
    .limit(50);

  const totalSessions = mySessions.length;
  const activeSessions = mySessions.filter(s => s.status === "lobby" || s.status === "active").length;
  const completedSessions = mySessions.filter(s => s.status === "ended").length;

  // Serialize for client component
  const serializedSessions = mySessions.map(s => ({
    id: s.id,
    sessionCode: s.sessionCode,
    gameMode: s.gameMode,
    category: s.category ?? null,
    status: s.status,
    questionIds: s.questionIds as number[] | null,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <SessionsContent
      sessions={serializedSessions}
      totalSessions={totalSessions}
      activeSessions={activeSessions}
      completedSessions={completedSessions}
    />
  );
}
