"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

interface LeaderboardUser {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  rank: number;
}

function avatarSrc(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("https://res.cloudinary.com/")) {
    return `/api/profile-image?imageUrl=${encodeURIComponent(url)}`;
  }
  return url;
}

function Avatar({ url, name, size = 56 }: { url: string | null; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const src = avatarSrc(url);
  const initials = (name || "?").slice(0, 2).toUpperCase();

  if (!src || err) {
    return (
      <div
        className="flex items-center justify-center font-black text-white bg-zinc-700 border-2 border-black flex-shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className="object-cover border-2 border-black flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

// ── Rank badge configs ──────────────────────────────────────────────────────
const RANK_CONFIG = [
  {
    rank: 1,
    label: "Gold Champion",
    bg: "#eab308",
    shadow: "#ca8a04",
    textColor: "#000",
    scoreColor: "#000",
    size: "w-64 md:w-72",
    avatarSize: 80,
    scoreSize: "text-4xl",
    order: "order-first md:order-2",
    crown: "👑",
    ringColor: "#ffd700",
    pulseColor: "rgba(234,179,8,0.4)",
  },
  {
    rank: 2,
    label: "Silver",
    bg: "#fff",
    shadow: "#3b82f6",
    textColor: "#000",
    scoreColor: "#3b82f6",
    size: "w-56 md:w-60",
    avatarSize: 64,
    scoreSize: "text-2xl",
    order: "order-2 md:order-1",
    crown: "🥈",
    ringColor: "#93c5fd",
    pulseColor: "rgba(59,130,246,0.3)",
  },
  {
    rank: 3,
    label: "Bronze",
    bg: "#fff",
    shadow: "#f97316",
    textColor: "#000",
    scoreColor: "#f97316",
    size: "w-56 md:w-60",
    avatarSize: 64,
    scoreSize: "text-2xl",
    order: "order-3",
    crown: "🥉",
    ringColor: "#fdba74",
    pulseColor: "rgba(249,115,22,0.3)",
  },
];

function PodiumCard({ user, config, index }: {
  user: LeaderboardUser | undefined;
  config: typeof RANK_CONFIG[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 60, scale: 0.85 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: index * 0.15, ease: "back.out(1.6)" }
    );
  }, [index]);

  // Pulse ring animation for #1
  useEffect(() => {
    if (config.rank !== 1 || !ringRef.current) return;
    gsap.to(ringRef.current, {
      scale: 1.15,
      opacity: 0,
      duration: 1.4,
      repeat: -1,
      ease: "power2.out",
    });
  }, [config.rank]);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: hovered ? -8 : 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [hovered]);

  const name = user ? (user.displayName || user.username) : "—";

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col items-center gap-3 p-6 border-2 border-black ${config.size} ${config.order} cursor-default`}
      style={{
        backgroundColor: config.bg,
        boxShadow: hovered
          ? `8px 8px 0 ${config.shadow}`
          : `4px 4px 0 ${config.shadow}`,
        transition: "box-shadow 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pulse ring (rank 1 only) */}
      {config.rank === 1 && (
        <div
          ref={ringRef}
          className="absolute inset-0 border-4 pointer-events-none"
          style={{ borderColor: config.ringColor, opacity: 0.6 }}
        />
      )}

      {/* Rank badge */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <div
          className="relative flex items-center justify-center font-black text-sm px-3 py-1 border-2 border-black"
          style={{
            backgroundColor: config.shadow,
            color: "#fff",
            boxShadow: "2px 2px 0 #000",
            minWidth: 40,
          }}
        >
          <span className="mr-1">{config.crown}</span>
          #{config.rank}
          {/* Animated shimmer for #1 */}
          {config.rank === 1 && (
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ borderRadius: "inherit" }}
            >
              <div
                className="absolute inset-0 -translate-x-full"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  animation: "shimmer 2s infinite",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Avatar with ring */}
      <div className="relative mt-3">
        <div
          className="absolute inset-0 -m-2 border-4"
          style={{
            borderColor: config.ringColor,
            animation: config.rank === 1 ? "spin 8s linear infinite" : undefined,
            borderStyle: config.rank === 1 ? "dashed" : "solid",
            opacity: 0.7,
          }}
        />
        <Avatar url={user?.avatar ?? null} name={name} size={config.avatarSize} />
      </div>

      {/* Name */}
      <span
        className="font-black text-center leading-tight max-w-full truncate px-2"
        style={{ color: config.textColor, fontSize: config.rank === 1 ? 18 : 15 }}
      >
        {name}
      </span>

      {/* Label */}
      <span
        className="text-xs font-black tracking-widest uppercase px-2 py-0.5 border border-black"
        style={{ backgroundColor: config.shadow, color: "#fff" }}
      >
        {config.label}
      </span>

      {/* Score */}
      <span
        className={`font-black tabular-nums ${config.scoreSize}`}
        style={{ color: config.scoreColor }}
      >
        {user ? user.lifetimePoints.toLocaleString() : "—"}
      </span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading || !tableRef.current) return;
    gsap.fromTo(
      tableRef.current.querySelectorAll(".table-row"),
      { opacity: 0, x: -20 },
      {
        opacity: 1, x: 0,
        duration: 0.35,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: { trigger: tableRef.current, start: "top 85%" },
      }
    );
  }, [loading]);

  async function fetchLeaderboard() {
    try {
      const res = await fetch("/api/leaderboard?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen dot-bg">
      {/* Hero */}
      <div
        ref={heroRef}
        className="relative overflow-hidden border-b-4 border-black"
        style={{ background: "linear-gradient(135deg, #000 0%, #1a1a2e 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            animation: "slide 8s linear infinite",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-4 border-2 border-yellow-400">
            <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
            Live Rankings
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white leading-none">
            RANK<span className="text-yellow-400">.</span>
          </h1>
          <p className="text-white/50 text-lg mt-3 max-w-lg">
            Top students by lifetime points from live games. Updates every 30 seconds.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16">
              {[
                { cfg: RANK_CONFIG[1], user: top3[1] },
                { cfg: RANK_CONFIG[0], user: top3[0] },
                { cfg: RANK_CONFIG[2], user: top3[2] },
              ].map(({ cfg, user }, i) => (
                <PodiumCard key={cfg.rank} user={user} config={cfg} index={i} />
              ))}
            </div>

            {/* Table */}
            <div
              ref={tableRef}
              className="bg-white border-2 border-black overflow-hidden"
              style={{ boxShadow: "4px 4px 0 #000" }}
            >
              <div className="grid grid-cols-12 bg-yellow-400 border-b-2 border-black px-5 py-3 text-xs font-black tracking-wider text-black">
                <span className="col-span-1">Rank</span>
                <span className="col-span-8">Student</span>
                <span className="col-span-3 text-right">Points</span>
              </div>

              {rest.length > 0 ? rest.map((user) => (
                <div
                  key={user.id}
                  className="table-row grid grid-cols-12 px-5 py-3 border-t border-zinc-100 hover:bg-zinc-50 transition-colors items-center"
                >
                  <span className="col-span-1 font-black text-zinc-400 text-sm">
                    #{user.rank}
                  </span>
                  <div className="col-span-8 flex items-center gap-3">
                    <Avatar url={user.avatar} name={user.displayName || user.username} size={36} />
                    <span className="font-bold text-black truncate text-sm">
                      {user.displayName || user.username}
                    </span>
                  </div>
                  <span className="col-span-3 text-right font-black text-black tabular-nums text-sm">
                    {user.lifetimePoints.toLocaleString()}
                  </span>
                </div>
              )) : (
                <div className="px-6 py-12 text-center text-zinc-400 text-sm">
                  No rankings yet. Play live games to appear here.
                </div>
              )}
            </div>

            <p className="text-center text-xs text-zinc-400 mt-6">
              Only live game scores count. Solo practice is not tracked.
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
