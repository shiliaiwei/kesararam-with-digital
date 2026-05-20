"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useLang } from "@/context/lang-context";
import { RankBadge as TierBadge, RankedAvatarRing, RankProgressBar, RankShowcase } from "@/components/shared/rank-label";
import { getRank } from "@/lib/rank-utils";

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

function IconNotebook() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="8" y="4" width="24" height="32" rx="2" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" /><rect x="8" y="4" width="6" height="32" rx="2" fill="#1d4ed8" /><line x1="18" y1="13" x2="28" y2="13" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" /><line x1="18" y1="19" x2="28" y2="19" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" /><line x1="18" y1="25" x2="24" y2="25" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" /></svg>; }
function IconPencil() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="17" y="4" width="6" height="26" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" transform="rotate(15 20 20)" /><polygon points="20,32 17,38 23,38" fill="#f97316" transform="rotate(15 20 20)" /><rect x="17" y="4" width="6" height="5" rx="1" fill="#e4e4e7" stroke="#ca8a04" strokeWidth="1.5" transform="rotate(15 20 20)" /></svg>; }
function IconPen() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="18" y="3" width="5" height="22" rx="2" fill="#bbf7d0" stroke="#15803d" strokeWidth="2" /><polygon points="20,34 17,25 23,25" fill="#15803d" /><rect x="18" y="3" width="5" height="6" rx="1" fill="#6b7280" stroke="#374151" strokeWidth="1.5" /><circle cx="20" cy="6" r="1.5" fill="#374151" /></svg>; }
function IconRuler() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="5" y="15" width="30" height="10" rx="2" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" transform="rotate(-20 20 20)" />{[0, 1, 2, 3, 4, 5].map(i => <line key={i} x1={9 + i * 4} y1="17" x2={9 + i * 4} y2={i % 2 === 0 ? 21 : 19} stroke="#c2410c" strokeWidth="1.5" transform="rotate(-20 20 20)" />)}</svg>; }
function IconEraser() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="6" y="14" width="28" height="14" rx="3" fill="#f0abfc" stroke="#7e22ce" strokeWidth="2" /><rect x="6" y="14" width="12" height="14" rx="3" fill="#7e22ce" /><line x1="18" y1="14" x2="18" y2="28" stroke="#7e22ce" strokeWidth="2" /></svg>; }
function IconHighlighter() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="14" y="4" width="12" height="24" rx="3" fill="#fca5a5" stroke="#b91c1c" strokeWidth="2" /><polygon points="20,36 15,28 25,28" fill="#b91c1c" /><rect x="14" y="4" width="12" height="7" rx="2" fill="#e4e4e7" stroke="#b91c1c" strokeWidth="1.5" /></svg>; }
function IconStickyNotes() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="6" y="8" width="22" height="22" rx="2" fill="#a5f3fc" stroke="#0e7490" strokeWidth="2" /><rect x="10" y="4" width="22" height="22" rx="2" fill="#67e8f9" stroke="#0e7490" strokeWidth="2" /><line x1="14" y1="13" x2="28" y2="13" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round" /><line x1="14" y1="18" x2="28" y2="18" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round" /><line x1="14" y1="23" x2="22" y2="23" stroke="#0e7490" strokeWidth="1.5" strokeLinecap="round" /></svg>; }
function IconGeometrySet() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><polygon points="20,4 36,34 4,34" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" /><line x1="20" y1="4" x2="20" y2="34" stroke="#be185d" strokeWidth="1.5" strokeDasharray="2 2" /><line x1="12" y1="19" x2="28" y2="19" stroke="#be185d" strokeWidth="1.5" strokeDasharray="2 2" /><circle cx="20" cy="34" r="2" fill="#be185d" /></svg>; }
function IconStudyPlanner() { return <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="6" y="8" width="28" height="28" rx="2" fill="#d9f99d" stroke="#4d7c0f" strokeWidth="2" /><rect x="6" y="8" width="28" height="8" rx="2" fill="#4d7c0f" /><line x1="13" y1="4" x2="13" y2="12" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" /><line x1="27" y1="4" x2="27" y2="12" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />{[0, 1, 2].map(r => [0, 1, 2].map(c => <rect key={`${r}-${c}`} x={11 + c * 8} y={20 + r * 5} width="5" height="3" rx="1" fill="#4d7c0f" opacity="0.5" />))}</svg>; }

const REWARD_ICONS = [IconNotebook, IconPencil, IconPen, IconRuler, IconEraser, IconHighlighter, IconStickyNotes, IconGeometrySet, IconStudyPlanner];

const REWARD_ITEMS = [
  { id: 1, name: "Notebook", nameKh: "សៀវភៅកត់ត្រា", cost: 500, color: "#3b82f6" },
  { id: 2, name: "Pencil", nameKh: "ខ្មៅដៃ", cost: 100, color: "#eab308" },
  { id: 3, name: "Pen", nameKh: "ប៊ិច", cost: 150, color: "#22c55e" },
  { id: 4, name: "Ruler", nameKh: "បន្ទាត់", cost: 200, color: "#f97316" },
  { id: 5, name: "Eraser", nameKh: "កាំបិតលុប", cost: 80, color: "#a855f7" },
  { id: 6, name: "Highlighter", nameKh: "ប៊ិចសម្គាល់", cost: 250, color: "#ef4444" },
  { id: 7, name: "Sticky Notes", nameKh: "ក្រដាសសម្គាល់", cost: 300, color: "#06b6d4" },
  { id: 8, name: "Geometry Set", nameKh: "ឧបករណ៍គណិត", cost: 800, color: "#ec4899" },
  { id: 9, name: "Study Planner", nameKh: "ផែនការសិក្សា", cost: 1200, color: "#84cc16" },
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
  const c = { 1: { fill: "#eab308", stroke: "#ca8a04", text: "#000", label: "1ST" }, 2: { fill: "#94a3b8", stroke: "#64748b", text: "#fff", label: "2ND" }, 3: { fill: "#cd7c3a", stroke: "#92400e", text: "#fff", label: "3RD" } }[rank];
  return (
    <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
      <polygon points="26,2 48,14 48,38 26,50 4,38 4,14" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
      <polygon points="26,5 45,16 45,22 26,11" fill="rgba(255,255,255,0.2)" />
      <text x="26" y="31" textAnchor="middle" fontSize="14" fontWeight="900" fill={c.text} fontFamily="system-ui, sans-serif">{c.label}</text>
    </svg>
  );
}

// ── Podium card ───────────────────────────────────────────────────────────────

const PODIUM_CFG = [
  { rank: 2 as const, label: "Silver", accentColor: "#94a3b8", shadowColor: "#64748b", scoreColor: "#475569", barH: "h-20 md:h-28", order: "order-2 md:order-1" },
  { rank: 1 as const, label: "Gold Champion", accentColor: "#eab308", shadowColor: "#ca8a04", scoreColor: "#000", barH: "h-24 md:h-36", order: "order-1 md:order-2" },
  { rank: 3 as const, label: "Bronze", accentColor: "#cd7c3a", shadowColor: "#92400e", scoreColor: "#92400e", barH: "h-16 md:h-24", order: "order-3" },
];

function PodiumCard({ user, cfg, index }: { user: LeaderboardUser | undefined; cfg: typeof PODIUM_CFG[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isFirst = cfg.rank === 1;
  const name = user ? (user.displayName || user.username) : "—";

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current, { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: index * 0.1, ease: "back.out(1.5)" });
  }, [index]);

  useEffect(() => {
    if (!isFirst || !glowRef.current) return;
    gsap.to(glowRef.current, { opacity: 0.7, scale: 1.05, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, [isFirst]);

  return (
    <div ref={cardRef} className={`relative flex flex-col items-center w-full ${cfg.order}`}>
      {isFirst && <div ref={glowRef} className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(234,179,8,0.3) 0%, transparent 70%)", opacity: 0.3 }} />}
      <div className="relative mb-2">
        {/* Tier-ranked avatar ring */}
        <RankedAvatarRing lifetimePoints={user?.lifetimePoints ?? 0} size={isFirst ? 60 : 46}>
          <Avatar url={user?.avatar ?? null} name={name} size={isFirst ? 60 : 46} changedAt={user?.avatarChangedAt} />
        </RankedAvatarRing>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 scale-75 md:scale-100"><RankBadge rank={cfg.rank} /></div>
      </div>
      <div className="w-full flex flex-col items-center gap-1 pt-5 pb-3 px-1 md:px-2 border-2 border-black mt-1" style={{ backgroundColor: isFirst ? cfg.accentColor : "#fff", boxShadow: `3px 3px 0 ${cfg.shadowColor}` }}>
        <span className="font-black text-center leading-tight w-full truncate text-[10px] md:text-sm font-kh-header" style={{ color: isFirst ? "#000" : "#111" }}>{name}</span>
        {/* Tier label under name */}
        {user && <TierBadge lifetimePoints={user.lifetimePoints} size="xs" />}
        <span className="text-[8px] md:text-[9px] font-black tracking-widest uppercase px-1 py-0.5 border border-black" style={{ backgroundColor: cfg.shadowColor, color: "#fff" }}>{cfg.label}</span>
        <AnimatedNumber value={user?.lifetimePoints ?? 0} className={`font-black tabular-nums ${isFirst ? "text-xl md:text-3xl" : "text-base md:text-xl"}`} style={{ color: cfg.scoreColor }} />
        <span className="text-[8px] text-zinc-500 font-bold">pts</span>
      </div>
      <div className={`w-full border-2 border-t-0 border-black ${cfg.barH}`} style={{ backgroundColor: cfg.accentColor, opacity: 0.2 }} />
    </div>
  );
}

// ── Reward card ───────────────────────────────────────────────────────────────

// ── Psychology-driven Reward Card ────────────────────────────────────────────
// Principles applied:
//  • Goal Gradient Effect (Kivetz et al.) — progress bar accelerates visually near 100%
//  • Variable Ratio Reinforcement (Skinner) — "bonus" sparkle badge on random items
//  • Endowment Effect (Thaler) — "This is yours!" framing when affordable
//  • Social Proof (Cialdini) — simulated claim counts
//  • Scarcity / Loss Aversion (Kahneman) — "Only X left!" on premium items
//  • Zeigarnik Effect — incomplete progress pulls attention back
//  • Dopamine loop — burst animation + confetti on claim

// Seeded fake social proof counts (stable per item id)
const SOCIAL_PROOF: Record<number, number> = { 1: 47, 2: 112, 3: 89, 4: 63, 5: 134, 6: 38, 7: 71, 8: 19, 9: 12 };
const SCARCITY: Record<number, number | null> = { 1: null, 2: null, 3: null, 4: null, 5: null, 6: 8, 7: null, 8: 5, 9: 3 };
const BONUS_BADGE: Record<number, string | null> = { 1: null, 2: "⭐ Popular", 3: null, 4: null, 5: "🔥 Hot", 6: null, 7: null, 8: "💎 Rare", 9: "👑 Epic" };

// Mini confetti burst for claim celebration
function ClaimBurst({ color }: { color: string }) {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    angle: (i / 18) * 360,
    dist: 28 + Math.random() * 22,
    size: 4 + Math.random() * 5,
    c: [color, "#fff", "#fbbf24", "#34d399"][i % 4],
  }));
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
      {pieces.map(p => (
        <div key={p.id} className="absolute rounded-full"
          style={{
            width: p.size, height: p.size, backgroundColor: p.c,
            transform: `rotate(${p.angle}deg) translateY(-${p.dist}px)`,
            animation: `burstOut 0.55s ease-out forwards`,
            opacity: 1,
          }} />
      ))}
      <style>{`
        @keyframes burstOut {
          0%   { opacity:1; transform: rotate(var(--a,0deg)) translateY(0px) scale(1); }
          100% { opacity:0; transform: rotate(var(--a,0deg)) translateY(-48px) scale(0.3); }
        }
      `}</style>
    </div>
  );
}

function RewardCard({ item, itemIndex, userPoints, isLoggedIn, onClaim, lang }: {
  item: typeof REWARD_ITEMS[number]; itemIndex: number; userPoints: number;
  isLoggedIn: boolean; onClaim: (item: typeof REWARD_ITEMS[number]) => void; lang: string;
}) {
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const storageKey = `kwd_claimed_${item.id}`;
  const [claimed, setClaimed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });
  const [hovered, setHovered] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [pulse, setPulse] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const canClaim = isLoggedIn && userPoints >= item.cost && !claimed;
  const rawPct = Math.min(100, (userPoints / item.cost) * 100);
  // Goal Gradient: visually boost progress when close (≥70%) to feel "almost there"
  const displayPct = rawPct >= 70 && rawPct < 100
    ? Math.min(99, rawPct + (100 - rawPct) * 0.25)
    : rawPct;
  const pct = Math.round(displayPct);
  const IconComp = REWARD_ICONS[itemIndex];
  const socialCount = SOCIAL_PROOF[item.id] ?? 0;
  const scarcity = SCARCITY[item.id];
  const bonusBadge = BONUS_BADGE[item.id];
  const pointsNeeded = item.cost - userPoints;
  const isAlmostThere = isLoggedIn && !claimed && rawPct >= 60 && rawPct < 100;
  const isReady = isLoggedIn && !claimed && rawPct >= 100;

  // Pulse the CTA button when affordable — Endowment Effect trigger
  useEffect(() => {
    if (!isReady) return;
    const t = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(t);
  }, [isReady]);

  function handleClaim() {
    if (!canClaim) return;
    setClaimed(true);
    localStorage.setItem(storageKey, "1");
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 700);
    onClaim(item);
  }

  // Progress bar color: green when ready, amber when close, item color otherwise
  const barColor = isReady ? "#22c55e" : isAlmostThere ? "#f59e0b" : item.color;

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col overflow-hidden border-2 border-black select-none"
      style={{
        borderRadius: 12,
        boxShadow: hovered && canClaim
          ? `0 8px 32px ${item.color}55, 4px 4px 0 #000`
          : isReady
            ? `0 0 0 3px ${item.color}, 4px 4px 0 #000`
            : "3px 3px 0 #000",
        transform: hovered && canClaim ? "translate(-2px,-3px) scale(1.015)" : "translate(0,0) scale(1)",
        transition: "box-shadow 0.18s ease, transform 0.18s ease",
        background: "#fff",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Burst confetti on claim */}
      {showBurst && <ClaimBurst color={item.color} />}

      {/* Claimed overlay */}
      {claimed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.62)", borderRadius: 10 }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "#22c55e", border: "3px solid #fff", boxShadow: "0 0 0 3px #000" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-white font-black text-sm tracking-wide" style={kf}>
            {kh ? "🎉 បានទទួល!" : "🎉 Claimed!"}
          </span>
          <span className="text-white/60 text-[10px]" style={kf}>
            {kh ? "គ្រូនឹងប្រគល់ឱ្យអ្នក" : "Your teacher will deliver it"}
          </span>
        </div>
      )}

      {/* ── Header band ── */}
      <div className="relative flex items-center justify-between px-3 pt-3 pb-2"
        style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}cc 100%)` }}>

        {/* Bonus badge (Variable Ratio — only some items) */}
        {bonusBadge && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full border border-white/60"
              style={{ background: "rgba(0,0,0,0.45)", color: "#fff", letterSpacing: "0.05em" }}>
              {bonusBadge}
            </span>
          </div>
        )}

        {/* Icon */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center p-2 mt-3"
          style={{ background: "rgba(255,255,255,0.22)", border: "2px solid rgba(255,255,255,0.4)" }}>
          <IconComp />
        </div>

        {/* Points cost — big, prominent */}
        <div className="flex flex-col items-end mt-3">
          <span className="text-[9px] font-black text-white/70 uppercase tracking-widest" style={kf}>
            {kh ? "ពិន្ទុ" : "Points"}
          </span>
          <span className="text-2xl font-black text-white leading-none tabular-nums">
            {item.cost.toLocaleString()}
          </span>
          {/* Scarcity — Loss Aversion trigger */}
          {scarcity !== null && (
            <span className="text-[9px] font-black mt-0.5 px-1.5 py-0.5 rounded"
              style={{ background: "#ef4444", color: "#fff" }}>
              {kh ? `នៅសល់ ${scarcity} ទៀត!` : `Only ${scarcity} left!`}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-2 px-3 pt-2 pb-3 flex-1">

        {/* Name */}
        <div>
          <span className="font-black text-sm text-black block leading-tight" style={kf}>
            {kh ? item.nameKh : item.name}
          </span>
          <span className="text-[10px] text-zinc-400 block">
            {kh ? item.name : item.nameKh}
          </span>
        </div>

        {/* Social proof — Cialdini */}
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[7px] font-black text-white"
                style={{ background: ["#f97316", "#3b82f6", "#a855f7"][i], zIndex: 3 - i }} >
                {["A", "B", "C"][i]}
              </div>
            ))}
          </div>
          <span className="text-[9px] text-zinc-400 font-bold">
            {kh ? `${socialCount} នាក់បានទទួល` : `${socialCount} students claimed`}
          </span>
        </div>

        {/* Progress — Goal Gradient Effect */}
        {isLoggedIn && !claimed && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-bold text-zinc-500">
                {userPoints.toLocaleString()} / {item.cost.toLocaleString()} pts
              </span>
              <span className="text-[9px] font-black tabular-nums" style={{ color: barColor }}>
                {pct}%
              </span>
            </div>
            {/* Track */}
            <div className="relative h-3 rounded-full overflow-hidden border border-zinc-200"
              style={{ background: "#f4f4f5" }}>
              <div className="h-full rounded-full transition-all duration-700 relative"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }}>
                {/* Shimmer on the bar */}
                {pct > 10 && (
                  <div className="absolute inset-0 rounded-full"
                    style={{ background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.4) 50%,transparent 100%)", animation: "shimmer 1.8s infinite" }} />
                )}
              </div>
              {/* Milestone tick at 100% */}
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-black/20" />
            </div>
            {/* Motivational micro-copy — Zeigarnik Effect */}
            {isAlmostThere && (
              <p className="text-[9px] font-black mt-1 text-center" style={{ color: "#f59e0b", ...kf }}>
                {kh
                  ? `🔥 ខ្វះតែ ${pointsNeeded.toLocaleString()} ពិន្ទុទៀត!`
                  : `🔥 Just ${pointsNeeded.toLocaleString()} pts away!`}
              </p>
            )}
            {isReady && (
              <p className="text-[9px] font-black mt-1 text-center" style={{ color: "#22c55e", ...kf }}>
                {kh ? "✅ អ្នកអាចទទួលបានហើយ!" : "✅ You've earned this!"}
              </p>
            )}
          </div>
        )}

        {/* ── CTA Button ── */}
        {claimed ? (
          <div className="w-full py-2.5 rounded-lg font-black text-xs text-center border-2 border-green-500 text-green-600 bg-green-50" style={kf}>
            {kh ? "✓ ទទួលបានហើយ" : "✓ Claimed"}
          </div>
        ) : !isLoggedIn ? (
          <a href="/login"
            className="w-full py-2.5 rounded-lg font-black text-xs text-center border-2 border-black block transition-all"
            style={{ background: "#fbbf24", color: "#000", boxShadow: "2px 2px 0 #000", ...kf }}>
            {kh ? "ចូលគណនីដើម្បីទទួល →" : "Log in to claim →"}
          </a>
        ) : canClaim ? (
          <button
            onClick={handleClaim}
            className="w-full py-2.5 rounded-lg font-black text-xs border-2 border-black relative overflow-hidden"
            style={{
              background: item.color,
              color: "#000",
              boxShadow: pulse ? `0 0 0 4px ${item.color}55, 2px 2px 0 #000` : "2px 2px 0 #000",
              transform: pulse ? "scale(1.02)" : "scale(1)",
              transition: "box-shadow 0.4s ease, transform 0.4s ease",
              cursor: "pointer",
              ...kf,
            }}
          >
            {/* Animated shine sweep */}
            <span className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.45) 50%,transparent 60%)", animation: "shineSweep 1.6s infinite" }} />
            <span className="relative z-10">
              {kh ? "🎁 ទទួលឥឡូវ!" : "🎁 Claim Now!"}
            </span>
          </button>
        ) : (
          <button disabled
            className="w-full py-2.5 rounded-lg font-black text-xs border-2 border-zinc-200 text-zinc-400 bg-zinc-50 cursor-not-allowed"
            style={kf}>
            {kh
              ? `ត្រូវការ ${pointsNeeded.toLocaleString()} pts ទៀត`
              : `Need ${pointsNeeded.toLocaleString()} more pts`}
          </button>
        )}
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes shineSweep { 0%{transform:translateX(-120%)} 60%,100%{transform:translateX(220%)} }
      `}</style>
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
      .catch(() => { });
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
      <div className="relative overflow-hidden border-b-4 border-black" style={{ background: "linear-gradient(135deg,#09090b 0%,#18181b 100%)" }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
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
              <div className="flex flex-col sm:items-end gap-1">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Your Points</span>
                <div className="flex items-center gap-2">
                  <AnimatedNumber value={userPoints} className="text-3xl md:text-4xl font-black text-yellow-400 tabular-nums" />
                  <TierBadge lifetimePoints={userPoints} size="sm" lang={lang} />
                </div>
                <div className="w-48 sm:w-56">
                  <RankProgressBar lifetimePoints={userPoints} lang={lang} compact />
                </div>
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
                    {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                )}
              </div>
              <div className="bg-white border-2 border-black overflow-hidden" style={{ boxShadow: "4px 4px 0 #000" }}>
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
                  const tier = getRank(user.lifetimePoints);
                  return (
                    <div key={user.id} className="grid grid-cols-12 px-3 md:px-5 py-2.5 border-t border-zinc-100 hover:bg-zinc-50 transition-colors items-center">
                      <div className="col-span-1 flex items-center gap-0.5">
                        <span className="text-xs font-black text-zinc-400">{user.rank}</span>
                        {moved > 0 && <span className="text-[8px] font-black text-green-500 leading-none">▲</span>}
                        {moved < 0 && <span className="text-[8px] font-black text-red-400 leading-none">▼</span>}
                      </div>
                      <div className="col-span-7 flex items-center gap-2 min-w-0">
                        {/* Tier-ranked avatar ring */}
                        <RankedAvatarRing lifetimePoints={user.lifetimePoints} size={30}>
                          <Avatar url={user.avatar} name={user.displayName || user.username} size={30} changedAt={user.avatarChangedAt} />
                        </RankedAvatarRing>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-black text-xs md:text-sm truncate leading-tight font-kh-header">
                              {user.displayName || user.username}
                            </span>
                            <TierBadge lifetimePoints={user.lifetimePoints} size="xs" showEmoji={false} lang={lang} />
                          </div>
                          {user.displayName && (
                            <span className="text-[9px] text-zinc-400 truncate hidden sm:block">@{user.username}</span>
                          )}
                        </div>
                      </div>
                      <span className="col-span-2 text-center text-xs font-bold text-zinc-400 tabular-nums hidden sm:block">
                        {user.totalGamesPlayed}
                      </span>
                      <span className="col-span-4 sm:col-span-2 text-right font-black tabular-nums text-xs md:text-sm" style={{ color: tier.accent }}>
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

            {/* ── Rank Tier Showcase ── */}
            {currentUser && (
              <div className="bg-white border-2 border-black p-5" style={{ boxShadow: "4px 4px 0 #000" }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-black text-yellow-400 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 mb-1.5">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                      {kh ? "ថ្នាក់របស់អ្នក" : "Your Rank"}
                    </div>
                    <p className="text-xs text-zinc-500" style={kf}>
                      {kh ? "ប្រមូលពិន្ទុ → ដំឡើងថ្នាក់ → ទទួលបានស្លាកពិសេស" : "Earn points → Level up → Unlock exclusive labels"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TierBadge lifetimePoints={userPoints} size="md" lang={lang} />
                  </div>
                </div>
                <RankProgressBar lifetimePoints={userPoints} lang={lang} />
                <div className="mt-4">
                  <RankShowcase lifetimePoints={userPoints} lang={lang} />
                </div>
              </div>
            )}

            {/* ── Rewards ── Psychology-driven redesign ── */}
            <div>
              {/* Hero banner — Aspirational framing */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-black mb-5"
                style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)", boxShadow: "4px 4px 0 #000" }}>
                {/* Dot grid texture */}
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "16px 16px" }} />
                {/* Floating emoji decorations */}
                <span className="absolute top-3 right-6 text-3xl opacity-60 select-none" style={{ animation: "float 3s ease-in-out infinite" }}>🎁</span>
                <span className="absolute bottom-3 right-16 text-2xl opacity-40 select-none" style={{ animation: "float 3.5s ease-in-out infinite 0.5s" }}>⭐</span>
                <span className="absolute top-4 right-28 text-xl opacity-30 select-none" style={{ animation: "float 4s ease-in-out infinite 1s" }}>✨</span>
                <style>{`
                  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                `}</style>

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-black text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full mb-2">
                      <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                      {kh ? "រង្វាន់" : "Rewards Store"}
                    </div>
                    <h2 className="text-xl md:text-3xl font-black text-white leading-tight" style={kf}>
                      {kh ? "ទទួលរង្វាន់ដោយពិន្ទុ 🏆" : "Claim with Points 🏆"}
                    </h2>
                    <p className="text-white/60 text-xs mt-1 max-w-xs" style={kf}>
                      {kh
                        ? "លេងហ្គេម → ប្រមូលពិន្ទុ → ទទួលរង្វាន់ពិតៗ!"
                        : "Play games → Earn points → Get real prizes!"}
                    </p>
                  </div>

                  {/* Points balance pill — Endowment Effect: show what they "own" */}
                  {currentUser ? (
                    <div className="flex flex-col items-center gap-0.5 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 self-start sm:self-auto backdrop-blur-sm">
                      <span className="text-white/50 text-[9px] font-black uppercase tracking-widest" style={kf}>
                        {kh ? "ពិន្ទុរបស់អ្នក" : "Your Points"}
                      </span>
                      <div className="flex items-end gap-1">
                        <AnimatedNumber value={userPoints} className="text-3xl font-black text-yellow-400 tabular-nums leading-none" />
                        <span className="text-yellow-400/60 text-xs font-bold mb-0.5">pts</span>
                      </div>
                      <span className="text-white/40 text-[9px]" style={kf}>
                        {kh ? "ប្រើដើម្បីទទួលរង្វាន់" : "Use to claim prizes"}
                      </span>
                    </div>
                  ) : (
                    <a href="/login"
                      className="flex items-center gap-2 bg-yellow-400 text-black font-black text-sm px-4 py-3 rounded-xl border-2 border-black self-start"
                      style={{ boxShadow: "3px 3px 0 #000", ...kf }}>
                      <span>🔓</span>
                      {kh ? "ចូលគណនីដើម្បីទទួល" : "Log in to claim"}
                    </a>
                  )}
                </div>
              </div>

              {/* Claim success toast */}
              {claimMsg && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500 text-white font-bold text-sm border-2 border-black"
                  style={{ boxShadow: "3px 3px 0 #000", ...kf }}>
                  <span className="text-xl">🎉</span>
                  <span>{claimMsg}</span>
                </div>
              )}

              {/* Reward grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {REWARD_ITEMS.map((item, idx) => (
                  <RewardCard
                    key={item.id}
                    item={item}
                    itemIndex={idx}
                    userPoints={userPoints}
                    isLoggedIn={!!currentUser}
                    lang={lang}
                    onClaim={(i) => {
                      const msg = kh
                        ? `🎁 "${i.nameKh}" ត្រូវបានផ្ញើទៅគ្រូរបស់អ្នក!`
                        : `🎁 "${i.name}" claim sent to your teacher!`;
                      setClaimMsg(msg);
                      setTimeout(() => setClaimMsg(""), 5000);
                    }}
                  />
                ))}
              </div>

              {/* Footer note */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-zinc-300 text-[10px]">—</span>
                <p className="text-[10px] text-zinc-400 text-center" style={kf}>
                  {kh
                    ? "រង្វាន់ត្រូវបានប្រគល់ដោយគ្រូ · ទទួលបានតែម្តងក្នុងមួយធាតុ"
                    : "Prizes delivered by your teacher · One claim per item"}
                </p>
                <span className="text-zinc-300 text-[10px]">—</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
