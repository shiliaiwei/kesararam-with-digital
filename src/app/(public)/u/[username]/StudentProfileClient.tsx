"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";
import { RankBadge as TierBadge } from "@/components/shared/rank-label";
import { 
  Trophy, 
  Gift, 
  ChevronLeft, 
  Award, 
  Star,
  CheckCircle2,
  School,
  Gamepad2,
  ArrowRight,
  UserCheck
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SerializableStudent {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  avatarChangedAt: string | null; // ISO string
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  createdAt: string; // ISO string
  schoolName: string | null;
  province: string | null;
  gradeLevel: string | null;
  section: string | null;
  claimedRewards: string; // JSON string
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

function Avatar({ url, name, size = 180, changedAt }: {
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
      {parsed ? (
        <div className="w-full h-full rounded-none overflow-hidden relative flex-shrink-0" style={{ background: "#eab308", border: "3px solid #000" }}>
          {parsed.head && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/avatar/head/${encodeURIComponent(parsed.head)}`}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
          {parsed.face && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/avatar/face/${encodeURIComponent(parsed.face)}`}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
        </div>
      ) : (
        (() => {
          const src = avatarSrc(url, changedAt);
          if (src && !err) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={name}
                onError={() => setErr(true)}
                className="w-full h-full object-cover rounded-none"
                style={{ border: "3px solid #000" }}
              />
            );
          }
          return (
            <div
              className="w-full h-full rounded-none flex items-center justify-center font-black text-white"
              style={{
                background: "#27272a",
                border: "3px solid #000",
                fontSize: Math.round(size * 0.3),
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

export default function StudentProfileClient({ student, rank }: StudentProfileClientProps) {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";

  // Individual Privacy checks (Default to true/public)
  const isNamePublic = student.isNamePublic ?? true;
  const isUsernamePublic = student.isUsernamePublic ?? true;
  const isSchoolPublic = student.isSchoolPublic ?? true;
  const isProvincePublic = student.isProvincePublic ?? true;
  const isGradePublic = student.isGradePublic ?? true;
  const isSectionPublic = student.isSectionPublic ?? true;
  const isStatsPublic = student.isStatsPublic ?? true;

  // Calculate grade bilingual dynamically from DB values
  const gradeEn = student.gradeLevel || "—";
  const gradeKh = student.gradeLevel 
    ? (student.gradeLevel.toLowerCase().includes("grade") 
        ? student.gradeLevel.replace(/grade\s*/i, "ថ្នាក់ទី ") 
        : (student.gradeLevel.match(/\d+/) ? `ថ្នាក់ទី ${student.gradeLevel.match(/\d+/)?.[0]}` : student.gradeLevel))
    : "—";

  // Joined year bilingual dynamically
  const joinedYear = student.createdAt ? new Date(student.createdAt).getFullYear() : 2026;
  const joinedKh = `ឆ្នាំ ${joinedYear}`;
  const joinedEn = `${joinedYear}`;

  // Real-time claims parser
  const parsedClaims = (() => {
    try {
      return JSON.parse(student.claimedRewards || "[]") as Array<{ id: number; claimedAt: number }>;
    } catch {
      return [];
    }
  })();

  const [claimedItems, setClaimedItems] = useState<Array<{
    id: number;
    name: string;
    nameKh: string;
    cost: number;
    color: string;
    image: string;
    claimedAt: number;
  }>>([]);

  useEffect(() => {
    // 1. DB-backed claims mapped to REWARD_ITEMS details
    const dbItems = parsedClaims.map(claim => {
      const item = REWARD_ITEMS.find(r => r.id === claim.id);
      return item ? { ...item, claimedAt: claim.claimedAt } : null;
    }).filter(Boolean) as any[];

    // 2. Local storage claims merged for current browser sync
    const localItems = REWARD_ITEMS.filter(item => {
      const claimDataStr = localStorage.getItem(`kwd_claim_data_${item.id}`);
      return claimDataStr !== null || localStorage.getItem(`kwd_claimed_${item.id}`) === "1";
    }).map(item => {
      const claimDataStr = localStorage.getItem(`kwd_claim_data_${item.id}`);
      let claimedAt = Date.now();
      if (claimDataStr) {
        try {
          claimedAt = JSON.parse(claimDataStr).lastClaimedAt || Date.now();
        } catch {}
      }
      return { ...item, claimedAt };
    });

    // 3. Deduplicate claims by ID
    const mergedMap = new Map<number, any>();
    dbItems.forEach(item => mergedMap.set(item.id, item));
    localItems.forEach(item => {
      if (!mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    const merged = Array.from(mergedMap.values());

    if (merged.length > 0) {
      merged.sort((a, b) => (b.claimedAt || 0) - (a.claimedAt || 0));
      setClaimedItems(merged);
    } else {
      // Points based fallback
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

  return (
    <div className="bg-zinc-50 text-zinc-900 min-h-screen py-10 px-4 md:px-8 flex flex-col items-center">
      {/* Inject custom font faces */}
      <style>{`
        @font-face {
          font-family: 'Stack_Sans_Notch';
          src: local('Stack_Sans_Notch'), local('Stack-Sans-Notch'), local('Arial Black'), local('Arial');
          font-weight: 900;
        }
        .font-stack-notch {
          font-family: 'Stack_Sans_Notch', 'Google Sans', sans-serif !important;
        }
        .font-english {
          font-family: 'Stack_Sans_Notch', 'Google Sans', sans-serif !important;
        }
      `}</style>

      <div className="w-full max-w-6xl space-y-8 select-none">
        
        {/* Top navigation row */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <button 
            onClick={() => { router.push('/leaderboard'); }}
            className={`flex items-center gap-2 text-sm font-black uppercase text-zinc-600 hover:text-black transition-all ${kh ? 'font-kh-header' : 'font-stack-notch'}`}
          >
            <ChevronLeft size={18} strokeWidth={3} />
            {kh ? "ត្រឡប់ទៅតារាងពិន្ទុ" : "BACK TO LEADERBOARD"}
          </button>
          
          <span className={`text-[11px] font-black tracking-widest text-zinc-400 uppercase ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
            {kh ? "ព័ត៌មានរូបសិស្សផ្លូវការ" : "OFFICIAL STUDENT PROFILE"}
          </span>
        </div>

        {/* 1. Grand Brutalist School Header Banner - Full Width */}
        <div className="bg-white border-4 border-black p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[6px_6px_0_#000]">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            {/* Traditional Khmer Seal */}
            <svg className="w-16 h-16 text-amber-500 flex-shrink-0 animate-fade-in" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" stroke="#d97706" strokeWidth="3" fill="#fffbeb" />
              <path d="M50 18 L58 44 L54 44 L54 76 L46 76 L46 44 L42 44 Z" fill="#b45309" />
              <path d="M35 32 L42 50 L39 50 L39 76 L33 76 L33 50 L30 50 Z" fill="#b45309" opacity="0.9" />
              <path d="M65 32 L70 50 L67 50 L67 76 L61 76 L61 50 L58 50 Z" fill="#b45309" opacity="0.9" />
              <rect x="18" y="76" width="64" height="4" rx="1" fill="#b45309" />
            </svg>
            
            <div className="space-y-1">
              <h2 className="text-xl md:text-3xl font-black text-blue-900 font-kh-header leading-tight">
                សាលាបឋមសិក្សាកេសរារាម
              </h2>
              <p className="text-xs md:text-sm font-black text-zinc-400 tracking-widest uppercase font-mono">
                KESARARAM PRIMARY SCHOOL
              </p>
            </div>
          </div>

          {/* KWD Logo */}
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/brand/kwd-black_nobackground.png" 
              alt="KWD Logo" 
              className="h-12 md:h-16 object-contain"
            />
          </div>
        </div>

        {/* 2. Blue Identification Stripe Banner */}
        <div className="bg-[#0284c7] border-4 border-black p-5 text-center shadow-[6px_6px_0_#000] relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <span className="text-white text-lg md:text-2xl font-black tracking-widest font-kh-header block leading-none">
              ប័ណ្ណសម្គាល់ខ្លួនសិស្សផ្លូវការ
            </span>
            <span className="text-[10px] md:text-xs text-white/80 font-black uppercase tracking-wider block leading-none font-mono">
              OFFICIAL STUDENT IDENTIFICATION PROFILE
            </span>
          </div>

          <div className="bg-white text-zinc-950 font-black border-2 border-black px-4 py-1.5 shadow-[3px_3px_0_#000] text-sm md:text-base font-mono">
            ID: KWD-{student.id.toString().padStart(4, '0')}
          </div>
        </div>

        {/* 3. Main Grid Layout */}
        {student.isProfilePublic === false ? (
          <div className="bg-white border-4 border-black p-8 md:p-12 text-center shadow-[6px_6px_0_#000] flex flex-col items-center justify-center gap-6 select-none animate-fade-in min-h-[300px]">
            <div className="w-20 h-20 bg-yellow-400 border-4 border-black rounded-none flex items-center justify-center shadow-[4px_4px_0_#000] text-black">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-black text-black font-kh-header leading-tight">
                គណនីនេះជាគណនីឯកជន
              </h3>
              <p className="text-sm md:text-base font-black text-zinc-400 tracking-widest uppercase font-mono">
                THIS PROFILE IS PRIVATE
              </p>
            </div>

            <p className="text-zinc-600 font-bold max-w-md leading-relaxed font-kh-body">
              សិស្សនេះបានកំណត់ព័ត៌មានលម្អិត និងស្ថិតិលេងហ្គេមរបស់ពួកគេជាឯកជន។
              <span className="block mt-1 font-english text-xs text-zinc-500 uppercase tracking-wide">
                This student has set their details and gaming statistics to private.
              </span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Portrait & Credentials */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Passport Portrait Box */}
            <div className="bg-white border-4 border-black p-6 flex flex-col items-center justify-center shadow-[6px_6px_0_#000]">
              <div className="border-4 border-black bg-zinc-100 flex items-center justify-center overflow-hidden p-1 shadow-[4px_4px_0_#000] w-[200px] h-[260px] md:w-[240px] md:h-[312px]">
                <Avatar 
                  url={student.avatar} 
                  name={isNamePublic ? (student.displayName || student.username) : (isUsernamePublic ? student.username : "Student")} 
                  size={240} 
                  changedAt={student.avatarChangedAt} 
                />
              </div>

              {/* Tier Badge Directly Under Avatar */}
              {isStatsPublic && (
                <div className="mt-6 w-full flex flex-col items-center gap-2">
                  <TierBadge lifetimePoints={student.lifetimePoints} size="sm" lang={lang} />
                  <span className="text-xs font-bold text-zinc-400 mt-1 uppercase font-mono tracking-wider">
                    {kh ? "កម្រិតបច្ចុប្បន្ន" : "CURRENT TIER"}
                  </span>
                </div>
              )}
            </div>

            {/* Credentials Card */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000]">
              <h3 className={`text-base font-black uppercase tracking-widest text-zinc-400 border-b-2 border-zinc-200 pb-3 mb-4 flex items-center gap-2 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                <UserCheck size={18} className="text-blue-500" />
                {kh ? "អត្តសញ្ញាណសិស្ស" : "STUDENT CREDENTIALS"}
              </h3>

              <div className={`space-y-3.5 text-sm md:text-base ${kh ? 'font-kh-body' : 'font-english'}`}>
                
                {/* Display Name */}
                <div className="flex flex-col border-b border-zinc-100 pb-2">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase font-english tracking-wider">
                    {kh ? "ឈ្មោះសិស្ស / Student Name" : "Student Name / ឈ្មោះសិស្ស"}
                  </span>
                  <span className="font-black text-zinc-950 text-base md:text-lg mt-0.5">
                    {isNamePublic ? (student.displayName || student.username) : "Private / រក្សាការសម្ងាត់"}
                  </span>
                </div>

                {/* Username */}
                <div className="flex flex-col border-b border-zinc-100 pb-2">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase font-english tracking-wider">
                    {kh ? "ឈ្មោះគណនី / Username" : "Username / ឈ្មោះគណនី"}
                  </span>
                  <span className="font-extrabold text-zinc-800 text-sm md:text-base font-mono mt-0.5">
                    {isUsernamePublic ? `@${student.username}` : "@private / @រក្សាការសម្ងាត់"}
                  </span>
                </div>

                {/* Role */}
                <div className="flex flex-col border-b border-zinc-100 pb-2">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase font-english tracking-wider">
                    {kh ? "តួនាទី / Role" : "Role / តួនាទី"}
                  </span>
                  <span className="font-black text-zinc-900 text-sm md:text-base mt-0.5">
                    {kh ? "សិស្សសាលាបឋមសិក្សា / Primary Student" : "Primary Student / សិស្សសាលាបឋមសិក្សា"}
                  </span>
                </div>

                {/* School */}
                <div className="flex flex-col border-b border-zinc-100 pb-2">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase font-english tracking-wider">
                    {kh ? "គ្រឹះស្ថានសិក្សា / School" : "School / គ្រឹះស្ថានសិក្សា"}
                  </span>
                  <span className="font-black text-zinc-900 text-sm md:text-base mt-0.5">
                    {isSchoolPublic ? (student.schoolName || "—") : "Private / រក្សាការសម្ងាត់"}
                  </span>
                </div>

                {/* Grade & Section */}
                <div className="flex flex-col border-b border-zinc-100 pb-2">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase font-english tracking-wider">
                    {kh ? "កម្រិតថ្នាក់ & បន្ទប់ / Grade & Section" : "Grade & Section / កម្រិតថ្នាក់ & បន្ទប់"}
                  </span>
                  <span className="font-black text-zinc-900 text-sm md:text-base mt-0.5">
                    {isGradePublic 
                      ? `${getBilingualGrade(student.gradeLevel)}${isSectionPublic && student.section ? ` / Room (ថ្នាក់) ${student.section}` : ""}`
                      : "Private / រក្សាការសម្ងាត់"}
                  </span>
                </div>

                {/* Province */}
                <div className="flex flex-col border-b border-zinc-100 pb-2">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase font-english tracking-wider">
                    {kh ? "ខេត្ត-ក្រុង / Province-City" : "Province-City / ខេត្ត-ក្រុង"}
                  </span>
                  <span className="font-black text-zinc-900 text-sm md:text-base mt-0.5">
                    {isProvincePublic ? getBilingualProvince(student.province) : "Private / រក្សាការសម្ងាត់"}
                  </span>
                </div>

                {/* Total Points */}
                {isStatsPublic && (
                  <div className="flex flex-col border-b border-zinc-100 pb-2">
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase font-english tracking-wider">
                      {kh ? "ពិន្ទុសរុប / Lifetime Points" : "Lifetime Points / ពិន្ទុសរុប"}
                    </span>
                    <span className="font-black text-emerald-600 font-mono text-base md:text-lg mt-0.5">
                      {student.lifetimePoints.toLocaleString()} PTS
                    </span>
                  </div>
                )}

                {/* Joined Date */}
                <div className="flex flex-col pb-2">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase font-english tracking-wider">
                    {kh ? "ឆ្នាំចូលរួមលេង / Joined Year" : "Joined Year / ឆ្នាំចូលរួមលេង"}
                  </span>
                  <span className="font-black text-zinc-900 text-sm md:text-base mt-0.5">
                    {joinedYear}
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Statistics & Claimed Rewards Grid */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            {!isStatsPublic ? (
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000] flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
                <div className="w-16 h-16 bg-[#0284c7] border-4 border-black flex items-center justify-center shadow-[4px_4px_0_#000] text-white">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-black font-kh-header">ស្ថិតិលេងហ្គេមត្រូវបានរក្សាការសម្ងាត់</h4>
                  <p className="text-[10px] text-zinc-400 font-extrabold uppercase font-mono tracking-wider">GAME STATS ARE PRIVATE</p>
                </div>
                <p className="text-xs text-zinc-500 font-bold max-w-xs leading-relaxed">
                  {kh 
                    ? "សិស្សនេះបានកំណត់ស្ថិតិពិន្ទុ និងការប្តូររង្វាន់របស់ពួកគេជាឯកជន។" 
                    : "This student has set their game scores and claimed rewards to private."}
                </p>
              </div>
            ) : (
              <>
            
            {/* Play Stats Box */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000]">
              <h3 className={`text-base font-black uppercase tracking-widest text-zinc-400 border-b-2 border-zinc-200 pb-3 mb-6 flex items-center gap-2 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                <Gamepad2 size={18} className="text-yellow-500" />
                {kh ? "របាយការណ៍សកម្មភាពសិក្សា និងលេងហ្គេម" : "GAME PLAY STATISTICS"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Leaderboard Rank */}
                <div className="border-2 border-black p-4 bg-zinc-50 shadow-[3px_3px_0_#000] flex flex-col justify-center min-h-[90px]">
                  <span className={`text-[10px] font-black uppercase tracking-wider text-zinc-400 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                    {kh ? "ចំណាត់ថ្នាក់តារាងបច្ចុប្បន្ន" : "LEADERBOARD RANK"}
                  </span>
                  <span className="text-3xl font-black text-zinc-950 font-mono mt-1.5 flex items-center gap-2">
                    <Trophy size={28} className="text-yellow-500 fill-yellow-400" />
                    #{rank}
                  </span>
                </div>

                {/* Total Games Played */}
                <div className="border-2 border-black p-4 bg-zinc-50 shadow-[3px_3px_0_#000] flex flex-col justify-center min-h-[90px]">
                  <span className={`text-[10px] font-black uppercase tracking-wider text-zinc-400 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                    {kh ? "ហ្គេមបានលេងសរុប" : "TOTAL GAMES PLAYED"}
                  </span>
                  <span className="text-3xl font-black text-zinc-950 font-mono mt-1.5 flex items-center gap-2">
                    <Award size={28} className="text-blue-500" />
                    {student.totalGamesPlayed}
                  </span>
                </div>

                {/* Highest Score */}
                <div className="border-2 border-black p-4 bg-zinc-50 shadow-[3px_3px_0_#000] flex flex-col justify-center min-h-[90px]">
                  <span className={`text-[10px] font-black uppercase tracking-wider text-zinc-400 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                    {kh ? "ពិន្ទុខ្ពស់បំផុតក្នុង ១ ហ្គេម" : "HIGHEST SCORE"}
                  </span>
                  <span className="text-3xl font-black text-zinc-950 font-mono mt-1.5 flex items-center gap-2">
                    <Star size={28} className="text-yellow-500 fill-yellow-400" />
                    {student.highestScore.toLocaleString()}
                  </span>
                </div>

                {/* Student Grade */}
                <div className="border-2 border-black p-4 bg-zinc-50 shadow-[3px_3px_0_#000] flex flex-col justify-center min-h-[90px]">
                  <span className={`text-[10px] font-black uppercase tracking-wider text-zinc-400 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                    {kh ? "បន្ទប់សិក្សាផ្លូវការ" : "STUDENT GRADE ROOM"}
                  </span>
                  <span className={`text-base md:text-lg font-black text-zinc-950 mt-2 flex items-center gap-2 ${kh ? 'font-kh-header' : 'font-mono'}`}>
                    <School size={24} className="text-purple-500" />
                    {kh ? `${gradeKh} (${student.section ?? "—"})` : `${gradeEn} (Room ${student.section ?? "—"})`}
                  </span>
                </div>

              </div>
            </div>

            {/* DB-Backed Claimed Rewards Archive */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000]">
              <h3 className={`text-base font-black uppercase tracking-widest text-zinc-400 border-b-2 border-zinc-200 pb-3 mb-6 flex items-center gap-2 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                <Gift size={18} className="text-blue-500" />
                {kh ? "ប្រវត្តិនៃការប្តូរយករង្វាន់ពិតប្រាកដ" : "CLAIMED REWARDS ARCHIVE (LIVE)"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {claimedItems.length > 0 ? (
                  claimedItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="border-2 border-black p-4 bg-zinc-50 relative overflow-hidden flex items-center gap-4 shadow-[3px_3px_0_#000] animate-fade-in"
                    >
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-white border-2 border-black flex-shrink-0 flex items-center justify-center p-1.5 shadow-[2px_2px_0_#000]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-sm text-zinc-950 truncate ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                          {kh ? item.nameKh : item.name}
                        </p>
                        <p className="font-black text-[10px] text-zinc-400 font-mono mt-0.5">
                          {item.cost} PTS
                        </p>
                        
                        <div className="flex flex-col gap-1 mt-1.5">
                          <span className={`inline-flex self-start items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase border border-green-300 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                            <CheckCircle2 size={9} />
                            {kh ? "បានប្តូរពិតប្រាកដ" : "VERIFIED CLAIM"}
                          </span>
                          {item.claimedAt && (
                            <span className="text-[9px] text-zinc-400 font-mono">
                              {new Date(item.claimedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 border border-dashed border-zinc-300 text-zinc-400 text-sm font-bold bg-zinc-50">
                    {kh ? "មិនទាន់មានការប្តូររង្វាន់នៅឡើយទេ" : "No rewards claimed yet"}
                  </div>
                )}
              </div>
            </div>
            </>
            )}
          </div>

        </div>
      )}

        {/* 4. Grand Brutalist Bottom Footer Banner */}
        <div className="bg-[#0284c7] border-4 border-black p-5 text-center text-xs md:text-sm text-white font-black uppercase tracking-widest shadow-[6px_6px_0_#000] flex flex-col md:flex-row items-center justify-between gap-4">
          <span>Kesararam with Digital © 2026</span>
          <span className="font-mono">kesararamwithdigital.tech</span>
          <button 
            onClick={() => { router.push('/leaderboard'); }}
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-zinc-950 border-2 border-black hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-black shadow-[2px_2px_0_#000] active:shadow-none"
          >
            {kh ? "ចូលរួមលេងប្រកួតប្រជែង" : "JOIN QUIZ COMPETITION"}
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
