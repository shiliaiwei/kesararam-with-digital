"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";
import {
  Trophy, Gift, ChevronLeft, CheckCircle2,
  Gamepad2, Star, Zap, Shield, Lock,
  MapPin, GraduationCap, Calendar, ChevronDown,
  School, Flame, Target, BookOpen, Award,
} from "lucide-react";
import { CautionTape, SignShape } from "@/components/brand/brand-kit";
import { getAvatarFaceStyle } from "@/lib/utils";

export interface SerializableStudent {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  avatarChangedAt: string | null;
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  createdAt: string;
  schoolName: string | null;
  province: string | null;
  gradeLevel: string | null;
  section: string | null;
  claimedRewards: string;
  isProfilePublic?: boolean;
  isNamePublic?: boolean;
  isUsernamePublic?: boolean;
  isSchoolPublic?: boolean;
  isProvincePublic?: boolean;
  isGradePublic?: boolean;
  isSectionPublic?: boolean;
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

// Bilingual labels + brand color for each GameKit game type (matches ledger gameType).
const GAME_LABELS: Record<string, { en: string; kh: string; color: string; Icon: React.ComponentType<any> }> = {
  daily: { en: "Daily Challenge", kh: "បញ្ហាប្រចាំថ្ងៃ", color: "#eab308", Icon: Flame },
  "priority-puzzle": { en: "Who Goes First?", kh: "តើអ្នកណាទៅមុន?", color: "#3b82f6", Icon: Target },
  "sign-match": { en: "Sign Match", kh: "ផ្គូផ្គងសញ្ញា", color: "#22c55e", Icon: BookOpen },
  "catch-sign": { en: "Catch the Sign", kh: "ចាប់សញ្ញា", color: "#f97316", Icon: Zap },
  "light-hero": { en: "Traffic Light Hero", kh: "បញ្ញាបរភ្លើងសញ្ញា", color: "#ef4444", Icon: Trophy },
  "safety-adventure": { en: "Road Safety Adventure", kh: "ដំណើរផ្សងព្រេងសុវត្ថិភាព", color: "#a855f7", Icon: Award },
};

function gameLabel(gameType: string) {
  return GAME_LABELS[gameType] ?? { en: gameType, kh: gameType, color: "#71717a", Icon: Gamepad2 };
}

const REWARD_ITEMS = [
  { id: 1, name: "Notebook", nameKh: "សៀវភៅកត់ត្រា", cost: 500, image: "/rewards/notebook.webp" },
  { id: 2, name: "Pencil", nameKh: "ខ្មៅដៃ", cost: 100, image: "/rewards/pencil.webp" },
  { id: 3, name: "Pen", nameKh: "ប៊ិច", cost: 150, image: "/rewards/pen.webp" },
  { id: 4, name: "Ruler", nameKh: "បន្ទាត់", cost: 200, image: "/rewards/ruler.webp" },
  { id: 5, name: "Eraser", nameKh: "ជ័រលុប", cost: 80, image: "/rewards/eraser.webp" },
  { id: 6, name: "Highlighter", nameKh: "ប៊ិចសម្គាល់", cost: 250, image: "/rewards/highlighter.webp" },
  { id: 7, name: "Notes", nameKh: "ក្រដាសសម្គាល់", cost: 300, image: "/rewards/notes.webp" },
  { id: 8, name: "Kit", nameKh: "ឧបករណ៍គណិត", cost: 800, image: "/rewards/kit.webp" },
  { id: 9, name: "Planner", nameKh: "ផែនការសិក្សា", cost: 1200, image: "/rewards/planner.webp" },
];

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

function getBilingualGrade(grade: string | null | undefined): string {
  if (!grade) return "—";
  const n = grade.match(/\d+/)?.[0];
  if (!n) return grade;
  const khNum: Record<string, string> = { "6": "៦", "7": "៧", "8": "៨", "9": "៩", "10": "១០", "11": "១១", "12": "១២" };
  return khNum[n] ? `Grade ${n} / ថ្នាក់ទី ${khNum[n]}` : grade;
}

function avatarSrc(url: string | null, changedAt?: string | null): string | null {
  if (!url) return null;
  const base = url.startsWith("https://res.cloudinary.com/")
    ? `/api/profile-image?imageUrl=${encodeURIComponent(url)}`
    : url;
  return changedAt ? `${base}&v=${new Date(changedAt).getTime()}` : base;
}

function Avatar({ url, name, size = 96, changedAt }: {
  url: string | null; name: string; size?: number; changedAt?: string | null;
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

  if (parsed) {
    return (
      <div className="w-full h-full relative" style={{ background: "#eab308" }}>
        {parsed.head && <img src={`/avatar/head/${encodeURIComponent(parsed.head)}`} alt="" aria-hidden className="absolute inset-0 w-full h-full object-contain" />}
        {parsed.face && <img src={`/avatar/face/${encodeURIComponent(parsed.face)}`} alt="" aria-hidden style={getAvatarFaceStyle(parsed.head)} />}
      </div>
    );
  }

  const src = avatarSrc(url, changedAt);
  if (src && !err) {
    return <img src={src} alt={name} onError={() => setErr(true)} className="w-full h-full object-cover" />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center font-black text-white"
      style={{ background: "#1e40af", fontSize: Math.round(size * 0.3) }}>
      {initials}
    </div>
  );
}

// Sign-style stat cell: semantic color strip + iconed badge, flat brutalist.
function StatCard({ icon: Icon, label, value, kh, accent = "#eab308", iconFg = "text-black" }: {
  icon: React.ComponentType<any>; label: string; value: string | number;
  kh?: boolean; accent?: string; iconFg?: string;
}) {
  return (
    <div className="bg-white border-2 border-black" style={{ boxShadow: "4px 4px 0 #000" }}>
      <div style={{ height: 8, background: accent, borderBottom: "2px solid #000" }} />
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-4xl font-black text-black font-mono tabular-nums leading-none">{value}</p>
          <p className={`text-[11px] font-black text-gray-500 uppercase tracking-wide mt-2 ${kh ? "font-google-sans" : ""}`}>{label}</p>
        </div>
        <div className="size-9 grid place-items-center border-2 border-black flex-shrink-0"
          style={{ background: accent, boxShadow: "2px 2px 0 #000" }}>
          <Icon size={18} className={iconFg} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

// Collapsible dropdown section (brutalist card with a clickable header).
function Section({ id, title, icon: Icon, open, onToggle, kh, kf, count, children }: {
  id: string; title: string; icon: React.ComponentType<any>;
  open: boolean; onToggle: (id: string) => void; kh: boolean;
  kf: React.CSSProperties; count?: number; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between gap-2 text-left"
        style={{ background: "#eab308", borderBottom: open ? "2px solid #000" : "none", padding: "10px 16px" }}
      >
        <span className="flex items-center gap-2">
          <Icon size={15} className="text-black" />
          <span className={`text-sm font-black uppercase tracking-wide text-black ${kh ? "font-google-sans" : ""}`} style={kf}>
            {title}
          </span>
          {typeof count === "number" && (
            <span className="text-[10px] font-black font-mono bg-black text-white px-2 py-0.5">{count}</span>
          )}
        </span>
        <ChevronDown
          size={18}
          className="text-black flex-shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          strokeWidth={2.5}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export default function StudentProfileClient({ student, rank, gameStats = [] }: StudentProfileClientProps) {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" } : {};

  const [claimedItems, setClaimedItems] = useState<Array<{
    id: number; name: string; nameKh: string; cost: number; image: string; claimedAt: number;
  }>>([]);

  // Collapsible section state (dropdowns). "info" (game info) open by default.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    info: true,
    intro: false,
    games: false,
    rewards: false,
  });
  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const isNamePublic = student.isNamePublic ?? true;
  const isSchoolPublic = student.isSchoolPublic ?? true;
  const isProvincePublic = student.isProvincePublic ?? true;
  const isGradePublic = student.isGradePublic ?? true;
  const isSectionPublic = student.isSectionPublic ?? true;
  const isStatsPublic = student.isStatsPublic ?? true;

  const displayName = isNamePublic
    ? (student.displayName || student.username)
    : (kh ? "ឯកជន" : "Private");

  const gradeKh = student.gradeLevel
    ? (student.gradeLevel.toLowerCase().includes("grade")
      ? student.gradeLevel.replace(/grade\s*/i, "ថ្នាក់ទី ")
      : (student.gradeLevel.match(/\d+/) ? `ថ្នាក់ទី ${student.gradeLevel.match(/\d+/)?.[0]}` : student.gradeLevel))
    : "—";

  const joinedYear = student.createdAt ? new Date(student.createdAt).getFullYear() : 2026;

  // ── Rewards: real DB data only ────────────────────────────────────────────
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

  return (
    <div className="min-h-screen bg-[#f4f5f7]">

      {/* ── Top nav ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => router.push("/leaderboard")}
          className={`flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-black transition-colors ${kh ? "font-google-sans" : ""}`}
          style={kf}
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          {kh ? "ត្រឡប់" : "Back"}
        </button>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono hidden sm:block">
          Student Profile
        </span>
        <div className="w-16" />
      </div>

      {/* ── Signature caution-tape strip ───────────────────────────────────── */}
      <CautionTape variant="caution" height={10} />

      {/* ── Profile hero ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b-2 border-black">

        {/* Profile info row */}
        <div className="px-5 pt-6 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="p-0.5 border-3 border-black rounded-full" style={{
                padding: "3px",
                borderRadius: "50%",
                border: "3px solid #000",
                background: "#fff",
                boxShadow: "3px 3px 0 #000",
              }}>
                <div style={{ borderRadius: "50%", overflow: "hidden", width: "84px", height: "84px" }}>
                  <Avatar
                    url={student.avatar}
                    name={isNamePublic ? (student.displayName || student.username) : "S"}
                    size={84}
                    changedAt={student.avatarChangedAt}
                  />
                </div>
              </div>
            </div>

            {/* Name only (no username, no role, no tier name, no rank badge) */}
            <div>
              <h1 className={`text-xl font-black text-black leading-tight ${kh ? "font-google-sans" : ""}`}>
                {displayName}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── Private profile ────────────────────────────────────────────────── */}
      {student.isProfilePublic === false ? (
        <div className="max-w-xl mx-auto px-4 py-12">
          <div style={{ background: "#fff", border: "3px solid #000", boxShadow: "6px 6px 0 #000", padding: "40px" }} className="text-center">
            <div className="flex justify-center mb-6">
              <SignShape shape="octagon" body="#ef4444" size={84}>
                <Lock size={28} className="text-white" strokeWidth={2.5} />
              </SignShape>
            </div>
            <h3 className={`text-xl font-black text-black mb-2 ${kh ? "font-google-sans" : ""}`} style={kf}>
              {kh ? "គណនីនេះជាគណនីឯកជន" : "This Profile is Private"}
            </h3>
            <p className={`text-gray-500 text-sm max-w-xs mx-auto leading-relaxed mt-2 ${kh ? "font-google-sans" : ""}`} style={kf}>
              {kh
                ? "សិស្សនេះបានកំណត់ព័ត៌មានរបស់ពួកគេជាឯកជន។"
                : "This student has set their profile to private."}
            </p>
          </div>
        </div>

      ) : (

        /* ── Main Content — single "Stats" view with dropdown sections ─────── */
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {!isStatsPublic ? (
            <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000", padding: "48px" }} className="text-center">
              <Shield size={28} className="text-gray-200 mx-auto mb-3" />
              <p className={`font-black text-gray-400 ${kh ? "font-google-sans" : ""}`} style={kf}>
                {kh ? "ស្ថិតិត្រូវបានរក្សាការសម្ងាត់" : "Stats are private"}
              </p>
            </div>
          ) : (
            <>
              {/* Game Info — shown by default */}
              <Section
                id="info" title={kh ? "ព័ត៌មានហ្គេម" : "Game Info"} icon={Trophy}
                open={openSections.info} onToggle={toggleSection} kh={kh} kf={kf}
              >
                <div className="p-4 grid grid-cols-2 gap-3">
                  <StatCard icon={Trophy} kh={kh} accent="#eab308" iconFg="text-black" label={kh ? "ចំណាត់ថ្នាក់" : "Leaderboard Rank"} value={`#${rank}`} />
                  <StatCard icon={Gamepad2} kh={kh} accent="#3b82f6" iconFg="text-white" label={kh ? "ហ្គេមបានលេង" : "Games Played"} value={student.totalGamesPlayed.toLocaleString()} />
                  <StatCard icon={Star} kh={kh} accent="#22c55e" iconFg="text-black" label={kh ? "ពិន្ទុខ្ពស់" : "Highest Score"} value={student.highestScore.toLocaleString()} />
                  <StatCard icon={Zap} kh={kh} accent="#f97316" iconFg="text-black" label={kh ? "ពិន្ទុសរុប" : "Total Points"} value={student.lifetimePoints.toLocaleString()} />
                </div>
              </Section>

              {/* Intro — studies at, grade, room, city, joined */}
              <Section
                id="intro" title={kh ? "ប្រវត្តិ" : "Intro"} icon={GraduationCap}
                open={openSections.intro} onToggle={toggleSection} kh={kh} kf={kf}
              >
                <div className="p-4 space-y-3 text-sm">
                  {isSchoolPublic && student.schoolName && (
                    <div className="flex items-start gap-2.5 text-gray-800">
                      <School size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={kh ? "font-google-sans" : ""} style={kf}>
                        {kh ? "រៀននៅ " : "Studies at "}<strong>{student.schoolName}</strong>
                      </span>
                    </div>
                  )}
                  {isGradePublic && student.gradeLevel && (
                    <div className="flex items-start gap-2.5 text-gray-800">
                      <GraduationCap size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={kh ? "font-google-sans" : ""} style={kf}>
                        <strong>
                          {kh ? gradeKh : getBilingualGrade(student.gradeLevel)}
                          {isSectionPublic && student.section ? `, ${kh ? "ថ្នាក់" : "Room"} ${student.section}` : ""}
                        </strong>
                      </span>
                    </div>
                  )}
                  {isProvincePublic && student.province && (
                    <div className="flex items-start gap-2.5 text-gray-800">
                      <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={kh ? "font-google-sans" : ""} style={kf}>{getBilingualProvince(student.province)}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-gray-800">
                    <Calendar size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className={kh ? "font-google-sans" : ""} style={kf}>
                      {kh ? `ចូលរួម ឆ្នាំ ${joinedYear}` : `Joined ${joinedYear}`}
                    </span>
                  </div>
                </div>
              </Section>

              {/* Game Modes — per-mode score breakdown */}
              <Section
                id="games" title={kh ? "ពិន្ទុតាមរបៀបលេង" : "Game Mode Scores"} icon={Gamepad2}
                open={openSections.games} onToggle={toggleSection} kh={kh} kf={kf}
                count={gameStats.length}
              >
                {gameStats.length === 0 ? (
                  <div className="p-10 text-center">
                    <Gamepad2 size={28} className="text-gray-200 mx-auto mb-3" />
                    <p className={`text-sm font-bold text-gray-400 ${kh ? "font-google-sans" : ""}`} style={kf}>
                      {kh ? "មិនទាន់មានពិន្ទុតាមរបៀបលេង" : "No game-mode scores yet"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y-2 divide-gray-100">
                    {gameStats.map((g) => {
                      const meta = gameLabel(g.gameType);
                      const Icon = meta.Icon;
                      return (
                        <div key={g.gameType} className="flex items-center gap-3 px-5 py-3">
                          <div className="p-2 border-2 border-black flex-shrink-0" style={{ background: meta.color }}>
                            <Icon size={16} className="text-black" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-black text-black truncate ${kh ? "font-google-sans" : ""}`} style={kf}>
                              {kh ? meta.kh : meta.en}
                            </p>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide" style={kf}>
                              {g.plays.toLocaleString()} {kh ? "ដង" : g.plays === 1 ? "play" : "plays"}
                            </p>
                          </div>
                          <span className="text-base font-black font-mono tabular-nums text-black flex-shrink-0">
                            {g.points.toLocaleString()} <span className="text-[11px] text-gray-400">PTS</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* Items Claimed */}
              <Section
                id="rewards" title={kh ? "រង្វាន់ដែលបានប្តូរ" : "Items Claimed"} icon={Gift}
                open={openSections.rewards} onToggle={toggleSection} kh={kh} kf={kf}
                count={claimedItems.length}
              >
                {claimedItems.length === 0 ? (
                  <div className="p-10 text-center">
                    <Gift size={28} className="text-gray-200 mx-auto mb-3" />
                    <p className={`text-sm font-bold text-gray-400 ${kh ? "font-google-sans" : ""}`} style={kf}>
                      {kh ? "មិនទាន់មានការប្តូររង្វាន់" : "No rewards claimed yet"}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {claimedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50"
                        style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
                      >
                        <div className="w-12 h-12 bg-white flex items-center justify-center flex-shrink-0"
                          style={{ border: "2px solid #000" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-black text-black truncate ${kh ? "font-google-sans" : ""}`} style={kf}>
                            {kh ? item.nameKh : item.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono font-bold">{item.cost} PTS</p>
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle2 size={10} className="text-green-600" />
                            <span className={`text-[10px] text-green-700 font-black uppercase ${kh ? "font-google-sans" : ""}`} style={kf}>
                              {kh ? "បានប្តូរ" : "Claimed"}
                            </span>
                            {item.claimedAt && (
                              <span className="text-[10px] text-gray-400 font-mono ml-1">
                                · {new Date(item.claimedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      )}

      {/* ── Chevron tape divider ───────────────────────────────────────────── */}
      <div className="mt-10 border-y-2 border-black">
        <CautionTape variant="chevron" height={14} />
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-10 pb-10 text-center px-4">
        <p className="text-xs text-gray-400 font-mono">
          Kesararam with Digital © 2026 · kesararamwithdigital.tech
        </p>
      </footer>

    </div>
  );
}
