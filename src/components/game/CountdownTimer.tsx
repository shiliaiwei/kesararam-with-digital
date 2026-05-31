"use client";

import { useEffect, useRef, useState } from "react";
import { sounds } from "@/lib/game-sounds";

interface CountdownTimerProps {
  endsAt: string;
  totalSeconds: number;
  onExpire?: () => void;
  muted?: boolean;
}

export function CountdownTimer({ endsAt, totalSeconds, onExpire, muted }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const mountedAtRef = useRef(Date.now());
  onExpireRef.current = onExpire;

  useEffect(() => {
    expiredRef.current = false;
    mountedAtRef.current = Date.now();
    const end = new Date(endsAt).getTime();

    // Minimum 1.5s before expire can fire — prevents accidental immediate trigger
    const MIN_ACTIVE_MS = 1500;

    const tick = () => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((end - now) / 1000));
      setRemaining(left);

      if (!muted) {
        if (left <= 5 && left > 0) sounds.urgent_tick();
        else if (left > 5) sounds.countdown_tick();
      }

      const activeMs = now - mountedAtRef.current;
      if (left === 0 && !expiredRef.current && activeMs >= MIN_ACTIVE_MS) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    };

    const intervalRef = { id: 0 as ReturnType<typeof setInterval> };
    const initTimeout = setTimeout(() => {
      tick();
      intervalRef.id = setInterval(tick, 1000);
    }, 200);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(intervalRef.id);
    };
  }, [endsAt, muted]);

  const pct = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const urgent = remaining <= 5;
  const warning = remaining <= 10;

  const color = urgent
    ? "#ef4444"
    : warning
      ? "#f97316"
      : "#22c55e";

  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg className="absolute inset-0 -rotate-90" width="80" height="80">
        <circle cx="40" cy="40" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
        />
      </svg>
      <span
        className="relative z-10 text-2xl font-black tabular-nums"
        style={{ color, fontVariantNumeric: "tabular-nums" }}
      >
        {remaining}
      </span>
    </div>
  );
}
