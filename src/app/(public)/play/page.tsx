"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { 
  Users, 
  ChevronRight, 
  Zap, 
  BookOpenCheck, 
  Play, 
  Trophy, 
  Flame, 
  Clock, 
  Swords, 
  CalendarDays, 
  TriangleAlert, 
  Star, 
  GraduationCap 
} from "lucide-react";

// ─── BRAND COLORS ─────────────────────────────────────────────────────────────
const BRAND = {
  yellow: "#eab308",
  yellowDark: "#ca8a04",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
  cyan: "#06b6d4",
  black: "#000000",
  white: "#ffffff",
};

// ─── GAME MODES DATA ──────────────────────────────────────────────────────────
const GAME_MODES = [
  {
    id: "quick-quiz",
    number: "01",
    tag: "POPULAR",
    title: "Quick Quiz",
    titleKh: "សំណួរលឿន",
    desc: "10 random questions. Fast, no pressure, zero setup. Perfect warm-up.",
    descKh: "សំណួរចៃដន្យ ១០ — មិនបាច់បង្កើតគណនី",
    color: BRAND.yellow,
    textOnColor: BRAND.black,
    accentShadow: BRAND.black,
    href: "/play/solo?mode=quick-quiz",
    badge: "10 Qs",
    timer: "30s",
    cta: "PLAY NOW",
    ctaKh: "លេងឥឡូវ",
    Icon: Zap,
    difficulty: "EASY",
    diffColor: BRAND.green,
    xp: "+100 XP",
    players: "14.2K today",
  },
  {
    id: "speed-round",
    number: "02",
    tag: "INTENSE",
    title: "Speed Round",
    titleKh: "វគ្គល្បឿន",
    desc: "15 seconds per question. Think fast, tap faster. Adrenaline guaranteed.",
    descKh: "ចុចឆាប់ — ១៥វិនាទីក្នុងមួយសំណួរ",
    color: BRAND.red,
    textOnColor: BRAND.white,
    accentShadow: BRAND.black,
    href: "/play/solo?mode=speed-round",
    badge: "20 Qs",
    timer: "15s",
    cta: "RUSH IN",
    ctaKh: "ចូលប្រកួត",
    Icon: Flame,
    difficulty: "HARD",
    diffColor: BRAND.red,
    xp: "+250 XP",
    players: "8.5K today",
  },
  {
    id: "sign-challenge",
    number: "03",
    tag: "VISUAL",
    title: "Sign Challenge",
    titleKh: "ប្រឡងសញ្ញា",
    desc: "Test your visual memory. Identify traffic signs. Images only, no text.",
    descKh: "ស្គាល់សញ្ញាចរាចរ — រូបភាពប៉ុណ្ណោះ",
    color: BRAND.blue,
    textOnColor: BRAND.white,
    accentShadow: BRAND.black,
    href: "/play/solo?mode=sign-challenge",
    badge: "15 Qs",
    timer: "20s",
    cta: "IDENTIFY",
    ctaKh: "ប្រឡង",
    Icon: TriangleAlert,
    difficulty: "MEDIUM",
    diffColor: BRAND.yellow,
    xp: "+150 XP",
    players: "6.1K today",
  },
  {
    id: "mixed-battle",
    number: "04",
    tag: "ULTIMATE",
    title: "Mixed Battle",
    titleKh: "ប្រកួតចម្រុះ",
    desc: "All topics, all layouts. Every single traffic rule in a chaotic mix.",
    descKh: "គ្រប់ប្រភេទសំណួរ — ប្រកួតចម្រុះ",
    color: BRAND.purple,
    textOnColor: BRAND.white,
    accentShadow: BRAND.black,
    href: "/play/solo?mode=mixed-battle",
    badge: "20 Qs",
    timer: "30s",
    cta: "START BATTLE",
    ctaKh: "ប្រកួត",
    Icon: Swords,
    difficulty: "EXPERT",
    diffColor: BRAND.orange,
    xp: "+300 XP",
    players: "4.9K today",
  },
  {
    id: "daily-challenge",
    number: "05",
    tag: "DAILY STREAK",
    title: "Daily Challenge",
    titleKh: "បញ្ហាប្រចាំថ្ងៃ",
    desc: "Fresh curated questions every 24 hours. Keep your daily streak alive.",
    descKh: "សំណួរថ្មីរៀងរាល់ថ្ងៃ — រក្សាកំណត់ត្រា",
    color: BRAND.green,
    textOnColor: BRAND.white,
    accentShadow: BRAND.black,
    href: "/play/solo?mode=daily-challenge",
    badge: "15 Qs",
    timer: "30s",
    cta: "CLAIM TODAY",
    ctaKh: "លេងប្រចាំថ្ងៃ",
    Icon: CalendarDays,
    difficulty: "MEDIUM",
    diffColor: BRAND.yellow,
    xp: "+200 XP",
    players: "11.8K today",
  },
  {
    id: "exam-simulation",
    number: "06",
    tag: "OFFICIAL MOCK",
    title: "Exam Simulation",
    titleKh: "ត្រាប់តាមប្រឡង",
    desc: "Full 40-question mock exam. Standard timings and passing criteria.",
    descKh: "៤០ សំណួរ — ដូចការប្រឡងពិតប្រាកដ",
    color: BRAND.orange,
    textOnColor: BRAND.white,
    accentShadow: BRAND.black,
    href: "/play/solo?mode=exam-simulation",
    badge: "40 Qs",
    timer: "45s",
    cta: "SIMULATE NOW",
    ctaKh: "ត្រាប់តាម",
    Icon: GraduationCap,
    difficulty: "EXPERT",
    diffColor: BRAND.orange,
    xp: "+500 XP",
    players: "9.3K today",
  },
  {
    id: "survival-streak",
    number: "07",
    tag: "SUDDEN DEATH",
    title: "Survival Mode",
    titleKh: "វគ្គរស់រានមានជីវិត",
    desc: "One wrong answer and it's game over. How far can you push your streak?",
    descKh: "ខុសមួយចប់ — តើអ្នកអាចឆ្លើយបានប៉ុន្មាន?",
    color: BRAND.cyan,
    textOnColor: BRAND.black,
    accentShadow: BRAND.black,
    href: "/play/solo?mode=survival-streak",
    badge: "UNLIMITED",
    timer: "20s",
    cta: "SURVIVE",
    ctaKh: "រស់រាន",
    Icon: Star,
    difficulty: "HARDCORE",
    diffColor: BRAND.red,
    xp: "+10 XP / Q",
    players: "3.2K today",
  },
  {
    id: "zen-study",
    number: "08",
    tag: "STRESS-FREE",
    title: "Zen Review",
    titleKh: "សិក្សាស្ងប់ស្ងាត់",
    desc: "No timers, no scoreboards, no stress. Just pure, relaxed learning.",
    descKh: "គ្មានម៉ោងកំណត់ — សិក្សាដោយគ្មានសម្ពាធ",
    color: BRAND.white,
    textOnColor: BRAND.black,
    accentShadow: BRAND.black,
    href: "/play/solo?mode=zen-study",
    badge: "CUSTOM Qs",
    timer: "UNTIMED",
    cta: "RELAX & LEARN",
    ctaKh: "រៀនសិន",
    Icon: BookOpenCheck,
    difficulty: "BEGINNER",
    diffColor: BRAND.green,
    xp: "+50 XP",
    players: "7.4K today",
  },
  {
    id: "hardcore-boss",
    number: "09",
    tag: "BOSS BATTLE",
    title: "Boss Challenge",
    titleKh: "វគ្គពិសេសប្រឈម",
    desc: "The most confusing legal scenarios and critical traps. Master level only.",
    descKh: "សំណួរពិបាកបំផុត — សម្រាប់អ្នកជំនាញ",
    color: BRAND.black,
    textOnColor: BRAND.white,
    accentShadow: BRAND.black,
    href: "/play/solo?mode=hardcore-boss",
    badge: "25 Qs",
    timer: "25s",
    cta: "CONQUER",
    ctaKh: "ដោះស្រាយ",
    Icon: Trophy,
    difficulty: "LEGEND",
    diffColor: BRAND.purple,
    xp: "+600 XP",
    players: "1.5K today",
  },
];

// ─── OTP-STYLE CODE INPUT (Brutalist White BG Theme) ───────────────────────────
function OtpCodeInput({ lang }: { lang: string }) {
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const router = useRouter();
  const [cells, setCells] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const code = cells.join("");

  function handleChange(idx: number, val: string) {
    const ch = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-1);
    const next = [...cells];
    next[idx] = ch;
    setCells(next);
    if (ch && idx < 5) refs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !cells[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter" && code.length === 6) join();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCells(next);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  }

  function join() {
    if (code.length === 6) router.push(`/play/${code}`);
  }

  const filled = cells.filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}>
      {/* Cells Grid */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
        {cells.map((cell, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={cell}
            maxLength={1}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              width: 52,
              height: 64,
              border: `3px solid ${BRAND.black}`,
              background: cell ? "#fefce8" : BRAND.white,
              color: BRAND.black,
              fontSize: 26,
              fontWeight: 900,
              fontFamily: "monospace",
              textAlign: "center",
              outline: "none",
              cursor: "text",
              transition: "transform 0.1s, box-shadow 0.1s, background-color 0.1s",
              caretColor: BRAND.yellow,
              borderRadius: 0,
              boxShadow: cell ? `4px 4px 0 ${BRAND.yellow}` : `3px 3px 0 ${BRAND.black}`,
              transform: cell ? "translate(-2px, -2px)" : "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = BRAND.yellow;
              e.target.style.boxShadow = `4px 4px 0 ${BRAND.black}`;
              e.target.style.transform = "translate(-2px, -2px)";
            }}
            onBlur={(e) => {
              if (!e.target.value) {
                e.target.style.borderColor = BRAND.black;
                e.target.style.boxShadow = `3px 3px 0 ${BRAND.black}`;
                e.target.style.transform = "none";
              }
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ width: "100%", maxWidth: 380, height: 6, background: "#e4e4e7", border: `2px solid ${BRAND.black}`, position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${(filled / 6) * 100}%`,
          background: filled === 6 ? BRAND.green : BRAND.yellow,
          transition: "width 0.15s ease, background 0.2s"
        }} />
      </div>

      {/* Action Button */}
      <button
        onClick={join}
        disabled={code.length !== 6}
        className="otp-join-btn"
        style={{
          ...khFont,
          width: "100%",
          maxWidth: 380,
          height: 56,
          background: code.length === 6 ? BRAND.yellow : "#f4f4f5",
          color: BRAND.black,
          border: `3px solid ${BRAND.black}`,
          fontWeight: 900,
          fontSize: 16,
          letterSpacing: 2,
          cursor: code.length === 6 ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "all 0.1s",
          boxShadow: code.length === 6 ? `6px 6px 0 ${BRAND.black}` : `2px 2px 0 ${BRAND.black}`,
          borderRadius: 0,
          position: "relative",
          transform: "translate(0,0)",
        }}
        onMouseEnter={(e) => {
          if (code.length === 6) {
            e.currentTarget.style.transform = "translate(-3px,-3px)";
            e.currentTarget.style.boxShadow = `9px 9px 0 ${BRAND.black}`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translate(0,0)";
          e.currentTarget.style.boxShadow = code.length === 6 ? `6px 6px 0 ${BRAND.black}` : `2px 2px 0 ${BRAND.black}`;
        }}
        onMouseDown={(e) => {
          if (code.length === 6) {
            e.currentTarget.style.transform = "translate(3px,3px)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
        onMouseUp={(e) => {
          if (code.length === 6) {
            e.currentTarget.style.transform = "translate(-3px,-3px)";
            e.currentTarget.style.boxShadow = `9px 9px 0 ${BRAND.black}`;
          }
        }}
      >
        {kh ? "ចូលរួមលេងផ្ទាល់" : "JOIN ROOM NOW"}
        <ChevronRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
}

// ─── GAME MODE CARD (Collectible Card Style) ──────────────────────────────────
function GameCard({ mode, kh, khFont }: {
  mode: typeof GAME_MODES[number];
  kh: boolean;
  khFont: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isBlackCard = mode.color === BRAND.black;
  const isWhiteCard = mode.color === BRAND.white;
  
  const textColor = isBlackCard ? BRAND.white : BRAND.black;
  const subtitleColor = isBlackCard ? "rgba(255, 255, 255, 0.75)" : "rgba(0, 0, 0, 0.65)";
  const borderColor = isBlackCard ? BRAND.white : BRAND.black;

  const cardShadow = pressed
    ? `2px 2px 0 ${BRAND.black}`
    : hovered
      ? `14px 14px 0 ${BRAND.black}`
      : `8px 8px 0 ${BRAND.black}`;

  const cardTransform = pressed
    ? "translate(6px, 6px)"
    : hovered
      ? "translate(-6px, -6px)"
      : "translate(0, 0)";

  return (
    <Link
      href={mode.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: mode.color,
        border: `4px solid ${borderColor}`,
        boxShadow: cardShadow,
        transform: cardTransform,
        transition: "transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.1s cubic-bezier(0.16, 1, 0.3, 1)",
        textDecoration: "none",
        color: textColor,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        borderRadius: 0,
        height: "100%",
      }}
    >
      {/* Card Header ID */}
      <div style={{
        padding: "16px 20px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `3px solid ${borderColor}`,
        fontFamily: "monospace",
        fontWeight: 900,
        fontSize: 12,
        letterSpacing: 1,
      }}>
        <span>DECK // MODE_{mode.number}</span>
        {mode.tag && (
          <span style={{
            background: isBlackCard ? BRAND.yellow : BRAND.black,
            color: isBlackCard ? BRAND.black : (mode.color === BRAND.yellow ? BRAND.black : BRAND.white),
            fontSize: 9,
            fontWeight: 900,
            padding: "2px 8px",
            border: `2px solid ${borderColor}`,
          }}>
            {mode.tag}
          </span>
        )}
      </div>

      {/* Illustration Area */}
      <div style={{
        margin: "16px 20px 0",
        height: 130,
        background: isWhiteCard ? BRAND.black : BRAND.white,
        border: `3px solid ${borderColor}`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: isWhiteCard 
            ? "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
            : "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          opacity: 0.8,
        }} />
        
        <div style={{
          width: 68,
          height: 68,
          background: mode.color,
          border: `3px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isWhiteCard ? BRAND.black : textColor,
          transform: hovered ? "rotate(-12deg) scale(1.15)" : "rotate(0deg)",
          transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: `4px 4px 0 ${borderColor}`,
        }}>
          <mode.Icon size={30} strokeWidth={2.5} />
        </div>

        <div style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          background: BRAND.black,
          color: BRAND.white,
          fontSize: 9,
          fontFamily: "monospace",
          fontWeight: 900,
          padding: "2px 6px",
          border: `1.5px solid ${isWhiteCard ? BRAND.white : BRAND.black}`,
        }}>
          {mode.badge}
        </div>

        <div style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          background: BRAND.black,
          color: BRAND.white,
          fontSize: 9,
          fontFamily: "monospace",
          fontWeight: 900,
          padding: "2px 6px",
          display: "flex",
          alignItems: "center",
          gap: 3,
          border: `1.5px solid ${isWhiteCard ? BRAND.white : BRAND.black}`,
        }}>
          <Clock size={10} />
          {mode.timer}
        </div>
      </div>

      {/* Card Details */}
      <div style={{
        padding: "16px 20px 20px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: 12,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <h3 style={{
              ...khFont,
              fontSize: 20,
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
            }}>
              {kh ? mode.titleKh : mode.title}
            </h3>
          </div>
          <span style={{
            fontSize: 8,
            fontFamily: "monospace",
            fontWeight: 900,
            letterSpacing: 2,
            color: BRAND.white,
            background: mode.diffColor,
            border: `1.5px solid ${borderColor}`,
            padding: "2px 8px",
            display: "inline-block",
            boxShadow: `2px 2px 0 ${borderColor}`,
          }}>
            {mode.difficulty}
          </span>
        </div>

        <p style={{
          ...khFont,
          fontSize: 13,
          fontWeight: 600,
          color: subtitleColor,
          margin: 0,
          lineHeight: 1.4,
          flex: 1,
        }}>
          {kh ? mode.descKh : mode.desc}
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `2px dashed ${borderColor}`,
          paddingTop: 10,
          fontSize: 10,
          fontFamily: "monospace",
          fontWeight: 900,
        }}>
          <span style={{ color: isBlackCard ? BRAND.yellow : (isWhiteCard ? BRAND.black : textColor) }}>
            XP: {mode.xp}
          </span>
          <span style={{ opacity: 0.8 }}>
            {mode.players}
          </span>
        </div>

        {/* CTA Button inside card */}
        <div style={{
          padding: "12px 20px",
          background: isBlackCard 
            ? (hovered ? BRAND.yellow : BRAND.white) 
            : (hovered ? BRAND.black : BRAND.white),
          color: isBlackCard 
            ? BRAND.black 
            : (hovered ? (isWhiteCard ? BRAND.white : mode.color) : BRAND.black),
          border: `3px solid ${borderColor}`,
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "all 0.1s",
          borderRadius: 0,
          boxShadow: hovered ? "none" : `4px 4px 0 ${borderColor}`,
          transform: hovered ? "translate(3px, 3px)" : "none",
        }}>
          <span style={khFont}>{kh ? mode.ctaKh : mode.cta}</span>
          <ChevronRight size={14} strokeWidth={3} />
        </div>
      </div>
    </Link>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PlayPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => (n + 1) % 3), 800);
    return () => clearInterval(t);
  }, []);

  const liveDots = ["●", "●●", "●●●"][tick];

  return (
    <div style={{
      minHeight: "100vh",
      background: BRAND.white,
      color: BRAND.black,
      fontFamily: "system-ui, -apple-system, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      
      {/* Pulse Live Header Strip */}
      <div style={{
        background: BRAND.yellow,
        padding: "10px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        borderBottom: `4px solid ${BRAND.black}`,
        position: "relative",
        zIndex: 10,
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 3,
          color: BRAND.black,
          ...khFont,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ 
            display: "inline-block", 
            width: 8, 
            height: 8, 
            background: BRAND.red, 
            animation: "pulse 1s infinite alternate" 
          }} />
          {kh 
            ? `ហ្គេមផ្ទាល់កំពុងដំណើរការ ${liveDots}` 
            : `LIVE ROOMS ACTIVE NOW ${liveDots}`}
        </span>
      </div>

      {/* ═══ SECTION 1: JOIN A LIVE GAME (HERO) ══════════════════════════ */}
      <section style={{
        background: BRAND.white,
        position: "relative",
        overflow: "hidden",
        borderBottom: `4px solid ${BRAND.black}`,
      }}>
        {/* Retro Grid Background */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }} />

        <div className="play-hero-grid">
          {/* Left Text Column */}
          <div className="play-hero-left">
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: BRAND.yellow,
              color: BRAND.black,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 3,
              padding: "6px 16px",
              border: `3px solid ${BRAND.black}`,
              boxShadow: `4px 4px 0 ${BRAND.black}`,
              marginBottom: 24,
              ...khFont,
            }}>
              <Users size={14} strokeWidth={2.5} />
              {kh ? "ម៉ាស៊ីនហ្គេមផ្ទាល់" : "MULTIPLAYER ARENA"}
            </div>

            <h1 style={{
              ...khFont,
              fontSize: "clamp(2.5rem, 4.5vw, 4.2rem)",
              fontWeight: 900,
              color: BRAND.black,
              lineHeight: 1.05,
              margin: "0 0 20px",
              letterSpacing: "-2px",
            }}>
              {kh ? "តើអ្នកមាន" : "Have a"}{" "}
              <span style={{ 
                background: BRAND.yellow, 
                padding: "0 10px", 
                border: `3px solid ${BRAND.black}`,
                boxShadow: `5px 5px 0 ${BRAND.black}`
              }}>
                {kh ? "លេខកូដបន្ទប់?" : "Room Code?"}
              </span>
            </h1>

            <p style={{
              ...khFont,
              fontSize: 16,
              fontWeight: 600,
              color: "#4b5563",
              margin: "0 0 36px",
              lineHeight: 1.5,
              maxWidth: 420,
            }}>
              {kh
                ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់ដែលទទួលបានពីគ្រូរបស់អ្នកដើម្បីចូលរួមការប្រកួតសំណួរផ្ទាល់ភ្លាមៗ។"
                : "Enter the 6-character access code provided by your instructor to instantly jump into live multiplayer sessions."}
            </p>

            {/* Micro Feature badges */}
            <div className="play-hero-stats" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { Icon: Trophy, text: kh ? "ការប្រកួតភ្លាមៗ" : "Live Rankings" },
                { Icon: Users, text: kh ? "លេងច្រើននាក់" : "Multiplayer" },
                { Icon: Zap, text: kh ? "លឿនរហ័ស" : "Zero Setup" },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  ...khFont,
                }}>
                  <s.Icon size={15} strokeWidth={2.5} style={{ color: BRAND.yellow }} />
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Input Column */}
          <div className="play-hero-right">
            <div style={{
              background: BRAND.white,
              border: `4px solid ${BRAND.black}`,
              padding: "48px 32px",
              boxShadow: `12px 12px 0 ${BRAND.black}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
              <div style={{
                ...khFont,
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: 3,
                color: BRAND.black,
                textAlign: "center",
                marginBottom: 28,
              }}>
                {kh ? "បញ្ចូលលេខកូដបន្ទប់ ៦ ខ្ទង់" : "ENTER 6-CHARACTER ROOM CODE"}
              </div>

              <OtpCodeInput lang={lang} />

              <div style={{
                marginTop: 24,
                textAlign: "center",
                fontSize: 11,
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#6b7280",
                ...khFont,
              }}>
                {kh ? "លេខកូដរួមបញ្ចូលទាំងអក្សរ និងលេខ" : "Supports alphanumeric codes"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: CHOOSE YOUR MODE ═════════════════════════════════ */}
      <section style={{
        background: BRAND.white,
        padding: "0",
      }}>
        {/* Responsive brutality stamp mode header */}
        <div className="mode-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{
              ...khFont,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 4,
              color: BRAND.red,
              textTransform: "uppercase",
            }}>
              {kh ? "ជំហានបន្ទាប់" : "STEP 2 — CHOOSE YOUR DECK"}
            </span>
            <h2 style={{
              ...khFont,
              fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
              fontWeight: 900,
              color: BRAND.black,
              margin: 0,
              letterSpacing: "-1.5px",
            }}>
              {kh ? "ជ្រើសរើសរបៀបលេង" : "Select a Game Mode"}
            </h2>
          </div>

          {/* Leaderboard and Learn actions */}
          <div className="mode-header-actions" style={{ display: "flex", gap: 14 }}>
            <Link href="/leaderboard" style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: BRAND.white,
              color: BRAND.black,
              border: `3px solid ${BRAND.black}`,
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: 1,
              textDecoration: "none",
              transition: "all 0.1s",
              boxShadow: `4px 4px 0 ${BRAND.black}`,
              ...khFont,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-2px,-2px)";
                e.currentTarget.style.boxShadow = `6px 6px 0 ${BRAND.black}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translate(0,0)";
                e.currentTarget.style.boxShadow = `4px 4px 0 ${BRAND.black}`;
              }}
            >
              <Trophy size={16} strokeWidth={2.5} />
              {kh ? "តារាងពិន្ទុ" : "Leaderboard"}
            </Link>
            
            <Link href="/learn" style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: BRAND.yellow,
              color: BRAND.black,
              border: `3px solid ${BRAND.black}`,
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: 1,
              textDecoration: "none",
              transition: "all 0.1s",
              boxShadow: `4px 4px 0 ${BRAND.black}`,
              ...khFont,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-2px,-2px)";
                e.currentTarget.style.boxShadow = `6px 6px 0 ${BRAND.black}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translate(0,0)";
                e.currentTarget.style.boxShadow = `4px 4px 0 ${BRAND.black}`;
              }}
            >
              <BookOpenCheck size={16} strokeWidth={2.5} />
              {kh ? "រៀនទ្រឹស្តីសិន" : "Study First"}
            </Link>
          </div>
        </div>

        {/* Collectible Cards Deck Grid */}
        <div className="card-grid">
          {GAME_MODES.map((mode) => (
            <GameCard key={mode.id} mode={mode} kh={kh} khFont={khFont} />
          ))}
        </div>

        {/* ═══ SECTION 3: QUICK QUIZ CALL TO ACTION ═══════════════════════ */}
        <div className="bottom-cta-card">
          {/* Side brand stripe */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: BRAND.yellow }} />
          
          <div style={{ paddingLeft: 12 }}>
            <div style={{
              ...khFont,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 4,
              color: BRAND.red,
              marginBottom: 12,
              textTransform: "uppercase",
            }}>
              {kh ? "មិនដឹងថាត្រូវចាប់ផ្តើមពីណា?" : "DON'T KNOW WHERE TO START?"}
            </div>
            
            <div style={{
              ...khFont,
              fontSize: "clamp(1.4rem, 2.8vw, 2.1rem)",
              fontWeight: 900,
              color: BRAND.black,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: 620,
            }}>
              {kh
                ? <span>ចាប់ផ្តើមជាមួយ <span style={{ background: BRAND.yellow, padding: "0 6px", border: `2.5px solid ${BRAND.black}` }}>សំណួររហ័ស</span> — ចំណាយពេលត្រឹមតែ ២ នាទី។</span>
                : <span>Start with <span style={{ background: BRAND.yellow, padding: "0 8px", border: `3px solid ${BRAND.black}`, boxShadow: "3px 3px 0 #000" }}>Quick Quiz</span> — takes 2 minutes.</span>}
            </div>
            
            <div style={{
              ...khFont,
              fontSize: 14,
              fontWeight: 700,
              color: "#4b5563",
              marginTop: 12,
            }}>
              {kh ? "មិនត្រូវការគណនីឡើយ។ ១០សំណួរល្បឿនលឿន។" : "No account needed. 10 questions. Zero pressure."}
            </div>
          </div>

          <Link href="/play/solo?mode=quick-quiz" className="bottom-cta-btn" style={{
            ...khFont,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "20px 48px",
            background: BRAND.yellow,
            color: BRAND.black,
            border: `3px solid ${BRAND.black}`,
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: 2,
            textDecoration: "none",
            boxShadow: `6px 6px 0 ${BRAND.black}`,
            transition: "all 0.1s",
            whiteSpace: "nowrap",
            transform: "translate(0, 0)",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-3px,-3px)";
              e.currentTarget.style.boxShadow = `9px 9px 0 ${BRAND.black}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(0,0)";
              e.currentTarget.style.boxShadow = `6px 6px 0 ${BRAND.black}`;
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translate(3px,3px)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translate(-3px,-3px)";
              e.currentTarget.style.boxShadow = `9px 9px 0 ${BRAND.black}`;
            }}
          >
            <Play size={16} fill="currentColor" strokeWidth={3} />
            {kh ? "លេងឥឡូវ" : "PLAY NOW"}
          </Link>
        </div>
      </section>

      {/* ─── STYLES & MEDIA QUERIES ────────────────────────────────────────────── */}
      <style>{`
        @keyframes pulse {
          from { opacity: 0.4; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1.1); }
        }

        .play-hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 64px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
        }

        .play-hero-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .play-hero-stats {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .play-hero-right {
          width: 100%;
          max-width: 480px;
          justify-self: end;
        }

        .mode-header {
          border-top: 4px solid #000000;
          border-bottom: 4px solid #000000;
          background: #ffffff;
          padding: 28px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px;
        }

        .bottom-cta-card {
          border: 4px solid #000000;
          background: #ffffff;
          padding: 48px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          max-width: 1200px;
          margin: 40px auto 80px;
          box-shadow: 12px 12px 0 #000000;
          position: relative;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .card-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            padding: 32px 16px;
          }
          .play-hero-grid {
            gap: 40px;
            padding: 56px 24px;
          }
        }

        @media (max-width: 991px) {
          .play-hero-grid {
            grid-template-columns: 1fr;
            padding: 48px 24px 64px;
          }
          .play-hero-left {
            align-items: center;
            text-align: center;
          }
          .play-hero-stats {
            justify-content: center;
          }
          .play-hero-right {
            justify-self: center;
            margin-top: 16px;
          }
          .bottom-cta-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 32px 24px;
            margin: 24px 16px 64px;
            gap: 24px;
          }
          .bottom-cta-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .card-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 24px 16px;
          }
          .play-hero-grid {
            padding: 32px 16px 48px;
          }
          .mode-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 16px;
          }
          .mode-header-actions {
            width: 100%;
            justify-content: space-between;
          }
          .mode-header-actions > a {
            flex: 1;
            justify-content: center;
            padding: 10px 12px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
}
