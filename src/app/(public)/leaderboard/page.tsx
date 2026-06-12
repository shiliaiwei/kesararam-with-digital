"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useLang } from "@/context/lang-context";
import { RankBadge as TierBadge, RankedAvatarRing, RankProgressBar, RankShowcase } from "@/components/shared/rank-label";
import { getRank } from "@/lib/rank-utils";
import { getAvatarFaceStyle } from "@/lib/utils";
import { REWARD_ITEMS, getRewardRarity, RARITY_META } from "@/lib/rewards";
import {
  Trophy,
  Gift,
  Lock,
  Sparkles,
  Star,
  Check,
  Flame,
  Crown,
  Info,
  Award,
  Wifi,
  BookOpen,
  MapPin,
  Layers,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ─── BRAND COLORS ─────────────────────────────────────────────────────────────
const BRAND = {
  yellow: "#eab308",
  yellowDark: "#ca8a04",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
  cyan: "#06b6d4",
  black: "#000000",
  white: "#ffffff",
};

// ── Types ─────────────────────────────────────────────────────────────────────

const CAMBODIA_PROVINCES = [
  { en: "Siem Reap", kh: "សៀមរាប" },
  { en: "Phnom Penh", kh: "ភ្នំពេញ" },
  { en: "Battambang", kh: "បាត់ដំបង" },
  { en: "Banteay Meanchey", kh: "បន្ទាយមានជ័យ" },
  { en: "Kampong Cham", kh: "កំពង់ចាម" },
  { en: "Kampong Chhnang", kh: "កំពង់ឆ្នាំង" },
  { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  { en: "Kampong Thom", kh: "កំពង់ធំ" },
  { en: "Kampot", kh: "កំពត" },
  { en: "Kandal", kh: "កណ្តាល" },
  { en: "Kep", kh: "កែប" },
  { en: "Koh Kong", kh: "កោះកុង" },
  { en: "Kratie", kh: "ក្រចេះ" },
  { en: "Mondulkiri", kh: "មណ្ឌលគីរី" },
  { en: "Oudar Meanchey", kh: "ឧត្តរមានជ័យ" },
  { en: "Pailin", kh: "ប៉ៃលិន" },
  { en: "Preah Sihanouk", kh: "ព្រះសីហនុ" },
  { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  { en: "Prey Veng", kh: "ព្រៃវែង" },
  { en: "Pursat", kh: "ពោធិ៍សាត់" },
  { en: "Ratanakiri", kh: "រតនគីរី" },
  { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  { en: "Takeo", kh: "តាកែវ" },
  { en: "Tboung Khmum", kh: "ត្បូងឃ្មុំ" },
];

function getProvinceKh(provinceEn: string | null | undefined): string {
  if (!provinceEn) return "—";
  const found = CAMBODIA_PROVINCES.find(p => p.en.toLowerCase() === provinceEn.toLowerCase());
  return found ? found.kh : provinceEn;
}

// ── Leaderboard time windows + game-type filter ───────────────────────────────
const WINDOW_TABS: { id: "weekly" | "monthly" | "all"; en: string; kh: string }[] = [
  { id: "weekly", en: "Weekly", kh: "ប្រចាំសប្តាហ៍" },
  { id: "monthly", en: "Monthly", kh: "ប្រចាំខែ" },
  { id: "all", en: "All-Time", kh: "គ្រប់ពេល" },
];

// GameType values match the `gameType` column written into pointsLedger.
// Includes both live teacher-hosted sessions AND solo practice game modes.
const GAME_TYPES: { id: string; en: string; kh: string }[] = [
  { id: "all",            en: "All Game Types",    kh: "គ្រប់ប្រភេទ" },
  { id: "quick-quiz",     en: "Quick Quiz",         kh: "សំណួរលឿន" },
  { id: "speed-round",    en: "Speed Round",        kh: "វគ្គល្បឿន" },
  { id: "sign-challenge", en: "Sign Challenge",     kh: "ប្រឡងសញ្ញា" },
  { id: "mixed-practice", en: "Mixed Practice",     kh: "ហ្វឹកហាត់ចម្រុះ" },
  { id: "sign-match",     en: "Sign Match (Mini)",  kh: "ផ្គូផ្គងសញ្ញា" },
  { id: "daily",          en: "Daily Challenge",    kh: "បញ្ហាប្រចាំថ្ងៃ" },
];

// Source filter — one segmented control. NO emoji (brand rule): Lucide icon +
// a semantic color dot per source. Values map to the API `source` param.
const SOURCE_TABS: { id: string; en: string; kh: string; icon: React.ElementType; color: string }[] = [
  { id: "all",   en: "All Sources",     kh: "ប្រភពទាំងអស់",   icon: Layers,   color: "#eab308" },
  { id: "live",  en: "Live Games",      kh: "ហ្គេមផ្ទាល់",     icon: Wifi,     color: "#ef4444" },
  { id: "solo",  en: "Solo Practice",   kh: "ហ្វឹកហាត់",       icon: BookOpen, color: "#22c55e" },
];

interface LeaderboardUser {
  id: number;
  username: string;
  isUsernamePublic?: boolean;
  displayName: string | null;
  avatar: string | null;
  avatarChangedAt: string | null;
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  schoolName?: string | null;
  province?: string | null;
  gradeLevel?: string | null;
  section?: string | null;
  className: string | null;
  rank: number;
}

// REWARD_ITEMS is now imported from @/lib/rewards — single source of truth.
// The import is at the top of this file.

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
  const initials = (name || "?").slice(0, 2).toUpperCase();

  const parsed = (() => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const data = JSON.parse(trimmed) as { face?: string; head?: string };
        if (data && (data.face || data.head)) {
          if (data.head && !data.face) {
            data.face = "Smile.svg";
          }
          return data;
        }
      } catch {
        return null;
      }
    }
    return null;
  })();

  return (
    <div className="relative flex-shrink-0 animate-fade-in" style={{ width: size, height: size }}>
      {ring && <div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: `3px solid ${ring}`, margin: -3, borderRadius: "50%" }} />}
      {parsed ? (
        <div className="w-full h-full rounded-full overflow-hidden relative flex-shrink-0" style={{ background: "#eab308", border: "2px solid #000" }}>
          {parsed.head && (
            <Image
              src={`/avatar/head/${encodeURIComponent(parsed.head)}`}
              alt=""
              aria-hidden
              fill
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
          {parsed.face && (
            <Image
              src={`/avatar/face/${encodeURIComponent(parsed.face)}`}
              alt=""
              aria-hidden
              style={getAvatarFaceStyle(parsed.head)}
            />
          )}
        </div>
      ) : (
        (() => {
          const src = avatarSrc(url, changedAt);
          if (src && !err) {
            return (
              <Image
                src={src}
                alt={name}
                onError={() => setErr(true)}
                fill
                className="w-full h-full object-cover rounded-full"
                style={{ border: "2px solid #000" }}
              />
            );
          }
          return (
            <div
              className="w-full h-full rounded-full flex items-center justify-center font-black text-white"
              style={{
                background: "#27272a",
                border: "2px solid #000",
                fontSize: Math.round(size * 0.36),
              }}
            >
              {initials}
            </div>
          );
        })()
      )}
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
    gsap.to(obj, { val: value, duration: 0.8, ease: "power2.out", onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString(); } });
    prev.current = value;
  }, [value]);
  return <span ref={ref} className={className} style={style}>{value.toLocaleString()}</span>;
}

// ── Rank badge SVG ────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: 1 | 2 | 3 }) {
  const c = { 1: { fill: "#eab308", stroke: "#ca8a04", text: "#000", label: "1ST" }, 2: { fill: "#94a3b8", stroke: "#64748b", text: "#fff", label: "2ND" }, 3: { fill: "#cd7c3a", stroke: "#92400e", text: "#fff", label: "3RD" } }[rank];
  return (
    <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
      <polygon points="26,2 48,14 48,38 26,50 4,38 4,14" fill={c.fill} stroke="#000" strokeWidth="3" />
      <polygon points="26,5 45,16 45,22 26,11" fill="rgba(255,255,255,0.25)" />
      <text x="26" y="32" textAnchor="middle" fontSize="13" fontWeight="900" fill={c.text} fontFamily="monospace">{c.label}</text>
    </svg>
  );
}

// ── Podium card ───────────────────────────────────────────────────────────────

const PODIUM_CFG = [
  {
    rank: 2 as const,
    label: "Silver",
    accentColor: "#94a3b8",
    pedestalBg: "repeating-linear-gradient(-45deg, #f1f5f9, #f1f5f9 8px, #cbd5e1 8px, #cbd5e1 16px)",
    shadowColor: "#000000",
    scoreColor: "#475569",
    barH: "h-20 md:h-28",
    order: "order-2 md:order-1"
  },
  {
    rank: 1 as const,
    label: "Gold Champion",
    accentColor: "#eab308",
    pedestalBg: "repeating-linear-gradient(-45deg, #fef08a, #fef08a 8px, #facc15 8px, #facc15 16px)",
    shadowColor: "#000000",
    scoreColor: "#000",
    barH: "h-24 md:h-36",
    order: "order-1 md:order-2"
  },
  {
    rank: 3 as const,
    label: "Bronze",
    accentColor: "#cd7c3a",
    pedestalBg: "repeating-linear-gradient(-45deg, #ffedd5, #ffedd5 8px, #fed7aa 8px, #fed7aa 16px)",
    shadowColor: "#000000",
    scoreColor: "#92400e",
    barH: "h-16 md:h-24",
    order: "order-3"
  },
];

function PodiumCard({ user, cfg, index, currentUser, onSelect }: {
  user: LeaderboardUser | undefined;
  cfg: typeof PODIUM_CFG[number];
  index: number;
  currentUser: any | null;
  onSelect: (user: LeaderboardUser) => void;
}) {
  const { lang } = useLang();
  const kh = lang === "kh";
  // Tier ("exclusive label") drives the avatar border colour.
  const tier = user ? getRank(user.lifetimePoints) : null;
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isFirst = cfg.rank === 1;
  const name = user ? (user.displayName || user.username) : "—";
  const userAvatar = (currentUser && user && user.id === currentUser.id) ? currentUser.avatar : (user?.avatar ?? null);
  const initials = (name && name !== "—" ? name : "?").slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: index * 0.08, ease: "back.out(1.2)" });
  }, [index]);

  useEffect(() => {
    if (!isFirst || !glowRef.current) return;
    gsap.to(glowRef.current, { opacity: 0.5, scale: 1.03, duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, [isFirst]);

  return (
    <div ref={cardRef} className={`relative flex flex-col items-center w-full ${cfg.order}`}>
      {isFirst && <div ref={glowRef} className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(234,179,8,0.25) 0%, transparent 70%)", opacity: 0.3 }} />}

      {/* Floating Avatar and Rank Badge Container */}
      <div
        className={`relative mb-2 flex flex-col items-center select-none ${user && user.isUsernamePublic !== false ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => { if (user) onSelect(user); }}
        style={{
          animation: isFirst
            ? "floatFirst 4s ease-in-out infinite"
            : cfg.rank === 2
              ? "floatSecond 4.4s ease-in-out infinite"
              : "floatThird 4.8s ease-in-out infinite",
        }}
      >
        {isFirst && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
            <Crown size={32} className="text-yellow-400 fill-yellow-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] animate-bounce" style={{ animationDuration: "2s", transform: "rotate(-10deg)" }} />
          </div>
        )}

        {/* Twinkling star decorations for 1st place champion */}
        {isFirst && (
          <>
            <div className="absolute -left-6 top-4 text-yellow-500 pointer-events-none" style={{ animation: "twinkle 2s ease-in-out infinite" }}>
              <Sparkles size={16} className="fill-yellow-400" />
            </div>
            <div className="absolute -right-6 top-8 text-yellow-500 pointer-events-none" style={{ animation: "twinkle 2.5s ease-in-out infinite 0.5s" }}>
              <Star size={12} className="fill-yellow-400" />
            </div>
          </>
        )}

        {/* Double Orbital Rings (Redesigned Animation Style) */}
        <div
          className="absolute rounded-full border-2 border-dashed pointer-events-none"
          style={{
            width: isFirst ? 92 : 76,
            height: isFirst ? 92 : 76,
            borderColor: isFirst ? "#eab308" : cfg.accentColor,
            animation: "spinCW 12s linear infinite",
            opacity: 0.85,
            top: -6,
            boxShadow: isFirst ? "0 0 12px rgba(234,179,8,0.5)" : "none"
          }}
        />
        <div
          className="absolute rounded-full border border-dotted pointer-events-none"
          style={{
            width: isFirst ? 100 : 84,
            height: isFirst ? 100 : 84,
            borderColor: isFirst ? "#ca8a04" : `${cfg.accentColor}aa`,
            animation: "spinCCW 8s linear infinite",
            opacity: 0.6,
            top: -10,
          }}
        />

        {/* Creative Rank Emblem/Medal */}
        <div
          className="relative rounded-full flex items-center justify-center border-4 border-black overflow-hidden transition-transform duration-300 hover:scale-110"
          style={{
            width: isFirst ? 80 : 64,
            height: isFirst ? 80 : 64,
            background: cfg.pedestalBg,
            // Tier-coloured ring outside the black border ("border profile based
            // on exclusive label").
            boxShadow: tier ? `0 0 0 3px ${tier.accent}` : undefined,
          }}
        >
          {userAvatar && (userAvatar.trim().startsWith("{") || userAvatar.startsWith("http") || userAvatar.startsWith("/")) ? (
            <Avatar url={userAvatar} name={name} size={isFirst ? 72 : 56} changedAt={user?.avatarChangedAt} />
          ) : (
            /* Inner circle with Rank Initials & Icon if no avatar */
            <div
              className="rounded-full bg-black flex flex-col items-center justify-center border-2 border-white/10 relative"
              style={{
                width: isFirst ? 58 : 46,
                height: isFirst ? 58 : 46,
              }}
            >
              <span
                className="font-black text-white font-mono leading-none tracking-tight"
                style={{
                  fontSize: isFirst ? "14px" : "11px",
                }}
              >
                {initials}
              </span>
              {isFirst ? (
                <Trophy size={isFirst ? 16 : 12} className="text-yellow-400 mt-1" />
              ) : cfg.rank === 2 ? (
                <Award size={isFirst ? 16 : 12} className="text-slate-300 mt-1" />
              ) : (
                <Star size={isFirst ? 16 : 12} className="text-orange-400 mt-1" />
              )}
            </div>
          )}
        </div>

        {/* Rank Badge - positioned below the profile so it never covers the face */}
        <div className="mt-2.5 scale-75 md:scale-100 z-10 filter drop-shadow-[2px_2px_0_rgba(0,0,0,0.85)]">
          <RankBadge rank={cfg.rank} />
        </div>
      </div>

      {/* Card Body */}
      <div
        className={`w-full flex flex-col items-center gap-1.5 pt-8 pb-4 px-2 md:px-3 border-3 border-black -mt-4 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden ${user && user.isUsernamePublic !== false ? "cursor-pointer" : "cursor-default"}`}
        onClick={user && user.isUsernamePublic !== false ? () => onSelect(user) : undefined}
        style={{
          backgroundColor: isFirst ? "#fffbeb" : "#fff",
          backgroundImage: isFirst
            ? "radial-gradient(#facc15 1px, transparent 1px)"
            : "radial-gradient(#e2e8f0 1px, transparent 1px)",
          backgroundSize: "8px 8px",
          boxShadow: isFirst
            ? `8px 8px 0 #000, 0 0 25px rgba(234,179,8,0.25)`
            : `4px 4px 0 #000`,
          borderRadius: 0,
          borderWidth: isFirst ? "4px" : "3px",
          animation: isFirst
            ? "goldGlowShadow 3s ease-in-out infinite, panBackground 15s linear infinite"
            : "panBackground 25s linear infinite"
        }}
      >
        {/* Rising particle fountain (Redesigned Animation Style for 1st place) */}
        {isFirst && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            <div className="absolute text-yellow-400"
              style={{
                left: "15%",
                bottom: "10%",
                animation: "floatParticle 4s ease-in-out infinite",
                animationDelay: "0s"
              }}
            >
              <Star size={10} className="fill-yellow-400" />
            </div>
            <div className="absolute text-yellow-400"
              style={{
                right: "20%",
                bottom: "20%",
                animation: "floatParticle 4.5s ease-in-out infinite",
                animationDelay: "1.5s"
              }}
            >
              <Sparkles size={8} className="fill-yellow-400" />
            </div>
            <div className="absolute text-yellow-400"
              style={{
                left: "45%",
                bottom: "5%",
                animation: "floatParticle 5s ease-in-out infinite",
                animationDelay: "3s"
              }}
            >
              <Star size={6} className="fill-yellow-400" />
            </div>
          </div>
        )}

        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-0 w-[150%] h-full opacity-20 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              transform: "skewX(-25deg)",
              animation: isFirst ? "shimmerSweep 3.5s ease-in-out infinite" : "shimmerSweep 5s ease-in-out infinite",
            }}
          />
        </div>

        <span className="font-black text-center leading-tight w-full truncate text-[10px] md:text-sm font-kh-header z-10" style={{ color: "#000" }}>{name}</span>
        {/* Consistent labels across all three: tier (exclusive) + province. */}
        {user && <TierBadge lifetimePoints={user.lifetimePoints} size="xs" />}
        {user && user.province && (
          <div className="flex flex-wrap justify-center gap-1 mt-1 z-10">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-black bg-blue-50 text-[8px] font-black uppercase text-blue-700">
              <MapPin size={8} />{kh ? getProvinceKh(user.province) : user.province}
            </span>
          </div>
        )}

        <span
          className="text-[8px] md:text-[9px] font-black tracking-widest uppercase px-2 py-0.5 border-2 border-black text-white z-10"
          style={{
            backgroundColor: isFirst ? "#eab308" : "#000",
            color: isFirst ? "#000" : "#fff"
          }}
        >
          {cfg.label}
        </span>
        <AnimatedNumber value={user?.lifetimePoints ?? 0} className={`font-black tabular-nums z-10 ${isFirst ? "text-xl md:text-3xl" : "text-base md:text-xl"}`} style={{ color: "#000" }} />
        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider z-10">pts</span>
      </div>
      {/* ── Standing pedestal — premium podium step with embossed rank ── */}
      <div
        className={`relative w-full border-3 border-t-0 border-black ${cfg.barH} overflow-hidden flex items-center justify-center`}
        style={{
          background: cfg.pedestalBg,
          boxShadow: isFirst ? "8px 0 0 #000" : "4px 0 0 #000"
        }}
      >
        {/* embossed rank numeral — reads like a real podium step */}
        <span
          className="font-black leading-none select-none tabular-nums z-10"
          style={{
            fontSize: isFirst ? "clamp(42px,13vw,76px)" : "clamp(28px,9vw,52px)",
            fontFamily: "monospace",
            WebkitTextStroke: "2.5px #000",
            WebkitTextFillColor: "rgba(255,255,255,0.6)",
          }}
        >
          {cfg.rank}
        </span>
        {/* subtle top sheen */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-white/25 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Social proof & badge data ─────────────────────────────────────────────
const SOCIAL_PROOF: Record<number, number> = { 1: 47, 2: 112, 3: 89, 4: 63, 5: 134, 6: 38, 7: 71, 8: 19, 9: 12 };
const SCARCITY: Record<number, number | null> = { 1: null, 2: null, 3: null, 4: null, 5: null, 6: 8, 7: null, 8: 5, 9: 3 };
const BONUS_BADGE: Record<number, { label: string; icon: typeof Star } | null> = {
  1: null,
  2: { label: "Popular", icon: Star },
  3: null,
  4: null,
  5: { label: "Hot", icon: Flame },
  6: null,
  7: null,
  8: { label: "Rare", icon: Sparkles },
  9: { label: "Epic", icon: Crown }
};

// ── Confetti effect ──────────────────────────────────────────────────────────
function ClaimBurst({ color }: { color: string }) {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    angle: (i / 18) * 360,
    dist: 28 + Math.random() * 22,
    size: 4 + Math.random() * 5,
    c: [color, "#000", "#eab308", "#22c55e"][i % 4],
  }));
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
      {pieces.map(p => (
        <div key={p.id} className="absolute rounded-none"
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
        @keyframes floatFirst {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes floatSecond {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1.5deg); }
        }
        @keyframes floatThird {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-150%) skewX(-25deg); }
          50% { transform: translateX(150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }
        @keyframes goldGlowShadow {
          0%, 100% {
            box-shadow: 8px 8px 0 #000, 0 0 15px rgba(234, 179, 8, 0.35);
          }
          50% {
            box-shadow: 10px 10px 0 #000, 0 0 35px rgba(234, 179, 8, 0.7);
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2) rotate(15deg); }
        }
        @keyframes spinCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinCCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0px) scale(0); opacity: 0; }
          30% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
        }
        @keyframes panBackground {
          0% { background-position: 0px 0px; }
          100% { background-position: 32px 32px; }
        }
        @keyframes shimmerProgress {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        @keyframes buttonPulse {
          0%, 100% { transform: scale(1); box-shadow: 4px 4px 0 #000; }
          50% { transform: scale(1.02); box-shadow: 6px 6px 0 #000, 0 0 15px var(--pulse-color); }
        }
      `}</style>
    </div>
  );
}

// Cooldown durations in milliseconds for each rank tier (Redesigned: Gold: 1.5y, Platinum: 2y, Diamond: 2.5y, Mythic: 3y)
const TIER_COOLDOWNS: Record<string, number> = {
  rookie: 365 * 24 * 60 * 60 * 1000,                      // 1 year
  debut: 365 * 24 * 60 * 60 * 1000,                       // 1 year
  gold: Math.round(1.5 * 365 * 24 * 60 * 60 * 1000),      // 1.5 years (1 year + 6 months)
  platinum: 2 * 365 * 24 * 60 * 60 * 1000,                // 2 years
  diamond: Math.round(2.5 * 365 * 24 * 60 * 60 * 1000),    // 2.5 years (2 years + 6 months)
  mythic: 3 * 365 * 24 * 60 * 60 * 1000,                  // 3 years
};

// ── REWARD CARD (Brutalist Premium Redesign) ──────────────────────────────────
function RewardCard({ item, userPoints, isLoggedIn, onClaim, lang, userLifetimePoints = 0 }: {
  item: typeof REWARD_ITEMS[number]; userPoints: number;
  isLoggedIn: boolean; onClaim: (item: typeof REWARD_ITEMS[number]) => void; lang: string;
  userLifetimePoints?: number;
}) {
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const userRank = getRank(userLifetimePoints);
  const cooldownMs = TIER_COOLDOWNS[userRank.id] ?? TIER_COOLDOWNS.rookie;

  const claimDataKey = `kwd_claim_data_${item.id}`;
  const [claimData, setClaimData] = useState(() => {
    if (typeof window === "undefined") return { claimCount: 0, lastClaimedAt: null };
    const saved = localStorage.getItem(claimDataKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          claimCount: parsed.claimCount ?? 0,
          lastClaimedAt: parsed.lastClaimedAt ?? null,
        };
      } catch {
        // fall through
      }
    }
    const legacyClaimed = localStorage.getItem(`kwd_claimed_${item.id}`) === "1";
    return {
      claimCount: legacyClaimed ? 1 : 0,
      lastClaimedAt: legacyClaimed ? Date.now() - 365 * 24 * 60 * 60 * 1000 : null,
    };
  });

  const claimCount = isLoggedIn ? claimData.claimCount : 0;
  const lastClaimedAt = isLoggedIn ? claimData.lastClaimedAt : null;

  const claimed = isLoggedIn && lastClaimedAt !== null && (Date.now() - lastClaimedAt < cooldownMs);
  const msRemaining = lastClaimedAt ? (lastClaimedAt + cooldownMs) - Date.now() : 0;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

  const [hovered, setHovered] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const canClaim = isLoggedIn && userPoints >= item.cost && !claimed;
  const rawPct = Math.min(100, (userPoints / item.cost) * 100);
  const pct = Math.round(rawPct);

  const socialCount = SOCIAL_PROOF[item.id] ?? 0;
  const scarcity = SCARCITY[item.id];
  const bonusBadge = BONUS_BADGE[item.id];
  const pointsNeeded = item.cost - userPoints;

  // Rarity ("premium collectible") — derived from cost; drives ribbon, frame
  // weight and the accent/aura on the card.
  const rarity = getRewardRarity(item.cost);
  const rmeta = RARITY_META[rarity];
  const isElite = rarity === "legendary" || rarity === "mythic";
  const isAlmostThere = isLoggedIn && !claimed && rawPct >= 60 && rawPct < 100;
  const isReady = isLoggedIn && !claimed && rawPct >= 100;

  useEffect(() => {
    if (!isReady) return;
    const t = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(t);
  }, [isReady]);

  function handleClaim() {
    if (!canClaim) return;
    const nextCount = claimCount + 1;
    const now = Date.now();
    const nextData = {
      claimCount: nextCount,
      lastClaimedAt: now,
    };
    localStorage.setItem(claimDataKey, JSON.stringify(nextData));
    localStorage.setItem(`kwd_claimed_${item.id}`, "1");
    setClaimData(nextData);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 700);
    onClaim(item);
  }

  // Hard offset shadow (brutalist) + rarity-tinted aura. Higher rarity = bigger
  // offset and a stronger coloured glow behind the solid shadow.
  const baseOffset = isElite ? "7px 7px" : "5px 5px";
  const hoverOffset = isElite ? "13px 13px" : "11px 11px";
  const cardShadow = claimed
    ? "3px 3px 0 #000"
    : hovered
      ? `${hoverOffset} 0 #000, 0 12px 34px ${rmeta.glow}`
      : isReady
        ? `${baseOffset} 0 #000, 0 0 22px ${rmeta.glow}`
        : `${baseOffset} 0 #000, 0 6px 18px ${rmeta.glow}`;

  const cardTransform = claimed
    ? "none"
    : hovered
      ? "translate(-6px,-6px)"
      : "translate(0,0)";

  return (
    <div
      className="relative flex flex-col overflow-hidden select-none transition-all duration-200 group"
      style={{
        boxShadow: cardShadow,
        transform: cardTransform,
        background: claimed ? "#f4f4f5" : "#ffffff",
        borderRadius: 0,
        border: `${isElite ? 4 : 3}px solid #000`,
        "--mouse-x": `${mousePos.x}%`,
        "--mouse-y": `${mousePos.y}%`,
      } as React.CSSProperties}
      onMouseEnter={() => { if (!claimed) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
      onPointerMove={handlePointerMove}
    >
      {showBurst && <ClaimBurst color={item.color} />}

      {/* ── Rarity ribbon — premium collectible banner ── */}
      <div
        className="relative z-30 flex items-center justify-between px-3 py-1.5 border-b-3 border-black"
        style={{ background: rmeta.accent }}
      >
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: isElite ? "#000" : "#fff" }}>
          <Sparkles size={11} strokeWidth={3} className={isElite ? "fill-black" : "fill-white"} />
          {kh ? rmeta.labelKh : rmeta.label}
        </span>
        {isElite && (
          <Crown size={13} strokeWidth={2.5} className="text-black" fill="currentColor" />
        )}
      </div>

      {/* Premium Spotlight Pointer Glow Effect */}
      {!claimed && hovered && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 220px at var(--mouse-x, 50%) var(--mouse-y, 50%), ${item.color}15, transparent 80%)`
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 100px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.12), transparent 80%)`
            }}
          />
        </>
      )}

      {/* Claimed diagonal tag overlay */}
      {claimed && (
        <div className="absolute top-4 right-[-32px] bg-black text-white text-[9px] font-black py-1.5 px-10 rotate-45 border-y border-white/20 z-20 select-none tracking-widest text-center shadow-sm">
          {kh ? "✓ បានទទួល" : "✓ CLAIMED"}
        </div>
      )}

      {/* ── Premium 4K Mockup Cover Image Header ── */}
      <div className="relative h-44 w-full border-b-3 border-black overflow-hidden bg-zinc-100 flex items-center justify-center">
        {/* Dynamic ambient backlight glowing halo */}
        {!claimed && (
          <div className="absolute inset-0 opacity-35 pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle at center, ${item.color}44 0%, transparent 70%)`
            }}
          />
        )}

        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover select-none z-10"
          style={{
            filter: claimed ? "grayscale(100%) brightness(0.9)" : "none",
            transform: hovered && !claimed ? "scale(1.08) rotate(0.5deg)" : "scale(1)",
            transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease"
          }}
        />

        {/* Lucide Badge Tag */}
        {bonusBadge && !claimed && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black text-white text-[8px] font-black uppercase px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_#000]">
            <bonusBadge.icon size={10} strokeWidth={3.5} className="text-yellow-400" />
            <span>{bonusBadge.label}</span>
          </div>
        )}

        {/* Premium cost medallion — black plate + rarity-accent star */}
        <div className="absolute bottom-3 right-3 flex items-stretch border-2 border-black shadow-[3px_3px_0_#000] z-20"
          style={{ filter: claimed ? "grayscale(100%)" : "none", borderRadius: 0 }}>
          <div className="flex items-center justify-center px-1.5" style={{ background: rmeta.accent }}>
            <Star size={12} strokeWidth={2.5} className="fill-current" style={{ color: isElite ? "#000" : "#fff" }} />
          </div>
          <div className="bg-black text-white px-2.5 py-1 flex flex-col items-center leading-none">
            <span className="text-[7px] font-black uppercase tracking-wider text-zinc-400">{kh ? "តម្លៃ" : "COST"}</span>
            <span className="text-base font-mono font-black tabular-nums" style={{ color: "#facc15" }}>{item.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="flex flex-col gap-3.5 px-3.5 py-4 flex-1 z-10">

        {/* Name and Khmer translation (ENLARGED TYPOGRAPHY) */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="font-black text-xl text-black block leading-tight tracking-tight uppercase group-hover:text-zinc-800 transition-colors" style={kf}>
              {kh ? item.nameKh : item.name}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wide mt-1 leading-none">
              {kh ? item.name : item.nameKh}
            </span>
          </div>
          {claimCount > 0 && (
            <div className="flex items-center gap-1 self-start bg-yellow-100 text-yellow-800 border border-yellow-200 text-[8px] font-black px-1.5 py-0.5 shadow-[1.5px_1.5px_0_#ca8a04] whitespace-nowrap">
              <Check size={8} strokeWidth={4} />
              <span>
                {kh
                  ? `ប្តូរ៖ ${claimCount} ដង`
                  : `Claimed: ${claimCount}x`}
              </span>
            </div>
          )}
        </div>

        {/* Scarcity indicator */}
        {scarcity !== null && !claimed && (
          <div className="flex items-center gap-1.5 self-start bg-red-100 text-red-600 border border-red-200 text-[8px] font-black px-1.5 py-0.5 shadow-[1.5px_1.5px_0_#ef4444] animate-pulse">
            <Info size={8} strokeWidth={3.5} />
            <span>{kh ? `នៅសល់ ${scarcity} ទៀត!` : `Only ${scarcity} left!`}</span>
          </div>
        )}

        {/* Social Claim numbers */}
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[7px] font-black text-white transition-transform duration-200 group-hover:scale-110"
                style={{ background: ["#f97316", "#3b82f6", "#a855f7"][i], zIndex: 3 - i }} >
                {["A", "B", "C"][i]}
              </div>
            ))}
          </div>
          <span className="text-[9px] text-zinc-400 font-bold leading-none">
            {kh ? `${socialCount} នាក់ធ្លាប់យក` : `${socialCount} claimed`}
          </span>
        </div>

        {/* Progress Bar (Endowment & Goal Gradient loop) */}
        {!claimed && (
          <div className="mt-1 border-t-2 border-dashed border-zinc-100 pt-2.5">
            <div className="flex justify-between items-center mb-1 font-mono text-[9px] font-black">
              <span className="text-zinc-500">
                {userPoints.toLocaleString()} / {item.cost.toLocaleString()} PTS
              </span>
              <span style={{ color: isReady ? "#22c55e" : isAlmostThere ? "#f59e0b" : "#000000" }}>
                {pct}%
              </span>
            </div>

            {/* Brutalist Flat Progress Bar with Animated Shimmer */}
            <div className="relative h-3 bg-zinc-100 border-2 border-black overflow-hidden" style={{ borderRadius: 0 }}>
              <div
                className="h-full transition-all duration-500 relative"
                style={{
                  width: `${pct}%`,
                  background: isReady ? BRAND.green : isAlmostThere ? BRAND.yellow : item.color,
                  borderRight: pct > 0 ? "2px solid #000" : "none"
                }}
              >
                {/* Active scan-line shimmer animation */}
                {isReady && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmerProgress_1.5s_linear_infinite]"
                    style={{ backgroundSize: "200% 100%" }}
                  />
                )}
              </div>
            </div>

            {/* Zeigarnik Effect micro-copy */}
            {isAlmostThere && (
              <p className="text-[9px] font-black mt-1 text-center" style={{ color: BRAND.yellowDark, ...kf }}>
                {kh ? `ខ្វះតែ ${pointsNeeded.toLocaleString()} ពិន្ទុទៀត!` : `Need ${pointsNeeded.toLocaleString()} more pts!`}
              </p>
            )}
            {isReady && (
              <p className="text-[9px] font-black mt-1 text-center" style={{ color: BRAND.green, ...kf }}>
                {kh ? "រួចរាល់សម្រាប់ទទួល!" : "Ready to claim now!"}
              </p>
            )}
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-auto pt-1">
          {claimed ? (
            <div className="w-full py-2.5 font-black text-[10px] text-center border-2 border-zinc-400 text-zinc-400 bg-zinc-100 leading-none flex flex-col items-center justify-center gap-1" style={kf}>
              <div className="flex items-center gap-1 justify-center">
                <Check size={11} strokeWidth={3.5} />
                <span>{kh ? "បានទទួលរួចហើយ" : "CLAIMED"}</span>
              </div>
              <span className="text-[7.5px] text-zinc-400 uppercase font-mono mt-0.5 tracking-tighter">
                {kh
                  ? `ប្តូរបានម្តងទៀតក្នុង៖ ${daysRemaining} ថ្ងៃ`
                  : `Next claim in: ${daysRemaining}d`}
              </span>
            </div>
          ) : !isLoggedIn ? (
            <a href="/login"
              className="w-full py-3 font-black text-xs text-center border-3 border-black flex items-center justify-center gap-1.5 uppercase tracking-wider leading-none transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "#000", color: "#facc15", boxShadow: `4px 4px 0 ${rmeta.accent}`, ...kf }}>
              <Lock size={12} strokeWidth={3} />
              {kh ? "ចូលគណនីដើម្បីទទួល" : "LOG IN TO CLAIM"}
            </a>
          ) : canClaim ? (
            <button
              onClick={handleClaim}
              className="w-full py-3.5 font-black text-sm border-3 border-black relative overflow-hidden flex items-center justify-center gap-2 cursor-pointer leading-none uppercase tracking-wider transition-all hover:-translate-y-1 hover:brightness-105 active:translate-y-0 active:shadow-[2px_2px_0_#000]"
              style={{
                background: item.color,
                color: BRAND.black,
                boxShadow: `5px 5px 0 #000, 0 0 22px ${rmeta.glow}`,
                animation: "buttonPulse 2.5s ease-in-out infinite",
                "--pulse-color": rmeta.glow,
                ...kf,
              } as any}
            >
              <Gift size={15} strokeWidth={3} className="animate-bounce" />
              <span>{kh ? "ទទួលឥឡូវនេះ!" : "CLAIM NOW"}</span>
            </button>
          ) : (
            <button disabled
              className="w-full py-3 font-black text-xs border-3 border-black bg-white text-black cursor-not-allowed leading-none flex items-center justify-center gap-1.5 uppercase tracking-wider"
              style={{ boxShadow: `3px 3px 0 ${rmeta.accent}`, ...kf }}>
              <Lock size={12} strokeWidth={3} className="text-zinc-500" />
              <span>{kh ? `ខ្វះ ${pointsNeeded.toLocaleString()} ពិន្ទុ` : `${pointsNeeded.toLocaleString()} PTS TO UNLOCK`}</span>
            </button>
          )}
        </div>

        {/* Dynamic Cooldown Tier Hint (Psychology of Reward & Progress) */}
        <div className="text-center mt-2 border-t border-zinc-100 pt-2 pointer-events-none">
          {userRank.id === "rookie" || userRank.id === "debut" ? (
            <span className="text-[8.5px] text-zinc-400 font-bold block leading-normal" style={kf}>
              {kh ? "💡 ឡើងថ្នាក់មាសដើម្បីទទួលបានការប្តូររង្វាន់ឡើងវិញ (១ឆ្នាំ ៦ខែ)!" : "💡 Level up to Gold to claim items (1 year 6 months reset)!"}
            </span>
          ) : userRank.id === "gold" ? (
            <span className="text-[8.5px] text-yellow-600 font-extrabold block leading-normal animate-pulse" style={kf}>
              {kh ? "⚡ ថ្នាក់មាស៖ រង្វាន់ប្តូរឡើងវិញក្នុងរយៈពេល ១ឆ្នាំ ៦ខែ!" : "⚡ Gold Tier: Claims reset in 1 year 6 months!"}
            </span>
          ) : userRank.id === "platinum" ? (
            <span className="text-[8.5px] text-sky-600 font-extrabold block leading-normal animate-pulse" style={kf}>
              {kh ? "⚡ ថ្នាក់ប្លាទីន៖ រង្វាន់ប្តូរឡើងវិញក្នុងរយៈពេល ២ឆ្នាំ!" : "⚡ Platinum Tier: Claims reset in 2 years!"}
            </span>
          ) : userRank.id === "diamond" ? (
            <span className="text-[8.5px] text-cyan-600 font-extrabold block leading-normal animate-pulse" style={kf}>
              {kh ? "⚡ ថ្នាក់ពេជ្រ៖ រង្វាន់ប្តូរឡើងវិញក្នុងរយៈពេល ២ឆ្នាំ ៦ខែ!" : "⚡ Diamond Tier: Claims reset in 2 years 6 months!"}
            </span>
          ) : (
            <span className="text-[8.5px] text-pink-600 font-extrabold block leading-normal animate-pulse" style={kf}>
              {kh ? "⚡ ថ្នាក់ព្រះ៖ រង្វាន់ប្តូរឡើងវិញក្នុងរយៈពេល ៣ឆ្នាំ!" : "⚡ Mythic Tier: Claims reset in 3 years!"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [prevRanks, setPrevRanks] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [soloLimits, setSoloLimits] = useState<any>(null);
  const router = useRouter();
  const handleSelectUser = (user: LeaderboardUser) => {
    // Private usernames are anonymized to `student_<id>` and have no public
    // profile — don't navigate (would 404 on /u/student_<id>).
    if (user.isUsernamePublic === false) return;
    router.push(`/u/${user.username}`);
  };

  // Real-time tracking user points state
  const [userPoints, setUserPoints] = useState(0);
  const [claimMsg, setClaimMsg] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);

  // Leaderboard filters: time window, province, game type, score source
  const [windowTab, setWindowTab] = useState<"weekly" | "monthly" | "all">("all");
  const [province, setProvince] = useState("all");
  const [gameType, setGameType] = useState("all");
  const [sourceTab, setSourceTab] = useState("all");

  const fetchLeaderboard = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50", window: windowTab });
      if (province !== "all") params.set("province", province);
      // Game-type filter now works for all windows including all-time
      if (gameType !== "all") params.set("gameType", gameType);
      // Source filter: live, solo, daily, or all
      if (sourceTab !== "all") params.set("source", sourceTab);
      const res = await fetch(`/api/leaderboard?${params.toString()}`);
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
  }, [windowTab, province, gameType, sourceTab]);

  useEffect(() => {
    fetchLeaderboard();
    const iv = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(iv);
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && !d.error) {
          if (d.role === "student" && (!d.schoolName || !d.province || !d.gradeLevel)) {
            router.push("/profile/student");
            return;
          }
          const lifetimePoints = d.lifetimePoints ?? 0;
          const livePoints = d.livePoints ?? 0;

          // Sync database claims to local storage for backward compatibility & seamless updates
          if (d.claimedRewards && typeof window !== "undefined") {
            try {
              const dbClaims = JSON.parse(d.claimedRewards) as Array<{ id: number; claimedAt: number }>;
              dbClaims.forEach(claim => {
                const claimDataKey = `kwd_claim_data_${claim.id}`;
                const localSaved = localStorage.getItem(claimDataKey);
                let currentCount = 1;
                if (localSaved) {
                  try {
                    currentCount = Math.max(1, JSON.parse(localSaved).claimCount ?? 1);
                  } catch { }
                }
                localStorage.setItem(claimDataKey, JSON.stringify({
                  claimCount: currentCount,
                  lastClaimedAt: claim.claimedAt
                }));
                localStorage.setItem(`kwd_claimed_${claim.id}`, "1");
              });
            } catch (err) {
              console.error("Failed to sync database claims to localStorage:", err);
            }
          }

          // Local storage subtraction deduction logic based on claim counts
          let activePoints = livePoints;
          REWARD_ITEMS.forEach(item => {
            if (typeof window !== "undefined") {
              const claimDataStr = localStorage.getItem(`kwd_claim_data_${item.id}`);
              if (claimDataStr) {
                try {
                  const data = JSON.parse(claimDataStr);
                  const count = data.claimCount ?? 0;
                  activePoints -= item.cost * count;
                } catch {
                  if (localStorage.getItem(`kwd_claimed_${item.id}`) === "1") {
                    activePoints -= item.cost;
                  }
                }
              } else if (localStorage.getItem(`kwd_claimed_${item.id}`) === "1") {
                activePoints -= item.cost;
              }
            }
          });
          setCurrentUser(d);
          setUserPoints(Math.max(0, activePoints));

          // Fetch limits status for play limit widget
          fetch("/api/game/solo/limits")
            .then(r => r.ok ? r.json() : null)
            .then(lim => {
              if (lim) {
                if (lim.tier === "guest") {
                  // Count guest plays today from localStorage
                  const guestPlays = (() => {
                    if (typeof window === "undefined") return 0;
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const countStr = localStorage.getItem(`kwd_solo_plays_${todayStr}`);
                    return countStr ? parseInt(countStr, 10) : 0;
                  })();
                  lim.playsToday = guestPlays;
                  lim.remaining = Math.max(0, lim.playsAllowed - guestPlays);
                  lim.isLimitReached = guestPlays >= lim.playsAllowed;
                }
                setSoloLimits(lim);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => { });
  }, [router]);

  // Countdown ticker
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 60), 1000);
    return () => clearInterval(t);
  }, []);

  const top3 = leaderboard.slice(0, 3);

  // Points, rewards, and tier progression are student-only features.
  // Teachers, admins, and staff host/manage but do not earn points.
  const isStudent = currentUser?.role === "student";

  // Claim click handler — Database claim and Local Points deduction
  const handleClaimItem = async (item: typeof REWARD_ITEMS[number]) => {
    setUserPoints(prev => Math.max(0, prev - item.cost));

    try {
      const res = await fetch("/api/user/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activePoints !== undefined) {
          setUserPoints(data.activePoints);
        }
      }
    } catch (err) {
      console.error("Failed to persist claim to database:", err);
    }

    const msg = kh
      ? `🎁 "${item.nameKh}" ត្រូវបានផ្ញើទៅគ្រូរបស់អ្នក!`
      : `🎁 "${item.name}" claim sent to your teacher!`;
    setClaimMsg(msg);
    setTimeout(() => setClaimMsg(""), 5000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-16">

      {/* Hero */}
      <div className="relative overflow-hidden border-b-4 border-black" style={{ background: "linear-gradient(135deg,#09090b 0%,#18181b 100%)" }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />

        <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                Live Rankings
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight mt-3">LEADERBOARD</h1>
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
            {currentUser && isStudent && (
              <div className="flex flex-col sm:items-end gap-2 bg-zinc-900/60 backdrop-blur-md p-4 border border-zinc-800 shadow-xl rounded-xl">
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Total Score (Rank)</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <AnimatedNumber value={currentUser.lifetimePoints ?? 0} className="text-2xl font-black text-white tabular-nums" />
                      <TierBadge lifetimePoints={currentUser.lifetimePoints ?? 0} size="sm" lang={lang} />
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-yellow-400/80 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
                      Claimable Balance
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <AnimatedNumber value={userPoints} className="text-2xl font-black text-yellow-400 tabular-nums" />
                      <span className="text-[10px] text-yellow-400 font-bold">PTS</span>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-56 mt-1">
                  <RankProgressBar lifetimePoints={currentUser.lifetimePoints ?? 0} lang={lang} compact />
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
            {/* Podium - only show if there are ranked users */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 items-end gap-2 md:gap-6 w-full">
                {[
                  { cfg: PODIUM_CFG[0], user: top3[1] },
                  { cfg: PODIUM_CFG[1], user: top3[0] },
                  { cfg: PODIUM_CFG[2], user: top3[2] },
                ].map(({ cfg, user }, i) => (
                  <PodiumCard key={cfg.rank} user={user} cfg={cfg} index={i} currentUser={currentUser} onSelect={handleSelectUser} />
                ))}
              </div>
            )}

            {/* Rankings Table */}
            <div>
              {/* ── Source filter — icon + name chips only (no box/table) ── */}
              <div className="mb-3 flex flex-wrap gap-2">
                {SOURCE_TABS.map(s => {
                  const active = sourceTab === s.id;
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSourceTab(s.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-[10px] md:text-xs font-black uppercase tracking-wider border-2 border-black transition-all ${active ? "shadow-[2px_2px_0_#000] -translate-y-0.5" : "hover:bg-zinc-50"}`}
                      style={{ background: active ? s.color : "#fff", color: active ? "#000" : "#71717a", borderRadius: 0, ...kf }}
                    >
                      <Icon size={14} strokeWidth={3} />
                      <span>{kh ? s.kh : s.en}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Window + province + game type ── */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="flex items-stretch border-2 border-black flex-shrink-0" style={{ borderRadius: 0 }}>
                  {WINDOW_TABS.map((w, i) => {
                    const active = windowTab === w.id;
                    return (
                      <button
                        key={w.id}
                        onClick={() => setWindowTab(w.id)}
                        className={`px-3 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors ${i > 0 ? "border-l-2 border-black" : ""} ${active ? "bg-black text-yellow-400" : "bg-white text-black hover:bg-zinc-100"}`}
                        style={kf}
                      >
                        {kh ? w.kh : w.en}
                      </button>
                    );
                  })}
                </div>

                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="border-2 border-black bg-white px-2.5 py-1.5 text-[11px] md:text-xs font-bold text-black focus:outline-none focus:bg-yellow-50"
                  style={{ borderRadius: 0, ...kf }}
                >
                  <option value="all">{kh ? "ខេត្ត/ក្រុងទាំងអស់" : "All Provinces"}</option>
                  {CAMBODIA_PROVINCES.map(p => (
                    <option key={p.en} value={p.en}>{kh ? p.kh : p.en}</option>
                  ))}
                </select>

                <select
                  value={gameType}
                  onChange={e => setGameType(e.target.value)}
                  className="border-2 border-black bg-white px-2.5 py-1.5 text-[11px] md:text-xs font-bold text-black focus:outline-none focus:bg-yellow-50"
                  style={{ borderRadius: 0, ...kf }}
                >
                  {GAME_TYPES.map(g => (
                    <option key={g.id} value={g.id}>{kh ? g.kh : g.en}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-base md:text-lg font-black text-black tracking-tight uppercase flex items-center gap-2" style={kf}>
                  <Trophy size={18} strokeWidth={2.5} className="text-yellow-500" />
                  {kh ? "ចំណាត់ថ្នាក់" : "Rankings"}
                  <span
                    className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border-2 border-black"
                    style={{ background: SOURCE_TABS.find(s => s.id === sourceTab)?.color ?? "#eab308", color: "#000" }}
                  >
                    {kh ? SOURCE_TABS.find(s => s.id === sourceTab)?.kh : SOURCE_TABS.find(s => s.id === sourceTab)?.en}
                  </span>
                </h2>
                {lastUpdated && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {kh ? "ធ្វើបច្ចុប្បន្នភាព" : "UPDATED"} {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                )}
              </div>

              <div className="bg-white border-3 border-black overflow-hidden" style={{ boxShadow: "4px 4px 0 #000", borderRadius: 0 }}>
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-black px-3 md:px-5 py-2.5 text-[9px] md:text-[10px] font-black tracking-widest text-yellow-400 uppercase">
                  <span className="col-span-1">#</span>
                  <span className="col-span-7 sm:col-span-6">{kh ? "សិស្ស" : "Student"}</span>
                  <span className="col-span-2 text-center hidden sm:block">{kh ? "ហ្គេម" : "Games"}</span>
                  <span className="col-span-4 sm:col-span-3 text-right">{kh ? "ពិន្ទុ" : "Points"}</span>
                </div>

                {leaderboard.length > 0 ? leaderboard.map((user) => {
                  const prev = prevRanks[user.id];
                  const moved = prev !== undefined ? prev - user.rank : 0;
                  const tier = getRank(user.lifetimePoints);
                  // Anonymized (private-username) rows have no public profile.
                  const linkable = user.isUsernamePublic !== false;
                  const isMe = !!currentUser && user.id === currentUser.id;
                  const medal = user.rank === 1 ? "#eab308" : user.rank === 2 ? "#94a3b8" : user.rank === 3 ? "#cd7c3a" : null;
                  const rowAvatar = isMe ? currentUser.avatar : user.avatar;
                  return (
                    <div
                      key={user.id}
                      className={`grid grid-cols-12 items-center px-3 md:px-5 py-2.5 border-t-2 border-black transition-colors ${isMe ? "bg-yellow-50" : "hover:bg-zinc-50"} ${linkable ? "cursor-pointer" : "cursor-default"}`}
                      style={medal ? { boxShadow: `inset 4px 0 0 ${medal}` } : undefined}
                      onClick={linkable ? () => handleSelectUser(user) : undefined}
                    >
                      {/* Rank + movement */}
                      <div className="col-span-1 flex items-center gap-1">
                        {medal ? (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-black font-black text-[11px] tabular-nums flex-shrink-0"
                            style={{ background: medal, color: user.rank === 1 ? "#000" : "#fff" }}
                          >
                            {user.rank}
                          </span>
                        ) : (
                          <span className="text-sm font-black text-zinc-400 tabular-nums">{user.rank}</span>
                        )}
                        {moved > 0 && <ChevronUp size={12} strokeWidth={4} className="text-green-500" />}
                        {moved < 0 && <ChevronDown size={12} strokeWidth={4} className="text-red-500" />}
                      </div>

                      {/* Avatar + name + meta */}
                      <div className="col-span-7 sm:col-span-6 flex items-center gap-2.5 min-w-0">
                        <Avatar url={rowAvatar} name={user.displayName || user.username} size={36} ring={medal ?? tier.accent} changedAt={user.avatarChangedAt} />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-black text-xs md:text-sm truncate leading-tight font-kh-header">
                              {user.displayName || user.username}
                            </span>
                            {isMe && (
                              <span className="text-[8px] font-black uppercase px-1 py-0.5 border border-black bg-yellow-400 text-black flex-shrink-0">
                                {kh ? "អ្នក" : "You"}
                              </span>
                            )}
                          </div>
                          {/* Full name above, @username below — always shown */}
                          <span className="text-[10px] text-zinc-400 font-mono truncate leading-tight">@{user.username}</span>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <TierBadge lifetimePoints={user.lifetimePoints} size="xs" lang={lang} />
                            {user.province && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.5">
                                <MapPin size={8} />{kh ? getProvinceKh(user.province) : user.province}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Games */}
                      <span className="col-span-2 text-center text-xs font-bold text-zinc-500 tabular-nums hidden sm:block">
                        {user.totalGamesPlayed}
                      </span>

                      {/* Points */}
                      <div className="col-span-4 sm:col-span-3 text-right">
                        <span className="font-black tabular-nums text-sm md:text-base text-black">{user.lifetimePoints.toLocaleString()}</span>
                        <span className="block text-[8px] text-zinc-400 font-bold uppercase tracking-wider leading-none">pts</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="px-6 py-10 text-center text-zinc-400 text-sm border-t-2 border-black" style={kf}>
                    {kh
                      ? "មិនទាន់មានចំណាត់ថ្នាក់ទេ។ លេងសកម្មភាព ឬចូលរួមថ្នាក់ផ្ទាល់ ដើម្បីបង្ហាញនៅទីនេះ។"
                      : "No rankings yet. Play games or join a live class to appear here."}
                  </div>
                )}
              </div>
              <p className="text-center text-[9px] text-zinc-400 mt-2 font-mono uppercase" style={kf}>
                {kh
                  ? "ហ្គេមផ្ទាល់ + ហ្វឹកហាត់ + បញ្ហាប្រចាំថ្ងៃ = ពិន្ទុ · ចំណាត់ថ្នាក់ផ្លាស់ប្ដូរបន្តផ្ទាល់ · ភ្ញៀវមិនកត់ត្រា"
                  : "Live + Solo + Daily all count · Ranks update in real-time · Guest plays not recorded"}
              </p>

            </div>

            {/* Rank Tier Showcase */}
            {currentUser && isStudent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="bg-white border-3 border-black p-5" style={{ boxShadow: "4px 4px 0 #000", borderRadius: 0 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-black text-yellow-400 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 mb-1.5 shadow-[2px_2px_0_#000]">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        {kh ? "ថ្នាក់របស់អ្នក" : "Your Rank"}
                      </div>
                      <p className="text-xs text-zinc-500" style={kf}>
                        Earn points → Level up → Unlock exclusive labels
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TierBadge lifetimePoints={currentUser.lifetimePoints ?? 0} size="md" lang={lang} />
                    </div>
                  </div>
                  <RankProgressBar lifetimePoints={currentUser.lifetimePoints ?? 0} lang={lang} />
                  <div className="mt-4">
                    <RankShowcase lifetimePoints={currentUser.lifetimePoints ?? 0} lang={lang} />
                  </div>
                </div>

                {/* Play Limits Showcase Card */}
                {soloLimits && (
                  <div className="border-3 border-black p-5 flex flex-col justify-between"
                    style={{
                      boxShadow: "4px 4px 0 #000",
                      borderRadius: 0,
                      background: soloLimits.isLimitReached ? "#fef2f2" : "#f0fdf4"
                    }}>
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-black text-[9px] font-black tracking-widest uppercase px-2.5 py-1 mb-1.5 shadow-[2px_2px_0_#000]"
                        style={{ color: soloLimits.isLimitReached ? BRAND.red : BRAND.green }}>
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                        {kh ? "កម្រិតលេងថ្ងៃនេះ" : "Daily Play Limit"}
                      </div>
                      <h3 className="text-lg font-black text-black leading-none mt-2" style={kf}>
                        {kh
                          ? `បានលេង៖ ${soloLimits.playsToday} / ${soloLimits.playsAllowed} ហ្គេម`
                          : `Plays Today: ${soloLimits.playsToday} / ${soloLimits.playsAllowed} games`}
                      </h3>
                      {soloLimits.upgradeMessage && (
                        <p className="text-xs text-zinc-600 font-bold mt-2 leading-relaxed" style={kf}>
                          {kh ? soloLimits.upgradeMessage.kh : soloLimits.upgradeMessage.en}
                        </p>
                      )}
                    </div>
                    <div>
                      {/* Progress bar */}
                      <div className="h-3 bg-white border-2 border-black overflow-hidden relative mt-4">
                        <div className="h-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (soloLimits.playsToday / soloLimits.playsAllowed) * 100)}%`,
                            background: soloLimits.isLimitReached ? BRAND.red : BRAND.green,
                          }} />
                      </div>
                      <div className="mt-4 flex justify-end">
                        {soloLimits.tier === "student" && (
                          <Link href="/profile/student" className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0_#000] hover:translate-y-[-1px] transition-transform" style={kf}>
                            {kh ? "ចូលរួមថ្នាក់គ្រូ →" : "JOIN TEACHER'S CLASS"}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Rewards Section (Psychology-driven redesign) ── */}
            <div>
                {/* Rewards Store Header — simplified, lighter weight */}
                <div className="relative overflow-hidden border-2 border-black mb-6"
                  style={{
                    background: "#18181b",
                    borderRadius: 0,
                  }}>
                  <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "16px 16px" }} />

                  <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-5 z-10">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-yellow-400 text-[10px] font-bold tracking-widest uppercase mb-2">
                        <Gift size={12} strokeWidth={2.5} />
                        <span>{kh ? "រង្វាន់" : "Rewards Store"}</span>
                      </div>
                      <h2 className="text-lg md:text-2xl font-bold text-white leading-tight" style={kf}>
                        {kh ? "ទទួលបានរង្វាន់ដោយពិន្ទុ" : "Claim with Points"}
                      </h2>
                    </div>

                    {/* Points Balance Card */}
                    {currentUser ? (
                      <div className="flex flex-col items-end gap-0.5 bg-white/5 border border-white/15 px-5 py-3 self-start sm:self-auto">
                        <span className="text-white/45 text-[9px] font-semibold uppercase tracking-widest leading-none" style={kf}>
                          {kh ? "ពិន្ទុផ្ទាល់ខ្លួន (ហ្គេមផ្ទាល់ប៉ុណ្ណោះ)" : "Claimable Balance (Live Only)"}
                        </span>
                        <div className="flex items-end gap-1.5 mt-1.5">
                          <AnimatedNumber value={userPoints} className="text-2xl font-bold text-yellow-400 tabular-nums leading-none font-mono" />
                          <span className="text-yellow-400/70 text-xs font-semibold leading-none mb-0.5">PTS</span>
                        </div>
                        <span className="text-[8px] text-zinc-400 font-bold block mt-1" style={kf}>
                          {kh ? "* មិនរួមបញ្ចូលពិន្ទុ Solo ទេ" : "* Solo practice points excluded"}
                        </span>
                      </div>
                    ) : (
                      <a href="/login"
                        className="inline-flex items-center gap-2 bg-yellow-400 text-black font-bold text-xs px-4 py-2.5 border-2 border-black self-start"
                        style={kf}>
                        <Lock size={12} strokeWidth={2.5} />
                        {kh ? "ចូលគណនីដើម្បីទទួល" : "Log in to claim"}
                      </a>
                    )}
                  </div>
                </div>

                {/* Claim Success Alerts */}
                {claimMsg && (
                  <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-none bg-green-500 text-white font-black text-xs border-3 border-black shadow-[3px_3px_0_#000]" style={kf}>
                    <Check size={16} strokeWidth={3.5} className="bg-white text-green-500 rounded-full p-0.5" />
                    <span>{claimMsg}</span>
                  </div>
                )}

                {/* Responsive Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {REWARD_ITEMS.map((item, idx) => (
                    <RewardCard
                      key={item.id}
                      item={item}
                      userPoints={userPoints}
                      isLoggedIn={!!currentUser}
                      lang={lang}
                      onClaim={handleClaimItem}
                      userLifetimePoints={currentUser?.lifetimePoints ?? 0}
                    />
                  ))}
                </div>

                {/* How it works + delivery note */}
                <div className="mt-6 flex flex-col items-center gap-2 text-center">
                  <p className="text-[11px] text-zinc-500 font-medium" style={kf}>
                    {kh
                      ? "លេងហ្គេម ➔ ប្រមូលពិន្ទុ ➔ ទទួលបានរង្វាន់ពិតៗ"
                      : "Play games ➔ Earn points ➔ Get real prizes"}
                  </p>
                  <p className="text-[10px] text-zinc-400" style={kf}>
                    {kh
                      ? "ពិន្ទុអាចប្រើដើម្បីប្តូររង្វាន់ · រង្វាន់ត្រូវបានប្រគល់ដោយគ្រូ · ទទួលបានតែម្តងក្នុងមួយធាតុ"
                      : "Points are redeemable for rewards · Prizes delivered by your teacher · One claim per item"}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] font-black text-red-600" style={kf}>
                        {kh ? "ហ្គេមផ្ទាល់: ១៥–៤០ ពិន្ទុ/ម្ដង" : "Live game: 15–40 pts/session"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <span className="text-[9px] font-black text-yellow-700" style={kf}>
                        {kh ? "ហ្វឹកហាត់: ៥–១៥ ពិន្ទុ/ម្ដង" : "Solo practice: 5–15 pts/session"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-[9px] font-black text-cyan-700" style={kf}>
                        {kh ? "បញ្ហាថ្ងៃ: ៥–១០ ពិន្ទុ/ថ្ងៃ" : "Daily challenge: 5–10 pts/day"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-400 font-mono uppercase mt-1" style={kf}>
                    {kh
                      ? "⚡ រង្វាន់ => ១–២ ខែ–មួយឆ្នាំ ត្រូវការ · ត្រូវការការខិតខំប្រឹងប្រែង"
                      : "⚡ Rewards require weeks to a full school term of consistent play"}
                  </p>
                </div>
              </div>
          </>
        )}
      </div>

    </div>
  );
}
