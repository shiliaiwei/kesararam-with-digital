import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants } from "@/db/schema/game";
import { getSession } from "@/lib/auth";
import { subscribe, unsubscribe, broadcast } from "@/lib/game-event-bus";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const user = await getSession();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [session] = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.sessionCode, code.toUpperCase()));

  if (!session) return new Response("Session not found", { status: 404 });

  // Mark participant connected (scoped to this user only)
  await db
    .update(gameParticipants)
    .set({ isConnected: true, lastSeenAt: new Date() })
    .where(
      and(
        eq(gameParticipants.sessionId, session.id),
        eq(gameParticipants.userId, user.id)
      )
    );

  let ctrl: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(controller) {
      ctrl = controller;
      subscribe(code.toUpperCase(), ctrl);

      // Send initial ping
      ctrl.enqueue(`data: ${JSON.stringify({ type: "ping" })}\n\n`);

      // Send catch-up state immediately on connect
      // If session is active → send question_start so late/reconnecting clients catch up
      // If session is lobby → send lobby_update as usual
      db.select()
        .from(gameParticipants)
        .where(eq(gameParticipants.sessionId, session.id))
        .then(async (participants) => {
          try {
            if (session.status === "active" && session.questionIds?.length) {
              // Import what we need for catch-up
              const { questions, answers } = await import("@/db/schema/content");
              const { mapContentToGameType } = await import("@/lib/game-engine");
              const { seededShuffle } = await import("@/lib/question-selector");
              const { eq: eqFn, asc } = await import("drizzle-orm");

              const qId = session.questionIds[session.currentQuestionIndex ?? 0];
              const [q] = await db.select({
                id: questions.id, questionEn: questions.questionEn,
                questionKm: questions.questionKm, imageUrl: questions.imageUrl,
                audioUrlEn: questions.audioUrlEn, audioUrlKm: questions.audioUrlKm,
              }).from(questions).where(eqFn(questions.id, qId));

              const ans = await db.select({
                id: answers.id, answerEn: answers.answerEn,
                answerKm: answers.answerKm, imageUrl: answers.imageUrl,
              }).from(answers).where(eqFn(answers.questionId, qId)).orderBy(asc(answers.sortOrder));

              if (q && ans.length > 0) {
                const endsAt = session.questionStartedAt
                  ? new Date(session.questionStartedAt.getTime() + session.timePerQuestion * 1000).toISOString()
                  : new Date(Date.now() + session.timePerQuestion * 1000).toISOString();

                ctrl.enqueue(`data: ${JSON.stringify({
                  type: "question_start",
                  question: {
                    id: q.id, questionEn: q.questionEn, questionKm: q.questionKm,
                    imageUrl: q.imageUrl ?? null, audioUrlEn: q.audioUrlEn ?? null,
                    audioUrlKm: q.audioUrlKm ?? null,
                    gameType: mapContentToGameType({ answerCount: ans.length, hasImage: ans.some(a => !!a.imageUrl), hasAudio: !!(q.audioUrlEn || q.audioUrlKm) }),
                    answers: seededShuffle(ans, `${session.sessionCode}:${qId}`).map(a => ({ id: a.id, answerEn: a.answerEn, answerKm: a.answerKm, imageUrl: a.imageUrl ?? null })),
                  },
                  startsAt: session.questionStartedAt?.toISOString() ?? new Date().toISOString(),
                  endsAt,
                  index: session.currentQuestionIndex ?? 0,
                  total: session.questionIds.length,
                  catchUp: true,
                })}\n\n`);
                return;
              }
            }

            if (session.status === "ended") {
              ctrl.enqueue(`data: ${JSON.stringify({ type: "session_end", podium: [], finalLeaderboard: [] })}\n\n`);
              return;
            }

            // Default: lobby_update
            ctrl.enqueue(`data: ${JSON.stringify({
              type: "lobby_update",
              participants: participants.map((p) => ({
                userId: p.userId, displayName: p.displayName,
                avatar: p.avatar, totalScore: p.totalScore,
                isConnected: p.isConnected ?? true,
              })),
            })}\n\n`);
          } catch { }
        });
    },
    cancel() {
      unsubscribe(code.toUpperCase(), ctrl);
      // Mark this user disconnected
      db.update(gameParticipants)
        .set({ isConnected: false, lastSeenAt: new Date() })
        .where(
          and(
            eq(gameParticipants.sessionId, session.id),
            eq(gameParticipants.userId, user.id)
          )
        )
        .catch(() => { });
    },
  });

  // Keepalive ping every 10s (faster dead-connection detection)
  const pingInterval = setInterval(() => {
    try {
      broadcast(code.toUpperCase(), { type: "ping" });
    } catch {
      clearInterval(pingInterval);
    }
  }, 10000);

  req.signal.addEventListener("abort", () => {
    clearInterval(pingInterval);
    unsubscribe(code.toUpperCase(), ctrl);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
