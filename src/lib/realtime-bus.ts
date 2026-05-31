import { broadcast as broadcastSSE, SSEEvent } from "./game-event-bus";

/**
 * Unified server-side broadcast router.
 * Routes events to either the in-memory Server-Sent Events (SSE) bus
 * or the Pusher edge WebSocket network depending on active configurations.
 */
export async function broadcastEvent(code: string, event: SSEEvent): Promise<boolean> {
  const provider = process.env.NEXT_PUBLIC_REALTIME_PROVIDER || "sse";

  if (provider === "pusher") {
    try {
      // Lazily import the Pusher broadcast adapter to keep SSE mode lightweight
      const { broadcastRealtime } = await import("./game-realtime-bus");
      return await broadcastRealtime(code, event);
    } catch (err) {
      console.error("Failed to execute Pusher dynamic import or broadcast:", err);
      // Failover to SSE in case of dependency or execution errors in production
      broadcastSSE(code, event);
      return false;
    }
  }

  // Fallback / default: local in-memory SSE event bus
  broadcastSSE(code, event);
  return true;
}
