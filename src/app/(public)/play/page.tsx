"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { Users, ChevronRight, Target, BookOpenCheck } from "lucide-react";

// ── Game mode SVG icons (Brutalist style) ──────────────────────────────

function IconQuickQuiz() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <circle cx="40" cy="40" r="32" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
      <circle cx="40" cy="40" r="24" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" opacity="0.5" />
      <text x="40" y="52" textAnchor="middle" fontSize="36" fontWeight="900" fill="#92400e" fontFamily="system-ui">?</text>
    </svg>
  );
}

function IconSpeedRound() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <polygon points="40,6 46,28 68,28 50,44 57,66 40,52 23,66 30,44 12,28 34,28" fill="#fca5a5" stroke="#b91c1c" strokeWidth="2.5" />
      <polygon points="40,14 44,30 56,30 46,40 50,54 40,46 30,54 34,40 24,30 36,30" fill="#ef4444" />
      <text x="40" y="46" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff" fontFamily="system-ui">⚡</text>
    </svg>
  );
}

function IconSignChallenge() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <polygon points="40,6 74,40 40,74 6,40" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="3" />
      <polygon points="40,14 66,40 40,66 14,40" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1" opacity="0.5" />
      <circle cx="40" cy="36" r="5" fill="#1d4ed8" />
      <rect x="38" y="44" width="4" height="4" rx="2" fill="#1d4ed8" />
    </svg>
  );
}

function IconMixedBattle() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="8" y="8" width="28" height="28" rx="5" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2.5" />
      <rect x="44" y="8" width="28" height="28" rx="5" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2.5" />
      <rect x="8" y="44" width="28" height="28" rx="5" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2.5" />
      <rect x="44" y="44" width="28" height="28" rx="5" fill="#7e22ce" stroke="#7e22ce" strokeWidth="2.5" />
      <text x="58" y="64" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="900">⚔</text>
    </svg>
  );
}

function IconDailyChallenge() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="10" y="16" width="60" height="54" rx="5" fill="#bbf7d0" stroke="#15803d" strokeWidth="2.5" />
      <rect x="10" y="16" width="60" height="18" rx="5" fill="#15803d" />
      <line x1="26" y1="10" x2="26" y2="24" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <line x1="54" y1="10" x2="54" y2="24" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="46" r="5" fill="#15803d" />
      <circle cx="52" cy="46" r="5" fill="#15803d" opacity="0.5" />
      <circle cx="28" cy="60" r="5" fill="#15803d" opacity="0.3" />
      <circle cx="52" cy="60" r="5" fill="#15803d" opacity="0.3" />
    </svg>
  );
}

function IconExamSimulation() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <polygon points="40,4 48,28 74,28 53,44 61,68 40,53 19,68 27,44 6,28 32,28" fill="#fed7aa" stroke="#c2410c" strokeWidth="2.5" />
      <polygon points="40,12 46,30 62,30 49,40 54,58 40,48 26,58 31,40 18,30 34,30" fill="#f97316" />
      <circle cx="40" cy="36" r="6" fill="#fff" opacity="0.9" />
    </svg>
  );
}

const GAME_MODE_ICONS = [IconQuickQuiz, IconSpeedRound, IconSignChallenge, IconMixedBattle, IconDailyChallenge, IconExamSimulation];

const GAME_MODES = [
  { id: "quick-quiz", tag: "HOT", tagColor: "#ef4444", title: "Quick Quiz", titleKh: "សំណួរលឿន", desc: "10 random questions across all categories.", descKh: "សំណួរចៃដន្យ ១០ ក្នុងចំណោមកម្រិតទាំងអស់។", color: "#eab308", href: "/play/solo?mode=quick-quiz", badge: "10Q · 30s", cta: "Play Now", ctaKh: "លេងឥឡូវ", motivator: "🧠 Perfect for a quick warm-up!", motivatorKh: "🧠 ល្អបំផុតសម្រាប់កំដៅសាច់ដុំលឿន!" },
  { id: "speed-round", tag: "INTENSE", tagColor: "#a855f7", title: "Speed Round", titleKh: "វគ្គល្បឿន", desc: "Fast MCQ only — tap fast, score big.", descKh: "សំណួរលឿនបំផុត — ឆ្លើយរហ័ស យកពិន្ទុខ្ពស់។", color: "#ef4444", href: "/play/solo?mode=speed-round", badge: "20Q · 15s", cta: "Go Fast", ctaKh: "ចូលប្រកួត", motivator: "⚡ Think fast, beat the clock!", motivatorKh: "⚡ គិតរហ័ស យកឈ្នះពេលវេលា!" },
  { id: "sign-challenge", tag: "POPULAR", tagColor: "#3b82f6", title: "Sign Challenge", titleKh: "ប្រឡងសញ្ញា", desc: "Identify traffic signs from images only.", descKh: "ស្គាល់ និងបកស្រាយសញ្ញាចរាចរណ៍តាមរូបភាព។", color: "#3b82f6", href: "/play/solo?mode=sign-challenge", badge: "15Q · 20s", cta: "Challenge", ctaKh: "ចាប់ផ្តើមប្រឡង", motivator: "🛑 Master visual road signs!", motivatorKh: "🛑 ជំនាញច្បាស់សញ្ញាចរាចរណ៍!" },
  { id: "mixed-battle", tag: "NEW", tagColor: "#10b981", title: "Mixed Battle", titleKh: "ប្រកួតចម្រុះ", desc: "All categories, all question types.", descKh: "សំណួរគ្រប់ប្រភេទ លាយចម្រុះគ្នាដើម្បីសាកល្បងសមត្ថភាព។", color: "#a855f7", href: "/play/solo?mode=mixed-battle", badge: "20Q · 30s", cta: "Battle!", ctaKh: "ប្រកួតចម្រុះ", motivator: "⚔️ The ultimate test of driving wits!", motivatorKh: "⚔️ ការសាកល្បងចំណេះដឹងចរាចរណ៍!" },
  { id: "daily-challenge", tag: "DAILY", tagColor: "#10b981", title: "Daily Challenge", titleKh: "បញ្ហាប្រចាំថ្ងៃ", desc: "New questions every day. Build your streak.", descKh: "សំណួរថ្មីៗជារៀងរាល់ថ្ងៃ។ សន្សំពិន្ទុប្រចាំថ្ងៃរបស់អ្នក។", color: "#22c55e", href: "/play/solo?mode=daily-challenge", badge: "15Q · 30s", cta: "Daily Mode", ctaKh: "លេងប្រចាំថ្ងៃ", motivator: "🔥 +15 XP · Build your daily streak!", motivatorKh: "🔥 +15 XP · បង្កើតកម្រិតប្រចាំថ្ងៃ!" },
  { id: "exam-simulation", tag: "PRO", tagColor: "#f97316", title: "Exam Simulation", titleKh: "ត្រាប់តាមប្រឡង", desc: "40 questions mirroring the real Cambodia exam.", descKh: "សាកល្បងប្រឡង ៤០ សំណួរ ដូចការប្រឡងយកប័ណ្ណបើកបរពិត។", color: "#f97316", href: "/play/solo?mode=exam-simulation", badge: "40Q · 45s", cta: "Simulate", ctaKh: "ចាប់ផ្តើមត្រាប់តាម", motivator: "🏆 Mirroring the official licensing exam!", motivatorKh: "🏆 ស្រដៀងនឹងការប្រឡងប័ណ្ណបើកបរពិត!" },
];

const STATS = [
  { value: "500+", labelEn: "Questions", labelKh: "សំណួរ", color: "#eab308" },
  { value: "6", labelEn: "Game Modes", labelKh: "របៀបលេង", color: "#ef4444" },
  { value: "8", labelEn: "Categories", labelKh: "ប្រភេទ", color: "#3b82f6" },
  { value: "Live", labelEn: "Multiplayer", labelKh: "ប្រកួតផ្ទាល់", color: "#22c55e" },
];

type GameMode = typeof GAME_MODES[number];

function GameModeCard({ mode, index, kh, khFont }: {
  mode: GameMode;
  index: number;
  kh: boolean;
  khFont: React.CSSProperties;
}) {
  const IconComp = GAME_MODE_ICONS[index];
  const hoverBgColor = mode.color + "08"; // 3% opacity for subtle color matching content bg

  return (
    <Link
      href={mode.href}
      className="group relative flex flex-col h-full bg-white border-[3px] border-black rounded-[10px] overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:-translate-x-1.5 hover:shadow-[12px_12px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0_#000] outline-none shadow-[8px_8px_0_#000]"
      style={{
        "--hover-bg": hoverBgColor,
      } as React.CSSProperties}
    >
      {/* Solid Color Header Row */}
      <div 
        className="flex justify-between items-start p-5 border-b-[3px] border-black transition-colors duration-200 rounded-t-[7px]"
        style={{ backgroundColor: mode.color }}
      >
        {/* Glowing Circle Icon Container */}
        <div className="w-16 h-16 rounded-full bg-white border-[3px] border-black flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0_#000] group-hover:scale-105 group-hover:rotate-6 transition-transform duration-200">
          <div className="w-11 h-11">
            <IconComp />
          </div>
        </div>

        {/* Brutalist Arcade Badges */}
        <div className="flex flex-col items-end gap-2.5">
          {mode.tag && (
            <span 
              className="px-2.5 py-0.5 text-[9px] font-black tracking-widest text-white uppercase border-2 border-black rounded-[4px] shadow-[2px_2px_0_#000]"
              style={{ backgroundColor: mode.tagColor || mode.color }}
            >
              {mode.tag}
            </span>
          )}
          <span 
            className="text-xs font-black px-2.5 py-1 bg-black text-white border-2 border-black rounded-full tracking-wider shadow-[2px_2px_0_#000]"
            style={{ color: mode.color }}
          >
            {mode.badge}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 bg-white group-hover:bg-[var(--hover-bg)] transition-colors duration-200 pb-8">
        <h3 className="text-2xl font-black text-black tracking-tight mb-1" style={khFont}>
          {kh ? mode.titleKh : mode.title}
        </h3>
        
        {/* Psychological Motivator Tagline */}
        <div 
          className="text-xs font-extrabold tracking-wide mb-3 flex items-center gap-1.5 opacity-90"
          style={{ color: mode.color === "#eab308" ? "#b45309" : mode.color }}
        >
          {kh ? mode.motivatorKh : mode.motivator}
        </div>

        <p className="text-[14px] leading-relaxed text-zinc-600 font-bold mb-6 flex-1" style={khFont}>
          {kh ? mode.descKh : mode.desc}
        </p>

        {/* Arcade CTA Button */}
        <div className="mt-auto">
          <div
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-black text-sm rounded-xl border-[3px] border-black shadow-[4px_4px_0_#000] group-hover:bg-black group-hover:text-white group-hover:shadow-[6px_6px_0_#000] group-hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all duration-150"
            style={{
              backgroundColor: mode.color,
              color: mode.color === "#eab308" || mode.color === "#22c55e" ? "#000" : "#fff"
            }}
          >
            <span style={khFont}>{kh ? mode.ctaKh : mode.cta}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform duration-200">
              <path d="M4 8h8M9 4l4 4-4 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Caution Tape Bottom Stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-[4px] caution-tape" />
    </Link>
  );
}

function JoinLiveSection({ lang }: { lang: string }) {
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const router = useRouter();
  const [code, setCode] = useState("");

  function join() {
    const c = code.trim().toUpperCase();
    if (c.length === 6) router.push(`/play/${c}`);
  }

  return (
    <section className="border-y-[4px] border-black bg-zinc-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-400 border-[3px] border-black flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "6px 6px 0 #ca8a04" }}>
              <Users size={28} className="text-black" />
            </div>
            <div>
              <div className="text-white font-black text-2xl" style={khFont}>
                {kh ? "ចូលហ្គេមផ្ទាល់" : "Join a Live Game"}
              </div>
              <div className="text-zinc-400 text-sm font-bold mt-1" style={khFont}>
                {kh ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់" : "Enter the 6-character room code from your teacher"}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="ABC123"
              className="w-full sm:w-48 border-[3px] border-yellow-400 bg-black text-yellow-400 px-4 py-4 font-black text-2xl tracking-widest text-center focus:outline-none placeholder:text-zinc-700 transition-colors focus:bg-zinc-950"
            />
            <button
              onClick={join}
              disabled={code.length !== 6}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-yellow-400 text-black font-black border-[3px] border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 hover:-translate-x-1 active:scale-95 active:translate-x-0 active:translate-y-0"
              style={{ boxShadow: code.length === 6 ? "6px 6px 0 #ca8a04" : "none", ...khFont }}
            >
              {kh ? "ចូល" : "Join"}
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PlayPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-yellow-400 selection:text-black animate-fade-in-up">
      
      {/* Hero Section */}
      <section
        className="relative overflow-hidden border-b-[4px] border-black bg-[#111111]"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.2) 2px, transparent 2px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-400" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div className="flex flex-col gap-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-4 py-2 w-fit border-2 border-yellow-400 shadow-[4px_4px_0_#ca8a04]">
                <span className="w-2.5 h-2.5 bg-black rounded-full" />
                {kh ? "មជ្ឈមណ្ឌលហ្គេម" : "Game Center"}
              </div>
              
              <h1 className="text-6xl md:text-[6rem] font-black text-white leading-none tracking-tight" style={khFont}>
                {kh ? "ប្រកួត" : "PLAY"}<span className="text-yellow-400">.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-zinc-300 max-w-lg leading-relaxed font-bold" style={khFont}>
                {kh ? "ជ្រើសរើសរបៀបលេង ហើយសាកល្បងចំណេះដឹងរបស់អ្នក" : "Choose a game mode, build your streak, and sharpen your driving theory knowledge."}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <Link href="/leaderboard"
                  className="flex items-center gap-2 px-8 py-4 bg-yellow-400 text-black font-black border-[3px] border-yellow-400 transition-all hover:-translate-y-1 hover:-translate-x-1 active:scale-95 active:translate-x-0 active:translate-y-0"
                  style={{ boxShadow: "6px 6px 0 #ca8a04", ...khFont }}>
                  <Target size={20} />
                  {kh ? "តារាងពិន្ទុ" : "Leaderboard"}
                </Link>
                <Link href="/learn"
                  className="flex items-center gap-2 px-8 py-4 bg-transparent text-white font-black border-[3px] border-white/50 hover:border-white transition-all hover:-translate-y-1 hover:-translate-x-1 active:scale-95 active:translate-x-0 active:translate-y-0"
                  style={{ boxShadow: "6px 6px 0 rgba(255,255,255,0.2)", ...khFont }}>
                  <BookOpenCheck size={20} />
                  {kh ? "រៀនសិន" : "Study First"}
                </Link>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center w-48 h-48 border-[4px] border-yellow-400 bg-yellow-400/10 flex-shrink-0 transition-transform duration-300 hover:rotate-3"
              style={{ boxShadow: "12px 12px 0 #ca8a04" }}>
              <span className="text-6xl font-black text-yellow-400">6</span>
              <span className="text-sm font-black text-white tracking-widest uppercase mt-2">
                {kh ? "របៀបលេង" : "Modes"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="border-b-[4px] border-black bg-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, labelEn, labelKh, color }) => (
              <div key={labelEn} className="border-[3px] border-black p-6 flex flex-col gap-1 transition-transform duration-200 hover:-translate-y-1"
                style={{ boxShadow: `6px 6px 0 ${color}` }}>
                <span className="text-4xl font-black" style={{ color }}>{value}</span>
                <span className="text-sm font-black text-black uppercase tracking-wider" style={khFont}>{kh ? labelKh : labelEn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Modes Grid */}
      <section className="py-20 bg-zinc-50" style={{ backgroundImage: "radial-gradient(#d4d4d8 2px, transparent 2px)", backgroundSize: "32px 32px" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="inline-block bg-black text-white text-sm font-black tracking-widest uppercase px-4 py-2 mb-4 border-2 border-black" style={khFont}>
              {kh ? "ជ្រើសរើសរបៀប" : "Choose Mode"}
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-black" style={khFont}>
              {kh ? "របៀបលេង" : "Game "}
              <span className="underline decoration-yellow-400 decoration-8 underline-offset-4">
                {kh ? "" : "Modes"}
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {GAME_MODES.map((mode, index) => (
              <GameModeCard key={mode.id} mode={mode} index={index} kh={kh} khFont={khFont} />
            ))}
          </div>
        </div>
      </section>

      <JoinLiveSection lang={lang} />

      {/* Final CTA */}
      <section className="bg-black border-t-[4px] border-yellow-400 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-5xl md:text-6xl font-black text-white" style={khFont}>
            {kh ? "ត្រៀមខ្លួនហើយ?" : "Ready to test yourself?"}
          </h2>
          <p className="text-zinc-400 text-xl font-bold" style={khFont}>
            {kh ? "រៀន — ប្រកួត — ការពារជីវិត" : "Study the theory, play the games, pass the exam."}
          </p>
          <div className="flex flex-wrap gap-6 justify-center mt-6">
            <Link href="/learn"
              className="px-10 py-5 bg-yellow-400 text-black font-black border-[3px] border-yellow-400 text-xl transition-all hover:-translate-y-1 hover:-translate-x-1 active:scale-95 active:translate-x-0 active:translate-y-0"
              style={{ boxShadow: "8px 8px 0 #ca8a04", ...khFont }}>
              {kh ? "រៀនឥឡូវ →" : "Start Learning →"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
