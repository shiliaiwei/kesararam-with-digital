"use client";

import { useGameSSE } from "./use-game-sse";
import { useGamePusher } from "./use-game-pusher";
import type { SSEEvent } from "@/lib/game-event-bus";

interface GameRealtimeResult {
  connected: boolean;
  error: string | null;
  reconnectCount?: number;
}

/**
 * Unified game real-time hook.
 * Acts as a drop-in replacement for useGameSSE.
 * Seamlessly manages either EventSource (SSE) or Pusher WebSockets depending
 * on the active system configurations, without breaking standard React hooks rules.
 */
export function useGameRealtime(
  code: string,
  onEvent: (event: SSEEvent) => void,
  enabled = true
): GameRealtimeResult {
  const provider = process.env.NEXT_PUBLIC_REALTIME_PROVIDER || "sse";
  const isSSE = provider === "sse";

  // Unconditional hook calls to respect React rules.
  // We control activation using the 'enabled' flag.
  const sse = useGameSSE(code, onEvent, enabled && isSSE);
  const pusher = useGamePusher(code, onEvent, enabled && !isSSE);

  if (isSSE) {
    return {
      connected: sse.connected,
      error: sse.error,
      reconnectCount: sse.reconnectCount,
    };
  }

  return {
    connected: pusher.connected,
    error: pusher.error,
    reconnectCount: 0, // Not applicable for managed Pusher WebSockets
  };
}
