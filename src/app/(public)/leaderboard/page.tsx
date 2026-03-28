"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Reward items (9 items) ───────────────────────────────────────────────────

const REWARD_ITEMS = [
  { id: 1, name: "Notebook",       nameKh: "សៀវភៅកត់ត្រា",  cost: 500,  icon: "📓", color: "#3b82f6" },
  { id: 2, name: "Pencil",         nameKh: "ខ្មៅដៃ",         cost: 100,  icon: "✏️", color: "#eab308" },
  { id: 3, name: "Pen",            nameKh: "ប៊ិច",            cost: 150,  icon: "🖊️", color: "#22c55e" },
  { id: 4, name: "Ruler",          nameKh: "បន្ទាត់",         cost: 200,  icon: "📏", color: "#f97316" },
  { id: 5, name: "Eraser",         nameKh: "កាំបិតលុប",       cost: 80,   icon: "🧹", color: "#a855f7" },
  { id: 6, name: "Highlighter",    nameKh: "ប៊ិចសម្គាល់",     cost: 250,  icon: "🖍️", color: "#ef4444" },
  { id: 7, name: "Sticky Notes",   nameKh: "ក្រដាសសម្គាល់",  cost: 300,  icon: "📝", color: "#06b6d4" },
  { id: 8, name: "Geometry Set",   nameKh: "ឧបករណ៍គណិត",    cost: 800,  icon: "📐", color: "#ec4899" },
  { id: 9, name: "Study Planner",  nameKh: "ផែនការសិក្សា",   cost: 1200, icon: "📅", color: "#84cc16" },
];

// ── Avatar ───────────────────────────────────────────────────────────────────

function avatarSrc(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("https://res.cloudinary.com/")) {
    return `/api/profile-image?imageUrl=${encodeURIComponent(url)}`;
  }
  return url;
}

function Avatar({ url, name, size = 56, ring }: {
  url: string | null;
  name: string;
  size?: number;
  ring?: string;
}) {
  const [err, setErr] = useState(false);
  const src = avatarSrc(url);
  const initials = (name || "?").slice(0, 2).toUpperCase();
  const fontSize = Math.round(size * 0.36);

  const base = (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {ring && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `3px solid ${ring}`, margin: -3, borderRadius: "50%" }}
        />
      )}
      {src && !err ? (
        <img
          src={src}
          alt={name}
          onError={() => setErr(true)}
          className="w-full h-full object-cover rounded-full"
          style={{ border: "2px solid #000" }}
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-black text-white"
          style={{ background: "#27272a", border: "2px solid #000", fontSize }}
        >
          {initials}
        </div>
      )}
    </div>
  );
  return base;
}

// ── Animated score counter ───────────────────────────────────────────────────

function AnimatedNumber({ value, className, style }: {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { val: prev.current };
    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString();
      },
    });
    prev.current = value;
  }, [value]);

  return <span ref={ref} className={className} style={style}>{value.toLocaleString()}</span>;
}

// ── SVG rank badge (no emoji) ────────────────────────────────────────────────

function RankBadge({ rank }: { rank: 1 | 2 | 3 }) {
  const configs = {
    1: { fill: "#eab308", stroke: "#ca8a04", text: "#000", label: "1ST" },
    2: { fill: "#94a3b8", stroke: "#64748b", text: "#fff", label: "2ND" },
    3: { fill: "#cd7c3a", stroke: "#92400e", text: "#fff", label: "3RD" },
  };
  const c = configs[rank];
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      {/* Hexagon */}
      <polygon
        points="26,2 48,14 48,38 26,50 4,38 4,14"
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth="2.5"
      />
      {/* Shine */}
      <polygon
        points="26,5 45,16 45,22 26,11"
        fill="rgba(255,255,255,0.2)"
      />
      <text
        x="26" y="31"
        textAnchor="middle"
        fontSize="14"
        fontWeight="900"
        fill={c.text}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.5"
      >
        {c.label}
      </text>
    </svg>
  );
}

// ── Podium card ──────────────────────────────────────────────────────────────

const PODIUM_CFG = [
  { rank: 2 as const, label: "Silver", accentColor: "#94a3b8", shadowColor: "#64748b", scoreColor: "#475569", height: "h-28", order: "order-2 md:order-1" },
  { rank: 1 as const, label: "Gold Champion", accentColor: "#eab308", shadowColor: "#ca8a04", scoreColor: "#000", height: "h-36", order: "order-1 md:order-2" },
  { rank: 3 as const, label: "Bronze", accentColor: "#cd7c3a", shadowColor: "#92400e", scoreColor: "#92400e", height: "h-24", order: "order-3" },
];

function PodiumCard({ user, cfg, index }: {
  user: LeaderboardUser | undefined;
  cfg: typeof PODIUM_CFG[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50, scale: 0.88 },
      { opacity: 1, y: 0, scale: 1, duration: 0.65, delay: index * 0.12, ease: "back.out(1.5)" }
    );
  }, [index]);

  // Continuous glow pulse for #1
  useEffect(() => {
    if (cfg.rank !== 1 || !glowRef.current) return;
    gsap.to(glowRef.current, {
      opacity: 0.8,
      scale: 1.06,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, [cfg.rank]);

  const name = user ? (user.displayName || user.username) : "—";
  const isFirst = cfg.rank === 1;

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col items-center ${cfg.order}`}
      style={{ minWidth: isFirst ? 200 : 168 }}
    >
      {/* Glow behind #1 */}
      {isFirst && (
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(234,179,8,0.25) 0%, transparent 70%)",
            opacity: 0.4,
            borderRadius: 8,
          }}
        />
      )}

      {/* Avatar + badge */}
      <div className="relative mb-3">
        <Avatar
          url={user?.avatar ?? null}
          name={name}
          size={isFirst ? 80 : 64}
          ring={cfg.accentColor}
        />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <RankBadge rank={cfg.rank} />
        </div>
      </div>

      {/* Card body */}
      <div
        className="w-full flex flex-col items-center gap-1.5 pt-6 pb-4 px-4 border-2 border-black mt-2"
        style={{
          backgroundColor: isFirst ? cfg.accentColor : "#fff",
          boxShadow: `4px 4px 0 ${cfg.shadowColor}`,
        }}
      >
        <span
          className="font-black text-center leading-tight w-full truncate text-sm"
          style={{ color: isFirst ? "#000" : "#111" }}
        >
          {name}
        </span>
        <span
          className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 border border-black"
          style={{ backgroundColor: cfg.shadowColor, color: "#fff" }}
        >
          {cfg.label}
        </span>
        <AnimatedNumber
          value={user?.lifetimePoints ?? 0}
          className={`font-black tabular-nums ${isFirst ? "text-3xl" : "text-xl"}`}
          style={{ color: cfg.scoreColor }}
        />
        <span className="text-[10px] text-zinc-500 font-bold">pts</span>
      </div>

      {/* Podium base */}
      <div
        className={`w-full border-2 border-t-0 border-black ${cfg.height}`}
        style={{ backgroundColor: cfg.accentColor, opacity: 0.25 }}
      />
    </div>
  );
}

// ── Reward item card ─────────────────────────────────────────────────────────

function RewardCard({ item, userPoints, isLoggedIn, onClaim }: {
  item: typeof REWARD_ITEMS[number];
  userPoints: number;
  isLoggedIn: boolean;
  onClaim: (item: typeof REWARD_ITEMS[number]) => void;
}) {
  const canClaim = isLoggedIn && userPoints >= item.cost;
  const [claimed, setClaimed] = useState(false);

  function handleClaim() {
    if (!canClaim || claimed) return;
    setClaimed(true);
    onClaim(item);
    setTimeout(() => setClaimed(false), 3000);
  }

  return (
    <div
      className="flex flex-col gap-3 p-4 bg-white border-2 border-black"
      style={{ boxShadow: `3px 3px 0 ${item.color}` }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 flex items-center justify-center border-2 border-black text-2xl"
        style={{ backgroundColor: `${item.color}22` }}
      >
        {item.icon}
      </div>
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="font-black text-sm text-black">{item.name}</span>
        <span className="text-xs text-zinc-400">{item.nameKh}</span>
      </div>
      {/* Cost badge */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-black px-2 py-0.5 border border-black"
          style={{ backgroundColor: item.color, color: "#fff" }}
        >
          {item.cost.toLocaleString()} pts
        </span>
        <button
          onClick={handleClaim}
          disabled={!canClaim || claimed}
          className="text-xs font-black px-3 py-1 border-2 border-black transition-all"
          style={{
            backgroundColor: claimed ? "#22c55e" : canClaim ? "#000" : "#e4e4e7",
            color: claimed ? "#fff" : canClaim ? "#ffd700" : "#a1a1aa",
            cursor: canClaim && !claimed ? "pointer" : "not-allowed",
            boxShadow: canClaim && !claimed ? "2px 2px 0 #000" : "none",
          }}
        >
          {claimed ? "Claimed!" : isLoggedIn ? "Claim" : "Login"}
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-zinc-100 border border-zinc-200 overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${Math.min(100, (userPoints / item.cost) * 100)}%`,
            backgroundColor: item.color,
          }}
        />
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: number; lifetimePoints: number } | null>(null);
  const [claimMsg, setClaimMsg] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const iv = setInterval(fetchLeaderboard, 30000);
    // Check auth
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user) setCurrentUser({ id: d.user.id, lifetimePoints: d.user.lifetimePoints ?? 0 }); })
      .catch(() => {});
    return () => clearInterval(iv);
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (loading || !tableRef.current) return;
    gsap.fromTo(
      tableRef.current.querySelectorAll(".trow"),
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.03, ease: "power2.out",
        scrollTrigger: { trigger: tableRef.current, start: "top 88%" } }
    );
  }, [loading]);

  function handleClaim(item: typeof REWARD_ITEMS[number]) {
    setClaimMsg(`"${item.name}" claim request sent to your teacher!`);
    setTimeout(() => setClaimMsg(""), 4000);
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const userPoints = currentUser?.lifetimePoints ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden border-b-4 border-black"
        style={{ background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
        <div className="relative max-w-5xl mx-auto px-6 py-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-4 border-2 border-yellow-400">
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
              Live Rankings
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
              LEADERBOARD
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Top students by lifetime points · updates every 30s
            </p>
          </div>
          {currentUser && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Your Points</span>
              <AnimatedNumber
                value={userPoints}
                className="text-4xl font-black text-yellow-400 tabular-nums"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-14">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Podium ── */}
            <div>
              <div className="flex items-end justify-center gap-4 md:gap-8">
                {[
                  { cfg: PODIUM_CFG[0], user: top3[1] },
                  { cfg: PODIUM_CFG[1], user: top3[0] },
                  { cfg: PODIUM_CFG[2], user: top3[2] },
                ].map(({ cfg, user }, i) => (
                  <PodiumCard key={cfg.rank} user={user} cfg={cfg} index={i} />
                ))}
              </div>
            </div>

            {/* ── Rankings table ── */}
            <div>
              <h2 className="text-xl font-black text-black mb-4 tracking-tight">All Rankings</h2>
              <div
                ref={tableRef}
                className="bg-white border-2 border-black overflow-hidden"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                {/* Header */}
                <div className="grid grid-cols-12 bg-black px-5 py-3 text-[10px] font-black tracking-widest text-yellow-400 uppercase">
                  <span className="col-span-1">#</span>
                  <span className="col-span-7">Student</span>
                  <span className="col-span-2 text-center">Games</span>
                  <span className="col-span-2 text-right">Points</span>
                </div>

                {rest.length > 0 ? rest.map((user, i) => (
                  <div
                    key={user.id}
                    className="trow grid grid-cols-12 px-5 py-3 border-t border-zinc-100 hover:bg-zinc-50 transition-colors items-center group"
                  >
                    <span className="col-span-1 text-xs font-black text-zinc-400">
                      {user.rank}
                    </span>
                    <div className="col-span-7 flex items-center gap-3">
                      <Avatar url={user.avatar} name={user.displayName || user.username} size={34} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-black text-sm truncate leading-tight">
                          {user.displayName || user.username}
                        </span>
                        {user.displayName && (
                          <span className="text-[10px] text-zinc-400 truncate">@{user.username}</span>
                        )}
                      </div>
                    </div>
                    <span className="col-span-2 text-center text-xs font-bold text-zinc-400 tabular-nums">
                      {user.totalGamesPlayed}
                    </span>
                    <span className="col-span-2 text-right font-black text-black tabular-nums text-sm">
                      {user.lifetimePoints.toLocaleString()}
                    </span>
                  </div>
                )) : (
                  <div className="px-6 py-12 text-center text-zinc-400 text-sm">
                    No rankings yet. Play live games to appear here.
                  </div>
                )}
              </div>
              <p className="text-center text-[11px] text-zinc-400 mt-3">
                Only live game scores count · Solo practice is not tracked
              </p>
            </div>

            {/* ── Rewards shop ── */}
            <div>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
                <div>
                  <div className="inline-block bg-black text-yellow-400 text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-2">
                    Rewards
                  </div>
                  <h2 className="text-2xl font-black text-black leading-tight">
                    Claim with Points
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    Earn points in live games · claim real stationery rewards · teacher delivers
                  </p>
                </div>
                {currentUser ? (
                  <div className="flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 border-2 border-black"
                    style={{ boxShadow: "3px 3px 0 #ca8a04" }}>
                    <span className="text-xs font-black uppercase tracking-widest">Your balance</span>
                    <span className="text-xl font-black tabular-nums">{userPoints.toLocaleString()}</span>
                    <span className="text-xs opacity-60">pts</span>
                  </div>
                ) : (
                  <a href="/login"
                    className="text-xs font-black px-4 py-2 bg-yellow-400 text-black border-2 border-black"
                    style={{ boxShadow: "3px 3px 0 #000" }}>
                    Log in to claim →
                  </a>
                )}
              </div>

              {/* Claim success toast */}
              {claimMsg && (
                <div className="mb-4 px-4 py-3 bg-green-500 text-white font-bold text-sm border-2 border-black"
                  style={{ boxShadow: "3px 3px 0 #000" }}>
                  {claimMsg}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {REWARD_ITEMS.map(item => (
                  <RewardCard
                    key={item.id}
                    item={item}
                    userPoints={userPoints}
                    isLoggedIn={!!currentUser}
                    onClaim={handleClaim}
                  />
                ))}
              </div>

              <p className="text-[11px] text-zinc-400 mt-4 text-center">
                Claimed items are sent as a request to your teacher for physical delivery.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
