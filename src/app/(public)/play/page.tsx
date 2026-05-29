"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { Users, ChevronRight, Target, BookOpenCheck, Flame, Trophy, Play, Zap, Shield, HelpCircle, Gamepad2, Award } from "lucide-react";

// ── Game mode SVG icons (Sleek Modern 3D/Neon Glow style) ────────────────────────

function IconQuickQuiz() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <defs>
        <radialGradient id="quickGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#eab308" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="url(#quickGlow)" />
      <circle cx="40" cy="40" r="24" fill="#fde047" stroke="#eab308" strokeWidth="2.5" />
      <text x="40" y="52" textAnchor="middle" fontSize="36" fontWeight="900" fill="#854d0e" fontFamily="sans-serif">?</text>
    </svg>
  );
}

function IconSpeedRound() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <defs>
        <radialGradient id="speedGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="url(#speedGlow)" />
      <polygon points="40,10 50,32 74,32 54,46 62,68 40,54 18,68 26,46 6,32 30,32" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
      <text x="40" y="47" textAnchor="middle" fontSize="18" fontWeight="900" fill="#fff" fontFamily="sans-serif">⚡</text>
    </svg>
  );
}

function IconSignChallenge() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <defs>
        <radialGradient id="signGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="url(#signGlow)" />
      <polygon points="40,12 68,40 40,68 12,40" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2.5" />
      <circle cx="40" cy="36" r="5" fill="#fff" />
      <rect x="38" y="45" width="4" height="6" rx="1" fill="#fff" />
    </svg>
  );
}

function IconMixedBattle() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <defs>
        <radialGradient id="mixedGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="url(#mixedGlow)" />
      <rect x="15" y="15" width="22" height="22" rx="4" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
      <rect x="43" y="15" width="22" height="22" rx="4" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
      <rect x="15" y="43" width="22" height="22" rx="4" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
      <rect x="43" y="43" width="22" height="22" rx="4" fill="#7e22ce" stroke="#6b21a8" strokeWidth="2" />
      <text x="54" y="60" textAnchor="middle" fontSize="15" fill="#fff" fontWeight="900">⚔</text>
    </svg>
  );
}

function IconDailyChallenge() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <defs>
        <radialGradient id="dailyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="url(#dailyGlow)" />
      <rect x="16" y="20" width="48" height="44" rx="6" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
      <rect x="16" y="20" width="48" height="14" rx="4" fill="#15803d" />
      <line x1="28" y1="14" x2="28" y2="24" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      <line x1="52" y1="14" x2="52" y2="24" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="48" r="6" fill="#fff" />
    </svg>
  );
}

function IconExamSimulation() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <defs>
        <radialGradient id="examGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="32" fill="url(#examGlow)" />
      <polygon points="40,10 48,30 70,30 52,43 59,64 40,51 21,64 28,43 10,30 32,30" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
      <circle cx="40" cy="38" r="6" fill="#fff" />
    </svg>
  );
}

const GAME_MODE_ICONS = [IconQuickQuiz, IconSpeedRound, IconSignChallenge, IconMixedBattle, IconDailyChallenge, IconExamSimulation];

const GAME_MODES = [
  { id: "quick-quiz", tag: "HOT", tagColor: "#ef4444", title: "Quick Quiz", titleKh: "សំណួរលឿន", desc: "10 random questions across all categories.", descKh: "សំណួរចៃដន្យ ១០ ក្នុងចំណោមកម្រិតទាំងអស់។", color: "#eab308", accent: "234, 179, 8", href: "/play/solo?mode=quick-quiz", badge: "10Q · 30s", cta: "Play Now", ctaKh: "លេងឥឡូវ", icon: HelpCircle },
  { id: "speed-round", tag: "INTENSE", tagColor: "#a855f7", title: "Speed Round", titleKh: "វគ្គល្បឿន", desc: "Fast MCQ only — tap fast, score big.", descKh: "សំណួរលឿនបំផុត — ឆ្លើយរហ័ស យកពិន្ទុខ្ពស់។", color: "#ef4444", accent: "239, 68, 68", href: "/play/solo?mode=speed-round", badge: "20Q · 15s", cta: "Go Fast", ctaKh: "ចូលប្រកួត", icon: Zap },
  { id: "sign-challenge", tag: "POPULAR", tagColor: "#3b82f6", title: "Sign Challenge", titleKh: "ប្រឡងសញ្ញា", desc: "Identify traffic signs from images only.", descKh: "ស្គាល់ និងបកស្រាយសញ្ញាចរាចរណ៍តាមរូបភាព។", color: "#3b82f6", accent: "59, 130, 246", href: "/play/solo?mode=sign-challenge", badge: "15Q · 20s", cta: "Challenge", ctaKh: "ចាប់ផ្តើមប្រឡង", icon: Shield },
  { id: "mixed-battle", tag: "NEW", tagColor: "#10b981", title: "Mixed Battle", titleKh: "ប្រកួតចម្រុះ", desc: "All categories, all question types.", descKh: "សំណួរគ្រប់ប្រភេទ លាយចម្រុះគ្នាដើម្បីសាកល្បងសមត្ថភាព។", color: "#a855f7", accent: "168, 85, 247", href: "/play/solo?mode=mixed-battle", badge: "20Q · 30s", cta: "Battle!", ctaKh: "ប្រកួតចម្រុះ", icon: Gamepad2 },
  { id: "daily-challenge", tag: "DAILY", tagColor: "#10b981", title: "Daily Challenge", titleKh: "បញ្ហាប្រចាំថ្ងៃ", desc: "New questions every day. Build your streak.", descKh: "សំណួរថ្មីៗជារៀងរាល់ថ្ងៃ។ សន្សំពិន្ទុប្រចាំថ្ងៃរបស់អ្នក។", color: "#22c55e", accent: "34, 197, 94", href: "/play/solo?mode=daily-challenge", badge: "15Q · 30s", cta: "Daily Mode", ctaKh: "លេងប្រចាំថ្ងៃ", icon: Flame },
  { id: "exam-simulation", tag: "PRO", tagColor: "#f97316", title: "Exam Simulation", titleKh: "ត្រាប់តាមប្រឡង", desc: "40 questions mirroring the real Cambodia exam.", descKh: "សាកល្បងប្រឡង ៤០ សំណួរ ដូចការប្រឡងយកប័ណ្ណបើកបរពិត។", color: "#f97316", accent: "249, 115, 22", href: "/play/solo?mode=exam-simulation", badge: "40Q · 45s", cta: "Simulate", ctaKh: "ចាប់ផ្តើមត្រាប់តាម", icon: Award },
];

const STATS = [
  { value: "500+", labelEn: "Questions", labelKh: "សំណួរ", color: "#eab308", icon: HelpCircle },
  { value: "6", labelEn: "Game Modes", labelKh: "របៀបលេង", color: "#ef4444", icon: Gamepad2 },
  { value: "8", labelEn: "Categories", labelKh: "ប្រភេទ", color: "#3b82f6", icon: Trophy },
  { value: "Live", labelEn: "Multiplayer", labelKh: "ប្រកួតផ្ទាល់", color: "#22c55e", icon: Users },
];

type GameMode = typeof GAME_MODES[number];

function GameModeCard({ mode, index, kh, khFont }: {
  mode: GameMode;
  index: number;
  kh: boolean;
  khFont: React.CSSProperties;
}) {
  const IconComp = GAME_MODE_ICONS[index];

  return (
    <Link
      href={mode.href}
      className="group relative flex flex-col h-full bg-[#151518]/90 border border-white/10 rounded-[10px] overflow-hidden transition-all duration-300 hover:border-white/20 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
      style={{
        // Dynamic box glow matching the game mode color
        boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 15px 35px rgba(${mode.accent}, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`;
      }}
    >
      {/* Decorative colored glow background circle */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[40px] opacity-10 transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: mode.color }}
      />

      {/* Diagonal gloss sweep highlight */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card Header/Icon Area */}
      <div className="p-6 pb-2 flex justify-between items-start">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center bg-zinc-950/80 border border-white/10 group-hover:border-white/25 group-hover:scale-105 transition-all duration-300 relative shadow-inner"
        >
          <div className="w-12 h-12 flex-shrink-0 transition-transform duration-300 group-hover:-rotate-3">
            <IconComp />
          </div>
        </div>

        {/* Top Badges */}
        <div className="flex flex-col items-end gap-2.5">
          {mode.tag && (
            <span 
              className="px-2.5 py-0.5 rounded-[4px] text-[9px] font-black tracking-wider text-black uppercase"
              style={{ backgroundColor: mode.color }}
            >
              {mode.tag}
            </span>
          )}
          <span 
            className="text-[11px] font-bold px-2.5 py-1 bg-white/5 text-zinc-300 border border-white/5 rounded-full tracking-wider transition-colors group-hover:text-white"
          >
            {mode.badge}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-6 pt-2">
        <h3 className="text-xl font-extrabold text-white tracking-tight mb-2 group-hover:text-white transition-colors" style={khFont}>
          {kh ? mode.titleKh : mode.title}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-400 font-medium mb-6 flex-1" style={khFont}>
          {kh ? mode.descKh : mode.desc}
        </p>

        {/* Interactive "ProMax" CTA Button */}
        <div className="mt-auto">
          <div
            className="w-full flex items-center justify-center gap-2 px-5 py-3 font-extrabold text-xs rounded-xl border border-white/5 bg-white/5 text-zinc-300 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300 shadow-md"
          >
            <span style={khFont}>{kh ? mode.ctaKh : mode.cta}</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1.5 transition-transform duration-300">
              <path d="M4 8h8M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Subtle Bottom Accent Indicator */}
      <div 
        className="h-[3px] w-full transition-transform duration-300 scale-x-0 group-hover:scale-x-100"
        style={{ backgroundColor: mode.color }}
      />
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
    <section className="relative overflow-hidden border-y border-white/5 bg-[#0a0a0c] py-16">
      {/* Spotlights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] opacity-10 bg-yellow-400 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] opacity-5 bg-blue-500 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row items-center gap-8 justify-between bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
              <Users size={28} className="text-yellow-400" />
            </div>
            <div>
              <div className="text-white font-extrabold text-2xl" style={khFont}>
                {kh ? "ចូលហ្គេមផ្ទាល់" : "Join a Live Game"}
              </div>
              <div className="text-zinc-400 text-sm font-semibold mt-1" style={khFont}>
                {kh ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់ដែលលោកគ្រូអ្នកគ្រូផ្តល់ឲ្យ" : "Enter the 6-character room code from your teacher"}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="ABC123"
              className="w-full sm:w-48 border border-white/10 rounded-xl bg-zinc-950/80 text-yellow-400 px-4 py-4 font-black text-2xl tracking-widest text-center focus:outline-none focus:border-yellow-400/50 placeholder:text-zinc-800 transition-colors"
            />
            <button
              onClick={join}
              disabled={code.length !== 6}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-yellow-400 text-black font-extrabold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:bg-yellow-300 hover:shadow-[0_0_25px_rgba(234,179,8,0.3)] active:scale-95 disabled:hover:shadow-none"
              style={khFont}
            >
              {kh ? "ចូលរួម" : "Join Game"}
              <ChevronRight size={20} />
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
    <div className="min-h-screen bg-[#070708] text-white font-sans selection:bg-yellow-400 selection:text-black">
      
      {/* Immersive Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[#09090b]">
        {/* Glow ambient spotlights */}
        <div className="absolute -top-32 -left-32 w-[35rem] h-[35rem] rounded-full blur-[140px] opacity-[0.08] bg-yellow-400 pointer-events-none animate-pulse duration-[8000ms]" />
        <div className="absolute top-20 right-0 w-[40rem] h-[40rem] rounded-full blur-[160px] opacity-[0.05] bg-blue-500 pointer-events-none" />

        {/* Clean Tech Grid Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)`,
            backgroundSize: "28px 28px",
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">
            <div className="flex flex-col gap-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 w-fit rounded-full border border-yellow-400/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                {kh ? "មជ្ឈមណ្ឌលហ្គេម" : "Lobby Hub"}
              </div>
              
              <h1 className="text-5xl md:text-[5.5rem] font-extrabold text-white leading-none tracking-tight" style={khFont}>
                {kh ? "ប្រកួត" : "PLAY"}<span className="text-yellow-400">.</span>
              </h1>
              
              <p className="text-md md:text-lg text-zinc-400 max-w-md leading-relaxed font-semibold" style={khFont}>
                {kh ? "ជ្រើសរើសរបៀបលេង សន្សំពិន្ទុរបស់អ្នក និងពង្រឹងចំណេះដឹងច្បាប់ចរាចរណ៍។" : "Select your mode, build your daily streak, and master your driving theory knowledge interactively."}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <Link href="/leaderboard"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-yellow-400 text-black font-extrabold transition-all duration-300 hover:bg-yellow-300 hover:shadow-[0_0_25px_rgba(234,179,8,0.25)] active:scale-95"
                  style={khFont}>
                  <Target size={18} />
                  {kh ? "តារាងពិន្ទុ" : "Leaderboard"}
                </Link>
                <Link href="/learn"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 text-white font-extrabold border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 active:scale-95"
                  style={khFont}>
                  <BookOpenCheck size={18} />
                  {kh ? "រៀនទ្រឹស្តី" : "Study First"}
                </Link>
              </div>
            </div>

            {/* Glowing Mode Counter Module */}
            <div className="relative group hidden md:flex flex-col items-center justify-center w-52 h-52 border border-white/10 bg-[#121215]/60 backdrop-blur-md rounded-2xl flex-shrink-0 shadow-2xl transition-all duration-300 hover:border-yellow-400/20 hover:shadow-[0_0_40px_rgba(234,179,8,0.1)]">
              <span className="text-7xl font-black text-yellow-400 tracking-tight group-hover:scale-105 transition-transform duration-300">6</span>
              <span className="text-xs font-black text-zinc-400 tracking-widest uppercase mt-2">
                {kh ? "របៀបលេង" : "Modes Available"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Glassmorphic Stats Section */}
      <div className="relative border-b border-white/5 bg-[#08080a] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, labelEn, labelKh, color, icon: Icon }) => (
              <div 
                key={labelEn} 
                className="relative group border border-white/5 bg-[#121215]/50 backdrop-blur-md rounded-xl p-6 flex flex-col gap-2 transition-all duration-300 hover:border-white/10 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold tracking-tight" style={{ color }}>{value}</span>
                  <Icon size={18} className="text-zinc-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest" style={khFont}>
                  {kh ? labelKh : labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Modes Grid */}
      <section className="py-24 bg-[#0a0a0c]" style={{ backgroundImage: "radial-gradient(#1c1c20 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="inline-block bg-yellow-400/10 text-yellow-400 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-yellow-400/20 mb-4" style={khFont}>
              {kh ? "ជ្រើសរើសរបៀបលេង" : "Choose Your Challenge"}
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={khFont}>
              {kh ? "របៀបលេង" : "Game "}
              <span className="text-yellow-400">
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

      {/* Immersive Call To Action Banner */}
      <section className="relative bg-zinc-950 py-24 overflow-hidden border-t border-white/5">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[35rem] h-[35rem] rounded-full blur-[140px] opacity-[0.04] bg-yellow-400 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6 relative">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={khFont}>
            {kh ? "តើអ្នកត្រៀមខ្លួនរួចរាល់ហើយឬនៅ?" : "Ready to test your skills?"}
          </h2>
          <p className="text-zinc-400 text-md md:text-lg max-w-lg leading-relaxed font-semibold" style={khFont}>
            {kh ? "សិក្សាទ្រឹស្តីលម្អិត លេងកម្សាន្ត និងត្រៀមប្រឡងយកប័ណ្ណបើកបរពិតប្រាកដ។" : "Study the theory modules, play the game sessions, and ace the driving license exam with confidence."}
          </p>
          <div className="mt-4">
            <Link href="/learn"
              className="px-10 py-4.5 rounded-xl bg-yellow-400 text-black font-extrabold transition-all duration-300 hover:bg-yellow-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] active:scale-95"
              style={khFont}>
              {kh ? "រៀនឥឡូវនេះ" : "Start Studying"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
