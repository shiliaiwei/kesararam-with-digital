"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { SSEEvent } from "@/lib/game-event-bus";

export function useGameSSE(code: string, onEvent: (event: SSEEvent) => void, enabled = true) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const attemptsRef = useRef(0);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!enabled || !code) return;

    const es = new EventSource(`/api/game/sessions/${code}/events`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as SSEEvent;
        onEventRef.current(event);
      } catch {}
    };

    es.onopen = () => {
      attemptsRef.current = 0;
      setConnected(true);
      setError(null);
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setConnected(false);
      attemptsRef.current++;
      if (attemptsRef.current <= 5) {
        const delay = Math.min(1000 * Math.pow(2, attemptsRef.current - 1), 30000);
        setTimeout(connect, delay);
      } else {
        setError("Failed to connect to game session");
      }
    };
  }, [code, enabled]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);

  return { connected, error };
}
