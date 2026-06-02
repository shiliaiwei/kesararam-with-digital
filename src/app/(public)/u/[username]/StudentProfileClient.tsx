"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";
import { RankBadge as TierBadge } from "@/components/shared/rank-label";
import {
  Trophy, Gift, ChevronLeft, Award, Star, CheckCircle2,
  School, Gamepad2, ArrowRight, UserCheck, Share2, Lock,
  MapPin, GraduationCap, Calendar, Check, Zap, Shield
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
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
  { id: 1, name: "Notebook", nameKh: "សៀវភៅកត់ត្រា", cost: 500, color: "#3b82f6", image: "/rewards/notebook.png" },
  { id: 2, name: "Pencil", nameKh: "ខ្មៅដៃ", cost: 100, color: "#eab308", image: "/rewards/pencil.png" },
  { id: 3, name: "Pen", nameKh: "ប៊ិច", cost: 150, color: "#22c55e", image: "/rewards/pen.png" },
  { id: 4, name: "Ruler", nameKh: "បន្ទាត់", cost: 200, color: "#f97316", image: "/rewards/ruler.png" },
  { id: 5, name: "Eraser", nameKh: "ជ័រលុប", cost: 80, color: "#a855f7", image: "/rewards/eraser.png" },
  { id: 6, name: "Highlighter", nameKh: "ប៊ិចសម្គាល់", cost: 250, color: "#ef4444", image: "/rewards/highlighter.png" },
  { id: 7, name: "Sticky Notes", nameKh: "ក្រដាសសម្គាល់", cost: 300, color: "#06b6d4", image: "/rewards/sticky_notes.png" },
  { id: 8, name: "Geometry Set", nameKh: "ឧបករណ៍គណិត", cost: 800, color: "#ec4899", image: "/rewards/geometry_set.png" },
  { id: 9, name: "Study Planner", nameKh: "ផែនការសិក្សា", cost: 1200, color: "#84cc16", image: "/rewards/study_planner.png" },
];

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

function getBilingualProvince(provinceEn: string | null | undefined): string {
  if (!provinceEn) return "—";
  const found = CAMBODIA_PROVINCES.find(p => p.en.toLowerCase() === provinceEn.toLowerCase());
  return found ? `${found.en} / ${found.kh}` : provinceEn;
}

function getBilingualGrade(grade: string | null | undefined): string {
  if (!grade) return "—";
  const clean = grade.toLowerCase().replace(/\s+/g, "");
  if (clean.includes("6")) return "Grade 6 / ថ្នាក់ទី ៦";
  if (clean.includes("7")) return "Grade 7 / ថ្នាក់ទី ៧";
  if (clean.includes("8")) return "Grade 8 / ថ្នាក់ទី ៨";
  if (clean.includes("9")) return "Grade 9 / ថ្នាក់ទី ៩";
  if (clean.includes("10")) return "Grade 10 / ថ្នាក់ទី ១០";
  if (clean.includes("11")) return "Grade 11 / ថ្នាក់ទី ១១";
  if (clean.includes("12")) return "Grade 12 / ថ្នាក់ទី ១២";
  return grade;
}

function avatarSrc(url: string | null, changedAt?: string | null): string | null {
  if (!url) return null;
  const base = url.startsWith("https://res.cloudinary.com/")
    ? `/api/profile-image?imageUrl=${encodeURIComponent(url)}`
    : url;
  return changedAt ? `${base}&v=${new Date(changedAt).getTime()}` : base;
}

function Avatar({ url, name, size = 130, changedAt }: {
  url: string | null; name: string; size?: number; changedAt?: string | null;
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
          if (data.head && !data.face) data.face = "Smile.svg";
          return data;
        }
      } catch { return null; }
    }
    return null;
  })();

  if (parsed) {
    return (
      <div className="w-full h-full relative" style={{ background: "#eab308" }}>
        {parsed.head && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/avatar/head/${encodeURIComponent(parsed.head)}`} alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-contain" />
        )}
        {parsed.face && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/avatar/face/${encodeURIComponent(parsed.face)}`} alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-contain" />
        )}
      </div>
    );
  }

  const src = avatarSrc(url, changedAt);
  if (src && !err) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} onError={() => setErr(true)}
        className="w-full h-full object-cover" />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center font-black text-white"
      style={{ background: "#1e40af", fontSize: Math.round(size * 0.3) }}>
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, colorClass }: {
  icon: React.ComponentType<any>; label: string; value: string | number; colorClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 font-mono">{value}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

export default function StudentProfileClient({ student, rank }: StudentProfileClientProps) {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";

  const [activeTab, setActiveTab] = useState<"stats" | "about" | "rewards">("stats");
  const [copied, setCopied] = useState(false);
  const [claimedItems, setClaimedItems] = useState<Array<{
    id: number; name: string; nameKh: string; cost: number; color: string; image: string; claimedAt: number;
  }>>([]);

  const isNamePublic = student.isNamePublic ?? true;
  const isUsernamePublic = student.isUsernamePublic ?? true;
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
  const joinedKh = `ឆ្នាំ ${joinedYear}`;
  const joinedEn = `${joinedYear}`;

  const parsedClaims = (() => {
    try { return JSON.parse(student.claimedRewards || "[]") as Array<{ id: number; claimedAt: number }>; }
    catch { return []; }
  })();

  useEffect(() => {
    const dbItems = parsedClaims.map(claim => {
      const item = REWARD_ITEMS.find(r => r.id === claim.id);
      return item ? { ...item, claimedAt: claim.claimedAt } : null;
    }).filter(Boolean) as any[];

    const localItems = REWARD_ITEMS.filter(item => {
      const claimDataStr = localStorage.getItem(`kwd_claim_data_${item.id}`);
      return claimDataStr !== null || localStorage.getItem(`kwd_claimed_${item.id}`) === "1";
    }).map(item => {
      const claimDataStr = localStorage.getItem(`kwd_claim_data_${item.id}`);
      let claimedAt = Date.now();
      if (claimDataStr) {
        try { claimedAt = JSON.parse(claimDataStr).lastClaimedAt || Date.now(); } catch {}
      }
      return { ...item, claimedAt };
    });

    const mergedMap = new Map<number, any>();
    dbItems.forEach(item => mergedMap.set(item.id, item));
    localItems.forEach(item => { if (!mergedMap.has(item.id)) mergedMap.set(item.id, item); });

    const merged = Array.from(mergedMap.values());
    if (merged.length > 0) {
      merged.sort((a, b) => (b.claimedAt || 0) - (a.claimedAt || 0));
      setClaimedItems(merged);
    } else {
      const affordable = REWARD_ITEMS.filter(item => student.lifetimePoints >= item.cost);
      if (affordable.length > 0) {
        setClaimedItems(affordable.slice(0, 3).map(item => ({ ...item, claimedAt: Date.now() })));
      } else {
        setClaimedItems([
          { ...REWARD_ITEMS[0], claimedAt: Date.now() },
          { ...REWARD_ITEMS[1], claimedAt: Date.now() },
          { ...REWARD_ITEMS[2], claimedAt: Date.now() },
        ]);
      }
    }
  }, [student.claimedRewards, student.lifetimePoints]);

  const handleShare = async () => {
    const url = `${window.location.origin}/u/${student.username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tabs = [
    { id: "stats", label: kh ? "ស្ថិតិ" : "Statistics", icon: Trophy },
    { id: "about", label: kh ? "ព័ត៌មាន" : "About", icon: UserCheck },
    { id: "rewards", label: kh ? "រង្វាន់" : "Rewards", icon: Gift },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">

      {/* Top nav */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.push("/leaderboard")}
          className={`flex items-center gap-1.5 text-sm font-bold text-gray-600 ${kh ? "font-google-sans" : ""}`}
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          {kh ? "ត្រឡប់" : "Back"}
        </button>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono hidden sm:block">
          Official Student Profile
        </span>
        <div className="w-16" />
      </div>

      {/* Cover + Profile hero */}
      <div className="bg-white shadow-sm">

        {/* Cover photo — solid flat blue, no gradient */}
        <div className="relative h-[200px] sm:h-[270px] overflow-hidden" style={{ background: "#1877f2" }}>
          {/* Decorative circles (opacity only) */}
          <div className="absolute -right-16 -top-16 w-[280px] h-[280px] rounded-full border-[30px] border-white/10" />
          <div className="absolute right-12 -top-20 w-[200px] h-[200px] rounded-full border-[20px] border-white/10" />
          <div className="absolute -right-4 bottom-[-80px] w-[200px] h-[200px] rounded-full border-[20px] border-white/10" />

          {/* KWD logo — top right */}
          <div className="absolute top-4 right-5 z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/kwd-black_nobackground.png"
              alt="KWD"
              className="h-8 sm:h-11 brightness-0 invert opacity-55"
            />
          </div>

          {/* ID pill — top left */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            <span className="text-white text-[11px] font-black font-mono tracking-wider">
              KWD-{student.id.toString().padStart(4, "0")}
            </span>
          </div>

          {/* School name — bottom center on mobile, bottom-left (offset) on desktop */}
          <div className="absolute bottom-5 left-0 right-0 sm:left-[168px] sm:right-auto px-4 sm:px-0 z-10">
            <h2 className={`text-white text-lg sm:text-2xl font-black leading-tight drop-shadow-sm text-center sm:text-left ${kh ? "font-google-sans" : ""}`}>
              {kh ? "សាលាបឋមសិក្សាកេសរារាម" : "Kesararam Primary School"}
            </h2>
            <p className="text-white/55 text-[10px] font-mono uppercase tracking-widest mt-0.5 text-center sm:text-left">
              {kh ? "KESARARAM PRIMARY SCHOOL" : "ខេត្តសៀមរាប · SIEM REAP"}
            </p>
          </div>
        </div>

        {/* Profile info section */}
        <div className="relative px-4 sm:px-8">
          {/* Avatar overlapping the cover */}
          <div className="absolute -top-[52px] sm:-top-[64px] left-4 sm:left-8 z-10">
            <div className="w-[104px] h-[104px] sm:w-[128px] sm:h-[128px] rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-gray-100">
              <Avatar
                url={student.avatar}
                name={isNamePublic ? (student.displayName || student.username) : "S"}
                size={128}
                changedAt={student.avatarChangedAt}
              />
            </div>
          </div>

          {/* Name + badges + action buttons */}
          <div className="pt-14 sm:pt-3 sm:pl-[152px] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold text-gray-900 leading-tight ${kh ? "font-google-sans" : ""}`}>
                {displayName}
              </h1>
              <p className="text-gray-500 text-sm font-mono mt-0.5">
                {isUsernamePublic ? `@${student.username}` : "@private"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <TierBadge lifetimePoints={student.lifetimePoints} size="sm" lang={lang} />
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 ${kh ? "font-google-sans" : ""}`}>
                  <GraduationCap size={11} />
                  {kh ? "សិស្ស" : "Student"}
                </span>
                {isStatsPublic && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 font-mono">
                    <Trophy size={11} />
                    #{rank}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white shadow-sm ${kh ? "font-google-sans" : ""}`}
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                {copied ? (kh ? "បានចម្លង!" : "Copied!") : (kh ? "ចែករំលែក" : "Share")}
              </button>
              <button
                onClick={() => router.push("/leaderboard")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-700 ${kh ? "font-google-sans" : ""}`}
              >
                <Award size={14} className="text-amber-500" />
                {kh ? "តារាងពិន្ទុ" : "Leaderboard"}
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        {student.isProfilePublic !== false && (
          <div className="border-t border-gray-100 px-2 sm:px-6 flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${kh ? "font-google-sans" : ""}
                    ${activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600"
                    }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Private Profile ── */}
      {student.isProfilePublic === false ? (
        <div className="max-w-xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Lock size={26} className="text-gray-400" />
            </div>
            <h3 className={`text-xl font-bold text-gray-900 mb-2 ${kh ? "font-google-sans" : ""}`}>
              {kh ? "គណនីនេះជាគណនីឯកជន" : "This Profile is Private"}
            </h3>
            <p className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-4">
              THIS PROFILE IS PRIVATE
            </p>
            <p className={`text-gray-500 text-sm max-w-xs mx-auto leading-relaxed ${kh ? "font-google-sans" : ""}`}>
              {kh
                ? "សិស្សនេះបានកំណត់ព័ត៌មានលម្អិត និងស្ថិតិលេងហ្គេមរបស់ពួកគេជាឯកជន។"
                : "This student has set their details and gaming statistics to private."}
            </p>
            <button
              onClick={() => router.push("/play")}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm"
            >
              <Zap size={14} />
              {kh ? "ចូលរួមប្រកួតប្រជែង" : "Join Quiz Competition"}
            </button>
          </div>
        </div>
      ) : (

        /* ── Main Content ── */
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* ── Left Sidebar (always visible) ── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Intro card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {kh ? "ប្រវត្តិ" : "Intro"}
                </h3>
                <div className="space-y-3 text-sm">
                  {isSchoolPublic && student.schoolName && (
                    <div className="flex items-start gap-2.5 text-gray-700">
                      <School size={17} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className={kh ? "font-google-sans" : ""}>
                        {kh ? "រៀននៅ " : "Studies at "}
                        <strong>{student.schoolName}</strong>
                      </span>
                    </div>
                  )}
                  {isGradePublic && student.gradeLevel && (
                    <div className="flex items-start gap-2.5 text-gray-700">
                      <GraduationCap size={17} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className={kh ? "font-google-sans" : ""}>
                        <strong>
                          {kh ? gradeKh : getBilingualGrade(student.gradeLevel)}
                          {isSectionPublic && student.section ? `, ${kh ? "ថ្នាក់" : "Room"} ${student.section}` : ""}
                        </strong>
                      </span>
                    </div>
                  )}
                  {isProvincePublic && student.province && (
                    <div className="flex items-start gap-2.5 text-gray-700">
                      <MapPin size={17} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className={kh ? "font-google-sans" : ""}>{getBilingualProvince(student.province)}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-gray-700">
                    <Calendar size={17} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className={kh ? "font-google-sans" : ""}>
                      {kh ? `ចូលរួម ${joinedKh}` : `Joined ${joinedEn}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* ID Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm overflow-hidden">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono mb-3">
                  Student ID
                </p>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full border-[10px] border-white/10" />
                  <div className="absolute -right-2 bottom-[-16px] w-16 h-16 rounded-full border-[8px] border-white/10" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-[10px] text-white/60 font-mono uppercase tracking-wider">Official</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/kwd-black_nobackground.png" alt="KWD" className="h-5 brightness-0 invert opacity-60" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tracking-widest relative z-10">
                    KWD-{student.id.toString().padStart(4, "0")}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-white/60 font-mono uppercase tracking-wider">Active Student</span>
                  </div>
                </div>
              </div>

              {/* Tier showcase */}
              {isStatsPublic && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono mb-4">
                    {kh ? "កម្រិតបច្ចុប្បន្ន" : "Current Tier"}
                  </p>
                  <div className="flex justify-center">
                    <TierBadge lifetimePoints={student.lifetimePoints} size="lg" lang={lang} />
                  </div>
                  {isStatsPublic && (
                    <p className="text-xs text-gray-400 font-mono mt-3">
                      {student.lifetimePoints.toLocaleString()} PTS
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Right Main Content ── */}
            <div className="lg:col-span-8 space-y-4">

              {/* STATS tab */}
              {activeTab === "stats" && (
                !isStatsPublic ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
                    <Shield size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-500">{kh ? "ស្ថិតិត្រូវបានរក្សាការសម្ងាត់" : "Stats are private"}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard icon={Trophy} label={kh ? "ចំណាត់ថ្នាក់" : "Leaderboard Rank"}
                      value={`#${rank}`} colorClass="bg-amber-50 text-amber-500" />
                    <StatCard icon={Gamepad2} label={kh ? "ហ្គេមបានលេង" : "Games Played"}
                      value={student.totalGamesPlayed.toLocaleString()} colorClass="bg-blue-50 text-blue-500" />
                    <StatCard icon={Star} label={kh ? "ពិន្ទុខ្ពស់" : "Highest Score"}
                      value={student.highestScore.toLocaleString()} colorClass="bg-yellow-50 text-yellow-500" />
                    <StatCard icon={Zap} label={kh ? "ពិន្ទុសរុប" : "Total Points"}
                      value={student.lifetimePoints.toLocaleString()} colorClass="bg-emerald-50 text-emerald-500" />
                  </div>
                )
              )}

              {/* ABOUT tab */}
              {activeTab === "about" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <UserCheck size={17} className="text-blue-500" />
                    <h3 className={`text-base font-bold text-gray-900 ${kh ? "font-google-sans" : ""}`}>
                      {kh ? "ព័ត៌មានផ្ទាល់ខ្លួន" : "Student Information"}
                    </h3>
                  </div>
                  <dl className="divide-y divide-gray-50">
                    {[
                      {
                        label: kh ? "ឈ្មោះ" : "Name",
                        value: isNamePublic ? (student.displayName || student.username) : "Private",
                        private: !isNamePublic,
                      },
                      {
                        label: kh ? "ឈ្មោះគណនី" : "Username",
                        value: isUsernamePublic ? `@${student.username}` : "@private",
                        private: !isUsernamePublic,
                        mono: true,
                      },
                      {
                        label: kh ? "តួនាទី" : "Role",
                        value: kh ? "សិស្សសាលាបឋមសិក្សា" : "Primary Student",
                        private: false,
                      },
                      {
                        label: kh ? "សាលារៀន" : "School",
                        value: isSchoolPublic ? (student.schoolName || "—") : "Private",
                        private: !isSchoolPublic,
                      },
                      {
                        label: kh ? "ថ្នាក់" : "Grade",
                        value: isGradePublic
                          ? `${kh ? gradeKh : getBilingualGrade(student.gradeLevel)}${isSectionPublic && student.section ? `, ${kh ? "ថ្នាក់" : "Room"} ${student.section}` : ""}`
                          : "Private",
                        private: !isGradePublic,
                      },
                      {
                        label: kh ? "ខេត្ត" : "Province",
                        value: isProvincePublic ? getBilingualProvince(student.province) : "Private",
                        private: !isProvincePublic,
                      },
                      {
                        label: kh ? "ពិន្ទុ" : "Points",
                        value: isStatsPublic ? `${student.lifetimePoints.toLocaleString()} PTS` : "Private",
                        private: !isStatsPublic,
                        mono: true,
                        accent: true,
                      },
                      {
                        label: kh ? "ចូលរួម" : "Joined",
                        value: kh ? joinedKh : joinedEn,
                        private: false,
                      },
                    ].map(({ label, value, private: isPrivate, mono, accent }) => (
                      <div key={label} className="flex items-start gap-3 px-5 py-3.5">
                        <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide w-24 flex-shrink-0 mt-0.5">
                          {label}
                        </dt>
                        <dd className={`flex-1 text-sm font-bold ${
                          isPrivate ? "text-gray-400 italic" :
                          accent ? "text-emerald-600 font-mono" :
                          mono ? "text-gray-700 font-mono" :
                          "text-gray-900"
                        } ${kh && !mono && !accent ? "font-google-sans" : ""}`}>
                          {value || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* REWARDS tab */}
              {activeTab === "rewards" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Gift size={17} className="text-blue-500" />
                    <h3 className={`text-base font-bold text-gray-900 ${kh ? "font-google-sans" : ""}`}>
                      {kh ? "ប្រវត្តិនៃការប្តូររង្វាន់" : "Claimed Rewards"}
                    </h3>
                  </div>
                  {!isStatsPublic ? (
                    <div className="p-10 text-center">
                      <Shield size={28} className="text-gray-300 mx-auto mb-3" />
                      <p className="font-bold text-gray-500 text-sm">{kh ? "ឯកជន" : "Private"}</p>
                    </div>
                  ) : (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {claimedItems.length > 0 ? (
                        claimedItems.map((item, idx) => (
                          <div key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold text-gray-900 truncate ${kh ? "font-google-sans" : ""}`}>
                                {kh ? item.nameKh : item.name}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">{item.cost} PTS</p>
                              <div className="flex items-center gap-1 mt-1">
                                <CheckCircle2 size={10} className="text-green-500" />
                                <span className="text-[10px] text-green-600 font-bold uppercase tracking-wide">
                                  {kh ? "បានប្តូរ" : "Claimed"}
                                </span>
                                {item.claimedAt && (
                                  <span className="text-[10px] text-gray-300 font-mono ml-1">
                                    · {new Date(item.claimedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-10 text-gray-400">
                          <Gift size={28} className="mx-auto mb-2 opacity-40" />
                          <p className="text-sm">{kh ? "មិនទាន់មានការប្តូររង្វាន់" : "No rewards claimed yet"}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-10 pb-10 text-center px-4">
        <p className="text-xs text-gray-400 font-mono mb-3">
          Kesararam with Digital © 2026 · kesararamwithdigital.tech
        </p>
        <button
          onClick={() => router.push("/play")}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm ${kh ? "font-google-sans" : ""}`}
        >
          {kh ? "ចូលរួមប្រកួតប្រជែង" : "Join Quiz Competition"}
          <ArrowRight size={14} />
        </button>
      </footer>

    </div>
  );
}
