import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants } from "@/db/schema/game";
import { questions, answers } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { mapContentToGameType } from "@/lib/game-engine";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [session] = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.sessionCode, code.toUpperCase()));

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const participants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, session.id));

  let currentQuestion = null;
  if (session.status === "active" && session.questionIds?.length) {
    const qId = session.questionIds[session.currentQuestionIndex ?? 0];
    const [q] = await db.select().from(questions).where(eq(questions.id, qId));
    const ans = await db
      .select()
      .from(answers)
      .where(eq(answers.questionId, qId))
      .orderBy(answers.sortOrder);

    if (q) {
      currentQuestion = {
        id: q.id,
        questionEn: q.questionEn,
        questionKm: q.questionKm,
        imageUrl: q.imageUrl,
        audioUrlEn: q.audioUrlEn,
        audioUrlKm: q.audioUrlKm,
        gameType: mapContentToGameType({
          answerCount: ans.length,
          hasImage: !!q.imageUrl,
          hasAudio: !!(q.audioUrlEn || q.audioUrlKm),
        }),
        answers: ans.map((a) => ({
          id: a.id,
          answerEn: a.answerEn,
          answerKm: a.answerKm,
          imageUrl: a.imageUrl,
        })),
      };
    }
  }

  const endsAt =
    session.questionStartedAt && session.status === "active"
      ? new Date(
          session.questionStartedAt.getTime() + session.timePerQuestion * 1000
        ).toISOString()
      : null;

  return NextResponse.json({
    status: session.status,
    sessionName: session.sessionName,
    currentQuestionIndex: session.currentQuestionIndex,
    totalQuestions: session.questionIds?.length ?? 0,
    timePerQuestion: session.timePerQuestion,
    language: session.language,
    currentQuestion,
    endsAt,
    participants: participants.map((p) => ({
      userId: p.userId,
      displayName: p.displayName,
      avatar: p.avatar,
      totalScore: p.totalScore,
      isConnected: p.isConnected,
    })),
  });
}
