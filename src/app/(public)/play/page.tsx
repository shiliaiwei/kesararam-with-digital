"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import {
  ChevronRight,
  Zap,
  BookOpenCheck,
  Play,
  Trophy,
  Flame,
  Clock,
  Swords,
  TriangleAlert,
  Sparkles,
  Gauge,
  Users,
  Lock,
} from "lucide-react";
import { GAMEKIT_CARDS } from "@/lib/gamekit/registry";

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
    title: "Quick Quiz",
    titleKh: "សំណួរលឿន",
    desc: "10 random questions. Fast, no pressure. Perfect warm-up.",
    descKh: "សំណួរចៃដន្យ ១០ — ឆាប់រហ័ស គ្មានសម្ពាធ ល្អសម្រាប់កម្ដៅខ្លួន។",
    href: "/play/solo?mode=quick-quiz",
    badge: "10 Qs",
    timer: "30s",
    difficulty: 1,
    popular: true,
    color: BRAND.yellow,
    Icon: Zap,
  },
  {
    id: "speed-round",
    number: "02",
    title: "Speed Round",
    titleKh: "វគ្គល្បឿន",
    desc: "15 seconds per question. Think fast, tap faster.",
    descKh: "១៥វិនាទីក្នុងមួយសំណួរ — គិតលឿន ចុចលឿន។",
    href: "/play/solo?mode=speed-round",
    badge: "20 Qs",
    timer: "15s",
    difficulty: 3,
    popular: false,
    color: BRAND.red,
    Icon: Flame,
  },
  {
    id: "sign-challenge",
    number: "03",
    title: "Sign Challenge",
    titleKh: "ប្រឡងសញ្ញា",
    desc: "Identify traffic signs from images only. Test your memory.",
    descKh: "ស្គាល់សញ្ញាចរាចរពីរូបភាព — សាកល្បងការចងចាំ។",
    href: "/play/solo?mode=sign-challenge",
    badge: "15 Qs",
    timer: "20s",
    difficulty: 2,
    popular: false,
    color: BRAND.cyan,
    Icon: TriangleAlert,
  },
  {
    id: "mixed-practice",
    number: "04",
    title: "Mixed Practice",
    titleKh: "ហ្វឹកហាត់ចម្រុះ",
    desc: "All question types together. The complete practice run.",
    descKh: "ប្រភេទសំណួរទាំងអស់ — ហ្វឹកហាត់ពេញលេញ។",
    href: "/play/solo?mode=mixed-practice",
    badge: "20 Qs",
    timer: "30s",
    difficulty: 2,
    popular: false,
    color: BRAND.purple,
    Icon: Swords,
  },
];

// ─── DIFFICULTY METER ─────────────────────────────────────────────────────────
function DifficultyDots({ level, kh }: { level: number; kh: boolean }) {
  const labels = kh
    ? ["ងាយ", "មធ្យម", "ពិបាក"]
    : ["Easy", "Medium", "Hard"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Gauge size={13} strokeWidth={2.5} style={{ color: BRAND.black }} />
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: 14,
              height: 6,
              border: `1.5px solid ${BRAND.black}`,
              background: i <= level ? BRAND.black : BRAND.white,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {labels[level - 1]}
      </span>
    </div>
  );
}

// ─── GAME MODE CARD ───────────────────────────────────────────────────────────
function GameCard({ mode, kh, khFont }: {
  mode: typeof GAME_MODES[number];
  kh: boolean;
  khFont: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={mode.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: BRAND.white,
        border: `4px solid ${BRAND.black}`,
        boxShadow: hovered ? `10px 10px 0 ${BRAND.black}` : `5px 5px 0 ${BRAND.black}`,
        transform: hovered ? "translate(-4px, -4px)" : "translate(0,0)",
        transition: "transform 0.14s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.14s cubic-bezier(0.34,1.56,0.64,1)",
        textDecoration: "none",
        color: BRAND.black,
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* POPULAR ribbon */}
      {mode.popular && (
        <div style={{
          position: "absolute",
          top: 14,
          right: -34,
          transform: "rotate(45deg)",
          background: BRAND.black,
          color: BRAND.yellow,
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: 1.5,
          padding: "4px 40px",
          zIndex: 3,
          ...khFont,
        }}>
          {kh ? "ពេញនិយម" : "POPULAR"}
        </div>
      )}

      {/* Colored illustration banner */}
      <div style={{
        height: 96,
        background: mode.color,
        borderBottom: `4px solid ${BRAND.black}`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* dot pattern */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(0,0,0,0.14) 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
        }} />
        {/* giant watermark number */}
        <span style={{
          position: "absolute",
          left: 10,
          bottom: -18,
          fontSize: 80,
          fontWeight: 900,
          fontFamily: "Impact, 'Arial Black', sans-serif",
          color: "rgba(0,0,0,0.12)",
          lineHeight: 1,
          userSelect: "none",
        }}>
          {mode.number}
        </span>
        {/* icon tile */}
        <div style={{
          width: 56,
          height: 56,
          background: BRAND.white,
          border: `3px solid ${BRAND.black}`,
          boxShadow: hovered ? `5px 5px 0 ${BRAND.black}` : `3px 3px 0 ${BRAND.black}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: hovered ? "rotate(-10deg) scale(1.08)" : "none",
          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
          zIndex: 2,
        }}>
          <mode.Icon size={26} strokeWidth={2.5} style={{ color: mode.color === BRAND.yellow ? BRAND.yellowDark : mode.color }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        {/* meta chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, fontFamily: "monospace", border: `2px solid ${BRAND.black}`, padding: "2px 7px" }}>
            {mode.badge}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, fontFamily: "monospace", border: `2px solid ${BRAND.black}`, padding: "2px 7px" }}>
            <Clock size={11} strokeWidth={2.5} /> {mode.timer}
          </span>
        </div>

        <h3 style={{ ...khFont, fontSize: 19, fontWeight: 900, margin: 0, lineHeight: 1.15, letterSpacing: "-0.5px", color: hovered ? (mode.color === BRAND.yellow ? BRAND.yellowDark : mode.color) : BRAND.black, transition: "color 0.2s" }}>
          {kh ? mode.titleKh : mode.title}
        </h3>

        <p style={{ ...khFont, fontSize: 12.5, fontWeight: 600, color: "rgba(0,0,0,0.62)", margin: 0, lineHeight: 1.45, flex: 1 }}>
          {kh ? mode.descKh : mode.desc}
        </p>

        <DifficultyDots level={mode.difficulty} kh={kh} />

        {/* CTA */}
        <div style={{
          marginTop: 4,
          padding: "11px 18px",
          background: hovered ? mode.color : BRAND.white,
          color: BRAND.black,
          border: `3px solid ${BRAND.black}`,
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "all 0.14s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: hovered ? "none" : `4px 4px 0 ${BRAND.black}`,
          transform: hovered ? "translate(3px,3px)" : "none",
        }}>
          <Play size={13} fill="currentColor" strokeWidth={3} />
          <span style={khFont}>{kh ? "លេងឥឡូវ" : "PLAY NOW"}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── OTP-STYLE CODE INPUT ─────────────────────────────────────────────────────
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

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}>
      <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
        {cells.map((cell, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={cell}
            maxLength={1}
            inputMode="text"
            autoComplete="off"
            aria-label={`${kh ? "តួអក្សរកូដទី" : "Room code character"} ${i + 1}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              width: 42,
              height: 52,
              border: `3px solid ${BRAND.black}`,
              background: cell ? "#fefce8" : BRAND.white,
              color: BRAND.black,
              fontSize: 21,
              fontWeight: 900,
              fontFamily: "monospace",
              textAlign: "center",
              outline: "none",
              borderRadius: 0,
              boxShadow: cell ? `3px 3px 0 ${BRAND.yellow}` : `3px 3px 0 ${BRAND.black}`,
              transform: cell ? "translate(-1px,-1px)" : "none",
              transition: "all 0.1s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = BRAND.yellow;
              e.target.style.boxShadow = `3px 3px 0 ${BRAND.black}`;
              e.target.style.transform = "translate(-1px,-1px)";
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

      <button
        onClick={join}
        disabled={code.length !== 6}
        style={{
          ...khFont,
          width: "100%",
          height: 50,
          background: code.length === 6 ? BRAND.black : "#e4e4e7",
          color: code.length === 6 ? BRAND.white : "#a1a1aa",
          border: `3px solid ${BRAND.black}`,
          fontWeight: 900,
          fontSize: 14,
          letterSpacing: kh ? "0px" : "2px",
          cursor: code.length === 6 ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.1s",
          boxShadow: code.length === 6 ? `4px 4px 0 ${BRAND.yellow}` : "none",
          borderRadius: 0,
        }}
        onMouseEnter={(e) => {
          if (code.length === 6) {
            e.currentTarget.style.transform = "translate(-2px,-2px)";
            e.currentTarget.style.boxShadow = `6px 6px 0 ${BRAND.yellow}`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translate(0,0)";
          e.currentTarget.style.boxShadow = code.length === 6 ? `4px 4px 0 ${BRAND.yellow}` : "none";
        }}
      >
        {kh ? "ចូលរួមលេង" : "JOIN GAME"}
        <ChevronRight size={18} strokeWidth={3} />
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PlayPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && !d.error) {
          if (d.role === "student" && (!d.schoolName || !d.province || !d.gradeLevel)) {
            router.push("/profile/student");
            return;
          }
          // A student who no longer belongs to a class (e.g. removed/kicked by a
          // teacher) must re-join via a class code before they can play.
          if (d.role === "student" && d.hasClass === false) {
            router.push("/profile/student");
            return;
          }
          // Auto-rejoin: if the student is already in an in-progress session
          // (lobby/active/paused), jump straight back in — no code re-entry.
          fetch("/api/game/my-session")
            .then(r => r.ok ? r.json() : null)
            .then(s => {
              if (s && s.code) router.push(`/play/${s.code}`);
            })
            .catch(() => { });
        }
      })
      .catch(() => { });
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: BRAND.white,
      color: BRAND.black,
      fontFamily: "system-ui, -apple-system, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      {/* ═══ HERO — PLAY FIRST ═════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: `4px solid ${BRAND.black}`, background: BRAND.yellow }}>
        {/* dot pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(0,0,0,0.10) 2px, transparent 2px)",
          backgroundSize: "26px 26px", pointerEvents: "none",
        }} />
        <div className="play-hero">
          <div className="play-hero-text">
            <div style={{
              ...khFont,
              display: "inline-flex", alignItems: "center", gap: 7,
              background: BRAND.black, color: BRAND.yellow,
              fontSize: 12, fontWeight: 900, letterSpacing: kh ? "0.5px" : "2px", textTransform: "uppercase",
              padding: "6px 14px", marginBottom: 18,
            }}>
              <Sparkles size={14} strokeWidth={2.5} />
              {kh ? "លេងដើម្បីរៀន រៀនដើម្បីសុវត្ថិភាព" : "Play to Learn, Learn for Safety"}
            </div>

            <h1 style={{
              ...khFont,
              fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
              fontWeight: 900, color: BRAND.black,
              lineHeight: kh ? 1.35 : 1.05,
              margin: 0,
              letterSpacing: kh ? "0px" : "-2px",
            }}>
              {kh ? "លេងសប្បាយៗ យល់ដឹងច្បាប់ចរាចរណ៍!" : "Ready to become a road safety champion?"}
            </h1>

            <p style={{
              ...khFont,
              fontSize: "clamp(1rem, 2vw, 1.25rem)", fontWeight: 600,
              color: "rgba(0,0,0,0.7)", margin: "14px 0 26px", maxWidth: 460, lineHeight: 1.5,
            }}>
              {kh
                ? "ជ្រើសរើសរបៀបលេង សន្សំពិន្ទុ និងរៀនច្បាប់ចរាចរណ៍ដោយសប្បាយៗ — មិនបាច់ចុះឈ្មោះ!"
                : "Pick your favorite mode to test your road safety skills, earn points, and climb the ranks instantly — no sign-up required!"}
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="#modes" style={{
                ...khFont,
                display: "flex", alignItems: "center", gap: 10,
                padding: "16px 34px", background: BRAND.black, color: BRAND.white,
                border: `3px solid ${BRAND.black}`, fontWeight: 900, fontSize: 15,
                letterSpacing: kh ? "0px" : "1.5px",
                textDecoration: "none", boxShadow: `5px 5px 0 rgba(0,0,0,0.25)`,
              }}>
                <Play size={16} fill="currentColor" strokeWidth={3} />
                {kh ? "ចាប់ផ្ដើមលេង" : "START THE CHALLENGE"}
              </a>
              <Link href="/leaderboard" style={{
                ...khFont,
                display: "flex", alignItems: "center", gap: 8,
                padding: "16px 28px", background: BRAND.white, color: BRAND.black,
                border: `3px solid ${BRAND.black}`, fontWeight: 900, fontSize: 14,
                letterSpacing: kh ? "0px" : "1px",
                textDecoration: "none", boxShadow: `5px 5px 0 rgba(0,0,0,0.25)`,
              }}>
                <Trophy size={16} strokeWidth={2.5} />
                {kh ? "តារាងពិន្ទុ" : "Leaderboard"}
              </Link>
            </div>
          </div>

          {/* Room code join — compact secondary */}
          <div className="play-hero-join">
            <div style={{
              background: BRAND.white, border: `4px solid ${BRAND.black}`,
              padding: "22px 20px", boxShadow: `7px 7px 0 ${BRAND.black}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Users size={18} strokeWidth={2.5} />
                <span style={{ ...khFont, fontSize: 14, fontWeight: 900, letterSpacing: kh ? "0px" : "1px" }}>
                  {kh ? "លេងជាមួយថ្នាក់រៀន" : "Play with Classmates"}
                </span>
              </div>
              <p style={{ ...khFont, fontSize: 11.5, fontWeight: 600, color: "rgba(0,0,0,0.55)", margin: "0 0 16px" }}>
                {kh ? "បញ្ចូលកូដ ៦ ខ្ទង់ពីលោកគ្រូអ្នកគ្រូ ដើម្បីចាប់ផ្ដើមលេងជាមួយមិត្តភក្តិភ្លាមៗ!" : "Enter the 6-digit code shared by your teacher to join the live classroom challenge!"}
              </p>
              <OtpCodeInput lang={lang} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GAME MODES ════════════════════════════════════════════════════ */}
      <section id="modes" style={{ background: BRAND.white }}>
        <div className="modes-header">
          <h2 style={{ ...khFont, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
            {kh ? "ជ្រើសរើសរបៀបលេង" : "Pick your game mode"}
          </h2>
          <Link href="/learn" style={{
            ...khFont,
            display: "flex", alignItems: "center", gap: 8, padding: "12px 22px",
            background: BRAND.white, color: BRAND.black, border: `3px solid ${BRAND.black}`,
            fontWeight: 900, fontSize: 13, letterSpacing: 1, textDecoration: "none",
            boxShadow: `4px 4px 0 ${BRAND.black}`,
          }}>
            <BookOpenCheck size={16} strokeWidth={2.5} />
            {kh ? "រៀនទ្រឹស្តីសិន" : "Study First"}
          </Link>
        </div>

        <div className="card-grid">
          {GAME_MODES.map((mode) => (
            <GameCard key={mode.id} mode={mode} kh={kh} khFont={khFont} />
          ))}
        </div>

        {/* ═══ MORE GAMES (GameKit) ═══════════════════════════════════════ */}
        <div className="modes-header" style={{ marginTop: 8 }}>
          <h2 style={{ ...khFont, fontSize: "clamp(1.4rem, 2.6vw, 2rem)", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
            {kh ? "ហ្គេមបន្ថែម" : "More Games"}
          </h2>
          <span style={{ ...khFont, fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.5)" }}>
            {kh ? "លេងដើម្បីទទួលពិន្ទុ" : "Play to earn points"}
          </span>
        </div>
        <div className="card-grid">
          {GAMEKIT_CARDS.filter((g) => g.id !== "daily").map((g) => {
            const isPro = g.accessTier === "class-pro";
            return (
              <Link
                key={g.id}
                href={g.route}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: BRAND.white,
                  border: `4px solid ${BRAND.black}`,
                  boxShadow: `5px 5px 0 ${BRAND.black}`,
                  textDecoration: "none",
                  color: BRAND.black,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* banner */}
                <div style={{ height: 88, background: g.brandColor, borderBottom: `4px solid ${BRAND.black}`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(0,0,0,0.14) 1.5px, transparent 1.5px)", backgroundSize: "14px 14px" }} />
                  <div style={{ width: 52, height: 52, background: BRAND.white, border: `3px solid ${BRAND.black}`, boxShadow: `3px 3px 0 ${BRAND.black}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                    <g.Icon size={24} strokeWidth={2.5} className="text-black" />
                  </div>
                  {/* badge */}
                  {g.badge && (
                    <span style={{ position: "absolute", top: 8, left: 8, background: BRAND.black, color: BRAND.white, fontSize: 9, fontWeight: 900, letterSpacing: 1, padding: "3px 7px", ...khFont }}>
                      {kh ? g.badge.kh : g.badge.en}
                    </span>
                  )}
                  {isPro && (
                    <span style={{ position: "absolute", top: 8, right: 8, background: BRAND.white, border: `2px solid ${BRAND.black}`, display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26 }}>
                      <Lock size={13} className="text-black" />
                    </span>
                  )}
                </div>
                {/* content */}
                <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
                  <h3 style={{ ...khFont, fontSize: 17, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>{kh ? g.title.kh : g.title.en}</h3>
                  <p style={{ ...khFont, fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.6)", margin: 0, lineHeight: 1.4, flex: 1 }}>{kh ? g.description.kh : g.description.en}</p>
                  <div style={{ marginTop: 4, padding: "10px 16px", background: BRAND.white, color: BRAND.black, border: `3px solid ${BRAND.black}`, fontWeight: 900, fontSize: 12, letterSpacing: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: `4px 4px 0 ${BRAND.black}` }}>
                    {isPro ? <Lock size={13} /> : <Play size={13} fill="currentColor" strokeWidth={3} />}
                    <span style={khFont}>{isPro ? (kh ? "ដោះសោដោយ Pro" : "PRO UNLOCK") : (kh ? "លេងឥឡូវ" : "PLAY NOW")}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom spacing */}
        <div style={{ height: 56 }} />
      </section>

      <style>{`
        .play-hero {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 48px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 24px;
          position: relative;
          z-index: 1;
        }
        .play-hero-join { width: 100%; max-width: 380px; justify-self: end; }

        .modes-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          max-width: 1200px; margin: 0 auto; padding: 40px 24px 8px;
        }

        .card-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px;
          max-width: 1200px; margin: 0 auto; padding: 24px 24px 16px;
        }

        .bottom-cta {
          border: 4px solid #000; background: #fff;
          padding: 36px 40px; display: flex; align-items: center; justify-content: space-between;
          gap: 32px; max-width: 1200px; margin: 32px auto 72px;
          box-shadow: 10px 10px 0 #000; position: relative; overflow: hidden;
        }

        @media (max-width: 1024px) {
          .card-grid { grid-template-columns: repeat(2, 1fr); gap: 22px; }
          .play-hero { gap: 32px; padding: 44px 24px; }
        }
        @media (max-width: 860px) {
          .play-hero { grid-template-columns: 1fr; gap: 28px; padding: 36px 24px; }
          .play-hero-join { justify-self: stretch; max-width: none; }
        }
        @media (max-width: 640px) {
          .card-grid { grid-template-columns: 1fr; gap: 20px; padding: 20px 16px 8px; }
          .play-hero { padding: 28px 16px; }
          .modes-header { padding: 32px 16px 4px; }
          .bottom-cta { flex-direction: column; align-items: flex-start; padding: 28px 22px; margin: 24px 16px 56px; gap: 22px; }
          .bottom-cta-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
