"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useLang } from "@/context/lang-context";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Reward SVG icons ──────────────────────────────────────────────────────────

function IconNotebook() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="8" y="4" width="24" height="32" rx="2" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2"/><rect x="8" y="4" width="6" height="32" rx="2" fill="#1d4ed8"/><line x1="18" y1="13" x2="28" y2="13" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/><line x1="18" y1="19" x2="28" y2="19" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/><line x1="18" y1="25" x2="24" y2="25" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/></svg>; }
function IconPencil() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="17" y="4" width="6" height="26" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" transform="rotate(15 20 20)"/><polygon points="20,32 17,38 23,38" fill="#f97316" transform="rotate(15 20 20)"/><rect x="17" y="4" width="6" height="5" rx="1" fill="#e4e4e7" stroke="#ca8a04" strokeWidth="1.5" transform="rotate(15 20 20)"/></svg>; }
function IconPen() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="18" y="3" width="5" height="22" rx="2" fill="#bbf7d0" stroke="#15803d" strokeWidth="2"/><polygon points="20,34 17,25 23,25" fill="#15803d"/><rect x="18" y="3" width="5" height="6" rx="1" fill="#6b7280" stroke="#374151" strokeWidth="1.5"/><circle cx="20" cy="6" r="1.5" fill="#374151"/></svg>; }
function IconRuler() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="5" y="15" width="30" height="10" rx="2" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" transform="rotate(-20 20 20)"/>{[0,1,2,3,4,5].map(i=><line key={i} x1={9+i*4} y1="17" x2={9+i*4} y2={i%2===0?21:19} stroke="#c2410c" strokeWidth="1.5" transform="rotate(-20 20 20)"/>)}</svg>; }
function IconEraser() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="6" y="14" width="28" height="14" rx="3" fill="#f0abfc" stroke="#7e22ce" strokeWidth="2"/><rect x="6" y="14" width="12" height="14" rx="3" fill="#7e22ce"/><line x1="18" y1="14" x2="18" y2="28" stroke="#7e22ce" strokeWidth="2"/></svg>; }
function IconHighlighter() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="14" y="4" width="12" height="24" rx="3" fill="#fca5a5" stroke="#b91c1c" strokeWidth="2"/><polygon points="20,36 15,28 25,28" fill="#b91c1c"/><rect x="14" y="4" width="12" height="7" rx="2" fill="#e4e4e7" stroke="#b91c1c" strokeWidth="1.5"/></svg>; }
function IconStickyNotes() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="6" y="8" width="22" height="22" rx="2" fill="#a5f3fc" stroke="#0e7490" strokeWidth="2"/><rect x="10" y="4" width="22" height="22" rx="2" fill="#67e8f9" stroke="#0e7490" strokeWidth="2"/><line x1="14" y1="13" x2="28" y2="13" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round"/><line x1="14" y1="18" x2="28" y2="18" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round"/><line x1="14" y1="23" x2="22" y2="23" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconGeometrySet() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><polygon points="20,4 36,34 4,34" fill="#fbcfe8" stroke="#be185d" strokeWidth="2"/><line x1="20" y1="4" x2="20" y2="34" stroke="#be185d" strokeWidth="1.5" strokeDasharray="2 2"/><line x1="12" y1="19" x2="28" y2="19" stroke="#be185d" strokeWidth="1.5" strokeDasharray="2 2"/><circle cx="20" cy="34" r="2" fill="#be185d"/></svg>; }
function IconStudyPlanner() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="6" y="8" width="28" height="28" rx="2" fill="#d9f99d" stroke="#4d7c0f" strokeWidth="2"/><rect x="6" y="8" width="28" height="8" rx="2" fill="#4d7c0f"/><line x1="13" y1="4" x2="13" y2="12" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round"/><line x1="27" y1="4" x2="27" y2="12" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round"/>{[0,1,2].map(r=>[0,1,2].map(c=><rect key={`${r}-${c}`} x={11+c*8} y={20+r*5} width="5" height="3" rx="1" fill="#4d7c0f" opacity="0.5"/>))}</svg>; }

const REWARD_ICONS = [IconNotebook,IconPencil,IconPen,IconRuler,IconEraser,IconHighlighter,IconStickyNotes,IconGeometrySet,IconStudyPlanner];

const REWARD_ITEMS = [
  { id:1, name:"Notebook",      nameKh:"សៀវភៅកត់ត្រា", cost:500,  color:"#3b82f6" },
  { id:2, name:"Pencil",        nameKh:"ខ្មៅដៃ",        cost:100,  color:"#eab308" },
  { id:3, name:"Pen",           nameKh:"ប៊ិច",           cost:150,  color:"#22c55e" },
  { id:4, name:"Ruler",         nameKh:"បន្ទាត់",        cost:200,  color:"#f97316" },
  { id:5, name:"Eraser",        nameKh:"កាំបិតលុប",      cost:80,   color:"#a855f7" },
  { id:6, name:"Highlighter",   nameKh:"ប៊ិចសម្គាល់",    cost:250,  color:"#ef4444" },
  { id:7, name:"Sticky Notes",  nameKh:"ក្រដាសសម្គាល់", cost:300,  color:"#06b6d4" },
  { id:8, name:"Geometry Set",  nameKh:"ឧបករណ៍គណិត",   cost:800,  color:"#ec4899" },
  { id:9, name:"Study Planner", nameKh:"ផែនការសិក្សា",  cost:1200, color:"#84cc16" },
];

// ── Avatar ────────────────────────────────────────────────────────────────────

function avatarSrc(url: string | null, changedAt?: string | null): string | null {
  if (!url) return null;
  const base = url.startsWith("https://res.cloudinary.com/")
    ? `/api/profile-image?imageUrl=${encodeURIComponent(url)}`
    : url;
  return changedAt ? `${base}&v=${new Date(changedAt).getTime()}` : base;
}

function Avatar({ url, name, size = 40, ring, changedAt }: {
  url: string | null; name: string; size?: number; ring?: string; changedAt?: string | null;
}) {
  const [err, setErr] = useState(false);
  const src = avatarSrc(url, changedAt);
  const initials = (name || "?").slice(0, 2).toUpperCase();
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {ring && <div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: `3px solid ${ring}`, margin: -3, borderRadius: "50%" }} />}
      {src && !err
        ? <img src={src} alt={name} onError={() => setErr(true)} className="w-full h-full object-cover rounded-full" style={{ border: "2px solid #000" }} />
        : <div className="w-full h-full rounded-full flex items-center justify-center font-black text-white" style={{ background: "#27272a", border: "2px solid #000", fontSize: Math.round(size * 0.36) }}>{initials}</div>
      }
    </div>
  );
}

// ── Animated number ───────────────────────────────────────────────────────────

function AnimatedNumber({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  useEffect(() => {
    if (!ref.current) return;
    const obj = { val: prev.current };
    gsap.to(obj, { val: value, duration: 1.0, ease: "power2.out", onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString(); } });
    prev.current = value;
  }, [value]);
  return <span ref={ref} className={className} style={style}>{value.toLocaleString()}</span>;
}

// ── Rank badge SVG ────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: 1 | 2 | 3 }) {
  const c = { 1: { fill:"#eab308", stroke:"#ca8a04", text:"#000", label:"1ST" }, 2: { fill:"#94a3b8", stroke:"#64748b", text:"#fff", label:"2ND" }, 3: { fill:"#cd7c3a", stroke:"#92400e", text:"#fff", label:"3RD" } }[rank];
  return (
    <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
      <polygon points="26,2 48,14 48,38 26,50 4,38 4,14" fill={c.fill} stroke={c.stroke} strokeWidth="2.5"/>
      <polygon points="26,5 45,16 45,22 26,11" fill="rgba(255,255,255,0.2)"/>
      <text x="26" y="31" textAnchor="middle" fontSize="14" fontWeight="900" fill={c.text} fontFamily="system-ui, sans-serif">{c.label}</text>
    </svg>
  );
}

// ── Podium card ───────────────────────────────────────────────────────────────

const PODIUM_CFG = [
  { rank:2 as const, label:"Silver",       accentColor:"#94a3b8", shadowColor:"#64748b", scoreColor:"#475569", barH:"h-20 md:h-28", order:"order-2 md:order-1" },
  { rank:1 as const, label:"Gold Champion",accentColor:"#eab308", shadowColor:"#ca8a04", scoreColor:"#000",    barH:"h-24 md:h-36", order:"order-1 md:order-2" },
  { rank:3 as const, label:"Bronze",       accentColor:"#cd7c3a", shadowColor:"#92400e", scoreColor:"#92400e", barH:"h-16 md:h-24", order:"order-3" },
];

function PodiumCard({ user, cfg, index }: { user: LeaderboardUser|undefined; cfg: typeof PODIUM_CFG[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isFirst = cfg.rank === 1;
  const name = user ? (user.displayName || user.username) : "—";

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current, { opacity:0, y:40, scale:0.9 }, { opacity:1, y:0, scale:1, duration:0.6, delay:index*0.1, ease:"back.out(1.5)" });
  }, [index]);

  useEffect(() => {
    if (!isFirst || !glowRef.current) return;
    gsap.to(glowRef.current, { opacity:0.7, scale:1.05, duration:1.2, repeat:-1, yoyo:true, ease:"sine.inOut" });
  }, [isFirst]);

  return (
    <div ref={cardRef} className={`relative flex flex-col items-center w-full ${cfg.order}`}>
      {isFirst && <div ref={glowRef} className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse at center, rgba(234,179,8,0.3) 0%, transparent 70%)", opacity:0.3 }} />}
      <div className="relative mb-2">
        <Avatar url={user?.avatar??null} name={name} size={isFirst?60:46} ring={cfg.accentColor} changedAt={user?.avatarChangedAt} />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 scale-75 md:scale-100"><RankBadge rank={cfg.rank} /></div>
      </div>
      <div className="w-full flex flex-col items-center gap-1 pt-5 pb-3 px-1 md:px-2 border-2 border-black mt-1" style={{ backgroundColor: isFirst ? cfg.accentColor : "#fff", boxShadow:`3px 3px 0 ${cfg.shadowColor}` }}>
        <span className="font-black text-center leading-tight w-full truncate text-[10px] md:text-sm font-kh-header" style={{ color: isFirst?"#000":"#111" }}>{name}</span>
        <span className="text-[8px] md:text-[9px] font-black tracking-widest uppercase px-1 py-0.5 border border-black" style={{ backgroundColor:cfg.shadowColor, color:"#fff" }}>{cfg.label}</span>
        <AnimatedNumber value={user?.lifetimePoints??0} className={`font-black tabular-nums ${isFirst?"text-xl md:text-3xl":"text-base md:text-xl"}`} style={{ color:cfg.scoreColor }} />
        <span className="text-[8px] text-zinc-500 font-bold">pts</span>
      </div>
      <div className={`w-full border-2 border-t-0 border-black ${cfg.barH}`} style={{ backgroundColor:cfg.accentColor, opacity:0.2 }} />
    </div>
  );
}

// ── Reward card ───────────────────────────────────────────────────────────────

// Realistic product photo covers per item (Cloudinary)
const REWARD_PHOTOS: Record<number, string> = {
  1: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1/rewards/notebook",
  2: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1/rewards/pencil",
  3: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1/rewards/pen",
  4: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1/rewards/ruler",
  5: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1/rewards/eraser",
  6: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1/rewards/highlighter",
  7: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1/rewards/sticky-notes",
  8: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1/rewards/geometry-set",
  9: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1/rewards/study-planner",
};

function RewardCard({ item, itemIndex, userPoints, isLoggedIn, onClaim, lang }: {
  item: typeof REWARD_ITEMS[number]; itemIndex: number; userPoints: number;
  isLoggedIn: boolean; onClaim: (item: typeof REWARD_ITEMS[number]) => void; lang: string;
}) {
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  // One-claim-per-item per browser session (persisted in localStorage)
  const storageKey = `kwd_claimed_${item.id}`;
  const [claimed, setClaimed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });
  const [hovered, setHovered] = useState(false);

  const canClaim = isLoggedIn && userPoints >= item.cost && !claimed;
  const pct = Math.min(100, Math.round((userPoints / item.cost) * 100));
  const IconComp = REWARD_ICONS[itemIndex];

  function handleClaim() {
    if (!canClaim) return;
    setClaimed(true);
    localStorage.setItem(storageKey, "1");
    onClaim(item);
  }

  const statusLabel = claimed
    ? (kh ? "បានទទួលហើយ ✓" : "Claimed ✓")
    : !isLoggedIn
    ? (kh ? "ចូលគណនីដើម្បីទទួល" : "Log in to claim")
    : userPoints < item.cost
    ? (kh ? `ត្រូវការ ${(item.cost - userPoints).toLocaleString()} pts ទៀត` : `Need ${(item.cost - userPoints).toLocaleString()} more pts`)
    : (kh ? "ទទួលឥឡូវ →" : "Claim Now →");

  return (
    <div
      className="relative flex flex-col overflow-hidden border-2 border-black"
      style={{
        boxShadow: hovered && canClaim ? `6px 6px 0 ${item.color}` : "3px 3px 0 #000",
        transform: hovered && canClaim ? "translate(-3px,-3px)" : "translate(0,0)",
        transition: "box-shadow 0.15s ease, transform 0.15s ease",
        opacity: claimed ? 0.75 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Claimed overlay */}
      {claimed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-green-500 border-3 border-white flex items-center justify-center"
              style={{ border: "3px solid #fff", boxShadow: "0 0 0 3px #000" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-black text-xs" style={kf}>{kh ? "បានទទួល" : "Claimed"}</span>
          </div>
        </div>
      )}

      {/* Color header with icon */}
      <div className="relative flex items-center justify-between px-3 py-3"
        style={{ backgroundColor: item.color }}>
        <div className="w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center p-1.5">
          <IconComp />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-black text-white/70 uppercase tracking-widest" style={kf}>
            {kh ? "ពិន្ទុ" : "Points"}
          </span>
          <span className="text-xl font-black text-white leading-none">
            {item.cost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3 bg-white flex-1">
        <div>
          <span className="font-black text-sm text-black block leading-tight">
            {kh ? item.nameKh : item.name}
          </span>
          <span className="text-[10px] text-zinc-400 block" style={kf}>
            {kh ? item.name : item.nameKh}
          </span>
        </div>

        {/* Progress bar */}
        {isLoggedIn && (
          <div>
            <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1">
              <span>{userPoints.toLocaleString()} / {item.cost.toLocaleString()} pts</span>
              <span style={{ color: item.color }}>{pct}%</span>
            </div>
            <div className="h-2 bg-zinc-100 border border-zinc-200 overflow-hidden">
              <div className="h-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: item.color }} />
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleClaim}
          disabled={!canClaim}
          className="w-full py-2.5 font-black text-xs border-2 border-black transition-all"
          style={{
            backgroundColor: claimed ? "#22c55e" : canClaim ? item.color : "#e4e4e7",
            color: claimed ? "#fff" : canClaim ? "#000" : "#a1a1aa",
            cursor: canClaim ? "pointer" : "not-allowed",
            boxShadow: canClaim ? "2px 2px 0 #000" : "none",
            ...kf,
          }}
        >
          {statusLabel}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [prevRanks, setPrevRanks] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: number; lifetimePoints: number } | null>(null);
  const [claimMsg, setClaimMsg] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [lang, setLang] = useState<"en"|"kh">("en");

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      const newBoard: LeaderboardUser[] = data.leaderboard || [];
      setLeaderboard(prev => {
        const ranks: Record<number, number> = {};
        prev.forEach(u => { ranks[u.id] = u.rank; });
        setPrevRanks(ranks);
        return newBoard;
      });
      setLastUpdated(new Date());
      setCountdown(60);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const iv = setInterval(fetchLeaderboard, 60000);
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setCurrentUser({ id: d.id, lifetimePoints: d.lifetimePoints ?? 0 }); })
      .catch(() => {});
    return () => clearInterval(iv);
  }, [fetchLeaderboard]);

  // Countdown ticker
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 60), 1000);
    return () => clearInterval(t);
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const userPoints = currentUser?.lifetimePoints ?? 0;

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* Hero */}
      <div className="relative overflow-hidden border-b-4 border-black" style={{ background:"linear-gradient(135deg,#09090b 0%,#18181b 100%)" }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize:"20px 20px" }} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
        <div className="relative max-w-4xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-3 border-2 border-yellow-400">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                Live Rankings
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight">LEADERBOARD</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-white/40 text-xs">Top students by lifetime points</span>
                {lastUpdated && (
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Next update in {countdown}s
                  </span>
                )}
              </div>
            </div>
            {currentUser && (
              <div className="flex flex-col sm:items-end gap-0.5">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Your Points</span>
                <AnimatedNumber value={userPoints} className="text-3xl md:text-4xl font-black text-yellow-400 tabular-nums" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="grid grid-cols-3 items-end gap-2 md:gap-6 w-full">
              {[
                { cfg: PODIUM_CFG[0], user: top3[1] },
                { cfg: PODIUM_CFG[1], user: top3[0] },
                { cfg: PODIUM_CFG[2], user: top3[2] },
              ].map(({ cfg, user }, i) => (
                <PodiumCard key={cfg.rank} user={user} cfg={cfg} index={i} />
              ))}
            </div>

            {/* Rankings table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base md:text-xl font-black text-black tracking-tight">All Rankings</h2>
                {lastUpdated && (
                  <span className="text-[10px] text-zinc-400 font-bold">
                    {lastUpdated.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
                  </span>
                )}
              </div>
              <div className="bg-white border-2 border-black overflow-hidden" style={{ boxShadow:"4px 4px 0 #000" }}>
                {/* Header */}
                <div className="grid grid-cols-12 bg-black px-3 md:px-5 py-2.5 text-[9px] md:text-[10px] font-black tracking-widest text-yellow-400 uppercase">
                  <span className="col-span-1">#</span>
                  <span className="col-span-7 md:col-span-7">Student</span>
                  <span className="col-span-2 text-center hidden sm:block">Games</span>
                  <span className="col-span-4 sm:col-span-2 text-right">Points</span>
                </div>

                {rest.length > 0 ? rest.map((user) => {
                  const prev = prevRanks[user.id];
                  const moved = prev !== undefined ? prev - user.rank : 0;
                  return (
                    <div key={user.id} className="grid grid-cols-12 px-3 md:px-5 py-2.5 border-t border-zinc-100 hover:bg-zinc-50 transition-colors items-center">
                      <div className="col-span-1 flex items-center gap-0.5">
                        <span className="text-xs font-black text-zinc-400">{user.rank}</span>
                        {moved > 0 && <span className="text-[8px] font-black text-green-500 leading-none">▲</span>}
                        {moved < 0 && <span className="text-[8px] font-black text-red-400 leading-none">▼</span>}
                      </div>
                      <div className="col-span-7 flex items-center gap-2 min-w-0">
                        <Avatar url={user.avatar} name={user.displayName||user.username} size={30} changedAt={user.avatarChangedAt} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-black text-xs md:text-sm truncate leading-tight font-kh-header">
                            {user.displayName || user.username}
                          </span>
                          {user.displayName && (
                            <span className="text-[9px] text-zinc-400 truncate hidden sm:block">@{user.username}</span>
                          )}
                        </div>
                      </div>
                      <span className="col-span-2 text-center text-xs font-bold text-zinc-400 tabular-nums hidden sm:block">
                        {user.totalGamesPlayed}
                      </span>
                      <span className="col-span-4 sm:col-span-2 text-right font-black text-black tabular-nums text-xs md:text-sm">
                        {user.lifetimePoints.toLocaleString()}
                      </span>
                    </div>
                  );
                }) : (
                  <div className="px-6 py-10 text-center text-zinc-400 text-sm">
                    No rankings yet. Play live games to appear here.
                  </div>
                )}
              </div>
              <p className="text-center text-[10px] text-zinc-400 mt-2">
                Only live game scores count · Solo practice is not tracked
              </p>
            </div>

            {/* Rewards */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
                <div>
                  <div className="inline-block bg-black text-yellow-400 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 mb-1.5">
                    {kh ? "រង្វាន់" : "Rewards"}
                  </div>
                  <h2 className="text-lg md:text-2xl font-black text-black leading-tight" style={kf}>
                    {kh ? "ទទួលរង្វាន់ដោយពិន្ទុ" : "Claim with Points"}
                  </h2>
                  <p className="text-zinc-500 text-xs mt-1" style={kf}>
                    {kh ? "ប្រកួតផ្ទាល់ — ទទួលពិន្ទុ — គ្រូប្រគល់រង្វាន់" : "Earn points in live games · claim stationery · teacher delivers"}
                  </p>
                </div>
                {currentUser ? (
                  <div className="flex items-center gap-2 bg-black text-yellow-400 px-3 py-2 border-2 border-black self-start sm:self-auto" style={{ boxShadow:"3px 3px 0 #ca8a04" }}>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={kf}>{kh ? "ពិន្ទុ" : "Balance"}</span>
                    <span className="text-lg font-black tabular-nums">{userPoints.toLocaleString()}</span>
                    <span className="text-[9px] opacity-60">pts</span>
                  </div>
                ) : (
                  <a href="/login" className="text-xs font-black px-3 py-2 bg-yellow-400 text-black border-2 border-black self-start" style={{ boxShadow:"3px 3px 0 #000", ...kf }}>
                    {kh ? "ចូលគណនីដើម្បីទទួល →" : "Log in to claim →"}
                  </a>
                )}
              </div>

              {claimMsg && (
                <div className="mb-3 px-4 py-3 bg-green-500 text-white font-bold text-sm border-2 border-black" style={{ boxShadow:"3px 3px 0 #000", ...kf }}>
                  {claimMsg}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {REWARD_ITEMS.map((item, idx) => (
                  <RewardCard key={item.id} item={item} itemIndex={idx} userPoints={userPoints} isLoggedIn={!!currentUser} lang={lang}
                    onClaim={(i) => {
                      const msg = kh ? `"${i.nameKh}" ត្រូវបានផ្ញើទៅគ្រូរបស់អ្នក!` : `"${i.name}" claim sent to your teacher!`;
                      setClaimMsg(msg);
                      setTimeout(() => setClaimMsg(""), 4000);
                    }} />
                ))}
              </div>
              <p className="text-[10px] text-zinc-400 mt-3 text-center" style={kf}>
                {kh ? "រង្វាន់ត្រូវបានប្រគល់ដោយគ្រូ · ទទួលបានតែម្តងក្នុងមួយធាតុ" : "Claimed items are delivered by your teacher · One claim per item"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
