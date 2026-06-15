import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants, gameSessionAnswers } from "@/db/schema/game";
import { questions, answers, topics, pointsLedger } from "@/db/schema/content";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { LeaderboardEntry } from "@/lib/game-event-bus";
import { broadcastEvent } from "@/lib/realtime-bus";
import { mapContentToGameType, type GameStatus } from "@/lib/game-engine";
import { awardStorePoints } from "@/lib/store-points/award";
import { eq, and, asc, sql } from "drizzle-orm";

async function buildLeaderboard(sessionId: number, prevRanks: Map<number, number>): Promise<LeaderboardEntry[]> {
  const participants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, sessionId));

  return participants
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((p, i) => ({
      userId: p.userId,
      displayName: p.displayName,
      avatar: p.avatar,
      totalScore: p.totalScore,
      rank: i + 1,
      rankChange: (prevRanks.get(p.userId) ?? i + 1) - (i + 1),
      correctAnswers: p.correctAnswers,
      currentStreak: p.currentStreak,
    }));
}

// Live teacher-hosted sessions are the ONLY source of public-leaderboard points.
// On game end we add each participant's score to their lifetime total AND write a
// pointsLedger row (so weekly/monthly windowed boards include the play).
async function syncScoresToUserProfiles(sessionId: number, gameMode: string) {
  console.log(`[syncScoresToUserProfiles] Syncing scores for session ${sessionId}`);

  // Atomically claim the session: flip scores_synced false→true in a single
  // statement. Only the request that wins this update proceeds; a retried or
  // duplicate "end" sees no row returned and skips, so points are never
  // added to lifetimePoints / the ledger twice.
  const [claimed] = await db
    .update(gameSessions)
    .set({ scoresSynced: true })
    .where(and(eq(gameSessions.id, sessionId), eq(gameSessions.scoresSynced, false)))
    .returning({ id: gameSessions.id });

  if (!claimed) {
    console.log(`[syncScoresToUserProfiles] Session ${sessionId} already synced — skipping`);
    return;
  }

  try {
    // Get all participants with their scores
    const participants = await db
      .select()
      .from(gameParticipants)
      .where(eq(gameParticipants.sessionId, sessionId));

    // Per-participant denominator for Store Points accuracy = questions answered.
    const answeredRows = await db
      .select({
        userId: gameSessionAnswers.userId,
        answered: sql<number>`COUNT(*)::int`,
      })
      .from(gameSessionAnswers)
      .where(eq(gameSessionAnswers.sessionId, sessionId))
      .groupBy(gameSessionAnswers.userId);
    const answeredByUser = new Map(answeredRows.map((r) => [r.userId, r.answered]));

    // Update each user's profile with their game score
    for (const participant of participants) {
      await db
        .update(users)
        .set({
          totalGamesPlayed: sql`${users.totalGamesPlayed} + 1`,
          lifetimePoints: sql`${users.lifetimePoints} + ${participant.totalScore}`,
          highestScore: sql`GREATEST(${users.highestScore}, ${participant.totalScore})`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, participant.userId));

      // Ledger row powers the weekly/monthly windowed leaderboards.
      if (participant.totalScore > 0) {
        await db.insert(pointsLedger).values({
          userId: participant.userId,
          source: `live-session:${sessionId}`,
          gameType: gameMode,
          points: participant.totalScore,
        });
      }

      // Store Points: one capped credit per participant per session (inert until
      // cutover). Idempotent on session+user, so a retried "end" never re-awards.
      const answered = answeredByUser.get(participant.userId) ?? participant.correctAnswers;
      if (answered > 0) {
        try {
          await awardStorePoints({
            userId: participant.userId,
            gameType: gameMode,
            attemptId: `live:${sessionId}`,
            correctUnits: participant.correctAnswers,
            totalUnits: answered,
            valid: true,
            idempotencyKey: `${participant.userId}:live:${sessionId}`,
          });
        } catch (err) {
          console.error(`[syncScoresToUserProfiles] store-points award failed for user ${participant.userId}:`, err);
        }
      }

      console.log(`[syncScoresToUserProfiles] Updated user ${participant.userId}: +${participant.totalScore} points`);
    }

    console.log(`[syncScoresToUserProfiles] Successfully synced ${participants.length} user profiles`);
  } catch (error) {
    console.error("[syncScoresToUserProfiles] Error syncing scores:", error);
    // Don't throw - we don't want to fail the game end if profile sync fails
  }
}

async function syncParticipantScoresFromAnswers(sessionId: number) {
  const participants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, sessionId));

  const answersList = await db
    .select()
    .from(gameSessionAnswers)
    .where(eq(gameSessionAnswers.sessionId, sessionId));

  const answersByUser = new Map<number, typeof answersList>();
  for (const ans of answersList) {
    if (!answersByUser.has(ans.userId)) {
      answersByUser.set(ans.userId, []);
    }
    answersByUser.get(ans.userId)!.push(ans);
  }

  for (const p of participants) {
    const userAnswers = answersByUser.get(p.userId) ?? [];
    
    let totalScore = 0;
    let correctAnswers = 0;
    for (const ans of userAnswers) {
      totalScore += ans.totalPoints;
      if (ans.isCorrect) {
        correctAnswers += 1;
      }
    }

    const sortedAnswers = [...userAnswers].sort((a, b) => a.answeredAt.getTime() - b.answeredAt.getTime());
    let currentStreak = 0;
    for (const ans of sortedAnswers) {
      if (ans.isCorrect) {
        currentStreak += 1;
      } else {
        currentStreak = 0;
      }
    }

    await db
      .update(gameParticipants)
      .set({
        totalScore,
        correctAnswers,
        currentStreak,
      })
      .where(
        and(
          eq(gameParticipants.sessionId, sessionId),
          eq(gameParticipants.userId, p.userId)
        )
      );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    console.log(`[CONTROL] Request for session code: ${code}`);

    const user = await getSession();
    if (!user) {
      console.log(`[CONTROL] Unauthorized - no user session`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(`[CONTROL] User: ${user.name} (${user.id})`);

    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.sessionCode, code.toUpperCase()));

    if (!session) {
      console.log(`[CONTROL] Session not found: ${code}`);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    console.log(`[CONTROL] Session found: ID=${session.id}, status=${session.status}, questionIds=${session.questionIds?.length || 0}`);

    const isHost = session.hostId === user.id;
    const isAdmin = user.role === "admin";
    if (!isHost && !isAdmin) {
      console.log(`[CONTROL] Forbidden - user ${user.id} is not host ${session.hostId}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body as { action: "start" | "advance" | "pause" | "reveal" | "resume" | "end" | "terminate" | "back" };
    console.log(`[CONTROL] Action: ${action}`);

    const currentStatus = session.status as GameStatus;

    // ── TERMINATE (delete lobby before starting) ──────────────────────────────
    if (action === "terminate") {
      if (currentStatus !== "lobby")
        return NextResponse.json({ error: "Can only terminate a lobby" }, { status: 409 });
      await db.update(gameSessions)
        .set({ status: "ended", endedAt: new Date() })
        .where(eq(gameSessions.id, session.id));
      await broadcastEvent(code.toUpperCase(), { type: "warning", message: "Session terminated by host" });
      return NextResponse.json({ status: "ended" });
    }

    // ── START ─────────────────────────────────────────────────────────────────
    if (action === "start") {
      console.log(`[START] Session ${session.id}, status: ${currentStatus}, questionIds:`, session.questionIds);

      // Allow re-start if already active (idempotent)
      if (currentStatus !== "lobby" && currentStatus !== "active")
        return NextResponse.json({ error: `Cannot start from status: ${currentStatus}` }, { status: 409 });

      if (!session.questionIds?.length) {
        console.error(`[START] No questions in session ${session.id}`);
        return NextResponse.json({ error: "No questions in session" }, { status: 400 });
      }

      const now = new Date();
      const firstQId = session.questionIds[0];
      console.log(`[START] First question ID: ${firstQId}`);

      await db.update(gameSessions)
        .set({ status: "active", startedAt: now, currentQuestionIndex: 0, questionStartedAt: now })
        .where(eq(gameSessions.id, session.id));

      const q = await getQuestionPayload(firstQId);
      const endsAt = new Date(now.getTime() + session.timePerQuestion * 1000);

      await broadcastEvent(code.toUpperCase(), {
        type: "question_start",
        question: q,
        startsAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
        index: 0,
        total: session.questionIds.length,
      });

      console.log(`[START] Game started successfully, broadcasting question 1/${session.questionIds.length}`);
      return NextResponse.json({ status: "active", currentQuestionIndex: 0 });
    }

    // ── REVEAL (Reveal answer & rankings for current question without moving index) ───────────
    if (action === "reveal") {
      if (currentStatus !== "active")
        return NextResponse.json({ error: "Session not active" }, { status: 409 });

      const idx = session.currentQuestionIndex ?? 0;
      const qIds = session.questionIds ?? [];
      const currentQId = qIds[idx];
      const now = new Date();

      // Correct answer for reveal
      const [correctAnswer] = await db
        .select({ id: answers.id })
        .from(answers)
        .where(and(eq(answers.questionId, currentQId), eq(answers.isCorrect, true)))
        .limit(1);

      // Insert timeout records for non-answerers
      const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.sessionId, session.id));
      const answered = await db.select({ userId: gameSessionAnswers.userId }).from(gameSessionAnswers)
        .where(and(eq(gameSessionAnswers.sessionId, session.id), eq(gameSessionAnswers.questionId, currentQId)));
      const answeredSet = new Set(answered.map(a => a.userId));

      for (const p of participants) {
        if (!answeredSet.has(p.userId)) {
          try {
            await db.insert(gameSessionAnswers).values({
              sessionId: session.id, userId: p.userId, questionId: currentQId,
              answerId: null, answeredAt: now, isCorrect: false,
              speedScore: 0, streakBonus: 0, totalPoints: 0, remainingTimeMs: 0,
            });
            await db.update(gameParticipants).set({ currentStreak: 0 })
              .where(and(eq(gameParticipants.sessionId, session.id), eq(gameParticipants.userId, p.userId)));
          } catch { /* already answered */ }
        }
      }

      const prevRanks = new Map([...participants].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => [p.userId, i + 1]));
      const leaderboard = await buildLeaderboard(session.id, prevRanks);

      // Broadcast question_end so clients see the correct answer + round leaderboard
      await broadcastEvent(code.toUpperCase(), {
        type: "question_end",
        correctAnswerId: correctAnswer?.id ?? null,
        leaderboard,
      });

      return NextResponse.json({ status: "active", currentQuestionIndex: idx, revealed: true });
    }

    // ── BACK (Go backward: revert reveal or decrement question index or go back to lobby) ──
    if (action === "back") {
      const { currentPhase } = body as { currentPhase?: "active" | "round_end" };
      console.log(`[BACK] Session ${session.id}, status: ${currentStatus}, currentQuestionIndex: ${session.currentQuestionIndex}, currentPhase: ${currentPhase}`);

      if (currentStatus !== "active") {
        return NextResponse.json({ error: "Session not active" }, { status: 409 });
      }

      const idx = session.currentQuestionIndex ?? 0;
      const qIds = session.questionIds ?? [];
      const now = new Date();

      if (currentPhase === "round_end") {
        // ── Case 1: Revert from round_end (revealed) to active of the SAME question ──
        const currentQId = qIds[idx];
        
        // 1. Delete answers for this question
        await db
          .delete(gameSessionAnswers)
          .where(
            and(
              eq(gameSessionAnswers.sessionId, session.id),
              eq(gameSessionAnswers.questionId, currentQId)
            )
          );

        // 2. Recalculate and sync participant scores
        await syncParticipantScoresFromAnswers(session.id);

        // 3. Reset questionStartedAt so the timer starts fresh
        await db
          .update(gameSessions)
          .set({ questionStartedAt: now })
          .where(eq(gameSessions.id, session.id));

        // 4. Fetch question payload
        const q = await getQuestionPayload(currentQId);
        const endsAt = new Date(now.getTime() + session.timePerQuestion * 1000);

        // 5. Broadcast question_start to make students see the question again
        await broadcastEvent(code.toUpperCase(), {
          type: "question_start",
          question: q,
          startsAt: now.toISOString(),
          endsAt: endsAt.toISOString(),
          index: idx,
          total: qIds.length,
        });

        return NextResponse.json({ status: "active", currentQuestionIndex: idx });
      } else {
        // ── Case 2: Go back from active question screen to previous state ──
        if (idx === 0) {
          // ── Case 2a: If on the FIRST question, go back to LOBBY ──
          const currentQId = qIds[0];
          
          // 1. Delete answers for the first question
          await db
            .delete(gameSessionAnswers)
            .where(
              and(
                eq(gameSessionAnswers.sessionId, session.id),
                eq(gameSessionAnswers.questionId, currentQId)
              )
            );

          // 2. Recalculate scores
          await syncParticipantScoresFromAnswers(session.id);

          // 3. Set status to lobby
          await db
            .update(gameSessions)
            .set({ status: "lobby", currentQuestionIndex: 0, questionStartedAt: null, startedAt: null })
            .where(eq(gameSessions.id, session.id));

          // 4. Fetch participants
          const participants = await db
            .select()
            .from(gameParticipants)
            .where(eq(gameParticipants.sessionId, session.id));

          // 5. Broadcast lobby_update forcing clients to lobby
          await broadcastEvent(code.toUpperCase(), {
            type: "lobby_update",
            forceLobby: true,
            participants: participants.map((p) => ({
              userId: p.userId,
              displayName: p.displayName,
              avatar: p.avatar,
              totalScore: p.totalScore,
              isConnected: p.isConnected ?? true,
            })),
          });

          return NextResponse.json({ status: "lobby", currentQuestionIndex: 0 });
        } else {
          // ── Case 2b: If on question > 0, go back to previous question's round_end phase ──
          const prevIdx = idx - 1;
          const prevQId = qIds[prevIdx];
          const currentQId = qIds[idx];

          // 1. Delete answers for the current question (so when they advance to it again, it's fresh)
          await db
            .delete(gameSessionAnswers)
            .where(
              and(
                eq(gameSessionAnswers.sessionId, session.id),
                eq(gameSessionAnswers.questionId, currentQId)
              )
            );

          // 2. Recalculate and sync participant scores
          await syncParticipantScoresFromAnswers(session.id);

          // 3. Update currentQuestionIndex in database to the previous index
          await db
            .update(gameSessions)
            .set({ currentQuestionIndex: prevIdx })
            .where(eq(gameSessions.id, session.id));

          // 4. Correct answer for the previous question
          const [correctAnswer] = await db
            .select({ id: answers.id })
            .from(answers)
            .where(and(eq(answers.questionId, prevQId), eq(answers.isCorrect, true)))
            .limit(1);

          // 5. Build leaderboard
          const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.sessionId, session.id));
          const prevRanks = new Map([...participants].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => [p.userId, i + 1]));
          const leaderboard = await buildLeaderboard(session.id, prevRanks);

          // 6. Broadcast question_end for the previous question index
          await broadcastEvent(code.toUpperCase(), {
            type: "question_end",
            correctAnswerId: correctAnswer?.id ?? null,
            leaderboard,
          });

          return NextResponse.json({ status: "active", currentQuestionIndex: prevIdx });
        }
      }
    }

    // ── ADVANCE (Increment index and broadcast next question_start cleanly) ───────────────────
    if (action === "advance") {
      // Idempotent: if already ended, just return ok
      if (currentStatus === "ended")
        return NextResponse.json({ status: "ended" });
      if (currentStatus !== "active")
        return NextResponse.json({ error: "Session not active" }, { status: 409 });

      const idx = session.currentQuestionIndex ?? 0;
      const qIds = session.questionIds ?? [];
      const nextIdx = idx + 1;
      const now = new Date();

      // Last question — end game and render final Podium
      if (nextIdx >= qIds.length) {
        await db.update(gameSessions).set({ status: "ended", endedAt: now }).where(eq(gameSessions.id, session.id));
        
        const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.sessionId, session.id));
        const prevRanks = new Map([...participants].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => [p.userId, i + 1]));
        const leaderboard = await buildLeaderboard(session.id, prevRanks);

        for (const entry of leaderboard) {
          await db.update(gameParticipants).set({ rank: entry.rank })
            .where(and(eq(gameParticipants.sessionId, session.id), eq(gameParticipants.userId, entry.userId)));
        }

        // Sync scores to user profiles for leaderboard persistence
        await syncScoresToUserProfiles(session.id, session.gameMode);

        // Broadcast session_end to transition players cleanly to final podium
        await broadcastEvent(code.toUpperCase(), { type: "session_end", podium: leaderboard.slice(0, 3), finalLeaderboard: leaderboard });

        // After 30 seconds, send a final close event
        setTimeout(async () => {
          await broadcastEvent(code.toUpperCase(), { type: "warning", message: "Session closed. Please exit." });
        }, 30000);

        return NextResponse.json({ status: "ended" });
      }

      // ── Next question — complete ALL DB writes BEFORE broadcasting ──────────
      const nextQId = qIds[nextIdx];
      const nextNow = new Date();

      // DB write first
      await db.update(gameSessions)
        .set({ currentQuestionIndex: nextIdx, questionStartedAt: nextNow })
        .where(eq(gameSessions.id, session.id));

      // Fetch next question payload
      const q = await getQuestionPayload(nextQId);
      const endsAt = new Date(nextNow.getTime() + session.timePerQuestion * 1000);

      // Start the next question for all clients without visual glitches
      await broadcastEvent(code.toUpperCase(), {
        type: "question_start", question: q,
        startsAt: nextNow.toISOString(), endsAt: endsAt.toISOString(),
        index: nextIdx, total: qIds.length,
      });

      return NextResponse.json({ status: "active", currentQuestionIndex: nextIdx });
    }

    // ── PAUSE ─────────────────────────────────────────────────────────────────
    if (action === "pause") {
      if (currentStatus !== "active") return NextResponse.json({ error: "Not active" }, { status: 409 });
      await db.update(gameSessions).set({ status: "paused" }).where(eq(gameSessions.id, session.id));
      await broadcastEvent(code.toUpperCase(), { type: "session_paused" });
      return NextResponse.json({ status: "paused" });
    }

    // ── RESUME ────────────────────────────────────────────────────────────────
    if (action === "resume") {
      if (currentStatus !== "paused") return NextResponse.json({ error: "Not paused" }, { status: 409 });
      await db.update(gameSessions).set({ status: "active" }).where(eq(gameSessions.id, session.id));
      await broadcastEvent(code.toUpperCase(), { type: "session_resumed" });
      return NextResponse.json({ status: "active" });
    }

    // ── END ───────────────────────────────────────────────────────────────────
    if (action === "end") {
      if (currentStatus === "ended") return NextResponse.json({ status: "ended" });
      const now = new Date();
      await db.update(gameSessions).set({ status: "ended", endedAt: now }).where(eq(gameSessions.id, session.id));
      const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.sessionId, session.id));
      const prevRanks = new Map([...participants].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => [p.userId, i + 1]));
      const leaderboard = await buildLeaderboard(session.id, prevRanks);

      // Save final ranks
      for (const entry of leaderboard) {
        await db.update(gameParticipants).set({ rank: entry.rank })
          .where(and(eq(gameParticipants.sessionId, session.id), eq(gameParticipants.userId, entry.userId)));
      }

      // Sync scores to user profiles for leaderboard persistence
      await syncScoresToUserProfiles(session.id, session.gameMode);

      await broadcastEvent(code.toUpperCase(), { type: "session_end", podium: leaderboard.slice(0, 3), finalLeaderboard: leaderboard });

      // After 30 seconds, send a final close event to disconnect all clients
      setTimeout(async () => {
        await broadcastEvent(code.toUpperCase(), { type: "warning", message: "Session closed. Please exit." });
      }, 30000);

      return NextResponse.json({ status: "ended" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Control route error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

async function getQuestionPayload(questionId: number) {
  try {
    console.log(`[getQuestionPayload] Fetching question ${questionId}`);

    // Explicitly select only the columns we need to avoid schema mismatch
    const [q] = await db
      .select({
        id: questions.id,
        questionEn: questions.questionEn,
        questionKm: questions.questionKm,
        imageUrl: questions.imageUrl,
        audioUrlEn: questions.audioUrlEn,
        audioUrlKm: questions.audioUrlKm,
        difficulty: questions.difficulty,
        topicId: questions.topicId,
      })
      .from(questions)
      .where(eq(questions.id, questionId));

    if (!q) {
      console.error(`[getQuestionPayload] Question ${questionId} not found`);
      throw new Error(`Question ${questionId} not found`);
    }

    // Safely query the topicCode separately to avoid Neon subquery parameter binding errors
    let topicCode = null;
    if (q.topicId) {
      try {
        const [t] = await db
          .select({ topicCode: topics.topicCode })
          .from(topics)
          .where(eq(topics.id, q.topicId));
        if (t) {
          topicCode = t.topicCode;
        }
      } catch (err) {
        console.error(`[getQuestionPayload] Error fetching topicCode for topic ID ${q.topicId}:`, err);
      }
    }

    const ans = await db
      .select({
        id: answers.id,
        answerEn: answers.answerEn,
        answerKm: answers.answerKm,
        imageUrl: answers.imageUrl,
      })
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .orderBy(asc(answers.sortOrder));

    console.log(`[getQuestionPayload] Found ${ans.length} answers for question ${questionId}`);

    if (ans.length === 0) {
      console.error(`[getQuestionPayload] No answers found for question ${questionId}`);
      throw new Error(`No answers found for question ${questionId}`);
    }

    const gameType = mapContentToGameType({
      answerCount: ans.length,
      hasImage: ans.some(a => !!a.imageUrl),
      hasAudio: !!(q.audioUrlEn || q.audioUrlKm)
    });

    const payload = {
      id: q.id,
      questionEn: q.questionEn,
      questionKm: q.questionKm,
      imageUrl: q.imageUrl ?? null,
      audioUrlEn: q.audioUrlEn ?? null,
      audioUrlKm: q.audioUrlKm ?? null,
      difficulty: q.difficulty ?? null,
      gameType,
      answers: ans
        .map(a => ({ ...a, _r: Math.random() }))
        .sort((a, b) => a._r - b._r)
        .map(({ _r, ...a }) => ({
          id: a.id,
          answerEn: a.answerEn,
          answerKm: a.answerKm,
          imageUrl: a.imageUrl ?? null
        })),
      topicCode: topicCode ?? null,
    };

    console.log(`[getQuestionPayload] Returning payload:`, JSON.stringify(payload, null, 2));
    return payload;
  } catch (error) {
    console.error("getQuestionPayload error:", error);
    throw error;
  }
}
