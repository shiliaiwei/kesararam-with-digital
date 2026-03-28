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
  avatarChangedAt: string | null;
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  rank: number;
}

// ── Reward SVG icons ─────────────────────────────────────────────────────────

function IconNotebook() {
  return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <rect x="8" y="4" width="24" height="32" rx="2" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2"/>
    <rect x="8" y="4" width="6" height="32" rx="2" fill="#1d4ed8"/>
    <line x1="18" y1="13" x2="28" y2="13" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
    <line x1="18" y1="19" x2="28" y2="19" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
    <line x1="18" y1="25" x2="24" y2="25" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
function IconPencil() {
  return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <rect x="17" y="4" width="6" height="26" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" transform="rotate(15 20 20)"/>
    <polygon points="20,32 17,38 23,38" fill="#f97316" transform="rotate(15 20 20)"/>
    <rect x="17" y="4" width="6" height="5" rx="1" fill="#e4e4e7" stroke="#ca8a04" strokeWidth="1.5" transform="rotate(15 20 20)"/>
  </svg>;
}
function IconPen() {
  return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <rect x="18" y="3" width="5" height="22" rx="2" fill="#bbf7d0" stroke="#15803d" strokeWidth="2"/>
    <polygon points="20,34 17,25 23,25" fill="#15803d"/>
    <rect x="18" y="3" width="5" height="6" rx="1" fill="#6b7280" stroke="#374151" strokeWidth="1.5"/>
    <circle cx="20" cy="6" r="1.5" fill="#374151"/>
  </svg>;
}
function IconRuler() {
  return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <rect x="5" y="15" width="30" height="10" rx="2" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" transform="rotate(-20 20 20)"/>
    {[0,1,2,3,4,5].map(i => (
      <line key={i} x1={9+i*4} y1="17" x2={9+i*4} y2={i%2===0?21:19} stroke="#c2410c" strokeWidth="1.5" transform="rotate(-20 20 20)"/>
    ))}
  </svg>;
}
function IconEraser() {
  return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <rect x="6" y="14" width="28" height="14" rx="3" fill="#f0abfc" stroke="#7e22ce" strokeWidth="2"/>
    <rect x="6" y="14" width="12" height="14" rx="3" fill="#7e22ce"/>
    <line x1="18" y1="14" x2="18" y2="28" stroke="#7e22ce" strokeWidth="2"/>
  </svg>;
}
function IconHighlighter() {
  return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <rect x="14" y="4" width="12" height="24" rx="3" fill="#fca5a5" stroke="#b91c1c" strokeWidth="2"/>
    <polygon points="20,36 15,28 25,28" fill="#b91c1c"/>
    <rect x="14" y="4" width="12" height="7" rx="2" fill="#e4e4e7" stroke="#b91c1c" strokeWidth="1.5"/>
  </svg>;
}
function IconStickyNotes() {
  return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <rect x="6" y="8" width="22" height="22" rx="2" fill="#a5f3fc" stroke="#0e7490" strokeWidth="2"/>
    <rect x="10" y="4" width="22" height="22" rx="2" fill="#67e8f9" stroke="#0e7490" strokeWidth="2"/>
    <line x1="14" y1="13" x2="28" y2="13" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="14" y1="18" x2="28" y2="18" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="14" y1="23" x2="22" y2="23" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>;
}
function IconGeometrySet() {
  return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <polygon points="20,4 36,34 4,34" fill="#fbcfe8" stroke="#be185d" strokeWidth="2"/>
    <line x1="20" y1="4" x2="20" y2="34" stroke="#be185d" strokeWidth="1.5" strokeDasharray="2 2"/>
    <line x1="12" y1="19" x2="28" y2="19" stroke="#be185d" strokeWidth="1.5" strokeDasharray="2 2"/>
    <circle cx="20" cy="34" r="2" fill="#be185d"/>
  </svg>;
}
function IconStudyPlanner() {
  return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <rect x="6" y="8" width="28" height="28" rx="2" fill="#d9f99d" stroke="#4d7c0f" strokeWidth="2"/>
    <rect x="6" y="8" width="28" height="8" rx="2" fill="#4d7c0f"/>
    <line x1="13" y1="4" x2="13" y2="12" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="27" y1="4" x2="27" y2="12" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round"/>
    {[0,1,2].map(row => [0,1,2].map(col => (
      <rect key={`${row}-${col}`} x={11+col*8} y={20+row*5} width="5" height="3" rx="1" fill="#4d7c0f" opacity="0.5"/>
    )))}
  </svg>;
}

const REWARD_ICONS = [IconNotebook, IconPencil, IconPen, IconRuler, IconEraser, IconHighlighter, IconStickyNotes, IconGeometrySet, IconStudyPlanner];

// ── Reward items (9 items) ───────────────────────────────────────────────────

const REWARD_ITEMS = [
  { id: 1, name: "Notebook",       nameKh: "សៀវភៅកត់ត្រា",  cost: 500,  color: "#3b82f6" },
  { id: 2, name: "Pencil",         nameKh: "ខ្មៅដៃ",         cost: 100,  color: "#eab308" },
  { id: 3, name: "Pen",            nameKh: "ប៊ិច",            cost: 150,  color: "#22c55e" },
  { id: 4, name: "Ruler",          nameKh: "បន្ទាត់",         cost: 200,  color: "#f97316" },
  { id: 5, name: "Eraser",         nameKh: "កាំបិតលុប",       cost: 80,   color: "#a855f7" },
  { id: 6, name: "Highlighter",    nameKh: "ប៊ិចសម្គាល់",     cost: 250,  color: "#ef4444" },
  { id: 7, name: "Sticky Notes",   nameKh: "ក្រដាសសម្គាល់",  cost: 300,  color: "#06b6d4" },
  { id: 8, name: "Geometry Set",   nameKh: "ឧបករណ៍គណិត",    cost: 800,  color: "#ec4899" },
  { id: 9, name: "Study Planner",  nameKh: "ផែនការសិក្សា",   cost: 1200, color: "#84cc16" },
];

// ── Avatar ───────────────────────────────────────────────────────────────────

function avatarSrc(url: string | null, changedAt?: string | null): string | null {
  if (!url) return null;
  const base = url.startsWith("https://res.cloudinary.com/")
    ? `/api/profile-image?imageUrl=${encodeURIComponent(url)}`
    : url;
  // Cache-bust when avatar changes
  return changedAt ? `${base}&v=${new Date(changedAt).getTime()}` : base;
}

function Avatar({ url, name, size = 56, ring, changedAt }: {
  url: string | null;
  name: string;
  size?: number;
  ring?: string;
  changedAt?: string | null;
}) {
  const [err, setErr] = useState(false);
  const src = avatarSrc(url, changedAt);
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
          changedAt={user?.avatarChangedAt}
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

function RewardCard({ item, itemIndex, userPoints, isLoggedIn, onClaim }: {
  item: typeof REWARD_ITEMS[number];
  itemIndex: number;
  userPoints: number;
  isLoggedIn: boolean;
  onClaim: (item: typeof REWARD_ITEMS[number]) => void;
}) {
  const canClaim = isLoggedIn && userPoints >= item.cost;
  const [claimed, setClaimed] = useState(false);
  const IconComp = REWARD_ICONS[itemIndex];
  const pct = Math.min(100, (userPoints / item.cost) * 100);

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
      {/* SVG Icon */}
      <div
        className="w-12 h-12 flex items-center justify-center border-2 border-black p-1.5"
        style={{ backgroundColor: `${item.color}22` }}
      >
        <IconComp />
      </div>
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="font-black text-sm text-black">{item.name}</span>
        <span className="text-xs text-zinc-400">{item.nameKh}</span>
      </div>
      {/* Cost + claim */}
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
      {/* Progress bar — only shown when logged in */}
      {isLoggedIn && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-zinc-400">
            <span>{userPoints.toLocaleString()} / {item.cost.toLocaleString()} pts</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-100 border border-zinc-200 overflow-hidden rounded-full">
            <div
              className="h-full transition-all duration-700 rounded-full"
              style={{ width: `${pct}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [prevRanks, setPrevRanks] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: number; lifetimePoints: number } | null>(null);
  const [claimMsg, setClaimMsg] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Fetch leaderboard and track rank changes
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      const newBoard: LeaderboardUser[] = data.leaderboard || [];
      setLeaderboard(prev => {
        // Track previous ranks for animation
        const ranks: Record<number, number> = {};
        prev.forEach(u => { ranks[u.id] = u.rank; });
        setPrevRanks(ranks);
        return newBoard;
      });
      setLastUpdated(new Date());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    // Real-time: poll every 10s (SSE would require a dedicated endpoint)
    const iv = setInterval(fetchLeaderboard, 10000);

    // Check auth
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && !d.error) {
          setCurrentUser({ id: d.id, lifetimePoints: d.lifetimePoints ?? 0 });
        }
      })
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

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-black tracking-tight">All Rankings</h2>
              {lastUpdated && (
                <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live · {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              )}
            </div>
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

                {rest.length > 0 ? rest.map((user) => {
                  const prev = prevRanks[user.id];
                  const moved = prev !== undefined ? prev - user.rank : 0; // positive = moved up
                  return (
                  <a
                    key={user.id}
                    href={`/p/${user.username}`}
                    className="trow grid grid-cols-12 px-5 py-3 border-t border-zinc-100 hover:bg-zinc-50 transition-colors items-center group"
                  >
                    <div className="col-span-1 flex items-center gap-1">
                      <span className="text-xs font-black text-zinc-400">{user.rank}</span>
                      {moved > 0 && <span className="text-[9px] font-black text-green-500">▲</span>}
                      {moved < 0 && <span className="text-[9px] font-black text-red-400">▼</span>}
                    </div>
                    <div className="col-span-7 flex items-center gap-3">
                      <Avatar url={user.avatar} name={user.displayName || user.username} size={34} changedAt={user.avatarChangedAt} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-black text-sm truncate leading-tight group-hover:underline">
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
                  </a>
                  );
                }) : (
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
                {REWARD_ITEMS.map((item, idx) => (
                  <RewardCard
                    key={item.id}
                    item={item}
                    itemIndex={idx}
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
