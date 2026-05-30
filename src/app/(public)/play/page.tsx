"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { Users, ChevronRight, Zap, Target, BookOpenCheck, Play, Trophy, Flame, Clock, Swords, CalendarDays, TriangleAlert, Star, GraduationCap } from "lucide-react";

// ─── BRAND COLORS ─────────────────────────────────────────────────────────────
const BRAND = {
  yellow: "#eab308",
  yellowDark: "#ca8a04",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
  black: "#000000",
  white: "#ffffff",
};

// ─── GAME MODES DATA ──────────────────────────────────────────────────────────
const GAME_MODES = [
  {
    id: "quick-quiz",
    number: "01",
    tag: "HOT",
    title: "Quick Quiz",
    titleKh: "សំណួរលឿន",
    desc: "10 questions. All categories. No excuses.",
    descKh: "សំណួរចៃដន្យ ១០ — សាកល្បងឥឡូវ",
    color: BRAND.yellow,
    textOnColor: BRAND.black,
    accentShadow: BRAND.yellowDark,
    href: "/play/solo?mode=quick-quiz",
    badge: "10Q",
    timer: "30s",
    cta: "PLAY NOW",
    ctaKh: "លេងឥឡូវ",
    Icon: Zap,
    difficulty: "EASY",
    diffColor: BRAND.green,
    popular: true,
  },
  {
    id: "speed-round",
    number: "02",
    tag: "INTENSE",
    title: "Speed Round",
    titleKh: "វគ្គល្បឿន",
    desc: "Tap fast. Score big. Don't choke.",
    descKh: "ចុចឆាប់ — ទទួលពិន្ទុ",
    color: BRAND.red,
    textOnColor: BRAND.white,
    accentShadow: "#b91c1c",
    href: "/play/solo?mode=speed-round",
    badge: "20Q",
    timer: "15s",
    cta: "GO FAST",
    ctaKh: "ចូលប្រកួត",
    Icon: Flame,
    difficulty: "HARD",
    diffColor: BRAND.red,
    popular: false,
  },
  {
    id: "sign-challenge",
    number: "03",
    tag: "",
    title: "Sign Challenge",
    titleKh: "ប្រឡងសញ្ញា",
    desc: "Identify real traffic signs. Images only.",
    descKh: "ស្គាល់សញ្ញាចរាចរ — រូបភាពប៉ុណ្ណោះ",
    color: BRAND.blue,
    textOnColor: BRAND.white,
    accentShadow: "#1d4ed8",
    href: "/play/solo?mode=sign-challenge",
    badge: "15Q",
    timer: "20s",
    cta: "CHALLENGE",
    ctaKh: "ប្រឡង",
    Icon: TriangleAlert,
    difficulty: "MEDIUM",
    diffColor: BRAND.yellow,
    popular: false,
  },
  {
    id: "mixed-battle",
    number: "04",
    tag: "NEW",
    title: "Mixed Battle",
    titleKh: "ប្រកួតចម្រុះ",
    desc: "All categories. All types. One winner.",
    descKh: "ប្រភេទទាំង ៨ — ប្រកួតពិត",
    color: BRAND.purple,
    textOnColor: BRAND.white,
    accentShadow: "#7e22ce",
    href: "/play/solo?mode=mixed-battle",
    badge: "20Q",
    timer: "30s",
    cta: "BATTLE",
    ctaKh: "ប្រកួត",
    Icon: Swords,
    difficulty: "HARD",
    diffColor: BRAND.red,
    popular: false,
  },
  {
    id: "daily-challenge",
    number: "05",
    tag: "DAILY",
    title: "Daily Challenge",
    titleKh: "បញ្ហាប្រចាំថ្ងៃ",
    desc: "New questions every day. Build your streak.",
    descKh: "សំណួរថ្មីរៀងរាល់ថ្ងៃ — បង្កើតកំណត់ត្រា",
    color: BRAND.green,
    textOnColor: BRAND.white,
    accentShadow: "#15803d",
    href: "/play/solo?mode=daily-challenge",
    badge: "15Q",
    timer: "30s",
    cta: "TODAY",
    ctaKh: "ប្រចាំថ្ងៃ",
    Icon: CalendarDays,
    difficulty: "MEDIUM",
    diffColor: BRAND.yellow,
    popular: false,
  },
  {
    id: "exam-simulation",
    number: "06",
    tag: "PRO",
    title: "Exam Simulation",
    titleKh: "ត្រាប់តាមប្រឡង",
    desc: "40 questions. Just like the real exam.",
    descKh: "ស្រដៀងប្រឡងពិត — ៤០ សំណួរ",
    color: BRAND.orange,
    textOnColor: BRAND.white,
    accentShadow: "#c2410c",
    href: "/play/solo?mode=exam-simulation",
    badge: "40Q",
    timer: "45s",
    cta: "SIMULATE",
    ctaKh: "ត្រាប់តាម",
    Icon: GraduationCap,
    difficulty: "EXPERT",
    diffColor: BRAND.orange,
    popular: false,
  },
];

// ─── OTP-STYLE CODE INPUT ──────────────────────────────────────────────────────
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      {/* OTP cells */}
      <div style={{ display: "flex", gap: 10 }}>
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
              width: 56,
              height: 68,
              border: `3px solid ${cell ? BRAND.yellow : "rgba(255,255,255,0.25)"}`,
              background: cell ? "rgba(234,179,8,0.12)" : "rgba(255,255,255,0.04)",
              color: cell ? BRAND.yellow : "rgba(255,255,255,0.3)",
              fontSize: 28,
              fontWeight: 900,
              fontFamily: "monospace",
              textAlign: "center",
              outline: "none",
              cursor: "text",
              transition: "border-color 0.1s, background 0.1s, color 0.1s",
              caretColor: BRAND.yellow,
              letterSpacing: 2,
              borderRadius: 0,
            }}
            onFocus={(e) => {
              e.target.style.border = `3px solid ${BRAND.yellow}`;
              e.target.style.boxShadow = `0 0 0 2px rgba(234,179,8,0.3)`;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 406, height: 4, background: "rgba(255,255,255,0.08)", position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${(filled / 6) * 100}%`,
          background: filled === 6 ? BRAND.green : BRAND.yellow,
          transition: "width 0.15s ease, background 0.2s"
        }} />
      </div>

      {/* Join Button */}
      <button
        onClick={join}
        disabled={code.length !== 6}
        style={{
          ...khFont,
          width: "100%",
          maxWidth: 406,
          height: 60,
          background: code.length === 6 ? BRAND.yellow : "rgba(255,255,255,0.06)",
          color: code.length === 6 ? BRAND.black : "rgba(255,255,255,0.25)",
          border: `3px solid ${code.length === 6 ? BRAND.yellow : "rgba(255,255,255,0.1)"}`,
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: 3,
          cursor: code.length === 6 ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "all 0.15s",
          boxShadow: code.length === 6 ? `6px 6px 0 ${BRAND.yellowDark}` : "none",
          borderRadius: 0,
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          if (code.length === 6) {
            (e.currentTarget as HTMLButtonElement).style.transform = "translate(-3px,-3px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `9px 9px 0 ${BRAND.yellowDark}`;
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translate(0,0)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = code.length === 6 ? `6px 6px 0 ${BRAND.yellowDark}` : "none";
        }}
        onMouseDown={(e) => {
          if (code.length === 6) {
            (e.currentTarget as HTMLButtonElement).style.transform = "translate(3px,3px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }
        }}
        onMouseUp={(e) => {
          if (code.length === 6) {
            (e.currentTarget as HTMLButtonElement).style.transform = "translate(-3px,-3px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `9px 9px 0 ${BRAND.yellowDark}`;
          }
        }}
      >
        {kh ? "ចូល" : "JOIN ROOM"}
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

// ─── GAME MODE CARD ───────────────────────────────────────────────────────────
function GameCard({ mode, index, kh, khFont }: {
  mode: typeof GAME_MODES[number];
  index: number;
  kh: boolean;
  khFont: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const shadow = pressed
    ? "none"
    : hovered
      ? `9px 9px 0 ${mode.accentShadow}`
      : `6px 6px 0 ${mode.accentShadow}`;

  const transform = pressed
    ? "translate(6px, 6px)"
    : hovered
      ? "translate(-3px, -3px)"
      : "translate(0,0)";

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
        background: BRAND.white,
        border: `3px solid ${BRAND.black}`,
        boxShadow: shadow,
        transform,
        transition: "transform 0.1s cubic-bezier(0.16,1,0.3,1), box-shadow 0.1s cubic-bezier(0.16,1,0.3,1)",
        textDecoration: "none",
        color: BRAND.black,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        borderRadius: 0,
      }}
    >
      {/* Top color bar with number + emoji */}
      <div style={{
        background: mode.color,
        borderBottom: `3px solid ${BRAND.black}`,
        padding: "20px 20px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        position: "relative",
      }}>
        {/* Big number */}
        <span style={{
          fontSize: 52,
          fontWeight: 900,
          lineHeight: 1,
          color: mode.textOnColor === BRAND.black ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)",
          fontFamily: "monospace",
          letterSpacing: -3,
          userSelect: "none",
        }}>
          {mode.number}
        </span>

        {/* Right side: tag + timer badge */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          {mode.tag && (
            <span style={{
              background: BRAND.black,
              color: mode.color,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: 2,
              padding: "3px 8px",
              border: `2px solid ${BRAND.black}`,
              boxShadow: `2px 2px 0 ${mode.accentShadow}`,
            }}>
              {mode.tag}
            </span>
          )}
          <div style={{
            display: "flex",
            gap: 6,
          }}>
            <span style={{
              background: mode.textOnColor === BRAND.black ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)",
              color: mode.textOnColor,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1,
              padding: "4px 8px",
              border: `2px solid ${mode.textOnColor === BRAND.black ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.3)"}`,
            }}>
              {mode.badge}
            </span>
            <span style={{
              background: BRAND.black,
              color: BRAND.white,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1,
              padding: "4px 8px",
              border: `2px solid ${BRAND.black}`,
            }}>
              <Clock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />{mode.timer}
            </span>
          </div>
        </div>

        {/* Icon */}
        <div style={{
          position: "absolute",
          bottom: 12,
          left: 20,
          color: mode.textOnColor === BRAND.black ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)",
          transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          display: "flex",
        }}>
          <mode.Icon size={28} strokeWidth={2.5} />
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1,
        padding: "16px 20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: hovered ? "#fafafa" : BRAND.white,
        transition: "background 0.1s",
      }}>
        {/* Difficulty pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 2,
            color: mode.diffColor,
            border: `2px solid ${mode.diffColor}`,
            padding: "2px 7px",
          }}>
            {mode.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          ...khFont,
          fontSize: 22,
          fontWeight: 900,
          margin: 0,
          letterSpacing: -0.5,
          lineHeight: 1.1,
          color: BRAND.black,
        }}>
          {kh ? mode.titleKh : mode.title}
        </h3>

        {/* Description */}
        <p style={{
          ...khFont,
          fontSize: 13,
          fontWeight: 600,
          color: "#52525b",
          margin: 0,
          lineHeight: 1.5,
          flex: 1,
        }}>
          {kh ? mode.descKh : mode.desc}
        </p>

        {/* CTA */}
        <div style={{
          marginTop: 12,
          padding: "12px 20px",
          background: hovered ? BRAND.black : BRAND.white,
          color: hovered ? mode.color : BRAND.black,
          border: `3px solid ${BRAND.black}`,
          fontWeight: 900,
          fontSize: 13,
          letterSpacing: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.1s, color 0.1s",
          boxShadow: `3px 3px 0 ${BRAND.black}`,
          borderRadius: 0,
        }}>
          <span style={khFont}>{kh ? mode.ctaKh : mode.cta}</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 8h8M9 4l4 4-4 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Popular ribbon */}
      {mode.popular && (
        <div style={{
          position: "absolute",
          top: 18,
          right: -28,
          background: BRAND.red,
          color: BRAND.white,
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: 2,
          padding: "5px 36px",
          transform: "rotate(45deg)",
          border: `2px solid ${BRAND.black}`,
          zIndex: 2,
        }}>
          POPULAR
        </div>
      )}
    </Link>
  );
}



// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PlayPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  // Animated counter on first paint
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

      {/* ═══ SECTION 1: JOIN A LIVE GAME — FULL BLEED HERO ═══════════════════ */}
      <section style={{
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
        borderBottom: `4px solid ${BRAND.yellow}`,
      }}>
        {/* Grid pattern */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(234,179,8,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }} />

        {/* Live indicator stripe */}
        <div style={{
          background: BRAND.yellow,
          padding: "8px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          borderBottom: `3px solid ${BRAND.yellowDark}`,
          position: "relative",
          zIndex: 1,
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 4,
            color: BRAND.black,
            ...khFont
          }}>
            {liveDots} {kh ? "ហ្គេមផ្ទាល់កំពុងដំណើរការ" : "LIVE GAMES RUNNING NOW"} {liveDots}
          </span>
        </div>

        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 32px 64px",
          position: "relative",
          zIndex: 1,
        }}>
          {/* Two-col layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
            className="play-hero-grid"
          >
            {/* Left: Text */}
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: BRAND.yellow,
                color: BRAND.black,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: 3,
                padding: "6px 14px",
                border: `2px solid ${BRAND.yellowDark}`,
                boxShadow: `4px 4px 0 ${BRAND.yellowDark}`,
                marginBottom: 20,
                ...khFont,
              }}>
                <Users size={13} />
                {kh ? "ចូលហ្គេមផ្ទាល់" : "JOIN A LIVE GAME"}
              </div>

              <h1 style={{
                ...khFont,
                fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
                fontWeight: 900,
                color: BRAND.white,
                lineHeight: 1,
                margin: "0 0 16px",
                letterSpacing: -2,
              }}>
                {kh ? "ចូលហ្គេម" : "Got a"}{" "}
                <span style={{ color: BRAND.yellow }}>
                  {kh ? "ផ្ទាល់" : "Room Code?"}
                </span>
              </h1>

              <p style={{
                ...khFont,
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.55)",
                margin: "0 0 32px",
                lineHeight: 1.6,
                maxWidth: 380,
              }}>
                {kh
                  ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់ពីគ្រូបង្រៀន ហើយចូលប្រកួតភ្លាមៗ"
                  : "Enter the 6-character code from your teacher and jump straight into the action."}
              </p>

              {/* Mini stats row */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { Icon: Trophy, text: kh ? "ប្រកួតផ្ទាល់" : "Real-time battle" },
                  { Icon: Users, text: kh ? "ក្រុម" : "Multiplayer" },
                  { Icon: Zap, text: kh ? "ភ្លាមៗ" : "Instant join" },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                    fontWeight: 700,
                    ...khFont,
                  }}>
                    <s.Icon size={13} />
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: OTP Input */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: `3px solid rgba(255,255,255,0.1)`,
              padding: "40px 32px",
              boxShadow: `8px 8px 0 rgba(234,179,8,0.15)`,
            }}>
              <div style={{
                ...khFont,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 3,
                color: "rgba(255,255,255,0.3)",
                textAlign: "center",
                marginBottom: 24,
              }}>
                {kh ? "បញ្ចូលលេខកូដ" : "ENTER ROOM CODE"}
              </div>

              <OtpCodeInput lang={lang} />

              <div style={{
                marginTop: 20,
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.2)",
                ...khFont,
              }}>
                {kh ? "លេខកូដ ៦ ខ្ទង់ ជាអក្សរ ឬ លេខ" : "6-character alphanumeric code"}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ═══ SECTION 2: PICK YOUR MODE ════════════════════════════════════════ */}
      <section style={{
        background: BRAND.white,
        backgroundImage: "radial-gradient(#d4d4d8 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px",
        padding: "0",
      }}>

        {/* Section header — brutalist stamp */}
        <div style={{
          background: BRAND.black,
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{
              ...khFont,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 4,
              color: BRAND.yellow,
              textTransform: "uppercase",
            }}>
              {kh ? "ជ្រើសរើស" : "STEP 2 — CHOOSE YOUR WEAPON"}
            </span>
            <h2 style={{
              ...khFont,
              fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight: 900,
              color: BRAND.white,
              margin: 0,
              letterSpacing: -1,
            }}>
              {kh ? "ជ្រើសរបៀបលេង" : "Pick a Game Mode"}
            </h2>
          </div>

          {/* Action pills */}
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/leaderboard" style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "transparent",
              color: BRAND.white,
              border: `2px solid rgba(255,255,255,0.2)`,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1,
              textDecoration: "none",
              transition: "all 0.15s",
              ...khFont,
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)";
              }}
            >
              <Trophy size={14} />
              {kh ? "តារាងពិន្ទុ" : "Leaderboard"}
            </Link>
            <Link href="/learn" style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: BRAND.yellow,
              color: BRAND.black,
              border: `2px solid ${BRAND.yellow}`,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: 1,
              textDecoration: "none",
              transition: "all 0.15s",
              boxShadow: `4px 4px 0 ${BRAND.yellowDark}`,
              ...khFont,
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translate(-2px,-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `6px 6px 0 ${BRAND.yellowDark}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translate(0,0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `4px 4px 0 ${BRAND.yellowDark}`;
              }}
            >
              <BookOpenCheck size={14} />
              {kh ? "រៀនសិន" : "Study First"}
            </Link>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 32px 64px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 24,
        }}>
          {GAME_MODES.map((mode, index) => (
            <GameCard key={mode.id} mode={mode} index={index} kh={kh} khFont={khFont} />
          ))}
        </div>

        {/* Bottom band: psychological push */}
        <div style={{
          borderTop: `4px solid ${BRAND.black}`,
          background: BRAND.yellow,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Flame size={22} color={BRAND.black} />
            <span style={{
              ...khFont,
              fontSize: 14,
              fontWeight: 900,
              color: BRAND.black,
              letterSpacing: 0.5,
            }}>
              {kh
                ? "ចាប់ផ្តើមជាមួយ Quick Quiz — ២ នាទី គ្រប់គ្រាន់"
                : "Start with Quick Quiz — takes 2 minutes. No account needed."}
            </span>
          </div>
          <Link href="/play/solo?mode=quick-quiz" style={{
            ...khFont,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            background: BRAND.black,
            color: BRAND.yellow,
            border: `3px solid ${BRAND.black}`,
            fontWeight: 900,
            fontSize: 14,
            letterSpacing: 2,
            textDecoration: "none",
            boxShadow: `5px 5px 0 ${BRAND.yellowDark}`,
            transition: "all 0.1s",
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translate(-3px,-3px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = `8px 8px 0 ${BRAND.yellowDark}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translate(0,0)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = `5px 5px 0 ${BRAND.yellowDark}`;
            }}
          >
            <Play size={16} fill="currentColor" />
            {kh ? "ចាប់ផ្តើមឥឡូវ" : "PLAY NOW"}
          </Link>
        </div>
      </section>



      {/* Responsive grid override */}
      <style>{`
        @media (max-width: 768px) {
          .play-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
