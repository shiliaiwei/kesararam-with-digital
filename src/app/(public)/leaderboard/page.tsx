"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { useLang } from "@/context/lang-context";
import { RankBadge as TierBadge, RankedAvatarRing, RankProgressBar, RankShowcase } from "@/components/shared/rank-label";
import { CautionTape } from "@/components/brand/brand-kit";
import { getRank, canClaimRewards, CLAIM_MIN_POINTS } from "@/lib/rank-utils";
import { getAvatarFaceStyle } from "@/lib/utils";
import { REWARD_ITEMS, getRewardRarity, RARITY_META, calculateDynamicCost } from "@/lib/rewards";
import { GAME_FILTER_ORDER, getGameMeta } from "@/lib/gamekit/game-catalog";
import { GameBadge } from "@/components/gamekit/GameBadge";
import { ScorePlate } from "@/components/shared/score-plate";
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
  MapPin,
  GraduationCap,
  Zap,
  ChevronUp,
  ChevronDown,
  Gamepad2,
  ArrowUp,
  ArrowUpDown,
  X,
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

// Game identity (icon + color + label) is resolved from the shared GAME_CATALOG —
// the single source of truth, so the leaderboard filter, the "Top game" cell, and
// the play hub all show the exact same iconic badge. (`getGameMeta` is imported.)

function getProvinceKh(provinceEn: string | null | undefined): string {
  if (!provinceEn || provinceEn.toLowerCase() === "cambodia") return "កម្ពុជា";
  const found = CAMBODIA_PROVINCES.find(p => p.en.toLowerCase() === provinceEn.toLowerCase());
  return found ? found.kh : provinceEn;
}



// ── Leaderboard game-type filter ──────────────────────────────────────────────
// Time-window + source controls were removed (2026-06-20): the board is always
// all-time, all-sources. The game-mode filter is the only scope control now.

// Sort options for the rankings table (client-side re-sort of the loaded page).
// "Road Points" is a product term — never translated to Khmer (brand rule).
const SORT_TABS: { id: "rank" | "live" | "games" | "acc"; en: string; kh: string }[] = [
  { id: "rank",  en: "Rank",       kh: "ចំណាត់ថ្នាក់" },
  { id: "live",  en: "Road Points", kh: "Road Points" },
  { id: "games", en: "Games",      kh: "ហ្គេម" },
  { id: "acc",   en: "Accuracy",   kh: "ត្រឹមត្រូវ" },
];

// Game filter chips — derived from the shared GAME_CATALOG so every chip carries
// the game's iconic badge (GameBadge). "all" leads; then every active game in
// catalog order. Doubles as the game-type filter (chip id === DB gameType).
const GAME_CHIPS: { id: string; en: string; kh: string }[] = [
  { id: "all", en: "All Games", kh: "ហ្គេមទាំងអស់" },
  ...GAME_FILTER_ORDER.map((g) => ({ id: g.id, en: g.en, kh: g.kh })),
];

interface LeaderboardUser {
  id: number;
  username: string;
  isUsernamePublic?: boolean;
  displayName: string | null;
  avatar: string | null;
  avatarChangedAt: string | null;
  scorePlateStyle: string;
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  priorityPoints?: number;
  soloPoints?: number;
  accuracy?: number;
  bestGame?: string | null;
  schoolName?: string | null;
  province?: string | null;
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
  if (!changedAt) return base;
  return `${base}${base.includes("?") ? "&" : "?"}v=${new Date(changedAt).getTime()}`;
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
        <div className="w-full h-full rounded-full overflow-hidden relative flex-shrink-0" style={{ background: "#ffffff", border: "2px solid #000" }}>
          <div style={{ position: "absolute", inset: "6%", width: "88%", height: "88%" }}>
            {parsed.head && (
              <img
                src={`/avatar/head/${encodeURIComponent(parsed.head)}`}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
            {parsed.face && (
              <img
                src={`/avatar/face/${encodeURIComponent(parsed.face)}`}
                alt=""
                aria-hidden
                style={getAvatarFaceStyle(parsed.head)}
              />
            )}
          </div>
        </div>
      ) : (
        (() => {
          const src = avatarSrc(url, changedAt);
          if (src && !err) {
            return (
              <img
                src={src}
                alt={name}
                onError={() => setErr(true)}
                className="absolute inset-0 w-full h-full object-cover rounded-full"
                style={{ border: "2px solid #000", background: "#ffffff" }}
              />
            );
          }
          return (
            <div
              className="w-full h-full rounded-full flex items-center justify-center font-black"
              style={{
                background: "#ffffff",
                color: "#000000",
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
    gsap.to(obj, { val: value, duration: 0.8, ease: "power2.out", onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(obj.val).toString(); } });
    prev.current = value;
  }, [value]);
  return <span ref={ref} className={className} style={style}>{value.toString()}</span>;
}

// ── Rank badge SVG ────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: 1 | 2 | 3 }) {
  const c = { 1: { fill: "#eab308", stroke: "#ca8a04", text: "#000", label: "1ST" }, 2: { fill: "#94a3b8", stroke: "#64748b", text: "#fff", label: "2ND" }, 3: { fill: "#cd7c3a", stroke: "#92400e", text: "#fff", label: "3RD" } }[rank];
  return (
    <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
      <polygon points="26,2 48,14 48,38 26,50 4,38 4,14" fill={c.fill} stroke="#000" strokeWidth="3" />
      <polygon points="26,5 45,16 45,22 26,11" fill="rgba(255,255,255,0.25)" />
      <text x="26" y="32" textAnchor="middle" fontSize="13" fontWeight="900" fill={c.text} fontFamily="KWD Roboto">{c.label}</text>
    </svg>
  );
}

// ── Podium card ───────────────────────────────────────────────────────────────

const PODIUM_CFG = [
  {
    rank: 2 as const,
    labelEn: "Strong Challenger",
    labelKh: "អ្នកប្រកួតខ្លាំង",
    accentColor: "#94a3b8",
    surfaceColor: "#f8fafc",
    patternColor: "#cbd5e1",
    pedestalBg: "repeating-linear-gradient(-45deg,#f8fafc 0 10px,#cbd5e1 10px 20px)",
    pedestalHeight: "h-16 md:h-24",
    order: "order-1",
  },
  {
    rank: 1 as const,
    labelEn: "Road Safety Champion",
    labelKh: "ជើងឯកសុវត្ថិភាពចរាចរណ៍",
    accentColor: "#eab308",
    surfaceColor: "#fffbeb",
    patternColor: "#facc15",
    pedestalBg: "repeating-linear-gradient(-45deg,#fef08a 0 10px,#facc15 10px 20px)",
    pedestalHeight: "h-20 md:h-32",
    order: "order-2",
  },
  {
    rank: 3 as const,
    labelEn: "Rising Star",
    labelKh: "តារាកំពុងរះ",
    accentColor: "#cd7c3a",
    surfaceColor: "#fff7ed",
    patternColor: "#fed7aa",
    pedestalBg: "repeating-linear-gradient(-45deg,#fff7ed 0 10px,#fed7aa 10px 20px)",
    pedestalHeight: "h-14 md:h-20",
    order: "order-3",
  },
];

// Keyframes shared by all three podium celebrations. Each effect centers on the
// avatar (the parent point is at its center) and radiates outward from behind it.
const PODIUM_CELEBRATION_KEYFRAMES = `
@keyframes lbBurst{0%{transform:translate(-50%,-50%) scale(.2) rotate(0deg);opacity:0}20%{opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.05) rotate(95deg);opacity:0}}
.lb-burst{left:50%;top:50%;animation:lbBurst 1.4s cubic-bezier(.16,.85,.3,1.2) forwards}
@keyframes lbRing{0%{transform:translate(-50%,-50%) scale(.3);opacity:.9}100%{transform:translate(-50%,-50%) scale(1.9);opacity:0}}
.lb-ring{left:50%;top:50%;border-radius:9999px;animation:lbRing 1.4s ease-out forwards}
@keyframes lbRise{0%{transform:translate(calc(-50% + var(--x)),-50%) translateY(16px) scale(.3);opacity:0}25%{opacity:1}100%{transform:translate(calc(-50% + var(--x)),-50%) translateY(-58px) scale(1) rotate(18deg);opacity:0}}
.lb-rise{left:50%;top:50%;animation:lbRise 1.6s ease-out forwards}
@keyframes lbPop{0%{transform:translate(-50%,-50%) scale(0);opacity:0}30%{opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.7) rotate(40deg);opacity:0}}
.lb-pop{left:50%;top:50%;animation:lbPop 1.25s ease-out forwards}

@keyframes scrollBg {
  from { background-position: 0 0; }
  to { background-position: 24px 24px; }
}
.animate-scroll-bg {
  animation: scrollBg 12s linear infinite;
}

@keyframes scrollPedestal {
  from { background-position: 0 0; }
  to { background-position: 28px 0; }
}
.animate-pedestal {
  animation: scrollPedestal 6s linear infinite;
}

@keyframes podiumShimmer {
  0% { transform: translateX(-150%) skewX(-20deg); }
  35%, 100% { transform: translateX(180%) skewX(-20deg); }
}
.animate-shimmer {
  animation: podiumShimmer 4s infinite linear;
}
`;

/**
 * Distinct celebration per podium rank, all radiating from behind the avatar:
 *   1st — golden star burst + expanding gold halo (grandest).
 *   2nd — silver sparkles drifting upward.
 *   3rd — bronze star pop + bronze halo (subtlest).
 */
function renderPodiumCelebration(rank: number, isFirst: boolean, isMobile: boolean) {
  if (rank === 1) {
    const d = isFirst ? (isMobile ? 38 : 58) : (isMobile ? 32 : 50);
    return (
      <>
        <style>{PODIUM_CELEBRATION_KEYFRAMES}</style>
        <span className="lb-ring absolute" style={{ width: isFirst ? (isMobile ? 70 : 104) : (isMobile ? 58 : 88), height: isFirst ? (isMobile ? 70 : 104) : (isMobile ? 58 : 88), border: "3px solid #eab308" }} />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <Star key={i} size={isFirst ? (isMobile ? 11 : 16) : (isMobile ? 9 : 13)} strokeWidth={1.5} className="lb-burst absolute"
              style={{ ["--dx" as string]: `${Math.cos(a) * d}px`, ["--dy" as string]: `${Math.sin(a) * d}px`, animationDelay: `${i * 0.03}s`, color: "#eab308", fill: "#facc15" } as React.CSSProperties} />
          );
        })}
      </>
    );
  }
  if (rank === 2) {
    return (
      <>
        <style>{PODIUM_CELEBRATION_KEYFRAMES}</style>
        {Array.from({ length: 7 }).map((_, i) => {
          const x = (i - 3) * (isMobile ? 9 : 13);
          return (
            <Sparkles key={i} size={isMobile ? 9 : 13} strokeWidth={1.75} className="lb-rise absolute"
              style={{ ["--x" as string]: `${x}px`, animationDelay: `${i * 0.1}s`, color: "#64748b", fill: "#cbd5e1" } as React.CSSProperties} />
          );
        })}
      </>
    );
  }
  // rank 3 — bronze pop + halo
  const d = isMobile ? 28 : 42;
  return (
    <>
      <style>{PODIUM_CELEBRATION_KEYFRAMES}</style>
      <span className="lb-ring absolute" style={{ width: isMobile ? 52 : 78, height: isMobile ? 52 : 78, border: "3px solid #cd7c3a" }} />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <Star key={i} size={isMobile ? 8 : 12} strokeWidth={1.75} className="lb-pop absolute"
            style={{ ["--dx" as string]: `${Math.cos(a) * d}px`, ["--dy" as string]: `${Math.sin(a) * d}px`, animationDelay: `${i * 0.05}s`, color: "#cd7c3a", fill: "#cd7c3a" } as React.CSSProperties} />
        );
      })}
    </>
  );
}

function PodiumCard({ user, cfg, index, currentUser, onSelect, celebrateRank, celebrateTick, gameType }: {
  user: LeaderboardUser | undefined;
  cfg: typeof PODIUM_CFG[number];
  index: number;
  currentUser: any | null;
  onSelect: (user: LeaderboardUser) => void;
  /** The rank (1|2|3) currently taking its turn to celebrate. */
  celebrateRank: number;
  /** Ticker value — re-keys the celebration so it replays each turn. */
  celebrateTick: number;
  gameType: string;
}) {
  const { lang } = useLang();
  const kh = lang === "kh";
  const cardRef = useRef<HTMLDivElement>(null);
  const isFirst = cfg.rank === 1;
  // This card's turn to celebrate (one rank at a time, rotated by the parent ticker).
  const isCelebrating = !!user && cfg.rank === celebrateRank;
  const name = user ? (user.displayName || user.username) : "—";
  const userAvatar = (currentUser && user && user.id === currentUser.id) ? currentUser.avatar : (user?.avatar ?? null);
  const initials = (name && name !== "—" ? name : "?").slice(0, 2).toUpperCase();
  const linkable = !!user && user.isUsernamePublic !== false;
  const scoreValue = user?.lifetimePoints ?? 0;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const avatarSize = isMobile ? (isFirst ? 58 : 44) : (isFirst ? 82 : 66);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 36, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, delay: index * 0.1, ease: "back.out(1.25)" },
    );
  }, [index]);

  return (
    <article
      ref={cardRef}
      className={`relative flex w-full flex-col items-center ${cfg.order}`}
      aria-label={`${cfg.rank}. ${name}`}
    >
      {/* Avatar masthead */}
      <div
        className={`relative z-20 mb-[-22px] md:mb-[-30px] flex flex-col items-center select-none ${linkable ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => { if (linkable && user) onSelect(user); }}
      >
        {isFirst && (
          <div
            className="absolute -top-7 md:-top-9 left-1/2 z-20 flex h-7 w-7 md:h-9 md:w-9 -translate-x-1/2 items-center justify-center border-[3px] border-black bg-yellow-400"
            style={{ boxShadow: "3px 3px 0 #000", transform: "translateX(-50%) rotate(45deg)" }}
          >
            <Crown size={isMobile ? 14 : 20} strokeWidth={2.5} className="text-black" style={{ transform: "rotate(-45deg)" }} />
          </div>
        )}

        {user ? (
          <div className="relative transition-transform duration-200 hover:-translate-y-1">
            {/* Celebration — rendered BEHIND the avatar (z-0), centered on it, so the
                effect radiates out from behind the badge border. Re-keyed by the
                ticker so it replays on this card's turn. Each rank has its own style. */}
            {isCelebrating && (
              <div key={celebrateTick} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2" style={{ zIndex: 0 }}>
                {renderPodiumCelebration(cfg.rank, isFirst, isMobile)}
              </div>
            )}
            <div className="relative z-10">
              <RankedAvatarRing
                lifetimePoints={user.lifetimePoints}
                size={avatarSize}
                index={index}
              >
                <Avatar
                  url={userAvatar}
                  name={name}
                  size={avatarSize}
                  changedAt={user.avatarChangedAt}
                />
              </RankedAvatarRing>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-center border-[3px] border-black bg-zinc-800 font-black text-white"
            style={{
              width: isMobile ? (isFirst ? 66 : 52) : (isFirst ? 94 : 78),
              height: isMobile ? (isFirst ? 66 : 52) : (isFirst ? 94 : 78),
              borderRadius: "50%",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            {initials}
          </div>
        )}

        <div className="-mt-2 z-30" style={{ filter: "drop-shadow(2px 2px 0 #000)" }}>
          <RankBadge rank={cfg.rank} />
        </div>
      </div>

      <div
        className={`relative flex w-full flex-col items-center overflow-hidden border-[3px] border-black px-1.5 pb-4 pt-8 md:px-3 md:pb-5 md:pt-12 text-center transition-transform duration-200 animate-scroll-bg ${linkable ? "cursor-pointer hover:-translate-y-1" : "cursor-default"}`}
        onClick={linkable && user ? () => onSelect(user) : undefined}
        style={{
          backgroundColor: cfg.surfaceColor,
          backgroundImage: `radial-gradient(${cfg.patternColor} 1px,transparent 1px)`,
          backgroundSize: "12px 12px",
          boxShadow: isFirst ? "8px 8px 0 #000" : "5px 5px 0 #000",
          borderRadius: 0,
        }}
      >
        {/* Shimmer sweeping effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div 
            className="absolute inset-0 opacity-[0.12] animate-shimmer"
            style={{
              background: `linear-gradient(90deg, transparent, ${cfg.accentColor}, transparent)`,
              width: "50%",
              height: "100%",
            }}
          />
        </div>
        <div className="absolute inset-x-0 top-0 h-3 border-b-[3px] border-black" style={{ background: cfg.accentColor }} />

        <div
          className="mb-3 inline-flex items-center gap-1.5 border-2 border-black px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em]"
          style={{
            background: isFirst ? "#eab308" : "#000",
            color: isFirst ? "#000" : "#fff",
          }}
        >
          {isFirst ? <Crown size={11} /> : <Trophy size={11} />}
          <span className="hidden sm:inline">{cfg.labelEn}</span>
        </div>

        <h3 className="z-10 w-full truncate text-sm font-black leading-tight text-black md:text-lg font-kh-header">
          {name}
        </h3>

        <div className="z-10 mt-2 flex flex-wrap items-center justify-center gap-1.5">
          {user && <TierBadge lifetimePoints={user.lifetimePoints} size="xs" index={index} />}
        </div>

        <div className="z-10 my-4 h-[3px] w-12 bg-black" />

        {/* Matric number plate for top three */}
        {user ? (
          <ScorePlate
            value={<AnimatedNumber value={user?.priorityPoints ?? 0} />}
            styleId={user.scorePlateStyle}
            provinceEn={user.province}
            provinceKh={getProvinceKh(user.province)}
            size={isMobile ? (isFirst ? "sm" : "xs") : (isFirst ? "md" : "sm")}
            className="z-10"
          />
        ) : (
          <span className="z-10 font-black text-zinc-400">—</span>
        )}

        <span className="z-10 mt-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
          Road Points
        </span>

        {isFirst && (
          <div className="absolute bottom-3 right-3 text-yellow-500" aria-hidden="true">
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div
        className={`relative flex w-full items-center justify-center overflow-hidden border-[3px] border-t-0 border-black animate-pedestal ${cfg.pedestalHeight}`}
        style={{
          background: cfg.pedestalBg,
          boxShadow: isFirst ? "8px 8px 0 #000" : "5px 5px 0 #000",
          backgroundSize: "28px 28px",
        }}
      >
        <span
          className="z-10 select-none font-mono font-black leading-none tabular-nums"
          style={{
            fontSize: isFirst ? "clamp(48px,8vw,76px)" : "clamp(36px,6vw,56px)",
            WebkitTextStroke: "2px #000",
            WebkitTextFillColor: "rgba(255,255,255,.78)",
          }}
        >
          {cfg.rank}
        </span>
      </div>
    </article>
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

// Cooldown durations in milliseconds for each rank tier (Redesigned with Legend and Highmaster)
const TIER_COOLDOWNS: Record<string, number> = {
  rookie: 365 * 24 * 60 * 60 * 1000,                      // 1 year
  rising: 365 * 24 * 60 * 60 * 1000,                      // 1 year
  debut: 365 * 24 * 60 * 60 * 1000,                       // 1 year (alias)
  gold: Math.round(1.5 * 365 * 24 * 60 * 60 * 1000),      // 1.5 years
  platinum: 2 * 365 * 24 * 60 * 60 * 1000,                // 2 years
  diamond: Math.round(2.5 * 365 * 24 * 60 * 60 * 1000),    // 2.5 years
  master: Math.round(2.5 * 365 * 24 * 60 * 60 * 1000),     // 2.5 years
  elite: Math.round(2.5 * 365 * 24 * 60 * 60 * 1000),      // 2.5 years
  legend: 3 * 365 * 24 * 60 * 60 * 1000,                  // 3 years
  highmaster: 3 * 365 * 24 * 60 * 60 * 1000,              // 3 years
  mythic: 3 * 365 * 24 * 60 * 60 * 1000,                  // 3 years (alias)
};

// ── REWARD CARD (Brutalist Premium Redesign) ──────────────────────────────────
function RewardCard({ item, userPoints, isLoggedIn, onClaim, lang, userLifetimePoints = 0, teacherInventory = [], dbClaims = [] }: {
  item: typeof REWARD_ITEMS[number]; userPoints: number;
  isLoggedIn: boolean; onClaim: (item: typeof REWARD_ITEMS[number]) => void; lang: string;
  userLifetimePoints?: number;
  teacherInventory?: any[];
  dbClaims?: any[];
}) {
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "var(--font-system)" } : {};

  const userRank = getRank(userLifetimePoints);
  const cooldownMs = TIER_COOLDOWNS[userRank.id] ?? TIER_COOLDOWNS.rookie;

  // Rank gate: only Gold tier and above may claim (based on lifetime score).
  const meetsRank = canClaimRewards(userLifetimePoints);
  const pointsToGold = Math.max(0, CLAIM_MIN_POINTS - userLifetimePoints);

  // Claim state is SERVER-AUTHORITATIVE: a logged-in user's claims come ONLY from
  // the database (reward_claims). We deliberately do NOT read localStorage here —
  // it leaked the previous account's claims into a new account on the same browser
  // (a fresh login showed "Claimed: 2x"). `justClaimed` gives instant optimistic
  // feedback until the parent's claim refetch lands.
  const claimsForItem = dbClaims.filter((c: any) => c.itemId === item.id && c.status !== "rejected");
  const dbClaimCount = claimsForItem.length;
  const dbLastClaimedAt = claimsForItem.length > 0 ? new Date(claimsForItem[0].createdAt).getTime() : null;

  const [justClaimed, setJustClaimed] = useState(false);

  const claimCount = isLoggedIn ? dbClaimCount : 0;
  const lastClaimedAt = isLoggedIn ? dbLastClaimedAt : null;

  const itemCost = calculateDynamicCost(item, claimCount);

  const claimed = isLoggedIn && (justClaimed || (lastClaimedAt !== null && (Date.now() - lastClaimedAt < cooldownMs)));
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

  const itemConfig = teacherInventory?.find((i: any) => i.itemId === item.id);
  const isFrozen = itemConfig ? !!itemConfig.frozen : false;
  const isOutOfStock = itemConfig ? (itemConfig.stock === 0 || itemConfig.stock === "0") : false;
  const stockCount = itemConfig ? Number(itemConfig.stock) : null;
  const isPushed = itemConfig ? !!itemConfig.pushed : false;

  const canClaim = isLoggedIn && meetsRank && userPoints >= itemCost && !claimed && !isFrozen && !isOutOfStock;
  const rawPct = Math.min(100, (userPoints / itemCost) * 100);
  const pct = Math.round(rawPct);

  const socialCount = SOCIAL_PROOF[item.id] ?? 0;
  const scarcity = SCARCITY[item.id];
  const bonusBadge = BONUS_BADGE[item.id];
  const pointsNeeded = itemCost - userPoints;

  // Rarity ("premium collectible") — derived from cost; drives ribbon, frame
  // weight and the accent/aura on the card.
  const rarity = getRewardRarity(itemCost);
  const rmeta = RARITY_META[rarity];
  const isElite = rarity === "legendary" || rarity === "mythic";
  const isAlmostThere = isLoggedIn && meetsRank && !claimed && rawPct >= 60 && rawPct < 100;
  const isReady = isLoggedIn && meetsRank && !claimed && rawPct >= 100;

  useEffect(() => {
    if (!isReady) return;
    const t = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(t);
  }, [isReady]);

  function handleClaim() {
    if (!canClaim) return;
    // Optimistic only — the real record is created server-side; the parent then
    // refetches dbClaims, which becomes the source of truth for the claimed state.
    setJustClaimed(true);
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
          {rmeta.label}
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

        {/* Availability Badge */}
        {!claimed && (
          isLoggedIn ? (
            isFrozen ? (
              <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0_#000]">
                <span>{kh ? "ផ្អាកប្តូរ" : "FROZEN"}</span>
              </div>
            ) : isOutOfStock ? (
              <div className="absolute top-3 left-3 z-20 bg-zinc-600 text-white text-[8px] font-black uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0_#000]">
                <span>{kh ? "អស់ស្តុក" : "OUT OF STOCK"}</span>
              </div>
            ) : stockCount !== null ? (
              <div className="absolute top-3 left-3 z-20 bg-green-600 text-white text-[8px] font-black uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0_#000]">
                <span>{kh ? `ស្តុក៖ ${stockCount}` : `STOCK: ${stockCount}`}</span>
              </div>
            ) : (
              <div className="absolute top-3 left-3 z-20 bg-green-600 text-white text-[8px] font-black uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0_#000]">
                <span>{kh ? "មានស្តុក" : "IN STOCK"}</span>
              </div>
            )
          ) : (
            <div className="absolute top-3 left-3 z-20 bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0_#000]">
              <span>{kh ? "មានជានិច្ច" : "ALWAYS AVAILABLE"}</span>
            </div>
          )
        )}

        {/* Featured Star Badge (if pushed by teacher) */}
        {!claimed && isPushed && (
          <div className="absolute top-3 right-3 z-20 bg-yellow-400 text-black text-[8px] font-black uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0_#000] flex items-center gap-1 animate-pulse">
            <Star size={10} className="fill-black text-black" />
            <span>{kh ? "★ ណែនាំពិសេស" : "★ FEATURED"}</span>
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
            <span className="text-base font-mono font-black tabular-nums" style={{ color: "#facc15" }}>{itemCost.toLocaleString()}</span>
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
                {userPoints.toLocaleString()} / {itemCost.toLocaleString()} PTS
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
          ) : isFrozen ? (
            <button disabled
              className="w-full py-3 font-black text-xs border-3 border-black bg-zinc-100 text-zinc-400 cursor-not-allowed leading-none flex items-center justify-center gap-1.5 uppercase tracking-wider"
              style={{ boxShadow: `3px 3px 0 ${rmeta.accent}`, ...kf }}>
              <Lock size={12} strokeWidth={3} className="text-zinc-400" />
              <span>{kh ? "ផ្អាកប្តូរជាបណ្តោះអាសន្ន" : "TEMPORARILY FROZEN"}</span>
            </button>
          ) : isOutOfStock ? (
            <button disabled
              className="w-full py-3 font-black text-xs border-3 border-black bg-zinc-100 text-zinc-400 cursor-not-allowed leading-none flex items-center justify-center gap-1.5 uppercase tracking-wider"
              style={{ boxShadow: `3px 3px 0 ${rmeta.accent}`, ...kf }}>
              <Lock size={12} strokeWidth={3} className="text-zinc-400" />
              <span>{kh ? "អស់ពីស្តុក" : "OUT OF STOCK"}</span>
            </button>
          ) : !meetsRank ? (
            <button disabled
              className="w-full py-3 font-black text-xs border-3 border-black cursor-not-allowed leading-none flex flex-col items-center justify-center gap-0.5 uppercase tracking-wider"
              style={{ background: "#fef3c7", color: "#92400e", boxShadow: `3px 3px 0 ${rmeta.accent}`, ...kf }}>
              <span className="flex items-center gap-1.5">
                <Lock size={12} strokeWidth={3} />
                {kh ? "ឡើងដល់ GOLD ដើម្បីប្តូរ" : "REACH GOLD TO CLAIM"}
              </span>
              <span className="text-[8px] font-mono tracking-tighter text-yellow-700">
                {kh ? `ខ្វះ ${pointsToGold.toLocaleString()} ពិន្ទុដើម្បីដល់ GOLD` : `${pointsToGold.toLocaleString()} pts to Gold`}
              </span>
            </button>
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
              <span>
                {kh ? "ទទួលឥឡូវនេះ!" : "CLAIM NOW"}
              </span>
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
          {userRank.id === "rookie" || userRank.id === "rising" || userRank.id === "debut" ? (
            <span className="flex items-center justify-center gap-1 text-[8.5px] text-zinc-400 font-bold leading-normal" style={kf}>
              <Info size={10} />
              {kh ? "ឡើងដល់ GOLD ដើម្បីប្តូររង្វាន់ (កំណត់ឡើងវិញ ១ឆ្នាំ ៦ខែ)" : "Level up to Gold to claim items (1 year 6 months reset)!"}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1 text-[8.5px] text-cyan-700 font-extrabold leading-normal animate-pulse" style={kf}>
              <Zap size={10} />
              {userRank.label.toUpperCase()} TIER: {kh ? `រង្វាន់ប្តូរឡើងវិញក្នុង ${Math.ceil(cooldownMs / (365 * 24 * 60 * 60 * 1000))} ឆ្នាំ` : `Claims reset in ${Math.ceil(cooldownMs / (365 * 24 * 60 * 60 * 1000))} years`}
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
  const kf = kh ? { fontFamily: "var(--font-system)" } : {};

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  // The podium (top 3) is INTENTIONALLY decoupled from the game-type filter: it
  // always ranks by the primary LIVE score across all games, so tapping a game
  // only re-filters the table below — the champions on the podium stay stable.
  const [podiumBoard, setPodiumBoard] = useState<LeaderboardUser[]>([]);
  const [prevRanks, setPrevRanks] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [soloLimits, setSoloLimits] = useState<any>(null);
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleSelectUser = (user: LeaderboardUser) => {
    // Private usernames are anonymized to `student_<id>` and have no public
    // profile — don't navigate (would 404 on /u/student_<id>).
    if (user.isUsernamePublic === false) return;
    router.push(`/u/${user.username}`);
  };

  // Real-time tracking user points state
  const [userPoints, setUserPoints] = useState(0);
  const [userClaims, setUserClaims] = useState<any[]>([]);
  const [claimMsg, setClaimMsg] = useState("");
  const [teacherInventory, setTeacherInventory] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);
  // "Speed-camera flash": every 5s a random row's name plate flashes briefly. Pure
  // ambient polish — picks one visible player id, lights it for ~0.85s, then clears.
  const [flashId, setFlashId] = useState<number | null>(null);

  // Window + source controls were removed (2026-06-20): the board is fixed to
  // all-time / all-sources. These stay as constants so the fetch params are stable.
  const windowTab = "all";
  const sourceTab = "live";
  // Game mode is the only filter now, surfaced through a dropdown.
  const [gameType, setGameType] = useState("all");
  const [gameMenuOpen, setGameMenuOpen] = useState(false);
  const [hoveredHeader, setHoveredHeader] = useState(false);
  const [sortKey, setSortKey] = useState<"rank" | "live" | "games" | "acc">("rank");
  const [displayLimit, setDisplayLimit] = useState(100);
  // Podium celebration ticker — advances every 7s and rotates through the ranks
  // (1 → 2 → 3 → 1 …) so only ONE podium card celebrates at a time, each with its
  // own style. activeRank = (tick % 3) + 1.
  const [celebrateTick, setCelebrateTick] = useState(0);
  const hasActiveFilters = gameType !== "all";

  const fetchLeaderboard = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "100", window: windowTab });
      // Source filter: live, solo, daily, or all
      if (sourceTab !== "all") params.set("source", sourceTab);
      // Game type filter: daily, catch-sign, etc.
      if (gameType !== "all") params.set("gameType", gameType);

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
  }, [windowTab, sourceTab, gameType]);

  // Podium fetch — same window scope, but ALWAYS source="live" (Road Points) and NEVER the game-type filter,
  // so the top 3 stay fixed on the overall live-score (Road Points) ranking.
  const fetchPodium = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "3", window: windowTab, source: "live" });
      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setPodiumBoard(data.leaderboard || []);
    } catch { /* silent */ }
  }, [windowTab]);

  const fetchClaimsAndBalance = useCallback((livePoints?: number, lifetimePoints?: number) => {
    fetch("/api/user/claim")
      .then(r => (r.ok ? r.json() : null))
      .then(cd => {
        if (cd?.balance && typeof cd.balance.available === "number") {
          setUserPoints(Math.max(0, cd.balance.available));
        } else if (typeof livePoints === "number" || typeof lifetimePoints === "number") {
          setUserPoints(Math.max(0, (livePoints || lifetimePoints) ?? 0));
        }
        if (cd && Array.isArray(cd.claims)) {
          setUserClaims(cd.claims);
        }
        if (cd && Array.isArray(cd.teacherInventory)) {
          setTeacherInventory(cd.teacherInventory);
        }
      })
      .catch(() => {
        if (typeof livePoints === "number" || typeof lifetimePoints === "number") {
          setUserPoints(Math.max(0, (livePoints || lifetimePoints) ?? 0));
        }
      });
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchPodium();
    const iv = setInterval(() => { fetchLeaderboard(); fetchPodium(); }, 60000);
    return () => clearInterval(iv);
  }, [fetchLeaderboard, fetchPodium]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && !d.error) {
          if (d.role === "student" && (!d.schoolName || !d.province)) {
            router.push("/profile/student");
            return;
          }
          const lifetimePoints = d.lifetimePoints ?? 0;
          const livePoints = d.livePoints ?? 0;

          setCurrentUser(d);

          // Server-authoritative claimable balance: live priority points minus the
          // cost of every non-rejected reward claim (GET /api/user/claim). This is
          // the source of truth now that reward_claims drives the workflow — the
          // old localStorage claim bookkeeping is gone.
          if (d.role === "student") {
            fetchClaimsAndBalance(livePoints, lifetimePoints);
          } else {
            setUserPoints(Math.max(0, livePoints || lifetimePoints));
          }

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
  }, [router, fetchClaimsAndBalance]);

  // Countdown ticker
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 60), 1000);
    return () => clearInterval(t);
  }, []);

  // Premium podium celebration — advance the rank ticker every 7 seconds so the
  // top 3 take turns celebrating (1st, then 2nd, then 3rd), never all at once.
  useEffect(() => {
    const t = setInterval(() => setCelebrateTick(p => p + 1), 7000);
    return () => clearInterval(t);
  }, []);

  // Random speed-camera flash on one row every 30 seconds (slow premium gold flash).
  useEffect(() => {
    if (leaderboard.length === 0) return;
    const t = setInterval(() => {
      const pick = leaderboard[Math.floor(Math.random() * leaderboard.length)];
      setFlashId(pick?.id ?? null);
      setTimeout(() => setFlashId(null), 2500);
    }, 30000);
    return () => clearInterval(t);
  }, [leaderboard]);

  // Podium is fed by the game-independent podiumBoard so it never shifts on a game
  // tap; fall back to the main board on first paint before podiumBoard arrives.
  const top3 = (podiumBoard.length > 0 ? podiumBoard : leaderboard).slice(0, 3);

  const sortedBoard = [...leaderboard].sort((a, b) => {
    if (sortKey === "rank" || sortKey === "live") {
      const aPriority = a.priorityPoints ?? 0;
      const bPriority = b.priorityPoints ?? 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      const aSolo = a.soloPoints ?? 0;
      const bSolo = b.soloPoints ?? 0;
      if (aSolo !== bSolo) return bSolo - aSolo;
      return a.rank - b.rank;
    }
    if (sortKey === "games") {
      if ((b.totalGamesPlayed ?? 0) !== (a.totalGamesPlayed ?? 0)) return (b.totalGamesPlayed ?? 0) - (a.totalGamesPlayed ?? 0);
      return a.rank - b.rank;
    }
    // "acc"
    if ((b.accuracy ?? 0) !== (a.accuracy ?? 0)) return (b.accuracy ?? 0) - (a.accuracy ?? 0);
    return a.rank - b.rank;
  });

  const filteredSortedBoard = sortedBoard.filter(u => {
    return (u.totalGamesPlayed ?? 0) > 0;
  });

  // Points, rewards, and tier progression are student-only features.
  // Teachers, admins, and staff host/manage but do not earn points.
  const isStudent = currentUser?.role === "student";

  // Claim click handler — creates a PENDING claim routed to the student's teacher.
  // Points are only deducted once the server confirms the claim was created; on
  // any failure (not enough points / no class / already pending) we surface the
  // server's message instead of silently spending points.
  const handleClaimItem = async (item: typeof REWARD_ITEMS[number]) => {
    try {
      const res = await fetch("/api/user/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.message
          || (kh ? `មិនអាចស្នើ "${item.nameKh}" បានទេ។` : `Couldn't claim "${item.name}".`);
        setClaimMsg(`⚠️ ${msg}`);
        setTimeout(() => setClaimMsg(""), 6000);
        return;
      }

      fetchClaimsAndBalance();
      const ok = kh
        ? `🎁 "${item.nameKh}" ត្រូវបានផ្ញើទៅគ្រូរបស់អ្នក! រង់ចាំការយល់ព្រម។`
        : `🎁 "${item.name}" claim sent to your teacher! Waiting for approval.`;
      setClaimMsg(ok);
      setTimeout(() => setClaimMsg(""), 6000);
    } catch (err) {
      console.error("Failed to submit claim:", err);
      setClaimMsg(kh ? "មានបញ្ហាបណ្ដាញ។ សូមព្យាយាមម្ដងទៀត។" : "Network error. Please try again.");
      setTimeout(() => setClaimMsg(""), 6000);
    }
  };

  // Render row with KWD's original brutalist score plate / license plate style
  const renderRow = (user: LeaderboardUser, rowIndex: number, isSticky: boolean = false) => {
    const prev = prevRanks[user.id];
    const moved = prev !== undefined ? prev - user.rank : 0;
    const linkable = user.isUsernamePublic !== false;
    const isMe = !!currentUser && user.id === currentUser.id;
    
    // Dynamic rank matching client-side sort
    const displayRank = rowIndex + 1;
    const medal = displayRank === 1 ? "#eab308" : displayRank === 2 ? "#94a3b8" : displayRank === 3 ? "#cd7c3a" : null;
    
    const rowAvatar = isMe ? currentUser.avatar : user.avatar;
    
    // Dynamic overtake calculation matching client-side sort
    const isPointsSort = sortKey === "rank" || sortKey === "live";
    const scoreKey = gameType !== "all" ? "lifetimePoints" : "priorityPoints";
    const scoreValue = user[scoreKey] ?? 0;
    const tier = getRank(user.lifetimePoints);
    
    const above = isPointsSort && rowIndex > 0 ? filteredSortedBoard[rowIndex - 1] : null;
    const toOvertake = above ? Math.max(0, (above[scoreKey] ?? 0) - scoreValue + 1) : 0;
    const bestGameMeta = getGameMeta(user.bestGame);

    const rowProvince = isMe 
      ? ((currentUser?.isProvincePublic ?? false) ? (currentUser?.classProvince || currentUser?.province) : null)
      : user.province;
    const rowPlateStyle = isMe ? (currentUser?.scorePlateStyle || user.scorePlateStyle) : user.scorePlateStyle;

    return (
      <div
        key={user.id}
        className={`border-t-2 border-black transition-colors ${isSticky ? "bg-yellow-50/80 border-b-2" : isMe ? "bg-yellow-50" : "hover:bg-zinc-50"} ${linkable ? "cursor-pointer" : "cursor-default"}`}
        style={{ boxShadow: `inset 5px 0 0 ${medal ?? tier.accent}` }}
        onClick={linkable ? () => handleSelectUser(user) : undefined}
      >
        <div className="grid grid-cols-12 items-center px-2 sm:px-5 py-2 sm:py-2.5">
          {/* Rank + Avatar + Name + Meta */}
          <div className="col-span-4 sm:col-span-4 flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Rank + movement */}
            <div className="flex items-center gap-1 flex-shrink-0 w-7 sm:w-12">
              {medal ? (
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-black font-black text-[11px] tabular-nums flex-shrink-0"
                  style={{ background: medal, color: displayRank === 1 ? "#000" : "#fff" }}
                >
                  {displayRank}
                </span>
              ) : (
                <span className="text-sm font-black text-zinc-400 tabular-nums w-6 text-center sm:text-left">{displayRank}</span>
              )}
              {isPointsSort && moved !== 0 && (
                <div className="flex flex-col items-center justify-center flex-shrink-0">
                  {moved > 0 && <ChevronUp size={11} strokeWidth={4} className="text-green-500" />}
                  {moved < 0 && <ChevronDown size={11} strokeWidth={4} className="text-red-500" />}
                </div>
              )}
            </div>

            {/* Avatar + name + meta */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
              <RankedAvatarRing lifetimePoints={user.lifetimePoints} size={isMobile ? 26 : 36} index={rowIndex}>
                <Avatar
                  url={rowAvatar}
                  name={user.displayName || user.username}
                  size={isMobile ? 26 : 36}
                  changedAt={user.avatarChangedAt}
                />
              </RankedAvatarRing>
              <div className="flex flex-1 flex-col min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  {/* Name plate */}
                  <span
                    className={`inline-flex items-center font-black truncate min-w-0 ${flashId === user.id ? "lb-flash" : ""}`}
                    style={{
                      background: tier.labelGradient,
                      color: tier.textColor,
                      boxShadow: flashId === user.id ? undefined : "2px 2px 0 #000",
                      fontSize: 12,
                      letterSpacing: "0.01em",
                      maxWidth: "100%",
                      border: isMobile ? "2px solid #000" : "3px solid #000",
                      padding: isMobile ? "2px 4px" : "4px 8px",
                    }}
                    title={user.displayName || user.username}
                  >
                    {user.displayName || user.username}
                  </span>
                  {isMe && (
                    <span className="text-[8px] font-black uppercase px-1 py-0.5 border border-black bg-yellow-400 text-black flex-shrink-0">
                      {kh ? "អ្នក" : "You"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  <span className="inline-flex items-center text-[8px] font-black uppercase text-zinc-700 bg-zinc-100 border border-zinc-300 px-1 py-0.5 sm:hidden">
                    {tier.label}
                  </span>

                  {/* Goal-gradient: only for me, when someone is just ahead */}
                  {isMe && above && toOvertake > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-green-700 bg-green-50 border border-green-300 px-1 py-0.5">
                      <ArrowUp size={8} strokeWidth={4} />
                      {kh ? `ខ្វះ ${toOvertake.toLocaleString()} ដើម្បីលើស #${rowIndex}` : `${toOvertake.toLocaleString()} to pass #${rowIndex}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Road Points Column (Cambodian License Plate card style always) */}
          <div className="flex col-span-3 sm:col-span-2 justify-end sm:justify-start items-center">
            <ScorePlate
              value={user.priorityPoints ?? 0}
              styleId={rowPlateStyle}
              provinceEn={rowProvince}
              provinceKh={getProvinceKh(rowProvince)}
              size={isMobile ? "xs" : "sm"}
            />
          </div>

          {/* Solo Practice Column */}
          <div className="col-span-3 sm:col-span-2 flex justify-end sm:justify-start items-center">
            <span className="font-mono font-black text-xs md:text-sm text-black tabular-nums">
              {user.soloPoints ?? 0}
            </span>
          </div>

          {/* Total / Game Mode Score Column */}
          <div className="col-span-2 sm:col-span-2 flex justify-end sm:justify-start items-center">
            <span className="font-mono font-black text-xs md:text-sm text-black tabular-nums">
              {user.lifetimePoints ?? 0}
            </span>
          </div>

          {/* Games Column */}
          <span className="col-span-1 text-center text-xs font-bold text-zinc-500 tabular-nums hidden sm:block">
            {sortKey === "games" ? (
              <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-white flex items-center justify-center font-black text-black text-xs font-mono shadow-[2px_2px_0_#000] mx-auto">
                {user.totalGamesPlayed}
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full border-2 border-black bg-zinc-50 flex items-center justify-center font-bold text-zinc-500 text-xs font-mono mx-auto">
                {user.totalGamesPlayed}
              </div>
            )}
          </span>

          {/* Accuracy Column */}
          {sortKey === "acc" ? (
            <div className="col-span-1 flex justify-end hidden sm:flex">
              <span
                className="inline-flex items-center gap-1 border-2 border-black px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider font-mono shadow-[1.5px_1.5px_0_#000]"
                style={{
                  background: (user.accuracy ?? 0) >= 80 ? "#22c55e" : (user.accuracy ?? 0) >= 50 ? "#eab308" : "#ef4444",
                  color: (user.accuracy ?? 0) >= 80 || (user.accuracy ?? 0) < 50 ? "#fff" : "#000",
                }}
              >
                {user.accuracy}%
              </span>
            </div>
          ) : (
            <span
              className="col-span-1 text-right text-xs md:text-sm font-bold tabular-nums hidden sm:block font-mono"
              style={{ color: (user.accuracy ?? 0) >= 80 ? "#16a34a" : (user.accuracy ?? 0) >= 50 ? "#ca8a04" : "#ef4444" }}
            >
              {(user.accuracy ?? 0)}%
            </span>
          )}
        </div>

        {/* Mobile stat strip */}
        <div className="sm:hidden flex items-center gap-1.5 flex-wrap px-3 pb-2.5 -mt-0.5">
          <span
            className={`inline-flex items-center gap-1 border-2 border-black px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide tabular-nums ${
              sortKey === "games" ? "bg-red-500 text-white shadow-[1.5px_1.5px_0_#000]" : "bg-white text-black"
            }`}
            style={kf}
          >
            <Gamepad2 size={10} strokeWidth={2.75} />
            {(user.totalGamesPlayed ?? 0).toLocaleString()} {kh ? "ហ្គេម" : "Games"}
          </span>
          <span
            className={`inline-flex items-center gap-1 border-2 border-black px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide tabular-nums ${
              sortKey === "acc"
                ? "shadow-[1.5px_1.5px_0_#000]"
                : "bg-white"
            }`}
            style={{
              backgroundColor: sortKey === "acc"
                ? ((user.accuracy ?? 0) >= 80 ? "#22c55e" : (user.accuracy ?? 0) >= 50 ? "#eab308" : "#ef4444")
                : "#ffffff",
              color: sortKey === "acc"
                ? (((user.accuracy ?? 0) >= 80 || (user.accuracy ?? 0) < 50) ? "#ffffff" : "#000000")
                : ((user.accuracy ?? 0) >= 80 ? "#16a34a" : (user.accuracy ?? 0) >= 50 ? "#ca8a04" : "#ef4444"),
              ...kf
            }}
          >
            {(user.accuracy ?? 0)}% {kh ? "ត្រឹមត្រូវ" : "Acc"}
          </span>
        </div>
      </div>
    );
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
              <div className="relative overflow-hidden flex flex-col bg-zinc-950 border-[3px] border-black shadow-[4px_4px_0_#000]" style={{ borderRadius: 0 }}>
                {/* KWD Branding Stripe */}
                <CautionTape variant="caution" height={10} />
                
                <div className="flex flex-col gap-3.5 p-4 pt-3 w-full sm:w-[260px]">
                  <div className="flex items-center justify-between gap-4 w-full">
                    {/* Road Points styled as a Cambodian License Plate */}
                    <div className="flex flex-col items-start">
                      <span className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5">Road Points</span>
                      <ScorePlate
                        value={currentUser.livePoints ?? 0}
                        styleId={currentUser.scorePlateStyle}
                        provinceEn={(currentUser.isProvincePublic ?? false) ? (currentUser.classProvince || currentUser.province) : null}
                        provinceKh={getProvinceKh((currentUser.isProvincePublic ?? false) ? (currentUser.classProvince || currentUser.province) : null)}
                        size="sm"
                      />
                    </div>

                    <div className="flex flex-col items-end justify-center">
                      <span className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5">{kh ? "ថ្នាក់គណនី" : "Rank Tier"}</span>
                      <TierBadge lifetimePoints={currentUser.lifetimePoints ?? 0} size="sm" lang={lang} />
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <RankProgressBar lifetimePoints={currentUser.lifetimePoints ?? 0} lang={lang} compact />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-10">
        {loading ? (
          // Lightweight brutalist skeleton — paints the leaderboard's shape
          // immediately while the Top-50 data loads, instead of a bare spinner.
          // Avatars/badges/plates are intentionally NOT loaded here.
          <div className="flex flex-col gap-10" aria-hidden="true">
            {/* Podium skeleton (3 columns) */}
            <div className="grid grid-cols-3 items-end gap-2 md:gap-6 w-full pt-12">
              {[44, 58, 44].map((h, i) => (
                <div key={i} className={`flex flex-col items-center ${i === 1 ? "order-2" : i === 0 ? "order-1" : "order-3"}`}>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-200 border-[3px] border-black animate-pulse" />
                  <div className="w-full mt-3 border-[3px] border-black bg-white" style={{ boxShadow: "5px 5px 0 #000" }}>
                    <div className="h-3 bg-zinc-300" />
                    <div className="p-3 flex flex-col items-center gap-2">
                      <div className="h-3 w-16 bg-zinc-200 animate-pulse" />
                      <div className="h-6 w-20 bg-zinc-200 animate-pulse" />
                    </div>
                    <div className={`${i === 1 ? "h-20 md:h-32" : i === 0 ? "h-16 md:h-24" : "h-14 md:h-20"} bg-zinc-100 border-t-[3px] border-black animate-pulse`} />
                  </div>
                </div>
              ))}
            </div>
            {/* Table rows skeleton */}
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 border-2 border-black bg-white px-3 py-2.5" style={{ boxShadow: "3px 3px 0 #000" }}>
                  <div className="w-6 h-6 bg-zinc-200 animate-pulse" />
                  <div className="w-9 h-9 rounded-full bg-zinc-200 border-2 border-black animate-pulse" />
                  <div className="h-3 flex-1 max-w-[160px] bg-zinc-200 animate-pulse" />
                  <div className="ml-auto h-3 w-14 bg-zinc-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Podium - only show if there are ranked users */}
            {top3.length > 0 && (
              <div className="flex flex-col gap-5 w-full">
                {/* ── Bilingual "Top 3" section banner ── */}
                <div className="flex items-center justify-center gap-3" aria-hidden="true">
                  <span className="h-[3px] flex-1 max-w-[80px] bg-black" />
                  <span
                    className="inline-flex items-center gap-2 border-[3px] border-black bg-yellow-400 px-4 py-1.5 text-sm font-black uppercase tracking-[0.18em] text-black"
                    style={{ boxShadow: "4px 4px 0 #000", borderRadius: 0 }}
                  >
                    <Crown size={16} strokeWidth={2.5} className="text-black" />
                    {kh ? "អ្នកពូកែទាំង ៣" : "Top 3"}
                  </span>
                  <span className="h-[3px] flex-1 max-w-[80px] bg-black" />
                </div>

                <div className="grid grid-cols-3 items-end gap-2 md:gap-6 w-full pt-12">
                {[
                  { cfg: PODIUM_CFG[0], user: top3[1] },
                  { cfg: PODIUM_CFG[1], user: top3[0] },
                  { cfg: PODIUM_CFG[2], user: top3[2] },
                ].map(({ cfg, user }, i) => (
                  <PodiumCard key={cfg.rank} user={user} cfg={cfg} index={i} currentUser={currentUser} onSelect={handleSelectUser} celebrateRank={(celebrateTick % 3) + 1} celebrateTick={celebrateTick} gameType={gameType} />
                ))}
                </div>
              </div>
            )}

            {/* Rankings Table */}
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-base md:text-lg font-black text-black tracking-tight uppercase flex items-center gap-2" style={kf}>
                  <Trophy size={18} strokeWidth={2.5} className="text-yellow-500" />
                  {kh ? "ចំណាត់ថ្នាក់" : "Rankings"}
                  {gameType !== "all" && (
                    <span
                      className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider pl-1 pr-2 py-0.5 border-2 border-black bg-black text-yellow-400"
                    >
                      <GameBadge slug={gameType} size="xs" shadow={false} />
                      {kh ? getGameMeta(gameType)?.kh ?? gameType : getGameMeta(gameType)?.en ?? gameType}
                    </span>
                  )}
                </h2>
                {lastUpdated && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {kh ? "ធ្វើបច្ចុប្បន្នភាព" : "UPDATED"} {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                )}
              </div>



              <div className="bg-white border-3 border-black" style={{ boxShadow: "4px 4px 0 #000", borderRadius: 0 }}>
                <style>{`@keyframes lbFlash{0%,100%{box-shadow:2px 2px 0 #000;filter:brightness(1)}30%{box-shadow:2px 2px 0 #000,0 0 24px 8px rgba(255,215,0,0.95);filter:brightness(1.35)}65%{box-shadow:2px 2px 0 #000,0 0 10px 3px rgba(255,215,0,0.65);filter:brightness(1.15)}}.lb-flash{animation:lbFlash 2.5s ease-in-out}@keyframes menuSlowPop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}.menu-slow-pop{animation:menuSlowPop 0.3s cubic-bezier(0.16,1,0.3,1) forwards}`}</style>
                {/* Table Header — Live Score is the hero metric and leads the stats
                    right after the player; Games / Acc / Top game follow. */}
                <div className="grid grid-cols-12 bg-black px-2 sm:px-5 py-2 sm:py-2.5 text-[9px] md:text-[10px] font-black tracking-widest uppercase sticky top-[66px] z-30">
                  <span className="col-span-4 sm:col-span-4 text-yellow-400 flex items-center gap-1 sm:gap-6">
                    <span className="sm:hidden"># / {kh ? "សិស្ស" : "Player"}</span>
                    <span className="hidden sm:inline w-6">#</span>
                    <span className="hidden sm:inline">{kh ? "សិស្ស" : "Player"}</span>
                  </span>
                  
                  {/* Always Road Points column header */}
                  <span className="text-yellow-400 flex items-center font-black uppercase tracking-widest truncate col-span-3 sm:col-span-2">
                    Road Points
                  </span>

                  {/* Solo Practice column header */}
                  <span className="text-yellow-400 flex items-center font-black uppercase tracking-widest truncate col-span-3 sm:col-span-2">
                    {kh ? "ហាត់លេង" : "Solo Practice"}
                  </span>

                  {/* Total / Game Mode points header containing the filter dropdown */}
                  <div
                    onMouseEnter={() => setHoveredHeader(true)}
                    onMouseLeave={() => setHoveredHeader(false)}
                    className="col-span-2 sm:col-span-2 relative flex items-center justify-end sm:justify-start"
                  >
                    <button
                      onClick={() => {
                        setSortKey("rank");
                        setGameMenuOpen((o) => !o);
                      }}
                      className="flex items-center justify-end sm:justify-start gap-1 text-yellow-400 font-black uppercase text-right sm:text-left tracking-widest hover:text-yellow-300 transition-colors focus:outline-none w-full"
                    >
                      {gameType === "all" ? (
                        <>
                          <Crown size={11} strokeWidth={3} className="text-yellow-400 flex-shrink-0" />
                          <span className="truncate">{kh ? "សរុប" : "Total"}</span>
                        </>
                      ) : (
                        <>
                          <Gamepad2 size={11} strokeWidth={3} className="text-yellow-400 flex-shrink-0" />
                          <span className="truncate text-yellow-400">
                            {(kh ? getGameMeta(gameType)?.kh : getGameMeta(gameType)?.en) ?? gameType}
                          </span>
                        </>
                      )}
                      <ChevronDown size={10} strokeWidth={3} className={`ml-0.5 text-yellow-400 flex-shrink-0 transition-transform ${gameMenuOpen || hoveredHeader ? "rotate-180" : ""}`} />
                    </button>

                    {(gameMenuOpen || hoveredHeader) && (
                      <>
                        {/* Mobile click-outside backdrop */}
                        <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setGameMenuOpen(false)} />
                        <div
                          role="listbox"
                          className="absolute right-0 top-full z-50 mt-1 max-h-80 w-56 overflow-y-auto border-[3px] border-black bg-white menu-slow-pop"
                          style={{ boxShadow: "4px 4px 0 #000", borderRadius: 0 }}
                        >
                          {GAME_CHIPS.map((g) => {
                            const active = gameType === g.id;
                            return (
                              <button
                                key={g.id}
                                role="option"
                                aria-selected={active}
                                onClick={() => {
                                  setGameType(g.id);
                                  setSortKey("rank");
                                  setGameMenuOpen(false);
                                  setHoveredHeader(false);
                                }}
                                className={`flex w-full items-center gap-2 border-b-2 border-black px-2 py-1.5 text-left text-[10px] font-black uppercase tracking-wide transition-colors ${
                                  active ? "bg-yellow-300 text-black" : "bg-white text-black hover:bg-zinc-100"
                                }`}
                                style={kf}
                              >
                                {g.id === "all" ? (
                                  <span className="inline-flex items-center justify-center flex-shrink-0 border border-black bg-yellow-400 w-5 h-5">
                                    <Gamepad2 size={11} strokeWidth={2.75} color="#000" />
                                  </span>
                                ) : (
                                  <GameBadge slug={g.id} size="xs" shadow={false} />
                                )}
                                <span className="flex-1 truncate">{kh ? g.kh : g.en}</span>
                                {active && <Check size={12} strokeWidth={3} className="text-black" />}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Clickable Games Header */}
                  <button
                    onClick={() => setSortKey(sortKey === "games" ? "rank" : "games")}
                    className={`col-span-1 text-center font-black uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-0.5 hidden sm:flex mx-auto focus:outline-none ${
                      sortKey === "games" ? "text-yellow-400" : "text-zinc-500"
                    }`}
                    title={kh ? "ចំនួនលេងសរុប" : "Total games played"}
                  >
                    <span>{kh ? "ហ្គេម" : "Games"}</span>
                    {sortKey === "games" ? (
                      <ChevronDown size={10} strokeWidth={3} />
                    ) : (
                      <ArrowUpDown size={10} className="opacity-60" />
                    )}
                  </button>
                  {/* Clickable Accuracy Header */}
                  <button
                    onClick={() => setSortKey(sortKey === "acc" ? "rank" : "acc")}
                    className={`col-span-1 text-right font-black uppercase tracking-widest hover:text-white transition-colors flex items-center justify-end gap-0.5 hidden sm:flex focus:outline-none ${
                      sortKey === "acc" ? "text-yellow-400" : "text-green-400"
                    }`}
                  >
                    <span>{kh ? "ត្រឹមត្រូវ" : "Acc"}</span>
                    {sortKey === "acc" ? (
                      <ChevronDown size={10} strokeWidth={3} />
                    ) : (
                      <ArrowUpDown size={10} className="opacity-60" />
                    )}
                  </button>
                </div>

                {(() => {
                  const currentUserInSlice = filteredSortedBoard.slice(0, displayLimit).some(u => u.id === currentUser?.id);
                  const currentUserRowIndex = currentUser ? filteredSortedBoard.findIndex(u => u.id === currentUser.id) : -1;
                  const showStickyMe = currentUser && isStudent && !currentUserInSlice && currentUserRowIndex !== -1;

                  return filteredSortedBoard.length > 0 ? (
                    <>
                      {filteredSortedBoard.slice(0, displayLimit).map((user, rowIndex) => renderRow(user, rowIndex, false))}
                      
                      {showStickyMe && (
                        <>
                          <div className="border-t-3 border-black relative overflow-hidden select-none" style={{ height: 12 }}>
                            <CautionTape variant="caution" height={12} />
                          </div>
                          {renderRow(filteredSortedBoard[currentUserRowIndex], currentUserRowIndex, true)}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="px-6 py-10 text-center text-zinc-400 text-sm border-t-2 border-black" style={kf}>
                      {kh
                        ? "មិនទាន់មានចំណាត់ថ្នាក់ទេ។ លេងសកម្មភាព ឬចូលរួមថ្នាក់ផ្ទាល់ ដើម្បីបង្ហាញនៅទីនេះ។"
                        : "No rankings yet. Play games or join a live class to appear here."}
                    </div>
                  );
                })()}
              </div>

              {sortedBoard.length > 100 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => {
                      setDisplayLimit(d => {
                        if (d === 100 && sortedBoard.length > 100) return 200;
                        return 100;
                      });
                    }}
                    className="border-2 border-black bg-yellow-400 text-black px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0_#000] hover:-translate-y-0.5 transition-transform"
                    style={{ borderRadius: 0 }}
                  >
                    {displayLimit === 100 && (kh ? "មើលបន្ថែម (កំពូល ២០០)" : "See More (Top 200)")}
                    {displayLimit === 200 && (kh ? "បង្ហាញតិចជាងមុន (កំពូល ១០០)" : "See Less (Top 100)")}
                  </button>
                </div>
              )}

              <p className="text-center text-[9px] text-zinc-400 mt-2 font-mono uppercase" style={kf}>
                {kh
                  ? "Road Points = អាចដោះបាន · ចំណាត់ថ្នាក់តាម Road Points · ហ្គេម = ចំនួនលេងសរុប · ត្រឹមត្រូវ = មធ្យមភាគ"
                  : "Road Points = claimable · Ranked by Road Points · Games = total plays · Acc = avg correct"}
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
                {soloLimits && soloLimits.playsToday >= soloLimits.playsAllowed / 2 && (
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
                  {(() => {
                    const sortedItems = [...REWARD_ITEMS].sort((a, b) => {
                      const aConf = teacherInventory.find((i: any) => i.itemId === a.id);
                      const bConf = teacherInventory.find((i: any) => i.itemId === b.id);
                      const aPushed = aConf ? !!aConf.pushed : false;
                      const bPushed = bConf ? !!bConf.pushed : false;
                      if (aPushed && !bPushed) return -1;
                      if (!aPushed && bPushed) return 1;
                      return a.cost - b.cost;
                    });
                    return sortedItems.map((item, idx) => (
                      <RewardCard
                        key={item.id}
                        item={item}
                        userPoints={userPoints}
                        isLoggedIn={!!currentUser}
                        lang={lang}
                        onClaim={handleClaimItem}
                        userLifetimePoints={currentUser?.lifetimePoints ?? 0}
                        teacherInventory={teacherInventory}
                        dbClaims={userClaims}
                      />
                    ));
                  })()}
                </div>

              </div>
          </>
        )}
      </div>

    </div>
  );
}
