import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants, gameSessionAnswers } from "@/db/schema/game";
import { questions } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

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

  const isHost = session.hostId === user.id;
  const isAdmin = user.role === "admin";
  if (!isHost && !isAdmin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const participants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, session.id));

  const allAnswers = await db
    .select()
    .from(gameSessionAnswers)
    .where(eq(gameSessionAnswers.sessionId, session.id));

  const totalParticipants = participants.length;
  const avgScore =
    totalParticipants > 0
      ? Math.round(
          participants.reduce((s, p) => s + p.totalScore, 0) / totalParticipants
        )
      : 0;

  const totalAnswers = allAnswers.length;
  const correctAnswers = allAnswers.filter((a) => a.isCorrect).length;
  const avgAccuracy =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  // Per-question stats
  const qIds = session.questionIds ?? [];
  const perQuestion = await Promise.all(
    qIds.map(async (qId, idx) => {
      const qAnswers = allAnswers.filter((a) => a.questionId === qId);
      const correct = qAnswers.filter((a) => a.isCorrect).length;
      const total = qAnswers.length;
      const correctRate = total > 0 ? correct / total : 0;

      const [q] = await db
        .select({ questionEn: questions.questionEn, questionKm: questions.questionKm })
        .from(questions)
        .where(eq(questions.id, qId));

      const avgTime =
        total > 0
          ? Math.round(
              qAnswers.reduce((s, a) => s + (a.remainingTimeMs ?? 0), 0) / total
            )
          : 0;

      // Most selected wrong answer
      const wrongAnswers = qAnswers.filter((a) => !a.isCorrect && a.answerId);
      const wrongCounts = new Map<number, number>();
      for (const wa of wrongAnswers) {
        if (wa.answerId) wrongCounts.set(wa.answerId, (wrongCounts.get(wa.answerId) ?? 0) + 1);
      }
      const mostWrong = [...wrongCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      return {
        index: idx,
        questionId: qId,
        questionEn: q?.questionEn ?? "",
        questionKm: q?.questionKm ?? "",
        correctRate,
        averageRemainingMs: avgTime,
        mostSelectedWrongAnswer: mostWrong,
        needsReview: correctRate < 0.5,
        totalAnswers: total,
      };
    })
  );

  // Per-student stats
  const perStudent = participants.map((p) => {
    const pAnswers = allAnswers.filter((a) => a.userId === p.userId);
    const pCorrect = pAnswers.filter((a) => a.isCorrect).length;
    const pTotal = pAnswers.length;
    const avgTime =
      pTotal > 0
        ? Math.round(pAnswers.reduce((s, a) => s + (a.remainingTimeMs ?? 0), 0) / pTotal)
        : 0;

    return {
      userId: p.userId,
      displayName: p.displayName,
      avatar: p.avatar,
      totalScore: p.totalScore,
      correctAnswers: pCorrect,
      incorrectAnswers: pTotal - pCorrect,
      averageRemainingMs: avgTime,
      rank: p.rank,
    };
  });

  return NextResponse.json({
    summary: {
      totalParticipants,
      averageScore: avgScore,
      averageAccuracy: avgAccuracy,
      totalQuestions: qIds.length,
      sessionCode: session.sessionCode,
      gameMode: session.gameMode,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    },
    perQuestion,
    perStudent: perStudent.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)),
  });
}
