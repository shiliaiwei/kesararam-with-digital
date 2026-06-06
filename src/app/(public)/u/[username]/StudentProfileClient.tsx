"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";
import { RankBadge as TierBadge } from "@/components/shared/rank-label";
import {
  Trophy, Gift, ChevronLeft, Award, Star, CheckCircle2,
  Gamepad2, ArrowRight, UserCheck, Share2, Lock,
  MapPin, GraduationCap, Calendar, Check, Zap, Shield,
  School,
} from "lucide-react";
import { CautionTape, SignShape } from "@/components/brand/brand-kit";

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

interface StudentProfileClientProps {
  student: SerializableStudent;
  rank: number;
}

const REWARD_ITEMS = [
  { id: 1, name: "Premium Executive Notebook",       nameKh: "សៀវភៅកត់ត្រា",   cost: 500,  image: "/rewards/notebook.webp" },
  { id: 2, name: "Premium Mechanical Pencil",         nameKh: "ខ្មៅដៃ",            cost: 100,  image: "/rewards/pencil.webp" },
  { id: 3, name: "Premium Fountain Pen",            nameKh: "ប៊ិច",               cost: 150,  image: "/rewards/pen.webp" },
  { id: 4, name: "Premium Architectural Ruler",          nameKh: "បន្ទាត់",            cost: 200,  image: "/rewards/ruler.webp" },
  { id: 5, name: "Premium Designer Eraser",         nameKh: "ជ័រលុប",             cost: 80,   image: "/rewards/eraser.webp" },
  { id: 6, name: "Premium Highlighter",    nameKh: "ប៊ិចសម្គាល់",        cost: 250,  image: "/rewards/highlighter.webp" },
  { id: 7, name: "Premium Sticky Notes Set",   nameKh: "ក្រដាសសម្គាល់",      cost: 300,  image: "/rewards/sticky_notes.webp" },
  { id: 8, name: "Premium Geometry Kit",   nameKh: "ឧបករណ៍គណិត",       cost: 800,  image: "/rewards/geometry_set.webp" },
  { id: 9, name: "Premium Study Planner",  nameKh: "ផែនការសិក្សា",       cost: 1200, image: "/rewards/study_planner.webp" },
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
  const khNum: Record<string, string> = { "6":"៦","7":"៧","8":"៨","9":"៩","10":"១០","11":"១១","12":"១២" };
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
        {parsed.face && <img src={`/avatar/face/${encodeURIComponent(parsed.face)}`} alt="" aria-hidden className="absolute inset-0 w-full h-full object-contain" />}
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

// Sign-style stat card: semantic color strip (like a road sign) + iconed badge,
// flat brutalist (solid black border, hard offset shadow). No gradients / neon.
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

export default function StudentProfileClient({ student, rank }: StudentProfileClientProps) {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [activeTab, setActiveTab] = useState<"stats" | "about" | "rewards">("stats");
  const [copied, setCopied] = useState(false);
  const [claimedItems, setClaimedItems] = useState<Array<{
    id: number; name: string; nameKh: string; cost: number; image: string; claimedAt: number;
  }>>([]);

  const isNamePublic     = student.isNamePublic     ?? true;
  const isUsernamePublic = student.isUsernamePublic ?? true;
  const isSchoolPublic   = student.isSchoolPublic   ?? true;
  const isProvincePublic = student.isProvincePublic ?? true;
  const isGradePublic    = student.isGradePublic    ?? true;
  const isSectionPublic  = student.isSectionPublic  ?? true;
  const isStatsPublic    = student.isStatsPublic    ?? true;

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

  const handleShare = async () => {
    const url = `${window.location.origin}/u/${student.username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tabs = [
    { id: "stats"   as const, label: kh ? "ស្ថិតិ"    : "Statistics", icon: Trophy    },
    { id: "about"   as const, label: kh ? "ព័ត៌មាន"   : "About",      icon: UserCheck  },
    { id: "rewards" as const, label: kh ? "រង្វាន់"   : "Rewards",    icon: Gift      },
  ];

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

            {/* Name + badges */}
            <div>
              <h1 className={`text-xl font-black text-black leading-tight mb-0.5 ${kh ? "font-google-sans" : ""}`} style={kf}>
                {displayName}
              </h1>
              <p className="text-sm text-gray-500 font-mono">
                {isUsernamePublic ? `@${student.username}` : "@private"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <TierBadge lifetimePoints={student.lifetimePoints} size="sm" lang={lang} />
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide px-2 py-0.5 border-2 border-black ${kh ? "font-google-sans" : ""}`}
                  style={{ background: "#eab308", color: "#000" }}
                >
                  <GraduationCap size={11} />
                  {kh ? "សិស្ស" : "Student"}
                </span>
                {isStatsPublic && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black font-mono px-2 py-0.5 border-2 border-black"
                    style={{ background: "#000", color: "#eab308" }}>
                    <Trophy size={11} />
                    #{rank}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-black uppercase ${kh ? "font-google-sans" : ""}`}
              style={{ background: "#eab308", border: "2px solid #000", boxShadow: "3px 3px 0 #000", color: "#000" }}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? (kh ? "បានចម្លង!" : "Copied!") : (kh ? "ចែករំលែក" : "Share")}
            </button>
            <button
              onClick={() => router.push("/leaderboard")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-black uppercase ${kh ? "font-google-sans" : ""}`}
              style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000", color: "#000" }}
            >
              <Award size={14} />
              {kh ? "តារាងពិន្ទុ" : "Rank"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        {student.isProfilePublic !== false && (
          <div style={{ borderTop: "2px solid #000", display: "flex", overflowX: "auto" }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-black uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${kh ? "font-google-sans" : ""}`}
                  style={{
                    borderBottom: activeTab === tab.id ? "3px solid #eab308" : "3px solid transparent",
                    background: activeTab === tab.id ? "#fffbeb" : "transparent",
                    color: activeTab === tab.id ? "#000" : "#6b7280",
                    borderRight: "1px solid rgba(0,0,0,0.08)",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
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
            <button
              onClick={() => router.push("/play")}
              className={`mt-6 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase ${kh ? "font-google-sans" : ""}`}
              style={{ background: "#eab308", color: "#000", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}
            >
              <Zap size={14} />
              {kh ? "ចូលរួមប្រកួតប្រជែង" : "Join Quiz Competition"}
            </button>
          </div>
        </div>

      ) : (

        /* ── Main Content ─────────────────────────────────────────────────── */
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* ── Left Sidebar ──────────────────────────────────────────── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Intro card */}
              <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}>
                <div style={{ background: "#eab308", borderBottom: "2px solid #000", padding: "6px 16px" }}>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${kh ? "font-google-sans" : ""}`} style={kf}>
                    {kh ? "ប្រវត្តិ" : "Intro"}
                  </span>
                </div>
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
              </div>

              {/* Student ID card */}
              <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000", padding: "16px" }}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono mb-3">
                  {kh ? "លេខសម្គាល់សិស្ស" : "Student ID"}
                </p>
                <div style={{ background: "#0284c7", border: "2px solid #000", padding: "16px", position: "relative", overflow: "hidden" }}>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-[10px] text-white/70 font-mono uppercase tracking-wider">Official</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/kwd-black_nobackground.png" alt="KWD" className="h-5 brightness-0 invert opacity-80" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tracking-widest relative z-10">
                    KWD-{student.id.toString().padStart(4, "0")}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 relative z-10">
                    <div className="w-2 h-2 bg-emerald-400 border border-black" />
                    <span className="text-[10px] text-white/70 font-mono uppercase tracking-wider">
                      {kh ? "សិស្សសកម្ម" : "Active Student"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Tier */}
              {isStatsPublic && (
                <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000", padding: "20px" }} className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono mb-4" style={kf}>
                    {kh ? "កម្រិតបច្ចុប្បន្ន" : "Current Tier"}
                  </p>
                  <div className="flex justify-center mb-3">
                    <TierBadge lifetimePoints={student.lifetimePoints} size="md" lang={lang} />
                  </div>
                  <p className="text-sm font-black font-mono text-black">
                    {student.lifetimePoints.toLocaleString()} PTS
                  </p>
                </div>
              )}
            </div>

            {/* ── Right Main Content ─────────────────────────────────────── */}
            <div className="lg:col-span-8 space-y-4">

              {/* STATS tab */}
              {activeTab === "stats" && (
                !isStatsPublic ? (
                  <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000", padding: "48px" }} className="text-center">
                    <Shield size={28} className="text-gray-200 mx-auto mb-3" />
                    <p className={`font-black text-gray-400 ${kh ? "font-google-sans" : ""}`} style={kf}>
                      {kh ? "ស្ថិតិត្រូវបានរក្សាការសម្ងាត់" : "Stats are private"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard icon={Trophy}   kh={kh} accent="#eab308" iconFg="text-black" label={kh ? "ចំណាត់ថ្នាក់"    : "Leaderboard Rank"} value={`#${rank}`} />
                    <StatCard icon={Gamepad2} kh={kh} accent="#3b82f6" iconFg="text-white" label={kh ? "ហ្គេមបានលេង"     : "Games Played"}     value={student.totalGamesPlayed.toLocaleString()} />
                    <StatCard icon={Star}     kh={kh} accent="#22c55e" iconFg="text-black" label={kh ? "ពិន្ទុខ្ពស់"     : "Highest Score"}    value={student.highestScore.toLocaleString()} />
                    <StatCard icon={Zap}      kh={kh} accent="#f97316" iconFg="text-black" label={kh ? "ពិន្ទុសរុប"      : "Total Points"}     value={student.lifetimePoints.toLocaleString()} />
                  </div>
                )
              )}

              {/* ABOUT tab */}
              {activeTab === "about" && (
                <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}>
                  <div style={{ background: "#eab308", borderBottom: "2px solid #000", padding: "8px 16px" }} className="flex items-center gap-2">
                    <UserCheck size={15} className="text-black" />
                    <h3 className={`text-sm font-black uppercase tracking-wide text-black ${kh ? "font-google-sans" : ""}`} style={kf}>
                      {kh ? "ព័ត៌មានផ្ទាល់ខ្លួន" : "Student Information"}
                    </h3>
                  </div>
                  <dl className="divide-y divide-gray-100">
                    {([
                      { label: kh ? "ឈ្មោះ"       : "Name",     value: isNamePublic     ? (student.displayName || student.username) : "Private", priv: !isNamePublic },
                      { label: kh ? "ឈ្មោះគណនី"  : "Username", value: isUsernamePublic  ? `@${student.username}`                     : "@private", priv: !isUsernamePublic, mono: true },
                      { label: kh ? "តួនាទី"      : "Role",     value: kh ? "សិស្សសាលា" : "Student", priv: false },
                      { label: kh ? "សាលារៀន"     : "School",   value: isSchoolPublic    ? (student.schoolName || "—")                : "Private", priv: !isSchoolPublic },
                      { label: kh ? "ថ្នាក់"       : "Grade",    value: isGradePublic
                          ? `${kh ? gradeKh : getBilingualGrade(student.gradeLevel)}${isSectionPublic && student.section ? `, ${kh ? "ថ្នាក់" : "Room"} ${student.section}` : ""}`
                          : "Private", priv: !isGradePublic },
                      { label: kh ? "ខេត្ត"        : "Province", value: isProvincePublic  ? getBilingualProvince(student.province)     : "Private", priv: !isProvincePublic },
                      { label: kh ? "ពិន្ទុ"       : "Points",   value: isStatsPublic    ? `${student.lifetimePoints.toLocaleString()} PTS` : "Private", priv: !isStatsPublic, mono: true, accent: true },
                      { label: kh ? "ចូលរួម"      : "Joined",   value: kh ? `ឆ្នាំ ${joinedYear}` : `${joinedYear}`, priv: false },
                    ] as { label: string; value: string; priv: boolean; mono?: boolean; accent?: boolean }[]).map(({ label, value, priv, mono, accent }) => (
                      <div key={label} className="flex items-start gap-3 px-5 py-3.5">
                        <dt className="text-[11px] font-bold text-gray-400 uppercase tracking-wide w-24 flex-shrink-0 mt-0.5" style={kf}>{label}</dt>
                        <dd className={`flex-1 text-sm font-bold ${
                          priv ? "text-gray-400 italic" : accent ? "text-emerald-600 font-mono" : mono ? "text-gray-700 font-mono" : "text-gray-900"
                        } ${kh && !mono && !accent ? "font-google-sans" : ""}`} style={kh && !mono && !accent ? kf : {}}>
                          {value || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* REWARDS tab */}
              {activeTab === "rewards" && (
                <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}>
                  <div style={{ background: "#eab308", borderBottom: "2px solid #000", padding: "8px 16px" }} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift size={15} className="text-black" />
                      <h3 className={`text-sm font-black uppercase tracking-wide text-black ${kh ? "font-google-sans" : ""}`} style={kf}>
                        {kh ? "ប្រវត្តិនៃការប្តូររង្វាន់" : "Claimed Rewards"}
                      </h3>
                    </div>
                    <span className="text-[10px] font-black font-mono bg-black text-white px-2 py-0.5">
                      {claimedItems.length}
                    </span>
                  </div>

                  {!isStatsPublic ? (
                    <div className="p-10 text-center">
                      <Shield size={24} className="text-gray-200 mx-auto mb-3" />
                      <p className={`font-black text-gray-400 text-sm ${kh ? "font-google-sans" : ""}`} style={kf}>{kh ? "ឯកជន" : "Private"}</p>
                    </div>
                  ) : claimedItems.length === 0 ? (
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
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Chevron tape divider ───────────────────────────────────────────── */}
      <div className="mt-10 border-y-2 border-black">
        <CautionTape variant="chevron" height={14} />
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-10 pb-10 text-center px-4">
        <p className="text-xs text-gray-400 font-mono mb-4">
          Kesararam with Digital © 2026 · kesararamwithdigital.tech
        </p>
        <button
          onClick={() => router.push("/play")}
          className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase ${kh ? "font-google-sans" : ""}`}
          style={{ background: "#eab308", color: "#000", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}
        >
          {kh ? "ចូលរួមប្រកួតប្រជែង" : "Join Quiz Competition"}
          <ArrowRight size={14} />
        </button>
      </footer>

    </div>
  );
}
