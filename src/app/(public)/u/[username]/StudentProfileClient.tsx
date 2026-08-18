"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";
import {
  Trophy,
  Gift,
  ChevronLeft,
  CheckCircle2,
  Gamepad2,
  Star,
  Zap,
  Shield,
  Lock,
  MapPin,
  GraduationCap,
  Calendar,
  Flame,
  Target,
  BookOpen,
  Award,
  Crown,
  Medal,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CautionTape, SignShape } from "@/components/brand/brand-kit";
import { getAvatarFaceStyle } from "@/lib/utils";
import { RankedAvatarRing, TIER_ICONS } from "@/components/shared/rank-label";
import { RoadAvatarBorder } from "@/components/rank/RoadAvatarBorder";
import { MythicAvatarBorder } from "@/components/rank/MythicAvatarBorder";
import { GoldAvatarBorder } from "@/components/rank/GoldAvatarBorder";
import { PlatinumAvatarBorder } from "@/components/rank/PlatinumAvatarBorder";
import { DiamondAvatarBorder } from "@/components/rank/DiamondAvatarBorder";
import { calculateRankAndDivision, getNextRank, RANK_CONFIGS } from "@/lib/ranks";
import { REWARD_ITEMS } from "@/lib/rewards";
import { ScorePlate } from "@/components/shared/score-plate";
import type { ScorePlateStyle } from "@/lib/score-plates";

export interface SerializableStudent {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  avatarChangedAt: string | null;
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  livePoints: number;
  scorePlateStyle: ScorePlateStyle;
  createdAt: string;
  schoolName: string | null;
  province: string | null;
  className: string | null;
  claimedRewards: string;
  isProfilePublic?: boolean;
  isNamePublic?: boolean;
  isUsernamePublic?: boolean;
  isSchoolPublic?: boolean;
  isProvincePublic?: boolean;
  isClassPublic?: boolean;
  isStatsPublic?: boolean;
}

interface GameStat {
  gameType: string;
  points: number;
  plays: number;
}

interface StudentProfileClientProps {
  student: SerializableStudent;
  rank: number;
  gameStats?: GameStat[];
}

const BRAND = {
  yellow: "#eab308",
  black: "#000000",
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  purple: "#a855f7",
};

const checkerboardStyle: CSSProperties = {
  background:
    "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 28px 28px",
};

const boardAccentStyle: CSSProperties = {
  background:
    "repeating-conic-gradient(#eab308 0% 25%, #000 0% 50%) 0 0 / 20px 20px",
};

// Bilingual labels + brand color for each GameKit game type (matches ledger gameType).
const GAME_LABELS: Record<string, { en: string; kh: string; color: string; Icon: LucideIcon }> = {
  daily: { en: "Daily Challenge", kh: "បញ្ហាប្រចាំថ្ងៃ", color: BRAND.yellow, Icon: Flame },
  "mixed-practice": { en: "Mixed Practice", kh: "សំណួរចម្រុះ", color: BRAND.blue, Icon: Gamepad2 },
  "priority-puzzle": { en: "Who Goes First?", kh: "តើអ្នកណាទៅមុន?", color: BRAND.blue, Icon: Target },
  "sign-match": { en: "Sign Match", kh: "ផ្គូផ្គងសញ្ញា", color: BRAND.green, Icon: BookOpen },
  "catch-sign": { en: "Catch the Sign", kh: "ចាប់សញ្ញា", color: BRAND.orange, Icon: Zap },
  "light-hero": { en: "Traffic Light Hero", kh: "បញ្ញាបរភ្លើងសញ្ញា", color: BRAND.red, Icon: Trophy },
  "safety-adventure": { en: "Road Safety Journey", kh: "ដំណើរសុវត្ថិភាពចរាចរណ៍", color: BRAND.purple, Icon: Award },
};

function titleCaseSlug(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function gameLabel(gameType: string) {
  return GAME_LABELS[gameType] ?? {
    en: titleCaseSlug(gameType),
    kh: titleCaseSlug(gameType),
    color: "#71717a",
    Icon: Gamepad2,
  };
}

function iconTone(accent: string) {
  return accent === BRAND.blue || accent === BRAND.red || accent === BRAND.purple
    ? "text-white"
    : "text-black";
}

const CAMBODIA_PROVINCES = [
  { en: "Siem Reap", kh: "សៀមរាប" }, { en: "Phnom Penh", kh: "ភ្នំពេញ" },
  { en: "Battambang", kh: "បាត់ដំបង" }, { en: "Banteay Meanchey", kh: "បន្ទាយមានជ័យ" },
  { en: "Kampong Cham", kh: "កំពង់ចាម" }, { en: "Kampong Chhnang", kh: "កំពង់ឆ្នាំង" },
  { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" }, { en: "Kampong Thom", kh: "កំពង់ធំ" },
  { en: "Kampot", kh: "កំពត" }, { en: "Kandal", kh: "កណ្តាល" },
  { en: "Kep", kh: "កែប" }, { en: "Koh Kong", kh: "កោះកុង" },
  { en: "Kratie", kh: "ក្រចេះ" }, { en: "Mondulkiri", kh: "មណ្ឌលគីរី" },
  { en: "Oudar Meanchey", kh: "ឧត្តរមានជ័យ" }, { en: "Pailin", kh: "ប៉ៃលិន" },
  { en: "Preah Sihanouk", kh: "ព្រះសីហនុ" }, { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  { en: "Prey Veng", kh: "ព្រៃវែង" }, { en: "Pursat", kh: "ពោធិ៍សាត់" },
  { en: "Ratanakiri", kh: "រតនគីរី" }, { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  { en: "Svay Rieng", kh: "ស្វាយរៀង" }, { en: "Takeo", kh: "តាកែវ" },
  { en: "Tboung Khmum", kh: "ត្បូងឃ្មុំ" },
];

function getBilingualProvince(en: string | null | undefined): string {
  if (!en) return "—";
  const found = CAMBODIA_PROVINCES.find(p => p.en.toLowerCase() === en.toLowerCase());
  return found ? `${found.en} / ${found.kh}` : en;
}

function getProvinceKh(en: string | null | undefined): string | null {
  if (!en) return null;
  const found = CAMBODIA_PROVINCES.find(p => p.en.toLowerCase() === en.toLowerCase());
  return found ? found.kh : null;
}

function avatarSrc(url: string | null, changedAt?: string | null): string | null {
  if (!url) return null;
  const base = url.startsWith("https://res.cloudinary.com/")
    ? `/api/profile-image?imageUrl=${encodeURIComponent(url)}`
    : url;
  if (!changedAt) return base;
  return `${base}${base.includes("?") ? "&" : "?"}v=${new Date(changedAt).getTime()}`;
}

function Avatar({ url, name, size = 96, changedAt, round }: {
  url: string | null; name: string; size?: number; changedAt?: string | null; round?: boolean;
}) {
  const [err, setErr] = useState(false);
  const initials = (name || "?").slice(0, 2).toUpperCase();

  const parsed = (() => {
    if (!url) return null;
    const t = url.trim();
    if (t.startsWith("{") && t.endsWith("}")) {
      try {
        const d = JSON.parse(t) as { face?: string; head?: string };
        if (d && (d.face || d.head)) {
          if (d.head && !d.face) d.face = "Smile.svg";
          return d;
        }
      } catch { return null; }
    }
    return null;
  })();

  const borderRadiusStyle = { borderRadius: "50%" };

  if (parsed) {
    return (
      <div className="relative h-full w-full overflow-hidden" style={{ background: "#ffffff", border: "2px solid #000", ...borderRadiusStyle }}>
        <div style={{ position: "absolute", inset: "6%", width: "88%", height: "88%" }}>
          {parsed.head && <img src={`/avatar/head/${encodeURIComponent(parsed.head)}`} alt="" aria-hidden className="absolute inset-0 h-full w-full object-contain" />}
          {parsed.face && <img src={`/avatar/face/${encodeURIComponent(parsed.face)}`} alt="" aria-hidden style={getAvatarFaceStyle(parsed.head)} />}
        </div>
      </div>
    );
  }

  const src = avatarSrc(url, changedAt);
  if (src && !err) {
    return <img src={src} alt={name} onError={() => setErr(true)} className="h-full w-full object-cover" style={{ ...borderRadiusStyle, border: "2px solid #000", background: "#ffffff" }} />;
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center font-mono font-black"
      style={{
        background: "#ffffff",
        color: "#000000",
        border: "2px solid #000",
        fontSize: Math.round(size * 0.3),
        ...borderRadiusStyle
      }}
    >
      {initials}
    </div>
  );

}

function StatTile({ icon: Icon, label, value, kh, accent = BRAND.yellow, dark = false }: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  kh?: boolean;
  accent?: string;
  dark?: boolean;
}) {
  return (
    <article
      className={`min-h-[126px] border-[3px] border-black ${dark ? "bg-black text-white" : "bg-white text-black"}`}
      style={{ boxShadow: "5px 5px 0 #000" }}
    >
      <div className="flex h-full">
        <div className="w-3 border-r-[3px] border-black" style={{ background: accent }} />
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 break-words font-mono text-[clamp(1.85rem,7vw,3.25rem)] font-black leading-none tabular-nums">
              {value}
            </p>
            <div
              className="grid size-10 shrink-0 place-items-center border-[3px] border-black"
              style={{ background: accent, boxShadow: "2px 2px 0 #000" }}
            >
              <Icon size={19} className={iconTone(accent)} strokeWidth={2.6} />
            </div>
          </div>
          <p className={`mt-3 text-[11px] font-black uppercase tracking-wider ${dark ? "text-white/70" : "text-zinc-600"} ${kh ? "font-google-sans" : ""}`}>
            {label}
          </p>
        </div>
      </div>
    </article>
  );
}

function Panel({ title, icon: Icon, kh, kf, count, children, aside }: {
  title: string;
  icon: LucideIcon;
  kh: boolean;
  kf: CSSProperties;
  count?: number;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="border-[3px] border-black bg-white" style={{ boxShadow: "5px 5px 0 #000" }}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-black bg-[#eab308] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={18} className="shrink-0 text-black" strokeWidth={2.6} />
          <h2 className={`min-w-0 break-words text-sm font-black uppercase tracking-wider text-black ${kh ? "font-google-sans" : ""}`} style={kf}>
            {title}
          </h2>
          {typeof count === "number" && (
            <span className="border-2 border-black bg-black px-2 py-0.5 font-mono text-[10px] font-black text-white">
              {count}
            </span>
          )}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

function FactRow({ icon: Icon, label, value, kh, kf }: {
  icon: LucideIcon;
  label: string;
  value: string;
  kh: boolean;
  kf: CSSProperties;
}) {
  return (
    <div className="grid grid-cols-[44px_1fr] items-stretch border-[3px] border-black bg-white">
      <div className="grid place-items-center border-r-[3px] border-black bg-zinc-100">
        <Icon size={18} className="text-zinc-700" strokeWidth={2.4} />
      </div>
      <div className="min-w-0 px-3 py-2.5">
        <p className={`text-[10px] font-black uppercase tracking-wider text-zinc-500 ${kh ? "font-google-sans" : ""}`} style={kf}>
          {label}
        </p>
        <p className={`mt-0.5 break-words text-sm font-black text-black ${kh ? "font-google-sans" : ""}`} style={kf}>
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, kh, kf }: {
  icon: LucideIcon;
  title: string;
  kh: boolean;
  kf: CSSProperties;
}) {
  return (
    <div className="grid min-h-[168px] place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid size-14 place-items-center border-[3px] border-black bg-zinc-100">
          <Icon size={24} className="text-zinc-300" strokeWidth={2.5} />
        </div>
        <p className={`text-sm font-black text-zinc-400 ${kh ? "font-google-sans" : ""}`} style={kf}>
          {title}
        </p>
      </div>
    </div>
  );
}

export default function StudentProfileClient({ student, rank, gameStats = [] }: StudentProfileClientProps) {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "var(--font-system)" } : {};
  const t = (en: string, khText: string) => (kh ? khText : en);

  const [claimedItems, setClaimedItems] = useState<Array<{
    id: number; name: string; nameKh: string; cost: number; image: string; claimedAt: number;
  }>>([]);

  const isNamePublic = student.isNamePublic ?? true;
  const isUsernamePublic = student.isUsernamePublic ?? true;
  const isProvincePublic = student.isProvincePublic ?? false;
  const isClassPublic = student.isClassPublic ?? false;
  const isStatsPublic = student.isStatsPublic ?? true;

  const displayName = isNamePublic
    ? (student.displayName || student.username)
    : t("Private Student", "សិស្សឯកជន");

  const joinedYear = student.createdAt ? new Date(student.createdAt).getFullYear() : 2026;

  const topGame = gameStats[0];
  const topGameMeta = topGame ? gameLabel(topGame.gameType) : null;
  const bestModePoints = Math.max(...gameStats.map((g) => g.points), 1);
  const rankResult = calculateRankAndDivision(student.lifetimePoints);
  const profileRank = rankResult.rank;
  const division = rankResult.division;
  const progressToNextRank = rankResult.progressToNextRank;
  const pointsNeededForNextRank = rankResult.pointsNeededForNextRank;
  const nextRank = getNextRank(profileRank.name);

  const isMythicBorder = profileRank.id === "mythic";
  const isDiamondBorder = profileRank.id === "diamond";
  const isPlatinumBorder = profileRank.id === "platinum";
  const isGoldBorder = profileRank.id === "gold";
  const hasRoadAvatarBorder = profileRank.id === "rookie" || profileRank.id === "rising";

  useEffect(() => {
    try {
      const parsed = JSON.parse(student.claimedRewards || "[]") as Array<{ id: number; claimedAt: number }>;
      const items = parsed
        .map((claim) => {
          const item = REWARD_ITEMS.find((r) => r.id === claim.id);
          return item ? { ...item, claimedAt: claim.claimedAt } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => (b.claimedAt || 0) - (a.claimedAt || 0));
      setClaimedItems(items);
    } catch {
      setClaimedItems([]);
    }
  }, [student.claimedRewards]);

  if (student.isProfilePublic === false) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] text-black">
        <div className="border-b-[3px] border-black bg-white px-4 py-3">
          <button onClick={() => router.push("/leaderboard")} className="nb-btn flex items-center gap-2 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-black">
            <ChevronLeft size={17} strokeWidth={2.6} />
            {t("Back", "ត្រឡប់")}
          </button>
        </div>
        <CautionTape variant="checker" height={14} />
        <main className="grid-bg grid min-h-[calc(100vh-78px)] place-items-center px-4 py-12">
          <section className="w-full max-w-2xl border-[3px] border-black bg-white p-8 text-center sm:p-10" style={{ boxShadow: "6px 6px 0 #000" }}>
            <SignShape shape="octagon" body={BRAND.red} size={92}>
              <Lock size={30} className="text-white" strokeWidth={2.6} />
            </SignShape>
            <h1 className={`mt-6 text-2xl font-black uppercase text-black ${kh ? "font-google-sans" : ""}`} style={kf}>
              {t("This Profile is Private", "គណនីនេះជាគណនីឯកជន")}
            </h1>
            <p className={`mx-auto mt-3 max-w-sm text-sm font-bold leading-relaxed text-zinc-500 ${kh ? "font-google-sans" : ""}`} style={kf}>
              {t("This student has hidden their public profile.", "សិស្សនេះបានលាក់កម្រងព័ត៌មានសាធារណៈរបស់ពួកគេ។")}
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black">
      <div className="border-b-[3px] border-black bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => router.push("/leaderboard")}
            className={`nb-btn flex items-center gap-2 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-black ${kh ? "font-google-sans" : ""}`}
            style={kf}
          >
            <ChevronLeft size={17} strokeWidth={2.6} />
            {t("Back", "ត្រឡប់")}
          </button>
          <div className="hidden min-w-0 items-center gap-2 sm:flex">
            <div className="size-3 border-2 border-black bg-[#eab308]" />
            <p className={`truncate font-mono text-[11px] font-black uppercase tracking-[0.24em] text-zinc-500 ${kh ? "font-google-sans" : ""}`} style={kf}>
              {t("Public Student Profile", "កម្រងព័ត៌មានសិស្សសាធារណៈ")}
            </p>
            <div className="size-3 border-2 border-black bg-black" />
          </div>
          <div className="w-[86px]" aria-hidden />
        </div>
      </div>

      <CautionTape variant="checker" height={14} />

      <main className="grid-bg">
        <section className="border-b-[3px] border-black bg-white">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
            <div className="border-[3px] border-black bg-white" style={{ boxShadow: "6px 6px 0 #000" }}>
              <div className="h-14 border-b-[3px] border-black" style={checkerboardStyle} />
              
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 p-6 sm:p-8 md:p-10">
                
                {/* Left Side: Avatar Column (ID Card Theme) */}
                <div className="flex flex-col items-center justify-center shrink-0 border-[3px] border-black p-6 bg-zinc-50/50 shadow-[4px_4px_0_#000] relative w-full md:w-[220px]">
                  <div className="relative w-fit hover:-translate-y-1 transition-transform duration-200">
                    {isMythicBorder ? (
                      <MythicAvatarBorder
                        alt={`${displayName} avatar`}
                        username={isNamePublic ? (student.displayName || student.username) : "S"}
                        score={student.lifetimePoints}
                        size="md"
                      >
                        <Avatar
                          url={student.avatar}
                          name={isNamePublic ? (student.displayName || student.username) : "S"}
                          size={96}
                          changedAt={student.avatarChangedAt}
                          round={true}
                        />
                      </MythicAvatarBorder>
                    ) : isDiamondBorder ? (
                      <DiamondAvatarBorder
                        alt={`${displayName} avatar`}
                        username={isNamePublic ? (student.displayName || student.username) : "S"}
                        score={student.lifetimePoints}
                        size="md"
                      >
                        <Avatar
                          url={student.avatar}
                          name={isNamePublic ? (student.displayName || student.username) : "S"}
                          size={96}
                          changedAt={student.avatarChangedAt}
                          round={true}
                        />
                      </DiamondAvatarBorder>
                    ) : isPlatinumBorder ? (
                      <PlatinumAvatarBorder
                        alt={`${displayName} avatar`}
                        username={isNamePublic ? (student.displayName || student.username) : "S"}
                        score={student.lifetimePoints}
                        size="md"
                      >
                        <Avatar
                          url={student.avatar}
                          name={isNamePublic ? (student.displayName || student.username) : "S"}
                          size={96}
                          changedAt={student.avatarChangedAt}
                          round={true}
                        />
                      </PlatinumAvatarBorder>
                    ) : isGoldBorder ? (
                      <GoldAvatarBorder
                        alt={`${displayName} avatar`}
                        username={isNamePublic ? (student.displayName || student.username) : "S"}
                        score={student.lifetimePoints}
                        size="md"
                      >
                        <Avatar
                          url={student.avatar}
                          name={isNamePublic ? (student.displayName || student.username) : "S"}
                          size={96}
                          changedAt={student.avatarChangedAt}
                          round={true}
                        />
                      </GoldAvatarBorder>
                    ) : hasRoadAvatarBorder ? (
                      <RoadAvatarBorder
                        alt={`${displayName} avatar`}
                        username={isNamePublic ? (student.displayName || student.username) : "S"}
                        score={student.lifetimePoints}
                        size="md"
                      >
                        <Avatar
                          url={student.avatar}
                          name={isNamePublic ? (student.displayName || student.username) : "S"}
                          size={96}
                          changedAt={student.avatarChangedAt}
                          round={true}
                        />
                      </RoadAvatarBorder>
                    ) : (
                      <RankedAvatarRing lifetimePoints={student.lifetimePoints} size={118}>
                        <Avatar
                          url={student.avatar}
                          name={isNamePublic ? (student.displayName || student.username) : "S"}
                          size={118}
                          changedAt={student.avatarChangedAt}
                          round={true}
                        />
                      </RankedAvatarRing>
                    )}
                    <div className="absolute -bottom-5 -right-5">
                      <SignShape shape="diamond" body={BRAND.yellow} size={66}>
                        <Crown size={22} className="text-black" strokeWidth={2.6} />
                      </SignShape>
                    </div>
                  </div>
                  
                  <span className="mt-8 border-[3px] border-black bg-[#eab308] px-3 py-1 font-mono text-[11px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0_#000]">
                    {isUsernamePublic ? `@${student.username}` : t("Private ID", "លេខសម្គាល់ឯកជន")}
                  </span>
                </div>

                {/* Right Side: Identity Details & Rank Progression */}
                <div className="flex-1 min-w-0 flex flex-col justify-between text-center md:text-left gap-6 pt-4 md:pt-0">
                  <div>
                    {/* Role Tag & Details */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black text-[#eab308] border-2 border-black">
                        <GraduationCap size={11} strokeWidth={2.8} />
                        {t("Student", "សិស្ស")}
                      </span>
                      {isProvincePublic && student.province && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white text-black border-2 border-black">
                          <MapPin size={11} />
                          {getBilingualProvince(student.province)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white text-black border-2 border-black font-mono">
                        <Calendar size={11} />
                        {joinedYear}
                      </span>
                    </div>

                    <h1 className={`break-words text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight tracking-normal text-black ${kh ? "font-google-sans" : ""}`} style={kf}>
                      {displayName}
                    </h1>

                    {student.schoolName && student.isSchoolPublic !== false && (
                      <p className="mt-2 text-xs font-bold text-zinc-500 flex items-center justify-center md:justify-start gap-1">
                        <span className="inline-block size-2 bg-zinc-400" />
                        {student.schoolName}
                      </p>
                    )}
                  </div>

                  {isStatsPublic && (
                    <div className="flex flex-col gap-4 border-t-2 border-dashed border-zinc-200 pt-4">
                      {/* ScorePlate and Rank Badge inline */}
                      <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                        <ScorePlate
                          value={student.livePoints}
                          styleId={student.scorePlateStyle}
                          provinceEn={isProvincePublic ? student.province : null}
                          provinceKh={isProvincePublic ? getProvinceKh(student.province) : null}
                          size="md"
                          shadow
                        />
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t("Rank Tier", "ថ្នាក់គណនី")}</span>
                          <span className="border-2 border-black bg-purple-500 text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_#000]">
                            {profileRank.label} {division}
                          </span>
                        </div>
                      </div>

                      {/* Rank Progression Ruler (Goal-Gradient Indicator) */}
                      {nextRank ? (
                        <div className="w-full">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                            <span style={kf}>{t(`Next Rank: ${nextRank.label}`, `បន្ទាប់: ${nextRank.label}`)}</span>
                            <span className="font-mono text-zinc-600 bg-zinc-100 px-1.5 py-0.5 border border-zinc-200">
                              {pointsNeededForNextRank.toLocaleString()} pts {t("needed", "ទៀត")}
                            </span>
                          </div>
                          <div className="w-full h-4 border-[3px] border-black bg-white shadow-[2px_2px_0_#000] overflow-hidden relative flex items-center">
                            {/* Ruler ticks overlay */}
                            <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
                              {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-[1px] h-full bg-black" />
                              ))}
                            </div>
                            <div
                              className="h-full transition-all duration-700 border-r-[2px] border-black"
                              style={{ width: `${progressToNextRank}%`, backgroundColor: nextRank.accentColor || BRAND.yellow }}
                            />
                            <span className="absolute right-2 font-mono text-[9px] font-black text-black bg-white/80 px-1 border border-black/10">
                              {progressToNextRank}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                          ✦ {t("MAX RANK REACHED", "កម្រិតខ្ពស់បំផុត")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
          {isStatsPublic ? (
            <div className="border-[3px] border-black bg-white shadow-[5px_5px_0_#000] overflow-hidden">
              {/* Stats Matrix header */}
              <div className="border-b-[3px] border-black bg-black px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Trophy className="text-[#eab308]" size={16} strokeWidth={2.8} />
                  <span className="font-mono text-xs font-black uppercase tracking-wider">{t("STUDENT STATS", "ស្ថិតិសិស្ស")}</span>
                </div>
                <span className="font-mono text-[9px] font-black text-zinc-400 uppercase tracking-widest">{t("VERIFIED BY Kesararam With Digital", "ផ្ទៀងផ្ទាត់ដោយ Kesararam With Digital")}</span>
              </div>
              
              {/* 4-column divided grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[3px] bg-black">
                
                {/* Slot 1: Leaderboard Rank */}
                <div className="p-4 flex flex-col justify-between min-h-[110px] bg-white">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-black leading-none tracking-tight">
                      #{rank}
                    </span>
                    <div className="p-1.5 border-2 border-black bg-yellow-400 text-black shadow-[1.5px_1.5px_0_#000]">
                      <Trophy size={14} strokeWidth={2.8} />
                    </div>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-wider text-zinc-500 mt-2 ${kh ? "font-google-sans" : ""}`} style={kf}>
                    {t("Leaderboard Rank", "ចំណាត់ថ្នាក់")}
                  </p>
                </div>

                {/* Slot 2: Games Played */}
                <div className="p-4 flex flex-col justify-between min-h-[110px] bg-white">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-black leading-none tracking-tight">
                      {student.totalGamesPlayed.toLocaleString()}
                    </span>
                    <div className="p-1.5 border-2 border-black bg-blue-400 text-white shadow-[1.5px_1.5px_0_#000]">
                      <Gamepad2 size={14} strokeWidth={2.8} />
                    </div>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-wider text-zinc-500 mt-2 ${kh ? "font-google-sans" : ""}`} style={kf}>
                    {t("Games Played", "ចំនួនលេង")}
                  </p>
                </div>

                {/* Slot 3: Highest Score */}
                <div className="p-4 flex flex-col justify-between min-h-[110px] bg-white">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-black leading-none tracking-tight">
                      {student.highestScore.toLocaleString()}
                    </span>
                    <div className="p-1.5 border-2 border-black bg-green-500 text-black shadow-[1.5px_1.5px_0_#000]">
                      <Star size={14} strokeWidth={2.8} />
                    </div>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-wider text-zinc-500 mt-2 ${kh ? "font-google-sans" : ""}`} style={kf}>
                    {t("Highest Score", "ពិន្ទុខ្ពស់បំផុត")}
                  </p>
                </div>

                {/* Slot 4: Store Points */}
                <div className="p-4 flex flex-col justify-between min-h-[110px] bg-white">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-black leading-none tracking-tight">
                      {student.lifetimePoints.toLocaleString()}
                    </span>
                    <div className="p-1.5 border-2 border-black bg-orange-500 text-white shadow-[1.5px_1.5px_0_#000]">
                      <Zap size={14} strokeWidth={2.8} />
                    </div>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-wider text-zinc-500 mt-2 ${kh ? "font-google-sans" : ""}`} style={kf}>
                    {t("Store Points", "ពិន្ទុរង្វាន់")}
                  </p>
                </div>

              </div>
            </div>
          ) : (
            <div className="border-[3px] border-black bg-white p-4 text-center shadow-[3px_3px_0_#000]" style={{ borderRadius: "0" }}>
              <div className="flex items-center justify-center gap-2 text-zinc-500">
                <Shield size={18} strokeWidth={2.6} />
                <p className={`font-black text-xs uppercase tracking-wider ${kh ? "font-google-sans" : ""}`} style={kf}>
                  {t("Stats are private / ស្ថិតិត្រូវបានរក្សាការសម្ងាត់", "Stats are private / ស្ថិតិត្រូវបានរក្សាការសម្ងាត់")}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
            
            {/* Left Column: Rewards & Achievements */}
            <div className="space-y-6">
              
              {/* Rewards Panel */}
              {isStatsPublic ? (
                <Panel title={t("Rewards Claimed", "រង្វាន់ដែលបានប្តូរ")} icon={Gift} kh={kh} kf={kf} count={claimedItems.length}>
                  {claimedItems.length === 0 ? (
                    <EmptyState icon={Gift} title={t("No rewards claimed yet", "មិនទាន់មានការប្តូររង្វាន់")} kh={kh} kf={kf} />
                  ) : (
                    <div className="grid gap-3 p-4">
                      {claimedItems.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="grid grid-cols-[56px_1fr] border-[3px] border-black bg-zinc-50 shadow-[2px_2px_0_#000]">
                          <div className="grid place-items-center border-r-[3px] border-black bg-white">
                            <img src={item.image} alt={kh ? item.nameKh : item.name} className="h-9 w-9 object-contain" />
                          </div>
                          <div className="min-w-0 px-3 py-2.5">
                            <p className={`truncate text-sm font-black text-black ${kh ? "font-google-sans" : ""}`} style={kf}>
                              {kh ? item.nameKh : item.name}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-black text-zinc-500">{item.cost} PTS</span>
                              <span className="inline-flex items-center gap-1 border-2 border-black bg-[#22c55e] px-1.5 py-0.5 text-[10px] font-black uppercase text-black">
                                <CheckCircle2 size={11} strokeWidth={2.8} />
                                {t("Claimed", "បានប្តូរ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              ) : (
                <div className="border-[3px] border-black bg-white p-6 text-center shadow-[3px_3px_0_#000]" style={{ borderRadius: "0" }}>
                  <Shield size={28} className="mx-auto text-zinc-300" strokeWidth={2.6} />
                  <p className={`mt-2 font-black text-xs text-zinc-500 ${kh ? "font-google-sans" : ""}`} style={kf}>
                    {t("Rewards are private", "រង្វាន់ត្រូវបានរក្សាការសម្ងាត់")}
                  </p>
                </div>
              )}

              {/* Rank Showcase Achievements */}
              <Panel title={t("Rank Achievements", "ស្នាដៃថ្នាក់គណនី")} icon={Award} kh={kh} kf={kf}>
                <div className="p-4 space-y-2.5">
                  {RANK_CONFIGS.map((tierItem) => {
                    const unlocked = student.lifetimePoints >= tierItem.minPoints;
                    const isCurrent = tierItem.id === profileRank.id;
                    const Icon = TIER_ICONS[tierItem.id] || Star;
                    return (
                      <div
                        key={tierItem.id}
                        className={`flex items-center justify-between p-2.5 border-[3px] border-black transition-all ${
                          isCurrent
                            ? "bg-amber-50 shadow-[2px_2px_0_#000]"
                            : unlocked
                            ? "bg-zinc-50"
                            : "bg-zinc-100/50 opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="grid size-8 place-items-center border-2 border-black"
                            style={{
                              backgroundColor: unlocked ? tierItem.accentColor : "#d4d4d8",
                              color: unlocked ? "#000" : "#71717a",
                            }}
                          >
                            <Icon size={14} strokeWidth={2.8} />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider" style={{ color: unlocked ? "#000" : "#71717a" }}>
                              {tierItem.label}
                            </p>
                            <p className="text-[9px] font-bold text-zinc-500 font-mono">
                              {tierItem.minPoints === 0 ? "START" : `${tierItem.minPoints.toLocaleString()} PTS`}
                            </p>
                          </div>
                        </div>
                        <div>
                          {isCurrent ? (
                            <span className="border-2 border-black bg-purple-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 shadow-[1px_1px_0_#000]">
                              {t("CURRENT", "បច្ចុប្បន្ន")}
                            </span>
                          ) : unlocked ? (
                            <span className="inline-flex items-center gap-0.5 border-2 border-black bg-[#22c55e] text-black text-[8px] font-black uppercase px-1.5 py-0.5">
                              <CheckCircle2 size={10} strokeWidth={3} />
                              {t("UNLOCKED", "បានបើក")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 border-2 border-zinc-300 bg-zinc-200 text-zinc-500 text-[8px] font-black uppercase px-1.5 py-0.5">
                              <Lock size={10} strokeWidth={3} />
                              {t("LOCKED", "ចាក់សោ")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>

            </div>

            {/* Right Column: Game Scoreboard */}
            <div>
              {isStatsPublic ? (
                <Panel
                  title={t("Game Mode Scoreboard", "តារាងពិន្ទុតាមរបៀបលេង")}
                  icon={Gamepad2}
                  kh={kh}
                  kf={kf}
                  count={gameStats.length}
                  aside={<span className="hidden border-2 border-black bg-white px-2 py-1 font-mono text-[10px] font-black uppercase text-black sm:inline-block">{t("Score Board", "តារាងពិន្ទុ")}</span>}
                >
                  {gameStats.length === 0 ? (
                    <EmptyState icon={Gamepad2} title={t("No game-mode scores yet", "មិនទាន់មានពិន្ទុតាមរបៀបលេង")} kh={kh} kf={kf} />
                  ) : (
                    <div className="divide-y-[3px] divide-black">
                      {gameStats.map((g, idx) => {
                        const meta = gameLabel(g.gameType);
                        const Icon = meta.Icon;
                        const width = Math.max(8, Math.round((g.points / bestModePoints) * 100));
                        return (
                          <div key={g.gameType} className="grid gap-3 p-4 sm:grid-cols-[56px_1fr_auto] sm:items-center">
                            <div className="flex items-center gap-3 sm:block">
                              <div className="grid size-12 place-items-center border-[3px] border-black" style={{ background: meta.color, boxShadow: "2px 2px 0 #000" }}>
                                <Icon size={20} className={iconTone(meta.color)} strokeWidth={2.6} />
                              </div>
                              <span className="border-2 border-black bg-black px-2 py-1 font-mono text-[10px] font-black text-white sm:mt-2 sm:inline-block">
                                #{idx + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className={`min-w-0 break-words text-base font-black text-black ${kh ? "font-google-sans" : ""}`} style={kf}>
                                  {kh ? meta.kh : meta.en}
                                </p>
                                <p className="font-mono text-xs font-black uppercase text-zinc-500">
                                  {g.plays.toLocaleString()} {kh ? "ដង" : g.plays === 1 ? "play" : "plays"}
                                </p>
                              </div>
                              <div className="mt-3 h-5 border-[3px] border-black bg-white">
                                <div className="h-full border-r-[3px] border-black" style={{ width: `${width}%`, background: meta.color }} />
                              </div>
                            </div>
                            <div className="border-[3px] border-black bg-zinc-50 px-4 py-3 text-left sm:text-right">
                              <p className="font-mono text-2xl font-black leading-none tabular-nums text-black">{g.points.toLocaleString()}</p>
                              <p className="mt-1 font-mono text-[10px] font-black uppercase text-zinc-500">PTS</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              ) : (
                <div className="border-[3px] border-black bg-white p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-[5px_5px_0_#000]" style={{ borderRadius: "0" }}>
                  <Shield size={38} className="text-zinc-300" strokeWidth={2.6} />
                  <h3 className={`mt-4 text-lg font-black uppercase text-zinc-500 ${kh ? "font-google-sans" : ""}`} style={kf}>
                    {t("Scoreboard Private", "ពិន្ទុត្រូវបានរក្សាការសម្ងាត់")}
                  </h3>
                  <p className={`mt-2 max-w-xs text-xs text-zinc-400 font-bold ${kh ? "font-google-sans" : ""}`} style={kf}>
                    {t("This student has set their game statistics to private.", "សិស្សនេះបានកំណត់ព័ត៌មានលម្អិតនៃហ្គេមរបស់ពួកគេជាឯកជន។")}
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

        <div className="mt-4 border-y-[3px] border-black">
          <CautionTape variant="chevron" height={18} />
        </div>

        <footer className="px-4 py-8 text-center">
          <p className="font-mono text-xs font-black uppercase tracking-wider text-zinc-400">
            Kesararam with Digital © 2026 · kesararamwithdigital.tech
          </p>
        </footer>
      </main>
    </div>
  );
}
