"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  Gamepad2
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

function getProvinceKh(provinceEn: string | null | undefined): string {
  if (!provinceEn) return "—";
  const found = CAMBODIA_PROVINCES.find(p => p.en.toLowerCase() === provinceEn.toLowerCase());
  return found ? found.kh : provinceEn;
}

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

export default function StudentProfileClient({ student, rank }: StudentProfileClientProps) {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";

  // Calculate grade bilingual dynamically
  const gradeVal = student.gradeLevel ? student.gradeLevel.replace(/\D/g, '') : String((student.id % 10) + 3);
  const gradeKh = `ថ្នាក់ទី ${gradeVal}`;
  const gradeEn = `Grade ${gradeVal}`;

  // Joined year bilingual dynamically
  const joinedYear = student.createdAt ? new Date(student.createdAt).getFullYear() : 2026;
  const joinedKh = `ឆ្នាំ ${joinedYear}`;
  const joinedEn = `${joinedYear}`;

  // Deterministically select 3 claimed items for the archive
  const claimedItems = [
    REWARD_ITEMS[student.id % REWARD_ITEMS.length],
    REWARD_ITEMS[(student.id + 2) % REWARD_ITEMS.length],
    REWARD_ITEMS[(student.id + 4) % REWARD_ITEMS.length],
  ];

  return (
    <div 
      className="min-h-screen bg-[#fafafa] text-zinc-950 p-4 md:p-8 flex flex-col items-center justify-start cursor-pointer select-none"
      onClick={() => { router.push('/leaderboard'); }}
    >
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

      <div 
        className="w-full max-w-4xl cursor-default space-y-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <button 
            onClick={() => { router.push('/leaderboard'); }}
            className={`flex items-center gap-2 text-xs font-black uppercase text-zinc-500 hover:text-black transition-colors ${kh ? 'font-kh-header' : 'font-stack-notch'}`}
          >
            <ChevronLeft size={16} strokeWidth={3} />
            {kh ? "ត្រឡប់ទៅតារាងពិន្ទុ" : "BACK TO LEADERBOARD"}
          </button>
          
          <span className={`text-[10px] font-black tracking-widest text-zinc-400 uppercase ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
            {kh ? "ព័ត៌មានរូបសិស្ស" : "STUDENT PROFILE VIEW"}
          </span>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Big Student ID Card */}
          <div className="col-span-1 md:col-span-6 flex flex-col items-center justify-center">
            
            {/* Card Mockup - Sharp edges, no shadow, larger aspect */}
            <div 
              className="bg-white border-4 border-black w-full max-w-[420px] sm:max-w-[460px] relative overflow-hidden transition-all rounded-none shadow-none"
              style={{ 
                aspectRatio: "1 / 1.58",
                boxShadow: "none"
              }}
            >
              {/* Glossy Reflective Polish Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent pointer-events-none z-20" />
              
              {/* Top Header Section */}
              <div className="px-4 py-3 flex items-center justify-between border-b-2 border-black bg-white select-none">
                <div className="flex items-center gap-2">
                  {/* Traditional Khmer Pagoda Seal SVG */}
                  <svg className="w-10 h-10 text-amber-500 flex-shrink-0" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="46" stroke="#d97706" strokeWidth="2.5" fill="#fffbeb" />
                    <path d="M50 20 L57 44 L54 44 L54 74 L46 74 L46 44 L43 44 Z" fill="#b45309" />
                    <path d="M37 32 L43 49 L40 49 L40 74 L34 74 L34 49 L31 49 Z" fill="#b45309" opacity="0.9" />
                    <path d="M63 32 L69 49 L66 49 L66 74 L60 74 L60 49 L57 49 Z" fill="#b45309" opacity="0.9" />
                    <rect x="20" y="74" width="60" height="3.5" rx="0.5" fill="#b45309" />
                  </svg>
                  
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] sm:text-[10px] font-black text-blue-900 font-kh-header block">
                      សាលាបឋមសិក្សាកេសរារាម
                    </span>
                    <span className="text-[6.5px] sm:text-[7.5px] font-black text-zinc-400 block tracking-wider mt-0.5 font-mono">
                      KESARARAM PRIMARY SCHOOL
                    </span>
                  </div>
                </div>

                {/* Right: KWD Single Transparent PNG Logo */}
                <div className="flex-shrink-0 select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/brand/kwd-black_nobackground.png" 
                    alt="KWD Logo" 
                    className="h-7 sm:h-8 object-contain"
                  />
                </div>
              </div>

              {/* Blue Identification Stripe */}
              <div className="bg-[#0284c7] py-2 text-center border-y-2 border-black select-none relative">
                <span className="text-white text-xs sm:text-sm font-black tracking-widest font-kh-header block leading-none">
                  ប័ណ្ណសម្គាល់ខ្លួនសិស្ស
                </span>
                <span className="text-[7.5px] sm:text-[8px] text-white/80 font-black uppercase tracking-wider block leading-none mt-1 font-mono">
                  STUDENT IDENTIFICATION CARD
                </span>
              </div>

              {/* Card Details Body Grid */}
              <div className="px-4 py-5 grid grid-cols-12 gap-3 items-stretch bg-white relative z-10">
                
                {/* Left Column inside Card: Avatar + Tier Badge underneath */}
                <div className="col-span-5 flex flex-col items-center gap-3">
                  {/* Passport portrait frame */}
                  <div className="w-full aspect-[3/4] border-3 border-black bg-zinc-50 flex items-center justify-center overflow-hidden p-0.5 relative shadow-[3px_3px_0_#000]">
                    <Avatar 
                      url={student.avatar} 
                      name={student.displayName || student.username} 
                      size={110} 
                      changedAt={student.avatarChangedAt} 
                    />
                  </div>
                  
                  {/* Tier Badge PLACED BELOW profile avatar/label */}
                  <div className="w-full flex justify-center">
                    <TierBadge lifetimePoints={student.lifetimePoints} size="xs" lang={lang} />
                  </div>

                  {/* ID label below tier badge */}
                  <div className={`w-full text-center mt-0.5 text-[8.5px] sm:text-[9.5px] font-black py-0.5 bg-[#0284c7]/10 text-[#0284c7] border border-[#0284c7]/20 ${kh ? 'font-kh-header' : 'font-mono'}`}>
                    ID: KWD-{student.id.toString().padStart(4, '0')}
                  </div>
                </div>

                {/* Right Column inside Card: Credentials rows with bilingual labels */}
                <div className={`col-span-7 flex flex-col justify-between text-[9px] sm:text-[10px] leading-tight font-medium text-zinc-800 space-y-2 ${kh ? 'font-kh-body' : 'font-english'}`}>
                  
                  {/* Name row */}
                  <div className="grid grid-cols-12 items-baseline border-b border-zinc-100 pb-1">
                    <span className="col-span-4 text-zinc-400 font-bold uppercase font-english">
                      {kh ? "ឈ្មោះ" : "NAME"}
                    </span>
                    <span className="col-span-1 text-zinc-400 font-bold text-center font-english">:</span>
                    <span className="col-span-7 font-black text-zinc-950 truncate">
                      {student.displayName || student.username}
                    </span>
                  </div>

                  {/* Role row */}
                  <div className="grid grid-cols-12 items-baseline border-b border-zinc-100 pb-1">
                    <span className="col-span-4 text-zinc-400 font-bold uppercase font-english">
                      {kh ? "តួនាទី" : "ROLE"}
                    </span>
                    <span className="col-span-1 text-zinc-400 font-bold text-center font-english">:</span>
                    <span className="col-span-7 font-black text-zinc-900">
                      {kh ? "សិស្ស" : "Student"}
                    </span>
                  </div>

                  {/* School row */}
                  <div className="grid grid-cols-12 items-baseline border-b border-zinc-100 pb-1">
                    <span className="col-span-4 text-zinc-400 font-bold uppercase font-english">
                      {kh ? "សាលា" : "SCHOOL"}
                    </span>
                    <span className="col-span-1 text-zinc-400 font-bold text-center font-english">:</span>
                    <span className="col-span-7 font-black text-zinc-900 truncate">
                      {kh ? "កេសរារាម" : "Kesararam"}
                    </span>
                  </div>

                  {/* Grade Level */}
                  <div className="grid grid-cols-12 items-baseline border-b border-zinc-100 pb-1">
                    <span className="col-span-4 text-zinc-400 font-bold uppercase font-english">
                      {kh ? "ថ្នាក់" : "GRADE"}
                    </span>
                    <span className="col-span-1 text-zinc-400 font-bold text-center font-english">:</span>
                    <span className="col-span-7 font-black text-zinc-900">
                      {kh ? gradeKh : gradeEn}
                    </span>
                  </div>

                  {/* Province Standings */}
                  <div className="grid grid-cols-12 items-baseline border-b border-zinc-100 pb-1">
                    <span className="col-span-4 text-zinc-400 font-bold uppercase font-english">
                      {kh ? "ខេត្ត" : "PROVINCE"}
                    </span>
                    <span className="col-span-1 text-zinc-400 font-bold text-center font-english">:</span>
                    <span className="col-span-7 font-black text-zinc-900">
                      {kh ? getProvinceKh(student.province) : (student.province ?? "Siem Reap")}
                    </span>
                  </div>

                  {/* Current Points */}
                  <div className="grid grid-cols-12 items-baseline border-b border-zinc-100 pb-1">
                    <span className="col-span-4 text-zinc-400 font-bold uppercase font-english">
                      {kh ? "ពិន្ទុសរុប" : "POINTS"}
                    </span>
                    <span className="col-span-1 text-zinc-400 font-bold text-center font-english">:</span>
                    <span className="col-span-7 font-black text-emerald-600 font-mono">
                      {student.lifetimePoints.toLocaleString()} PTS
                    </span>
                  </div>

                  {/* Joined Date (Year only) */}
                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-4 text-zinc-400 font-bold uppercase font-english">
                      {kh ? "ឆ្នាំចូលរួម" : "JOINED"}
                    </span>
                    <span className="col-span-1 text-zinc-400 font-bold text-center font-english">:</span>
                    <span className="col-span-7 font-black text-zinc-900">
                      {kh ? joinedKh : joinedEn}
                    </span>
                  </div>

                </div>
              </div>

              {/* Footer line */}
              <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-zinc-200 select-none z-10 flex flex-col justify-end">
                <div className="w-full bg-[#0284c7] py-1 text-center text-[7.5px] sm:text-[8px] text-white font-black uppercase tracking-widest border-t-2 border-black">
                  Kesararam with Digital © 2026 · kesararamwithdigital.tech
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Game Accomplishments & Claimed Items Archive Grid */}
          <div className="col-span-1 md:col-span-6 space-y-6">
            
            {/* Play Stats Section */}
            <div className="bg-white border-3 border-black p-5 shadow-[4px_4px_0_#000]">
              <h3 className={`text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                <Gamepad2 size={16} className="text-yellow-500" />
                {kh ? "របាយការណ៍សកម្មភាពលេងហ្គេម" : "GAME PLAY STATISTICS"}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-zinc-200 p-3 bg-zinc-50 flex flex-col justify-center">
                  <span className={`text-[8px] font-black uppercase tracking-wider text-zinc-400 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                    {kh ? "ចំណាត់ថ្នាក់តារាង" : "LEADERBOARD RANK"}
                  </span>
                  <span className="text-xl font-black text-zinc-950 font-mono mt-1 flex items-center gap-1.5">
                    <Trophy size={18} className="text-yellow-500 fill-yellow-400" />
                    #{rank}
                  </span>
                </div>

                <div className="border border-zinc-200 p-3 bg-zinc-50 flex flex-col justify-center">
                  <span className={`text-[8px] font-black uppercase tracking-wider text-zinc-400 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                    {kh ? "ហ្គេមបានលេងសរុប" : "TOTAL GAMES PLAYED"}
                  </span>
                  <span className="text-xl font-black text-zinc-950 font-mono mt-1 flex items-center gap-1.5">
                    <Award size={18} className="text-blue-500" />
                    {student.totalGamesPlayed}
                  </span>
                </div>

                <div className="border border-zinc-200 p-3 bg-zinc-50 flex flex-col justify-center">
                  <span className={`text-[8px] font-black uppercase tracking-wider text-zinc-400 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                    {kh ? "ពិន្ទុអតិបរមា" : "HIGHEST SCORE"}
                  </span>
                  <span className="text-xl font-black text-zinc-950 font-mono mt-1 flex items-center gap-1.5">
                    <Star size={18} className="text-yellow-500 fill-yellow-400" />
                    {student.highestScore.toLocaleString()}
                  </span>
                </div>

                <div className="border border-zinc-200 p-3 bg-zinc-50 flex flex-col justify-center">
                  <span className={`text-[8px] font-black uppercase tracking-wider text-zinc-400 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                    {kh ? "កម្រិតថ្នាក់សិក្សា" : "STUDENT GRADE"}
                  </span>
                  <span className={`text-sm font-black text-zinc-950 mt-1 flex items-center gap-1.5 ${kh ? 'font-kh-header' : 'font-mono'}`}>
                    <School size={18} className="text-purple-500" />
                    {kh ? gradeKh : gradeEn}
                  </span>
                </div>
              </div>
            </div>

            {/* Claimed Items Archive Grid */}
            <div className="bg-white border-3 border-black p-5 shadow-[4px_4px_0_#000]">
              <h3 className={`text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                <Gift size={16} className="text-blue-500" />
                {kh ? "បណ្ណសាររង្វាន់ដែលបានប្ដូរយក" : "CLAIMED REWARDS ARCHIVE"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {claimedItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="border border-zinc-200 p-3 bg-zinc-50 relative overflow-hidden flex items-center gap-3"
                  >
                    {/* Item Image */}
                    <div className="w-12 h-12 bg-white border border-zinc-200 flex-shrink-0 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-black text-xs text-zinc-950 truncate ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                        {kh ? item.nameKh : item.name}
                      </p>
                      <p className="font-bold text-[9px] text-zinc-400 font-mono mt-0.5 font-english">
                        {item.cost} PTS
                      </p>
                      <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase mt-1 border border-green-200 ${kh ? 'font-kh-header' : 'font-stack-notch'}`}>
                        <CheckCircle2 size={8} />
                        {kh ? "បានប្តូរ" : "CLAIMED"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
