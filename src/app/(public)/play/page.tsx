"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/context/lang-context";
import { Users, ChevronRight } from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// ── Game mode SVG icons — animated, centered ────────────────────────────────

function IconQuickQuiz({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <circle cx="40" cy="40" r="32" fill="#fef08a" stroke="#ca8a04" strokeWidth="3">
        {animated && <animate attributeName="r" values="32;34;32" dur="1.8s" repeatCount="indefinite" />}
      </circle>
      <circle cx="40" cy="40" r="24" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" opacity="0.5" />
      <text x="40" y="52" textAnchor="middle" fontSize="36" fontWeight="900" fill="#92400e" fontFamily="system-ui">?</text>
      {animated && <>
        <circle cx="62" cy="18" r="4" fill="#fbbf24" opacity="0.7"><animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" /></circle>
        <circle cx="18" cy="62" r="3" fill="#fbbf24" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.4s" repeatCount="indefinite" /></circle>
      </>}
    </svg>
  );
}

function IconSpeedRound({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <polygon points="40,6 46,28 68,28 50,44 57,66 40,52 23,66 30,44 12,28 34,28" fill="#fca5a5" stroke="#b91c1c" strokeWidth="2.5">
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 40 40;5 40 40;-5 40 40;0 40 40" dur="0.8s" repeatCount="indefinite" />}
      </polygon>
      <polygon points="40,14 44,30 56,30 46,40 50,54 40,46 30,54 34,40 24,30 36,30" fill="#ef4444" />
      <text x="40" y="46" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff" fontFamily="system-ui">⚡</text>
    </svg>
  );
}

function IconSignChallenge({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <polygon points="40,6 74,40 40,74 6,40" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="3">
        {animated && <animate attributeName="stroke-width" values="3;5;3" dur="1.5s" repeatCount="indefinite" />}
      </polygon>
      <polygon points="40,14 66,40 40,66 14,40" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1" opacity="0.5" />
      <circle cx="40" cy="36" r="5" fill="#1d4ed8" />
      <rect x="38" y="44" width="4" height="4" rx="2" fill="#1d4ed8" />
    </svg>
  );
}

function IconMixedBattle({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="8" y="8" width="28" height="28" rx="5" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2.5">
        {animated && <animate attributeName="y" values="8;5;8" dur="1.2s" repeatCount="indefinite" />}
      </rect>
      <rect x="44" y="8" width="28" height="28" rx="5" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2.5">
        {animated && <animate attributeName="y" values="8;11;8" dur="1.2s" repeatCount="indefinite" />}
      </rect>
      <rect x="8" y="44" width="28" height="28" rx="5" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2.5">
        {animated && <animate attributeName="y" values="44;47;44" dur="1.2s" repeatCount="indefinite" />}
      </rect>
      <rect x="44" y="44" width="28" height="28" rx="5" fill="#7e22ce" stroke="#7e22ce" strokeWidth="2.5">
        {animated && <animate attributeName="y" values="44;41;44" dur="1.2s" repeatCount="indefinite" />}
      </rect>
      <text x="58" y="64" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="900">⚔</text>
    </svg>
  );
}

function IconDailyChallenge({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="10" y="16" width="60" height="54" rx="5" fill="#bbf7d0" stroke="#15803d" strokeWidth="2.5" />
      <rect x="10" y="16" width="60" height="18" rx="5" fill="#15803d" />
      <line x1="26" y1="10" x2="26" y2="24" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <line x1="54" y1="10" x2="54" y2="24" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="46" r="5" fill="#15803d">
        {animated && <animate attributeName="r" values="5;7;5" dur="1s" repeatCount="indefinite" />}
      </circle>
      <circle cx="52" cy="46" r="5" fill="#15803d" opacity="0.5" />
      <circle cx="28" cy="60" r="5" fill="#15803d" opacity="0.3" />
      <circle cx="52" cy="60" r="5" fill="#15803d" opacity="0.3" />
    </svg>
  );
}

function IconExamSimulation({ animated }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <polygon points="40,4 48,28 74,28 53,44 61,68 40,53 19,68 27,44 6,28 32,28" fill="#fed7aa" stroke="#c2410c" strokeWidth="2.5">
        {animated && <animateTransform attributeName="transform" type="scale" values="1 1;1.05 1.05;1 1" additive="sum" dur="1.5s" repeatCount="indefinite" />}
      </polygon>
      <polygon points="40,12 46,30 62,30 49,40 54,58 40,48 26,58 31,40 18,30 34,30" fill="#f97316" />
      <circle cx="40" cy="36" r="6" fill="#fff" opacity="0.9" />
    </svg>
  );
}

const GAME_MODE_ICONS = [IconQuickQuiz, IconSpeedRound, IconSignChallenge, IconMixedBattle, IconDailyChallenge, IconExamSimulation];

const GAME_MODES = [
  { id: "quick-quiz", title: "Quick Quiz", titleKh: "សំណួរលឿន", desc: "10 random questions across all categories.", descKh: "សំណួរចៃដន្យ ១០", color: "#eab308", accent: "#ca8a04", href: "/play/solo?mode=quick-quiz", badge: "10Q · 30s", cta: "Play Now →", ctaKh: "លេងឥឡូវ" },
  { id: "speed-round", title: "Speed Round", titleKh: "វគ្គល្បឿន", desc: "Fast MCQ only — tap fast, score big.", descKh: "MCQ លឿន — ចុចឆាប់", color: "#ef4444", accent: "#b91c1c", href: "/play/solo?mode=speed-round", badge: "20Q · 15s", cta: "Go Fast →", ctaKh: "ចូលប្រកួត" },
  { id: "sign-challenge", title: "Sign Challenge", titleKh: "ប្រឡងសញ្ញា", desc: "Identify traffic signs from images only.", descKh: "ស្គាល់សញ្ញាចរាចរ", color: "#3b82f6", accent: "#1d4ed8", href: "/play/solo?mode=sign-challenge", badge: "15Q · 20s", cta: "Challenge →", ctaKh: "ប្រឡង" },
  { id: "mixed-battle", title: "Mixed Battle", titleKh: "ប្រកួតចម្រុះ", desc: "All categories, all question types.", descKh: "ប្រភេទទាំង ៨", color: "#a855f7", accent: "#7e22ce", href: "/play/solo?mode=mixed-battle", badge: "20Q · 30s", cta: "Battle! →", ctaKh: "ប្រកួត" },
  { id: "daily-challenge", title: "Daily Challenge", titleKh: "បញ្ហាប្រចាំថ្ងៃ", desc: "New questions every day. Build your streak.", descKh: "សំណួរថ្មីរៀងរាល់ថ្ងៃ", color: "#22c55e", accent: "#15803d", href: "/play/solo?mode=daily-challenge", badge: "15Q · 30s", cta: "Daily →", ctaKh: "ប្រចាំថ្ងៃ" },
  { id: "exam-simulation", title: "Exam Simulation", titleKh: "ត្រាប់តាមប្រឡង", desc: "40 questions mirroring the real Cambodia exam.", descKh: "ស្រដៀងប្រឡងពិត", color: "#f97316", accent: "#c2410c", href: "/play/solo?mode=exam-simulation", badge: "40Q · 45s", cta: "Simulate →", ctaKh: "ត្រាប់តាម" },
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
    gsap.set(cardRef.current, { opacity: 0, y: 48, scale: 0.93 });
    const trigger = ScrollTrigger.create({
      trigger: cardRef.current, start: "top 90%", once: true,
      onEnter: () => gsap.to(cardRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.55, delay: index * 0.07, ease: "back.out(1.6)" }),
    });
    return () => trigger.kill();
  }, [index]);

  return (
    <Link
      ref={cardRef}
      href={mode.href}
      className="group relative flex flex-col overflow-hidden border-3 border-black"
      style={{
        boxShadow: hovered ? `0 0 0 3px #000, 10px 10px 0 ${mode.color}` : `0 0 0 3px #000, 5px 5px 0 #000`,
        transform: hovered ? "translate(-5px,-5px)" : "translate(0,0)",
        transition: "box-shadow 0.18s ease, transform 0.18s ease",
        background: hovered ? mode.color : "#fff",
        border: "3px solid #000",
      }}
      onMouseEnter={() => { setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Full-color header band */}
      <div
        className="relative flex items-center justify-between px-4 pt-4 pb-3"
        style={{ backgroundColor: mode.color }}
      >
        {/* Big icon left */}
        <div
          className="w-16 h-16 flex-shrink-0"
          style={{
            transform: hovered ? "scale(1.2) rotate(-6deg)" : "scale(1) rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.25))",
          }}
        >
          <IconComp animated={hovered} />
        </div>
        {/* Badge top-right */}
        <div
          className="text-xs font-black px-2.5 py-1 self-start"
          style={{
            backgroundColor: "#000",
            color: mode.color,
            border: "2px solid #000",
            letterSpacing: "0.05em",
          }}
        >
          {mode.badge}
        </div>
      </div>

      {/* Content area */}
      <div
        className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-1.5"
        style={{
          backgroundColor: hovered ? mode.color : "#fff",
          transition: "background-color 0.18s ease",
          borderTop: "3px solid #000",
        }}
      >
        <h3
          className="text-xl font-black leading-tight"
          style={{ color: hovered ? "#000" : "#000", ...khFont }}
        >
          {kh ? mode.titleKh : mode.title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: hovered ? "rgba(0,0,0,0.7)" : "#71717a", ...khFont }}
        >
          {kh ? mode.descKh : mode.desc}
        </p>

        {/* CTA */}
        <div className="mt-3">
          <div
            className="w-full flex items-center justify-center gap-2 py-3 font-black text-sm border-2 border-black"
            style={{
              backgroundColor: hovered ? "#000" : mode.color,
              color: hovered ? mode.color : "#000",
              transition: "all 0.18s ease",
              boxShadow: hovered ? "none" : "3px 3px 0 #000",
            }}
          >
            <span style={khFont}>{kh ? mode.ctaKh : mode.cta}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ transform: hovered ? "translateX(5px)" : "translateX(0)", transition: "transform 0.18s ease" }}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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

  function join() {
    const c = code.trim().toUpperCase();
    if (c.length === 6) router.push(`/play/${c}`);
  }

  return (
    <section className="border-b-2 border-black bg-zinc-950 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "3px 3px 0 #ca8a04" }}>
              <Users size={20} className="text-black" />
            </div>
            <div>
              <div className="text-white font-black text-lg" style={khFont}>
                {kh ? "ចូលហ្គេមផ្ទាល់" : "Join a Live Game"}
              </div>
              <div className="text-zinc-400 text-sm" style={khFont}>
                {kh ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់" : "Enter the 6-character room code from your teacher"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="ABC123"
              className="w-full md:w-40 border-2 border-yellow-400 bg-zinc-900 text-yellow-400 px-4 py-3 font-black text-xl tracking-widest text-center focus:outline-none placeholder:text-zinc-600"
            />
            <button
              onClick={join}
              disabled={code.length !== 6}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-black border-2 border-yellow-400 disabled:opacity-40 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "3px 3px 0 #ca8a04", ...khFont }}
            >
              {kh ? "ចូល" : "Join"}
              <ChevronRight size={16} />
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
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(headingRef.current, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
      .fromTo(subRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.3")
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.2");

    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.querySelectorAll(".stat-item"),
        { y: 30, opacity: 0, scale: 0.9 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.1, ease: "back.out(1.4)",
          scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b-4 border-black"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #000 60%, #1a0a00 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            animation: "slide 10s linear infinite",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex flex-col gap-5 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-3 py-1.5 w-fit border-2 border-yellow-400">
                <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
                {kh ? "លេងហ្គេម" : "Game Center"}
              </div>
              <h1 ref={headingRef} className="text-6xl md:text-8xl font-black text-white leading-none" style={khFont}>
                {kh ? "ប្រកួត" : "PLAY"}<span className="text-yellow-400">.</span>
              </h1>
              <p ref={subRef} className="text-lg md:text-xl text-white/60 max-w-lg leading-relaxed" style={khFont}>
                {kh ? "ជ្រើសរើសរបៀបលេង ហើយសាកល្បងចំណេះដឹងរបស់អ្នក" : "Choose a game mode and sharpen your driving theory knowledge."}
              </p>
              <div ref={ctaRef} className="flex flex-wrap gap-3">
                <Link href="/leaderboard"
                  className="px-6 py-3 bg-yellow-400 text-black font-black border-2 border-yellow-400 transition-all hover:-translate-y-1"
                  style={{ boxShadow: "4px 4px 0 #ca8a04", ...khFont }}>
                  {kh ? "មើលចំណាត់ថ្នាក់ →" : "Leaderboard →"}
                </Link>
                <Link href="/learn"
                  className="px-6 py-3 bg-transparent text-white font-black border-2 border-white/40 hover:border-white transition-all"
                  style={khFont}>
                  {kh ? "រៀនមុន" : "Study First"}
                </Link>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center w-40 h-40 border-4 border-yellow-400 bg-yellow-400/10 flex-shrink-0"
              style={{ boxShadow: "8px 8px 0 #ca8a04" }}>
              <span className="text-5xl font-black text-yellow-400">6</span>
              <span className="text-xs font-black text-white/60 tracking-widest uppercase mt-1">
                {kh ? "របៀបលេង" : "Game Modes"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Join Live */}
      <JoinLiveSection lang={lang} />

      {/* Stats */}
      <div ref={statsRef} className="border-b-2 border-black bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, labelEn, labelKh, color }) => (
              <div key={labelEn} className="stat-item border-2 border-black p-5 flex flex-col gap-1"
                style={{ boxShadow: `4px 4px 0 ${color}` }}>
                <span className="text-3xl font-black" style={{ color }}>{value}</span>
                <span className="text-sm font-bold text-zinc-500" style={khFont}>{kh ? labelKh : labelEn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Modes */}
      <section className="dot-bg py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <div className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
              {kh ? "ជ្រើសរើសរបៀប" : "Choose Mode"}
            </div>
            <h2 className="text-4xl md:text-5xl font-black" style={khFont}>
              {kh ? "របៀបលេង" : "Game "}
              <span className="underline decoration-yellow-400 decoration-4">
                {kh ? "" : "Modes"}
              </span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_MODES.map((mode, index) => (
              <GameModeCard key={mode.id} mode={mode} index={index} kh={kh} khFont={khFont} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black border-t-4 border-yellow-400 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl md:text-5xl font-black text-white" style={khFont}>
            {kh ? "ត្រៀមខ្លួនហើយ?" : "Ready to test yourself?"}
          </h2>
          <p className="text-white/50 text-lg" style={khFont}>
            {kh ? "រៀន — ប្រកួត — ការពារជីវិត" : "Study the theory, play the games, pass the exam."}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/learn"
              className="px-10 py-4 bg-yellow-400 text-black font-black border-2 border-yellow-400 text-lg transition-all hover:-translate-y-1"
              style={{ boxShadow: "6px 6px 0 #ca8a04", ...khFont }}>
              {kh ? "រៀនឥឡូវ →" : "Start Learning →"}
            </Link>
            <Link href="/login"
              className="px-10 py-4 bg-transparent text-white font-black border-2 border-white/40 hover:border-white text-lg transition-all"
              style={khFont}>
              {kh ? "បង្កើតគណនី" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
