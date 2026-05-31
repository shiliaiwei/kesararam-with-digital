"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Pusher from "pusher-js";
import type { SSEEvent } from "@/lib/game-event-bus";

interface PusherHookResult {
  connected: boolean;
  error: string | null;
}

export function useGamePusher(
  code: string,
  onEvent: (event: SSEEvent) => void,
  enabled = true
): PusherHookResult {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pusherRef = useRef<Pusher | null>(null);
  const mountedRef = useRef(true);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  // Unified function to fetch current state and perform self-healing catchup
  const triggerCatchupState = useCallback(async () => {
    if (!mountedRef.current || !code) return;
    try {
      const res = await fetch(`/api/game/sessions/${code}/state`);
      if (!res.ok) return;

      const state = await res.json();
      if (!mountedRef.current) return;

      // Dispatch appropriate SSEEvent based on snapshot state to sync frontend
      if (state.status === "lobby") {
        onEventRef.current({
          type: "lobby_update",
          participants: state.participants || [],
        });
      } else if (state.status === "active" && state.currentQuestion) {
        onEventRef.current({
          type: "question_start",
          question: state.currentQuestion,
          startsAt: state.endsAt 
            ? new Date(new Date(state.endsAt).getTime() - (state.timePerQuestion * 1000)).toISOString()
            : new Date().toISOString(),
          endsAt: state.endsAt || new Date().toISOString(),
          index: state.currentQuestionIndex ?? 0,
          total: state.totalQuestions ?? 0,
          catchUp: true,
        });
      } else if (state.status === "ended") {
        onEventRef.current({
          type: "session_end",
          podium: [],
          finalLeaderboard: state.participants || [],
        });
      }
    } catch (err) {
      console.warn("Real-time catchup state fetch failed:", err);
    }
  }, [code]);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled || !code) {
      setConnected(false);
      return;
    }

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

    if (!key) {
      console.error("NEXT_PUBLIC_PUSHER_KEY is missing in client-side environment variables.");
      setError("Pusher key missing. Configure .env.local");
      return;
    }

    // 1. Initialize Pusher Client
    const pusher = new Pusher(key, {
      cluster,
      forceTLS: true,
    });
    pusherRef.current = pusher;

    const channelName = `game-${code.toUpperCase()}`;
    const channel = pusher.subscribe(channelName);

    // 2. Set up event bindings
    pusher.connection.bind("connected", () => {
      if (!mountedRef.current) return;
      setConnected(true);
      setError(null);
      
      // Trigger self-healing state fetch on initial connect or reconnect
      triggerCatchupState();
    });

    pusher.connection.bind("disconnected", () => {
      if (!mountedRef.current) return;
      setConnected(false);
    });

    pusher.connection.bind("error", (err: any) => {
      if (!mountedRef.current) return;
      console.error("Pusher connection error:", err);
      setError("Connection lost. Retrying...");
      setConnected(false);
    });

    // Receive standard live game events and pass them to page controllers
    channel.bind("game-event", (data: SSEEvent) => {
      if (!mountedRef.current) return;
      if (data.type === "ping") return; // Skip heartbeats
      onEventRef.current(data);
    });

    // Cleanup on unmount or dependency change
    return () => {
      mountedRef.current = false;
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, [code, enabled, triggerCatchupState]);

  return { connected, error };
}
