"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/context/lang-context";
import { Users, ChevronRight, PlayCircle, Zap, ShieldAlert, Target, CalendarDays, BookOpenCheck } from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// ── Game mode SVG icons (Updated for dark mode) ──────────────────────────────

function IconQuickQuiz({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">
      <circle cx="40" cy="40" r="32" fill="#eab308" fillOpacity="0.2" stroke="#eab308" strokeWidth="2">
        {animated && <animate attributeName="r" values="32;34;32" dur="1.8s" repeatCount="indefinite" />}
      </circle>
      <circle cx="40" cy="40" r="24" fill="#eab308" fillOpacity="0.4" stroke="#fde047" strokeWidth="1" />
      <text x="40" y="52" textAnchor="middle" fontSize="36" fontWeight="900" fill="#fff" fontFamily="system-ui">?</text>
      {animated && <>
        <circle cx="62" cy="18" r="4" fill="#fde047" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" /></circle>
        <circle cx="18" cy="62" r="3" fill="#fde047" opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.4s" repeatCount="indefinite" /></circle>
      </>}
    </svg>
  );
}

function IconSpeedRound({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
      <polygon points="40,6 46,28 68,28 50,44 57,66 40,52 23,66 30,44 12,28 34,28" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2">
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 40 40;5 40 40;-5 40 40;0 40 40" dur="0.8s" repeatCount="indefinite" />}
      </polygon>
      <polygon points="40,14 44,30 56,30 46,40 50,54 40,46 30,54 34,40 24,30 36,30" fill="#f87171" fillOpacity="0.8" />
      <text x="40" y="46" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff" fontFamily="system-ui">⚡</text>
    </svg>
  );
}

function IconSignChallenge({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
      <polygon points="40,6 74,40 40,74 6,40" fill="#3b82f6" fillOpacity="0.2" stroke="#60a5fa" strokeWidth="2">
        {animated && <animate attributeName="stroke-width" values="2;4;2" dur="1.5s" repeatCount="indefinite" />}
      </polygon>
      <polygon points="40,14 66,40 40,66 14,40" fill="#93c5fd" fillOpacity="0.4" stroke="#93c5fd" strokeWidth="1" />
      <circle cx="40" cy="36" r="5" fill="#fff" />
      <rect x="38" y="44" width="4" height="4" rx="2" fill="#fff" />
    </svg>
  );
}

function IconMixedBattle({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
      <rect x="8" y="8" width="28" height="28" rx="6" fill="#a855f7" fillOpacity="0.2" stroke="#c084fc" strokeWidth="2">
        {animated && <animate attributeName="y" values="8;5;8" dur="1.2s" repeatCount="indefinite" />}
      </rect>
      <rect x="44" y="8" width="28" height="28" rx="6" fill="#a855f7" fillOpacity="0.2" stroke="#c084fc" strokeWidth="2">
        {animated && <animate attributeName="y" values="8;11;8" dur="1.2s" repeatCount="indefinite" />}
      </rect>
      <rect x="8" y="44" width="28" height="28" rx="6" fill="#a855f7" fillOpacity="0.2" stroke="#c084fc" strokeWidth="2">
        {animated && <animate attributeName="y" values="44;47;44" dur="1.2s" repeatCount="indefinite" />}
      </rect>
      <rect x="44" y="44" width="28" height="28" rx="6" fill="#c084fc" fillOpacity="0.6" stroke="#d8b4fe" strokeWidth="2">
        {animated && <animate attributeName="y" values="44;41;44" dur="1.2s" repeatCount="indefinite" />}
      </rect>
      <text x="58" y="64" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="900">⚔</text>
    </svg>
  );
}

function IconDailyChallenge({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
      <rect x="10" y="16" width="60" height="54" rx="8" fill="#22c55e" fillOpacity="0.15" stroke="#4ade80" strokeWidth="2" />
      <rect x="10" y="16" width="60" height="18" rx="8" fill="#22c55e" fillOpacity="0.6" />
      <line x1="26" y1="10" x2="26" y2="24" stroke="#86efac" strokeWidth="3" strokeLinecap="round" />
      <line x1="54" y1="10" x2="54" y2="24" stroke="#86efac" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="46" r="6" fill="#4ade80">
        {animated && <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite" />}
      </circle>
      <circle cx="52" cy="46" r="5" fill="#4ade80" opacity="0.6" />
      <circle cx="28" cy="60" r="5" fill="#4ade80" opacity="0.4" />
      <circle cx="52" cy="60" r="5" fill="#4ade80" opacity="0.4" />
    </svg>
  );
}

function IconExamSimulation({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
      <polygon points="40,4 48,28 74,28 53,44 61,68 40,53 19,68 27,44 6,28 32,28" fill="#f97316" fillOpacity="0.2" stroke="#fb923c" strokeWidth="2">
        {animated && <animateTransform attributeName="transform" type="scale" values="1 1;1.05 1.05;1 1" additive="sum" dur="1.5s" repeatCount="indefinite" />}
      </polygon>
      <polygon points="40,12 46,30 62,30 49,40 54,58 40,48 26,58 31,40 18,30 34,30" fill="#fb923c" fillOpacity="0.7" />
      <circle cx="40" cy="36" r="6" fill="#fff" opacity="0.9" />
    </svg>
  );
}

const GAME_MODE_ICONS = [IconQuickQuiz, IconSpeedRound, IconSignChallenge, IconMixedBattle, IconDailyChallenge, IconExamSimulation];

const GAME_MODES = [
  { id: "quick-quiz", tag: "HOT", tagColor: "#ef4444", title: "Quick Quiz", titleKh: "សំណួរលឿន", desc: "10 random questions across all categories.", descKh: "សំណួរចៃដន្យ ១០", color: "#eab308", accent: "#ca8a04", href: "/play/solo?mode=quick-quiz", badge: "10Q · 30s", cta: "Play Now", ctaKh: "លេងឥឡូវ" },
  { id: "speed-round", tag: "INTENSE", tagColor: "#a855f7", title: "Speed Round", titleKh: "វគ្គល្បឿន", desc: "Fast MCQ only — tap fast, score big.", descKh: "MCQ លឿន — ចុចឆាប់", color: "#ef4444", accent: "#b91c1c", href: "/play/solo?mode=speed-round", badge: "20Q · 15s", cta: "Go Fast", ctaKh: "ចូលប្រកួត" },
  { id: "sign-challenge", tag: "", tagColor: "", title: "Sign Challenge", titleKh: "ប្រឡងសញ្ញា", desc: "Identify traffic signs from images only.", descKh: "ស្គាល់សញ្ញាចរាចរ", color: "#3b82f6", accent: "#1d4ed8", href: "/play/solo?mode=sign-challenge", badge: "15Q · 20s", cta: "Challenge", ctaKh: "ប្រឡង" },
  { id: "mixed-battle", tag: "NEW", tagColor: "#3b82f6", title: "Mixed Battle", titleKh: "ប្រកួតចម្រុះ", desc: "All categories, all question types.", descKh: "ប្រភេទទាំង ៨", color: "#a855f7", accent: "#7e22ce", href: "/play/solo?mode=mixed-battle", badge: "20Q · 30s", cta: "Battle!", ctaKh: "ប្រកួត" },
  { id: "daily-challenge", tag: "DAILY", tagColor: "#22c55e", title: "Daily Challenge", titleKh: "បញ្ហាប្រចាំថ្ងៃ", desc: "New questions every day. Build your streak.", descKh: "សំណួរថ្មីរៀងរាល់ថ្ងៃ", color: "#22c55e", accent: "#15803d", href: "/play/solo?mode=daily-challenge", badge: "15Q · 30s", cta: "Play Daily", ctaKh: "ប្រចាំថ្ងៃ" },
  { id: "exam-simulation", tag: "PRO", tagColor: "#eab308", title: "Exam Simulation", titleKh: "ត្រាប់តាមប្រឡង", desc: "40 questions mirroring the real Cambodia exam.", descKh: "ស្រដៀងប្រឡងពិត", color: "#f97316", accent: "#c2410c", href: "/play/solo?mode=exam-simulation", badge: "40Q · 45s", cta: "Simulate", ctaKh: "ត្រាប់តាម" },
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
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const IconComp = GAME_MODE_ICONS[index];

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.set(cardRef.current, { opacity: 0, y: 40, scale: 0.95 });
    const trigger = ScrollTrigger.create({
      trigger: cardRef.current, start: "top 95%", once: true,
      onEnter: () => gsap.to(cardRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: index * 0.08, ease: "power3.out" }),
    });
    return () => trigger.kill();
  }, [index]);

  return (
    <Link
      ref={cardRef}
      href={mode.href}
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden active:scale-[0.97] transition-all duration-300"
      style={{
        background: `linear-gradient(180deg, rgba(24,24,27,0.8) 0%, rgba(9,9,11,0.9) 100%)`,
        border: `1px solid ${hovered ? mode.color : 'rgba(255,255,255,0.1)'}`,
        boxShadow: hovered ? `0 10px 40px -10px ${mode.color}60, inset 0 0 20px ${mode.color}15` : `0 10px 30px -10px rgba(0,0,0,0.5)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background glow effect based on mode color */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-30 pointer-events-none transition-opacity duration-500"
        style={{ backgroundColor: mode.color, opacity: hovered ? 0.6 : 0.2 }}
      />

      <div className="relative flex flex-col p-6 h-full z-10">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-6">
          <div 
            className="w-16 h-16 flex-shrink-0 relative transition-transform duration-500 cubic-bezier(0.34,1.56,0.64,1)"
            style={{ transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)" }}
          >
            <IconComp animated={hovered} />
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {mode.tag && (
              <span 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest text-white uppercase shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${mode.tagColor}, ${mode.accent})`,
                  boxShadow: `0 0 10px ${mode.tagColor}50`
                }}
              >
                {mode.tag}
              </span>
            )}
            <span className="text-xs font-bold text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-md border border-zinc-700/50">
              {mode.badge}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 
            className="text-2xl font-black text-white mb-2 tracking-tight transition-colors duration-300"
            style={{ ...khFont }}
          >
            {kh ? mode.titleKh : mode.title}
          </h3>
          <p 
            className="text-sm text-zinc-400 leading-relaxed mb-6 flex-1"
            style={khFont}
          >
            {kh ? mode.descKh : mode.desc}
          </p>

          {/* Action Button */}
          <div 
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden relative group/btn"
            style={{
              backgroundColor: hovered ? mode.color : "rgba(255,255,255,0.05)",
              color: hovered ? "#000" : mode.color,
              border: `1px solid ${hovered ? mode.color : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            {/* Button highlight sweep effect */}
            {hovered && (
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:animate-[shimmer_1s_ease-out_forwards]" />
            )}
            
            <span className="relative z-10" style={khFont}>{kh ? mode.ctaKh : mode.cta}</span>
            <ChevronRight 
              size={18} 
              className="relative z-10 transition-transform duration-300"
              style={{ transform: hovered ? "translateX(4px)" : "translateX(0)" }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function JoinLiveSection({ lang }: { lang: string }) {
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  function join() {
    const c = code.trim().toUpperCase();
    if (c.length === 6) router.push(`/play/${c}`);
  }

  return (
    <section className="relative overflow-hidden py-16 border-y border-zinc-800" style={{ background: "linear-gradient(to bottom, #09090b, #111827)" }}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-32 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 justify-between bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex-shrink-0">
              <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse" />
              <Users size={28} className="text-yellow-400 relative z-10" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl mb-1 tracking-tight" style={khFont}>
                {kh ? "ចូលហ្គេមផ្ទាល់" : "Join a Live Game"}
              </h2>
              <p className="text-zinc-400 text-sm" style={khFont}>
                {kh ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់ពីគ្រូរបស់អ្នក" : "Enter the 6-character room code from your teacher or host"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-56">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && join()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="ABC123"
                className="w-full bg-black/50 text-white px-5 py-4 rounded-xl font-black text-2xl tracking-[0.2em] text-center border transition-all duration-300 focus:outline-none placeholder:text-zinc-700 uppercase"
                style={{
                  borderColor: isFocused ? "#eab308" : "rgba(255,255,255,0.1)",
                  boxShadow: isFocused ? "0 0 20px rgba(234,179,8,0.2), inset 0 0 10px rgba(234,179,8,0.1)" : "none"
                }}
              />
              {/* Animated dashed border on focus to look high-tech */}
              {isFocused && (
                <div className="absolute inset-0 border-2 border-dashed border-yellow-400/30 rounded-xl pointer-events-none animate-[spin_10s_linear_infinite]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 20%, 0 20%)' }} />
              )}
            </div>
            <button
              onClick={join}
              disabled={code.length !== 6}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
              style={{
                background: code.length === 6 ? "linear-gradient(135deg, #facc15, #ca8a04)" : "#27272a",
                color: code.length === 6 ? "#000" : "#52525b",
                boxShadow: code.length === 6 ? "0 10px 25px -5px rgba(234,179,8,0.4)" : "none"
              }}
            >
              <span style={khFont}>{kh ? "ចូលរួម" : "Join"}</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.fromTo(headingRef.current, { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8 })
      .fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.5")
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4");

    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.querySelectorAll(".stat-item"),
        { y: 40, opacity: 0, scale: 0.9 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)",
          scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-yellow-400/30 selection:text-yellow-200">
      
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 80%)",
        }}
      />
      
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
              
              <div className="flex flex-col gap-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-xs font-black tracking-widest uppercase px-4 py-2 w-fit rounded-full shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_#facc15]" />
                  {kh ? "មជ្ឈមណ្ឌលហ្គេម" : "Game Center"}
                </div>
                
                <h1 ref={headingRef} className="text-6xl md:text-[5.5rem] font-black text-white leading-[1.1] tracking-tight" style={khFont}>
                  {kh ? "ជ្រើសរើស" : "Select"} <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    {kh ? "របៀបលេង" : "Your Mode."}
                  </span>
                </h1>
                
                <p ref={subRef} className="text-lg md:text-xl text-zinc-400 max-w-lg leading-relaxed" style={khFont}>
                  {kh ? "ប្រកួតប្រជែងចំណេះដឹងរបស់អ្នក បង្កើនល្បឿន និងត្រៀមខ្លួនសម្រាប់ការប្រឡងពិតប្រាកដ។" : "Challenge your knowledge, build your streak, and prepare for the real driving theory exam."}
                </p>
                
                <div ref={ctaRef} className="flex flex-wrap gap-4 mt-2">
                  <Link href="/leaderboard"
                    className="flex items-center gap-2 px-8 py-4 bg-yellow-400 text-black font-black rounded-xl hover:bg-yellow-300 transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]"
                    style={khFont}>
                    <Target size={20} />
                    {kh ? "តារាងពិន្ទុ" : "Leaderboard"}
                  </Link>
                  <Link href="/learn"
                    className="flex items-center gap-2 px-8 py-4 bg-zinc-900/80 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 transition-all active:scale-95"
                    style={khFont}>
                    <BookOpenCheck size={20} className="text-zinc-400" />
                    {kh ? "រៀនទ្រឹស្តីសិន" : "Study First"}
                  </Link>
                </div>
              </div>

              {/* Decorative Element Right Side */}
              <div className="hidden md:flex relative justify-center items-center w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative w-48 h-48 bg-black/40 backdrop-blur-xl border border-zinc-800 rounded-3xl flex flex-col items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                  <span className="text-7xl font-black bg-gradient-to-br from-yellow-400 to-orange-500 text-transparent bg-clip-text drop-shadow-lg">6</span>
                  <span className="text-sm font-black text-zinc-500 tracking-widest uppercase mt-2">Modes</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section Holographic Style */}
        <div ref={statsRef} className="py-8 relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map(({ value, labelEn, labelKh, color }) => (
                <div key={labelEn} className="stat-item relative overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 p-6 rounded-2xl flex flex-col items-center text-center group transition-all hover:bg-zinc-800/80 hover:border-zinc-700">
                  <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                  <span className="text-4xl md:text-5xl font-black tracking-tighter mb-1 transition-transform group-hover:scale-110" style={{ color }}>{value}</span>
                  <span className="text-xs md:text-sm font-bold text-zinc-500 tracking-wider uppercase" style={khFont}>{kh ? labelKh : labelEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Modes Grid */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight" style={khFont}>
                {kh ? "ជ្រើសរើសរបៀបលេង" : "Available Modes"}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GAME_MODES.map((mode, index) => (
                <GameModeCard key={mode.id} mode={mode} index={index} kh={kh} khFont={khFont} />
              ))}
            </div>
          </div>
        </section>

        <JoinLiveSection lang={lang} />

        {/* Final CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-yellow-400/5" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-yellow-500/10 to-transparent pointer-events-none" />
          
          <div className="relative max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-8">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg mb-2">
              <Zap size={32} className="text-yellow-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight" style={khFont}>
              {kh ? "តើអ្នកត្រៀមខ្លួនហើយឬនៅ?" : "Ready to test your limits?"}
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl" style={khFont}>
              {kh ? "ចាប់ផ្តើមរៀនសូត្រ យកឈ្នះពិន្ទុ និងក្លាយជាអ្នកបើកបរដ៏ឆ្នើម។" : "Master the theory, climb the leaderboard, and pass the real exam with confidence."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/learn"
                className="px-10 py-5 bg-white text-black font-black rounded-xl text-lg transition-all hover:bg-zinc-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                style={khFont}>
                {kh ? "ចាប់ផ្តើមរៀនឥឡូវនេះ" : "Start Learning Free"}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
