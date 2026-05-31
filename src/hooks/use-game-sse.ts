"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { SSEEvent } from "@/lib/game-event-bus";

/**
 * Stable SSE hook with proper reconnect handling.
 *
 * Fixes:
 * - mountedRef prevents stale closures from firing reconnects after unmount
 * - Backoff state is stored in refs (no re-renders)
 * - On reconnect, old EventSource is closed before opening new one
 * - Max 10 retries, capped at 15s backoff
 */
export function useGameSSE(code: string, onEvent: (event: SSEEvent) => void, enabled = true) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const esRef = useRef<EventSource | null>(null);
  const mountedRef = useRef(true);
  const attemptsRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const cleanup = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (esRef.current) {
      esRef.current.onopen = null;
      esRef.current.onmessage = null;
      esRef.current.onerror = null;
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current || !enabled || !code) return;

    // Close any existing connection first
    cleanup();

    const es = new EventSource(`/api/game/sessions/${code}/events`);
    esRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) { es.close(); return; }
      attemptsRef.current = 0;
      setConnected(true);
      setError(null);
      setReconnectCount(c => c + 1);
    };

    es.onmessage = (e) => {
      if (!mountedRef.current) return;
      try {
        const event = JSON.parse(e.data) as SSEEvent;
        if (event.type === "ping") return; // heartbeat — ignore
        onEventRef.current(event);
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      if (!mountedRef.current) return;

      // Close the broken connection
      es.onopen = null;
      es.onmessage = null;
      es.onerror = null;
      es.close();
      esRef.current = null;

      setConnected(false);
      attemptsRef.current++;

      if (attemptsRef.current <= 10) {
        const delay = Math.min(500 * Math.pow(1.8, attemptsRef.current - 1), 15000);
        retryTimerRef.current = setTimeout(connect, delay);
      } else {
        setError("Connection lost. Please refresh the page.");
      }
    };
  }, [code, enabled, cleanup]);

  useEffect(() => {
    mountedRef.current = true;
    attemptsRef.current = 0;

    if (enabled && code) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [connect, enabled, code, cleanup]);

  return { connected, error, reconnectCount };
}
