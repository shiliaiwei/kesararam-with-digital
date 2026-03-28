"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/context/lang-context";
import { Users, ChevronRight } from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const GAME_MODES = [
  { id: "quick-quiz", title: "Quick Quiz", titleKh: "សំណួរលឿន", desc: "10 random questions across all categories.", descKh: "សំណួរចៃដន្យ ១០", color: "#eab308", accent: "#ca8a04", href: "/play/solo?mode=quick-quiz", badge: "10Q · 30s", emoji: "❓" },
  { id: "speed-round", title: "Speed Round", titleKh: "វគ្គល្បឿន", desc: "Fast MCQ only — tap fast, score big.", descKh: "MCQ លឿន — ចុចឆាប់", color: "#ef4444", accent: "#b91c1c", href: "/play/solo?mode=speed-round", badge: "20Q · 15s", emoji: "⚡" },
  { id: "sign-challenge", title: "Sign Challenge", titleKh: "ប្រឡងសញ្ញា", desc: "Identify traffic signs from images only.", descKh: "ស្គាល់សញ្ញាផ្លូវវិថី", color: "#3b82f6", accent: "#1d4ed8", href: "/play/solo?mode=sign-challenge", badge: "15Q · 20s", emoji: "🚦" },
  { id: "mixed-battle", title: "Mixed Battle", titleKh: "ប្រយុទ្ធចម្រុះ", desc: "All categories, all question types.", descKh: "ប្រភេទទាំង ៨", color: "#a855f7", accent: "#7e22ce", href: "/play/solo?mode=mixed-battle", badge: "20Q · 30s", emoji: "🎲" },
  { id: "daily-challenge", title: "Daily Challenge", titleKh: "បញ្ហាប្រចាំថ្ងៃ", desc: "New questions every day. Build your streak.", descKh: "សំណួរថ្មីរៀងរាល់ថ្ងៃ", color: "#22c55e", accent: "#15803d", href: "/play/solo?mode=daily-challenge", badge: "15Q · 30s", emoji: "🔥" },
  { id: "exam-simulation", title: "Exam Simulation", titleKh: "ត្រាប់តាមប្រឡង", desc: "40 questions mirroring the real Cambodia exam.", descKh: "ស្រដៀងប្រឡងពិត", color: "#f97316", accent: "#c2410c", href: "/play/solo?mode=exam-simulation", badge: "40Q · 45s", emoji: "🏆" },
];

const STATS = [
  { value: "500+", label: "Questions", color: "#eab308" },
  { value: "6", label: "Game Modes", color: "#ef4444" },
  { value: "8", label: "Categories", color: "#3b82f6" },
  { value: "Live", label: "Multiplayer", color: "#22c55e" },
];

type GameMode = typeof GAME_MODES[number];

function GameModeCard({ mode, index, kh, khFont }: {
  mode: GameMode;
  index: number;
  kh: boolean;
  khFont: React.CSSProperties;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const playSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400 + index * 60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600 + index * 60, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch { /* silent */ }
  }, [index]);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.set(cardRef.current, { opacity: 0, y: 50, scale: 0.92 });
    const trigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: "top 88%",
      once: true,
      onEnter: () => gsap.to(cardRef.current, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.55, delay: index * 0.08, ease: "back.out(1.5)",
      }),
    });
    return () => trigger.kill();
  }, [index]);

  useEffect(() => {
    if (!iconRef.current) return;
    gsap.to(iconRef.current, {
      scale: hovered ? 1.25 : 1,
      rotation: hovered ? ([10, -10, 6, -6, 0] as number[])[index % 5] : 0,
      duration: 0.35,
      ease: "back.out(1.7)",
    });
  }, [hovered, index]);

  return (
    <Link
      ref={cardRef}
      href={mode.href}
      className="group relative flex flex-col overflow-hidden border-2 border-black"
      style={{
        boxShadow: hovered ? `6px 6px 0 ${mode.accent}` : "4px 4px 0 #000",
        borderRadius: "3px",
        transform: hovered ? "translate(-3px,-3px)" : "translate(0,0)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        background: "#fff",
      }}
      onMouseEnter={() => { setHovered(true); playSound(); }}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-2 w-full" style={{ backgroundColor: mode.color }} />
      <div
        className="relative flex items-center justify-between px-6 py-8 border-b-2 border-black overflow-hidden"
        style={{ backgroundColor: hovered ? mode.color : `${mode.color}18`, transition: "background-color 0.3s ease" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(-55deg, transparent 0, transparent 18px, rgba(0,0,0,0.04) 18px, rgba(0,0,0,0.04) 36px)",
            opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease",
          }}
        />
        <div ref={iconRef} className="text-6xl select-none" style={{ lineHeight: 1 }}>
          {mode.emoji}
        </div>
        <span
          className="text-xs font-black px-3 py-1.5 border-2 border-black"
          style={{
            backgroundColor: hovered ? "#000" : mode.color,
            color: hovered ? mode.color : "#000",
            borderRadius: "3px",
            transition: "background-color 0.25s, color 0.25s",
            ...khFont,
          }}
        >
          {mode.badge}
        </span>
      </div>
      <div
        className="flex flex-col flex-1 p-6 gap-3"
        style={{ transform: hovered ? "translateY(-2px)" : "translateY(0)", transition: "transform 0.25s ease" }}
      >
        <h3 className="text-xl font-black text-black" style={khFont}>
          {kh ? mode.titleKh : mode.title}
        </h3>
        <p className="text-sm text-zinc-500 leading-relaxed flex-1" style={khFont}>
          {kh ? mode.descKh : mode.desc}
        </p>
        <div className="flex items-center justify-between pt-3 border-t-2 border-black mt-1">
          <span
            className="text-sm font-black px-3 py-1 border-2 border-black"
            style={{
              backgroundColor: hovered ? "#000" : mode.color,
              color: hovered ? "#fff" : "#000",
              borderRadius: "3px",
              transition: "all 0.25s ease",
              ...khFont,
            }}
          >
            {kh ? "ចាប់ផ្តើម" : "Start playing"}
          </span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
            style={{ transform: hovered ? "translateX(5px)" : "translateX(0)", transition: "transform 0.25s ease" }}>
            <path d="M4 10h12M12 6l4 4-4 4" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
                {kh ? "ជ្រើសរើសរបៀបលេង ហើយធ្វើតេស្តចំណេះដឹងបើកបររបស់អ្នក" : "Choose a game mode and sharpen your driving theory knowledge."}
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
            {STATS.map(({ value, label, color }) => (
              <div key={label} className="stat-item border-2 border-black p-5 flex flex-col gap-1"
                style={{ boxShadow: `4px 4px 0 ${color}` }}>
                <span className="text-3xl font-black" style={{ color }}>{value}</span>
                <span className="text-sm font-bold text-zinc-500" style={khFont}>{label}</span>
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
              {kh ? "ជ្រើសរើស" : "Choose Mode"}
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
            {kh ? "ត្រៀមខ្លួនប្រឡង?" : "Ready to test yourself?"}
          </h2>
          <p className="text-white/50 text-lg" style={khFont}>
            {kh ? "ចូលរៀន — ចូលប្រកួត — ជោគជ័យ" : "Study the theory, play the games, pass the exam."}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/learn"
              className="px-10 py-4 bg-yellow-400 text-black font-black border-2 border-yellow-400 text-lg transition-all hover:-translate-y-1"
              style={{ boxShadow: "6px 6px 0 #ca8a04", ...khFont }}>
              {kh ? "ចូលរៀន →" : "Start Learning →"}
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
