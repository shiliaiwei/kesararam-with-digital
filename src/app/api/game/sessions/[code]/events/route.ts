import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants } from "@/db/schema/game";
import { getSession } from "@/lib/auth";
import { subscribe, unsubscribe, broadcast } from "@/lib/game-event-bus";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

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

      // Send current lobby state immediately on connect
      db.select()
        .from(gameParticipants)
        .where(eq(gameParticipants.sessionId, session.id))
        .then((participants) => {
          try {
            ctrl.enqueue(
              `data: ${JSON.stringify({
                type: "lobby_update",
                participants: participants.map((p) => ({
                  userId: p.userId,
                  displayName: p.displayName,
                  avatar: p.avatar,
                  totalScore: p.totalScore,
                  isConnected: p.isConnected ?? true,
                })),
              })}\n\n`
            );
          } catch {}
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
        .catch(() => {});
    },
  });

  // Keepalive ping every 15s
  const pingInterval = setInterval(() => {
    try {
      broadcast(code.toUpperCase(), { type: "ping" });
    } catch {
      clearInterval(pingInterval);
    }
  }, 15000);

  req.signal.addEventListener("abort", () => {
    clearInterval(pingInterval);
    unsubscribe(code.toUpperCase(), ctrl);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
