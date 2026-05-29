"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { useGameSSE } from "@/hooks/use-game-sse";
import { GAME_MODE_CONFIG } from "@/lib/game-engine";
import type { SSEEvent, ParticipantInfo, LeaderboardEntry, QuestionPayload } from "@/lib/game-event-bus";
import {
  Play, Square, Users, BarChart2,
  Copy, Check, ChevronRight, Loader2,
  SkipForward, Crown, TrendingUp, TrendingDown, Minus,
  Zap, Trophy, Target, Swords, BookOpen, GraduationCap,
  Settings2, Globe, Layers, ChevronUp, ChevronDown,
  Sparkles, Rocket,
} from "lucide-react";
import { UpgradeButton } from "@/components/pricing/upgrade-button";

// ── Answer color config ────────────────────────────────────────────────────
const ANSWER_STYLES = [
  { bg: "linear-gradient(135deg,#ef4444,#dc2626)", border: "#ef4444", label: "A" },
  { bg: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "#3b82f6", label: "B" },
  { bg: "linear-gradient(135deg,#22c55e,#16a34a)", border: "#22c55e", label: "C" },
  { bg: "linear-gradient(135deg,#f97316,#ea580c)", border: "#f97316", label: "D" },
];

// ── Mode icons map ─────────────────────────────────────────────────────────
const MODE_ICONS: Record<string, React.ReactNode> = {
  "quick-quiz": <Zap size={18} />,
  "speed-round": <Rocket size={18} />,
  "sign-challenge": <Target size={18} />,
  "mixed-battle": <Swords size={18} />,
  "daily-challenge": <BookOpen size={18} />,
  "exam-simulation": <GraduationCap size={18} />,
};

type HostPhase =
  | { name: "setup" }
  | { name: "creating" }
  | { name: "lobby"; code: string; sessionId: number; participants: ParticipantInfo[]; gameMode: string; categories: string[]; difficulty: string; questionCount: number; timePerQuestion: number; scoringMode: string; maxPlayers: number }
  | { name: "active"; code: string; sessionId: number; qIndex: number; total: number; leaderboard: LeaderboardEntry[]; question: QuestionPayload }
  | { name: "round_end"; code: string; sessionId: number; leaderboard: LeaderboardEntry[]; qIndex: number; total: number; question: QuestionPayload; correctAnswerId: number | null }
  | { name: "ended"; code: string; sessionId: number; leaderboard: LeaderboardEntry[] };

// ── Leaderboard row ────────────────────────────────────────────────────────
function LiveLeaderRow({ entry, rank, showScore }: { entry: LeaderboardEntry; rank: number; showScore: boolean }) {
  const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const isTop3 = rank <= 3;
  const rankColor = RANK_COLORS[rank - 1] ?? "#4b5563";
  const initials = (entry.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 transition-all duration-500 group"
      style={{
        background: isTop3
          ? `linear-gradient(90deg, ${rankColor}18, transparent)`
          : "transparent",
        borderLeft: isTop3 ? `3px solid ${rankColor}` : "3px solid transparent",
      }}
    >
      <div
        className="w-7 h-7 flex items-center justify-center font-black text-xs flex-shrink-0 rounded-sm"
        style={{
          background: isTop3 ? rankColor : "rgba(255,255,255,0.08)",
          color: isTop3 && rank === 1 ? "#000" : "#fff",
        }}
      >
        {isTop3 ? <Crown size={12} /> : rank}
      </div>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 text-white border border-white/10"
        style={{ background: `hsl(${(entry.userId * 47) % 360}, 70%, 45%)` }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-xs truncate">{entry.displayName}</div>
        {entry.currentStreak > 1 && (
          <div className="text-orange-400 text-xs font-bold">🔥 ×{entry.currentStreak}</div>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        {showScore ? (
          <>
            <div className="font-black text-white text-sm tabular-nums">{entry.totalScore.toLocaleString()}</div>
            <div className="flex items-center justify-end gap-0.5">
              {entry.rankChange > 0 ? <TrendingUp size={9} className="text-green-400" /> : entry.rankChange < 0 ? <TrendingDown size={9} className="text-red-400" /> : <Minus size={9} className="text-white/20" />}
              <span className={`text-xs font-bold ${entry.rankChange > 0 ? "text-green-400" : entry.rankChange < 0 ? "text-red-400" : "text-white/20"}`}>
                {entry.rankChange !== 0 ? `${entry.rankChange > 0 ? "+" : ""}${entry.rankChange}` : "–"}
              </span>
            </div>
          </>
        ) : (
          <div className="font-black text-white/20 text-sm">···</div>
        )}
      </div>
    </div>
  );
}

// ── Glass card component ───────────────────────────────────────────────────
function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 backdrop-blur-sm ${className}`}
      style={{ background: "rgba(255,255,255,0.04)", ...style }}
    >
      {children}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────
function SectionLabel({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)", ...style }}>
      {children}
    </div>
  );
}

export default function HostPage() {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [phase, setPhase] = useState<HostPhase>({ name: "setup" });
  const [categories, setCategories] = useState<{ id: number; titleEn: string; titleKm: string }[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [sessionName, setSessionName] = useState("");
  const [selectedMode, setSelectedMode] = useState("quick-quiz");
  const [difficulty, setDifficulty] = useState("mixed");
  const [scoringMode, setScoringMode] = useState("speed");
  const [language, setLanguage] = useState("both");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [controlling, setControlling] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(50);
  const [lobbyParticipants, setLobbyParticipants] = useState<ParticipantInfo[]>([]);
  const [questionCount, setQuestionCount] = useState(10);

  // Fetch categories + check for existing active session on mount
  useEffect(() => {
    fetch("/api/game/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        if (d.categories?.length) setSelectedCats([d.categories[0].id]);
      });
    fetch("/api/game/sessions")
      .then((r) => r.json())
      .then(async (d) => {
        const active = (d.sessions ?? []).find(
          (s: any) => s.status === "lobby" || s.status === "active" || s.status === "paused"
        );
        if (active) {
          if (active.status === "lobby") {
            try {
              const infoRes = await fetch(`/api/game/sessions/${active.sessionCode}/info`);
              if (infoRes.ok) {
                const info = await infoRes.json();
                setPhase({
                  name: "lobby", code: active.sessionCode, sessionId: active.id, participants: [],
                  gameMode: info.gameMode ?? "quick-quiz",
                  categories: [info.category?.replace(/-/g, " ") ?? "—"],
                  difficulty: info.difficulty ?? "mixed",
                  questionCount: info.questionCount ?? 0,
                  timePerQuestion: info.timePerQuestion ?? 30,
                  scoringMode: info.scoringMode ?? "speed",
                  maxPlayers: info.maxPlayers ?? 50,
                });
                return;
              }
            } catch { }
            setPhase({ name: "lobby", code: active.sessionCode, sessionId: active.id, participants: [], gameMode: "quick-quiz", categories: [], difficulty: "mixed", questionCount: 0, timePerQuestion: 30, scoringMode: "speed", maxPlayers: 50 });
          } else if (active.status === "active" || active.status === "paused") {
            try {
              const stateRes = await fetch(`/api/game/sessions/${active.sessionCode}/state`);
              if (stateRes.ok) {
                const state = await stateRes.json();
                if (state.currentQuestion) {
                  setPhase({
                    name: "active",
                    code: active.sessionCode,
                    sessionId: active.id,
                    qIndex: state.currentQuestionIndex ?? 0,
                    total: state.totalQuestions ?? 1,
                    leaderboard: state.participants?.map((p: any, i: number) => ({
                      userId: p.userId, displayName: p.displayName, avatar: p.avatar,
                      totalScore: p.totalScore, rank: i + 1, rankChange: 0,
                      correctAnswers: 0, currentStreak: 0,
                    })) ?? [],
                    question: state.currentQuestion,
                  });
                  return;
                }
              }
            } catch { }
            setPhase({ name: "lobby", code: active.sessionCode, sessionId: active.id, participants: [], gameMode: "quick-quiz", categories: [], difficulty: "mixed", questionCount: 0, timePerQuestion: 30, scoringMode: "speed", maxPlayers: 50 });
          }
        }
      })
      .catch(() => { });
  }, []);

  const activeCode = "code" in phase ? (phase as any).code : "";

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.type === "lobby_update") {
      setLobbyParticipants(event.participants);
      setPhase((p) => p.name === "lobby" ? { ...p, participants: event.participants } : p);
    }
    if (event.type === "question_start") {
      setPhase((p) => {
        if (p.name === "lobby" || p.name === "round_end" || p.name === "active") {
          const prevLeaderboard = p.name === "active" ? p.leaderboard
            : p.name === "round_end" ? p.leaderboard
              : [];
          return {
            name: "active",
            code: "code" in p ? (p as any).code : "",
            sessionId: "sessionId" in p ? (p as any).sessionId : 0,
            qIndex: event.index,
            total: event.total,
            leaderboard: prevLeaderboard,
            question: event.question,
          };
        }
        return p;
      });
    }
    if (event.type === "question_end") {
      setPhase((p) => {
        if (p.name === "active") {
          return {
            name: "round_end",
            code: p.code, sessionId: p.sessionId,
            leaderboard: event.leaderboard,
            qIndex: p.qIndex, total: p.total,
            question: p.question,
            correctAnswerId: event.correctAnswerId,
          };
        }
        return p;
      });
    }
    if (event.type === "session_end") {
      setPhase((p) => ({
        name: "ended",
        code: "code" in p ? (p as any).code : "",
        sessionId: "sessionId" in p ? (p as any).sessionId : 0,
        leaderboard: event.finalLeaderboard,
      }));
    }
  }, []);

  useGameSSE(activeCode, handleSSEEvent, !!activeCode);

  async function createSession() {
    if (!sessionName.trim()) { setError(kh ? "ដាក់ឈ្មោះ" : "Enter session name"); return; }
    if (!selectedCats.length) { setError(kh ? "ជ្រើសរើសប្រភេទ" : "Select a category"); return; }
    setError("");
    setPhase({ name: "creating" });
    const cfg = GAME_MODE_CONFIG[selectedMode];
    const res = await fetch("/api/game/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionName, categoryIds: selectedCats, difficulty, questionCount, timePerQuestion: cfg.timePerQuestion, scoringMode, language, gameType: selectedMode, maxPlayers, allowLateJoin: true }),
    });
    if (!res.ok) { const err = await res.json(); setError(err.error ?? "Failed"); setPhase({ name: "setup" }); return; }
    const data = await res.json();
    const catNames = categories.filter(c => selectedCats.includes(c.id)).map(c => kh ? c.titleKm : c.titleEn);
    setPhase({
      name: "lobby", code: data.sessionCode, sessionId: data.sessionId, participants: [],
      gameMode: selectedMode, categories: catNames, difficulty,
      questionCount: data.questionCount ?? questionCount,
      timePerQuestion: cfg.timePerQuestion, scoringMode, maxPlayers,
    });
  }

  async function control(action: string) {
    if (controlling || !("code" in phase)) return;
    setControlling(true); setError("");
    try {
      const res = await fetch(`/api/game/sessions/${(phase as any).code}/control`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({ error: "Unknown" })); setError(e.details || e.error || `Failed to ${action}`); }
    } catch (err) { setError(`Network error: ${err instanceof Error ? err.message : "Unknown"}`); }
    finally { setControlling(false); }
  }

  function copyCode() {
    if (!("code" in phase)) return;
    navigator.clipboard.writeText((phase as any).code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const GAME_MODES = Object.entries(GAME_MODE_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));
  const selectedModeConfig = GAME_MODE_CONFIG[selectedMode];

  // ── Dark base style ────────────────────────────────────────────────────
  const darkBase: React.CSSProperties = {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
  };

  // ── SETUP PHASE ────────────────────────────────────────────────────────────
  if (phase.name === "setup" || phase.name === "creating") {
    const maxQ = difficulty === "mixed" ? 40 : 20;
    const easy = Math.round(questionCount * 0.4);
    const hard = Math.round(questionCount * 0.2);
    const medium = questionCount - easy - hard;

    return (
      <div style={darkBase}>
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "#FFD700" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: "#a855f7" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase" style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>
                <Sparkles size={12} />
                {kh ? "បង្កើតហ្គេម" : "Create Game"}
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight" style={{ ...khFont }}>
              {kh ? "ហ្គេមផ្ទាល់" : "Live Game Session"}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)", ...khFont }}>
              {kh ? "រៀបចំ ហើយចាប់ផ្តើម" : "Configure your session and launch live"}
            </p>
          </div>

          {/* Upgrade banner */}
          <UpgradeButton variant="banner" trigger="session_limit" lang={lang} className="mb-8" label={kh ? "ទទួលបានវគ្គគ្មានដែនកំណត់ + ប្រភេទទាំងអស់ — ធ្វើឱ្យប្រសើរឡើង" : "Get unlimited sessions + all categories — Upgrade to Teacher Pro"} />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ── Left: Config form ── */}
            <div className="lg:col-span-3 flex flex-col gap-5">

              {/* Session name */}
              <GlassCard className="p-5">
                <SectionLabel style={khFont}>{kh ? "ឈ្មោះវគ្គ" : "Session Name"}</SectionLabel>
                <input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder={kh ? "ឧ. ថ្នាក់ ១០ — សញ្ញាចរាចរណ៍" : "e.g. Class 10 - Traffic Signs"}
                  className="w-full px-4 py-3 rounded-xl font-bold text-sm placeholder:text-white/20 outline-none transition-all focus:ring-2"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    ...khFont,
                  }}
                  onFocus={(e) => e.target.style.borderColor = "rgba(255,215,0,0.5)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
              </GlassCard>

              {/* Game Modes */}
              <GlassCard className="p-5">
                <SectionLabel style={khFont}>{kh ? "របៀបលេង" : "Game Mode"}</SectionLabel>
                <div className="grid grid-cols-2 gap-2.5">
                  {GAME_MODES.map((m) => {
                    const isSelected = selectedMode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedMode(m.id); setQuestionCount(m.defaultQuestionCount); }}
                        className="relative p-4 rounded-xl text-left transition-all duration-200 overflow-hidden group"
                        style={{
                          background: isSelected ? `${m.color}22` : "rgba(255,255,255,0.04)",
                          border: isSelected ? `1.5px solid ${m.color}` : "1.5px solid rgba(255,255,255,0.08)",
                          boxShadow: isSelected ? `0 0 20px ${m.color}30` : "none",
                          transform: isSelected ? "scale(1.02)" : "scale(1)",
                        }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl opacity-10" style={{ background: `radial-gradient(circle at 30% 50%, ${m.color}, transparent 70%)` }} />
                        )}
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-1" style={{ color: isSelected ? m.color : "rgba(255,255,255,0.5)" }}>
                            {MODE_ICONS[m.id]}
                            <span className="font-black text-sm" style={{ color: isSelected ? "#fff" : "rgba(255,255,255,0.7)", ...khFont }}>
                              {kh ? m.labelKm : m.label}
                            </span>
                          </div>
                          <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {m.defaultQuestionCount}Q · {m.timePerQuestion}s/Q
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Categories */}
              <GlassCard className="p-5">
                <SectionLabel style={khFont}>{kh ? "ប្រភេទ" : "Categories"}</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const sel = selectedCats.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCats((p) => sel ? p.filter((id) => id !== cat.id) : [...p, cat.id])}
                        className="px-3.5 py-1.5 rounded-full text-sm font-bold transition-all duration-200"
                        style={{
                          background: sel ? "#FFD700" : "rgba(255,255,255,0.07)",
                          color: sel ? "#000" : "rgba(255,255,255,0.6)",
                          border: sel ? "1.5px solid #FFD700" : "1.5px solid rgba(255,255,255,0.1)",
                          boxShadow: sel ? "0 0 12px rgba(255,215,0,0.3)" : "none",
                          transform: sel ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        <span style={khFont}>{kh ? cat.titleKm : cat.titleEn}</span>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Settings row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Scoring */}
                <GlassCard className="p-4">
                  <div className="flex items-center gap-1.5 mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <Zap size={12} />
                    <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "ពិន្ទុ" : "Scoring"}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {["speed", "equal"].map((s) => (
                      <button key={s} onClick={() => setScoringMode(s)}
                        className="py-2 rounded-lg text-xs font-black transition-all"
                        style={{
                          background: scoringMode === s ? "#FFD700" : "rgba(255,255,255,0.05)",
                          color: scoringMode === s ? "#000" : "rgba(255,255,255,0.5)",
                          border: scoringMode === s ? "none" : "1px solid rgba(255,255,255,0.08)",
                        }}>
                        {s === "speed" ? (kh ? "ល្បឿន" : "Speed") : (kh ? "ស្មើ" : "Equal")}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {/* Language */}
                <GlassCard className="p-4">
                  <div className="flex items-center gap-1.5 mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <Globe size={12} />
                    <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "ភាសា" : "Language"}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {["both", "en", "km"].map((l) => (
                      <button key={l} onClick={() => setLanguage(l)}
                        className="py-2 rounded-lg text-xs font-black transition-all"
                        style={{
                          background: language === l ? "#FFD700" : "rgba(255,255,255,0.05)",
                          color: language === l ? "#000" : "rgba(255,255,255,0.5)",
                          border: language === l ? "none" : "1px solid rgba(255,255,255,0.08)",
                        }}>
                        {l === "both" ? (kh ? "ទាំងពីរ" : "Both") : l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {/* Difficulty */}
                <GlassCard className="p-4">
                  <div className="flex items-center gap-1.5 mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <Layers size={12} />
                    <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "កម្រិត" : "Difficulty"}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: "mixed", label: kh ? "ចម្រុះ" : "Mixed", color: "#a855f7" },
                      { id: "easy", label: kh ? "ងាយ" : "Easy", color: "#22c55e" },
                      { id: "medium", label: kh ? "មធ្យម" : "Medium", color: "#eab308" },
                      { id: "hard", label: kh ? "លំបាក" : "Hard", color: "#ef4444" },
                    ].map((d) => (
                      <button key={d.id}
                        onClick={() => { setDifficulty(d.id); if (d.id !== "mixed" && questionCount > 20) setQuestionCount(20); }}
                        className="py-1.5 rounded-lg text-xs font-black transition-all"
                        style={{
                          background: difficulty === d.id ? `${d.color}30` : "rgba(255,255,255,0.05)",
                          color: difficulty === d.id ? d.color : "rgba(255,255,255,0.5)",
                          border: difficulty === d.id ? `1px solid ${d.color}60` : "1px solid rgba(255,255,255,0.08)",
                        }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Question Count */}
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel style={khFont}>{kh ? "ចំនួនសំណួរ" : "Question Count"}</SectionLabel>
                  <div className="px-4 py-1.5 rounded-xl font-black text-lg" style={{ background: "#FFD700", color: "#000", minWidth: 56, textAlign: "center" }}>
                    {questionCount}
                  </div>
                </div>
                {/* Range slider */}
                <input
                  type="range" min={5} max={maxQ} step={1} value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full mb-4 cursor-pointer"
                  style={{ accentColor: "#FFD700" }}
                />
                {/* Quick picks */}
                <div className="flex gap-2 mb-4">
                  {(difficulty === "mixed" ? [5, 10, 15, 20, 30, 40] : [5, 10, 15, 20]).map((n) => (
                    <button key={n} onClick={() => setQuestionCount(n)}
                      className="flex-1 py-2 rounded-lg text-xs font-black transition-all"
                      style={{
                        background: questionCount === n ? "#FFD700" : "rgba(255,255,255,0.06)",
                        color: questionCount === n ? "#000" : "rgba(255,255,255,0.5)",
                        border: questionCount === n ? "none" : "1px solid rgba(255,255,255,0.08)",
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
                {/* Composition preview */}
                {difficulty === "mixed" && (
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)", ...khFont }}>
                      {kh ? "ការបែងចែក" : "Composition"}
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(easy / questionCount) * 100}%` }} />
                      <div className="h-full rounded-full bg-yellow-500 transition-all" style={{ width: `${(medium / questionCount) * 100}%` }} />
                      <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${(hard / questionCount) * 100}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { label: kh ? "ងាយ" : "Easy", count: easy, color: "#22c55e" },
                        { label: kh ? "មធ្យម" : "Medium", count: medium, color: "#eab308" },
                        { label: kh ? "លំបាក" : "Hard", count: hard, color: "#ef4444" },
                      ].map((d) => (
                        <div key={d.label} className="flex items-center gap-1.5 font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                          {d.label}
                          <span className="ml-auto font-black text-white">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Max Players */}
              <GlassCard className="p-5">
                <div className="flex items-center gap-1.5 mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <Users size={13} />
                  <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "អ្នកលេងអតិបរមា" : "Max Players"}</span>
                </div>
                <div className="flex gap-2">
                  {[10, 20, 30, 50, 100].map((n) => (
                    <button key={n} onClick={() => setMaxPlayers(n)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all"
                      style={{
                        background: maxPlayers === n ? "#FFD700" : "rgba(255,255,255,0.06)",
                        color: maxPlayers === n ? "#000" : "rgba(255,255,255,0.5)",
                        border: maxPlayers === n ? "none" : "1px solid rgba(255,255,255,0.08)",
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-xl border font-bold text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", ...khFont }}>
                  ⚠ {error}
                  {(error.toLowerCase().includes("session") || error.toLowerCase().includes("limit") || error.toLowerCase().includes("upgrade")) && (
                    <div className="mt-2"><UpgradeButton variant="banner" trigger="session_limit" lang={lang} /></div>
                  )}
                </div>
              )}

              {/* Launch CTA */}
              <button
                onClick={createSession}
                disabled={phase.name === "creating"}
                className="w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #f59e0b)",
                  color: "#000",
                  boxShadow: "0 8px 32px rgba(255,215,0,0.35), 0 0 0 0 rgba(255,215,0,0)",
                  ...khFont,
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.boxShadow = "0 12px 40px rgba(255,215,0,0.5)"; (e.target as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.boxShadow = "0 8px 32px rgba(255,215,0,0.35)"; (e.target as HTMLElement).style.transform = "translateY(0)"; }}
              >
                {phase.name === "creating" ? <Loader2 size={22} className="animate-spin" /> : <Rocket size={22} />}
                {kh ? "ចាប់ផ្តើមហ្គេម" : "Launch Game"}
              </button>
            </div>

            {/* ── Right: Preview card ── */}
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <GlassCard className="overflow-hidden">
                  <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {kh ? "ការមើលជាមុន" : "Preview"}
                    </div>
                    <div className="font-black text-white truncate" style={khFont}>
                      {sessionName || (kh ? "ឈ្មោះវគ្គ..." : "Session name...")}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    {/* Mode preview */}
                    <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: `${selectedModeConfig?.color}18`, border: `1px solid ${selectedModeConfig?.color}40` }}>
                      <div style={{ color: selectedModeConfig?.color }}>{MODE_ICONS[selectedMode]}</div>
                      <div>
                        <div className="font-black text-white text-sm" style={khFont}>
                          {kh ? selectedModeConfig?.labelKm : selectedModeConfig?.label}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {selectedModeConfig?.timePerQuestion}s / question
                        </div>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: kh ? "សំណួរ" : "Questions", value: `${questionCount}Q` },
                        { label: kh ? "អ្នកលេង" : "Players", value: `≤${maxPlayers}` },
                        { label: kh ? "ពិន្ទុ" : "Scoring", value: scoringMode === "speed" ? (kh ? "ល្បឿន" : "Speed") : (kh ? "ស្មើ" : "Equal") },
                        { label: kh ? "ភាសា" : "Language", value: language === "both" ? (kh ? "ទាំងពីរ" : "Both") : language.toUpperCase() },
                        { label: kh ? "កម្រិត" : "Difficulty", value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1) },
                        { label: kh ? "ពេលវេលា" : "Time / Q", value: `${selectedModeConfig?.timePerQuestion}s` },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{item.label}</div>
                          <div className="font-black text-white text-sm">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Categories */}
                    {selectedCats.length > 0 && (
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)", ...khFont }}>
                          {kh ? "ប្រភេទ" : "Categories"}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {categories.filter(c => selectedCats.includes(c.id)).map(c => (
                            <span key={c.id} className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>
                              {kh ? c.titleKm : c.titleEn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LOBBY PHASE ────────────────────────────────────────────────────────────
  if (phase.name === "lobby") {
    const modeConfig = GAME_MODE_CONFIG[phase.gameMode];
    const catNames = phase.categories.length > 0 ? phase.categories.join(", ") : "—";
    const fillPct = Math.min((phase.participants.length / phase.maxPlayers) * 100, 100);

    return (
      <div style={darkBase}>
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute top-0 left-0 w-full h-full" style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(255,215,0,0.12) 0%, transparent 60%)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black" style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {kh ? "ហ្គេមរង់ចាំ" : "Waiting Room"}
                </div>
              </div>
              <h1 className="text-4xl font-black" style={khFont}>{kh ? "រៀបចំខ្លួនលេង" : "Ready to Play"}</h1>
              <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)", ...khFont }}>
                {kh ? "ចែករំលែកលេខកូដជាមួយអ្នករៀន" : "Share the room code with your students"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { if (confirm(kh ? "បោះបង់ហ្គេមនេះ?" : "Cancel this game session?")) { control("terminate"); setTimeout(() => setPhase({ name: "setup" }), 500); } }}
                disabled={controlling}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-40"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <Square size={14} />{kh ? "បោះបង់" : "Cancel"}
              </button>
              <button
                onClick={() => control("start")}
                disabled={controlling || phase.participants.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", boxShadow: "0 4px 20px rgba(34,197,94,0.4)" }}
              >
                {controlling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                {kh ? "ចាប់ផ្តើម" : "Start Game"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl font-bold text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", ...khFont }}>
              ⚠ {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* ── Room Code (big) ── */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,215,0,0.06))", border: "2px solid rgba(255,215,0,0.3)" }}>
                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.08), transparent 70%)" }} />
                <div className="relative z-10">
                  <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,215,0,0.6)" }}>
                    {kh ? "លេខកូដបន្ទប់" : "Room Code"}
                  </div>
                  <div className="text-7xl font-black tracking-[0.15em] mb-2" style={{ color: "#FFD700", textShadow: "0 0 40px rgba(255,215,0,0.5)", letterSpacing: "0.2em" }}>
                    {phase.code}
                  </div>
                  <div className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {kh ? "ចូលតាម:" : "Join at:"} <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "bold" }}>kesararamwithdigital.tech/play/{phase.code}</span>
                  </div>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm mx-auto transition-all"
                    style={{ background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)", color: copied ? "#4ade80" : "#fff", border: copied ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(255,255,255,0.15)" }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? (kh ? "បានចម្លង!" : "Copied!") : (kh ? "ចម្លងលេខកូដ" : "Copy Code")}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Game Details ── */}
            <GlassCard className="p-5">
              <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)", ...khFont }}>
                {kh ? "ព័ត៌មានហ្គេម" : "Game Details"}
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: kh ? "របៀប" : "Mode", value: kh ? modeConfig?.labelKm : modeConfig?.label, color: modeConfig?.color },
                  { label: kh ? "ប្រភេទ" : "Category", value: catNames },
                  { label: kh ? "កម្រិត" : "Difficulty", value: phase.difficulty.charAt(0).toUpperCase() + phase.difficulty.slice(1), color: { mixed: "#a855f7", easy: "#22c55e", medium: "#eab308", hard: "#ef4444" }[phase.difficulty] },
                  { label: kh ? "សំណួរ" : "Questions", value: `${phase.questionCount}Q` },
                  { label: kh ? "ពេល/Q" : "Time/Q", value: `${phase.timePerQuestion}s` },
                  { label: kh ? "ពិន្ទុ" : "Scoring", value: phase.scoringMode },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.35)", ...khFont }}>{item.label}</span>
                    <span className="text-sm font-black capitalize" style={{ color: item.color || "#fff" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ── Players section ── */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users size={16} style={{ color: "#FFD700" }} />
                <span className="font-black text-sm uppercase tracking-widest" style={khFont}>
                  {phase.participants.length} / {phase.maxPlayers} {kh ? "នាក់" : "Players"}
                </span>
              </div>
              <div className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                {Math.round(fillPct)}% {kh ? "ពេញ" : "full"}
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${fillPct}%`, background: "linear-gradient(90deg,#22c55e,#4ade80)" }} />
            </div>

            {phase.participants.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <Users size={28} style={{ color: "rgba(255,255,255,0.2)" }} />
                </div>
                <p className="font-bold text-sm" style={{ color: "rgba(255,255,255,0.3)", ...khFont }}>
                  {kh ? "រង់ចាំអ្នកចូលរួម..." : "Waiting for players to join..."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {phase.participants.map((p, i) => (
                  <div
                    key={p.userId}
                    className="flex items-center gap-2 p-2.5 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      animation: "fadeIn 0.3s ease-out",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ background: `hsl(${(p.userId * 47) % 360}, 70%, 45%)`, color: "#fff" }}
                    >
                      {p.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.8)", ...khFont }}>
                      {p.displayName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
        <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
    );
  }

  // ── ACTIVE / ROUND END — FULLSCREEN PRESENTATION ───────────────────────────
  if (phase.name === "active" || phase.name === "round_end") {
    const isActive = phase.name === "active";
    const progress = ((phase.qIndex + 1) / phase.total) * 100;
    const leaderboard = phase.leaderboard ?? [];
    const question = phase.question;
    const answers = question?.answers ?? [];
    const correctAnswerId = phase.name === "round_end" ? phase.correctAnswerId : null;

    const displayLeaderboard: LeaderboardEntry[] = leaderboard.length > 0
      ? leaderboard
      : lobbyParticipants.map((p, i) => ({
        userId: p.userId, displayName: p.displayName, avatar: p.avatar,
        totalScore: 0, rank: i + 1, rankChange: 0,
        correctAnswers: 0, currentStreak: 0,
      }));

    return (
      <div
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{
          background: "#080811",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-black text-xs tracking-widest">LIVE</span>
            </div>
            <span className="text-white/50 text-sm font-bold" style={khFont}>
              {kh ? `សំណួរ ${phase.qIndex + 1} / ${phase.total}` : `Q ${phase.qIndex + 1} / ${phase.total}`}
            </span>
          </div>

          {/* Progress */}
          <div className="flex-1 mx-8 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#FFD700,#f59e0b)" }} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {error && <span className="text-red-400 text-xs font-bold max-w-xs truncate">{error}</span>}
            <button
              onClick={() => { if (confirm(kh ? "បញ្ចប់ហ្គេម?" : "End session?")) control("end"); }}
              disabled={controlling}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-black text-sm transition-all disabled:opacity-40"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <Square size={13} />{kh ? "បញ្ចប់" : "End"}
            </button>
            <button
              onClick={() => control("advance")}
              disabled={controlling}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-black text-sm transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#FFD700,#f59e0b)", color: "#000", boxShadow: "0 0 20px rgba(255,215,0,0.3)" }}
            >
              {controlling ? <Loader2 size={15} className="animate-spin" /> : <SkipForward size={15} />}
              {isActive ? (kh ? "បន្ទាប់" : "Next") : (kh ? "សំណួរបន្ទាប់" : "Next Q")}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Question area */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 overflow-y-auto">
            <div className="w-full max-w-3xl">
              {/* Round label */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: isActive ? "rgba(255,215,0,0.2)" : "rgba(34,197,94,0.2)", color: isActive ? "#FFD700" : "#4ade80", border: isActive ? "1px solid rgba(255,215,0,0.4)" : "1px solid rgba(74,222,128,0.4)" }}>
                  {isActive ? (kh ? "សំណួរ" : "Question") : (kh ? "ចប់វគ្គ" : "Round Over")}
                </div>
                <span className="text-white/30 text-xs font-bold">{phase.qIndex + 1} / {phase.total}</span>
              </div>

              {/* Question text */}
              <div className="text-center mb-8">
                {question?.imageUrl && (
                  <img src={question.imageUrl} alt="question" className="w-32 h-32 object-cover rounded-2xl mx-auto mb-6 border-2 border-white/10" />
                )}
                <div className="font-black text-3xl xl:text-4xl text-white leading-snug" style={khFont}>
                  {kh && question?.questionKm ? question.questionKm : question?.questionEn}
                </div>
                {kh && question?.questionKm && question?.questionEn && (
                  <div className="text-white/30 text-base font-bold mt-2">{question.questionEn}</div>
                )}
              </div>

              {/* Answers */}
              {answers.length > 0 && (
                <div className={`grid gap-3 ${answers.length <= 2 ? "grid-cols-1 max-w-xl mx-auto" : "grid-cols-2"}`}>
                  {answers.map((ans, i) => {
                    const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
                    const isCorrect = correctAnswerId !== null && ans.id === correctAnswerId;
                    const isWrong = correctAnswerId !== null && ans.id !== correctAnswerId;
                    const text = kh ? (ans.answerKm || ans.answerEn) : ans.answerEn;

                    return (
                      <div
                        key={ans.id}
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500"
                        style={{
                          background: isCorrect ? "rgba(34,197,94,0.25)" : isWrong ? "rgba(255,255,255,0.03)" : style.bg,
                          border: isCorrect ? "2px solid #4ade80" : isWrong ? "2px solid rgba(255,255,255,0.05)" : `2px solid ${style.border}40`,
                          opacity: isWrong ? 0.3 : 1,
                          boxShadow: isCorrect ? "0 0 24px rgba(74,222,128,0.35)" : "none",
                        }}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/20 font-black text-white text-base flex-shrink-0">
                          {style.label}
                        </div>
                        <span className="font-black text-white text-base leading-tight flex-1" style={khFont}>{text}</span>
                        {isCorrect && <span className="text-2xl flex-shrink-0">✅</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isActive && (
                <div className="mt-6 text-center text-sm font-bold" style={{ color: "rgba(255,255,255,0.3)", ...khFont }}>
                  {kh ? "ចុច «សំណួរបន្ទាប់» ដើម្បីបន្ត" : "Click «Next Q» to continue"}
                </div>
              )}
            </div>
          </div>

          {/* Right: Leaderboard */}
          <div className="w-72 xl:w-80 flex flex-col flex-shrink-0" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
            <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <BarChart2 size={13} style={{ color: "#FFD700" }} />
              <span className="text-white font-black text-xs uppercase tracking-widest" style={khFont}>
                {kh ? "ចំណាត់ថ្នាក់" : "Live Scores"}
              </span>
              <span className="ml-auto font-bold text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                {displayLeaderboard.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y" style={{ "--tw-divide-opacity": "0.05" } as any}>
              {displayLeaderboard.length === 0 ? (
                <div className="text-center py-10 text-sm font-bold" style={{ color: "rgba(255,255,255,0.2)", ...khFont }}>
                  {kh ? "រង់ចាំ..." : "Waiting..."}
                </div>
              ) : (
                displayLeaderboard.slice(0, 20).map((entry, i) => (
                  <LiveLeaderRow key={entry.userId} entry={entry} rank={i + 1} showScore={!isActive} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ENDED ──────────────────────────────────────────────────────────────────
  if (phase.name === "ended") {
    const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

    return (
      <div style={darkBase}>
        <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(255,215,0,0.15), transparent 60%)", zIndex: 0 }} />

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
          {/* Game over badge */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4" style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>
              <Trophy size={14} />
              {kh ? "ចប់ហ្គេម" : "Game Over"}
            </div>
            <h1 className="text-4xl font-black mb-2" style={khFont}>{kh ? "លទ្ធផលចុងក្រោយ" : "Final Results"}</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", ...khFont }}>
              {phase.leaderboard.length} {kh ? "អ្នកលេងបានចូលរួម" : "players participated"}
            </p>
          </div>

          {/* Top 3 podium */}
          {phase.leaderboard.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-8">
              {[1, 0, 2].map((idx) => {
                const entry = phase.leaderboard[idx];
                if (!entry) return null;
                const rank = idx + 1;
                const heights = [" h-24", "h-32", "h-20"];
                return (
                  <div key={entry.userId} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white border-2" style={{ background: `hsl(${(entry.userId * 47) % 360}, 70%, 45%)`, borderColor: RANK_COLORS[idx] }}>
                      {(entry.displayName || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-xs font-black text-center truncate w-full" style={{ color: "#fff", ...khFont }}>{entry.displayName}</div>
                    <div className={`w-full ${heights[idx] || "h-20"} rounded-t-xl flex flex-col items-center justify-center`} style={{ background: `${RANK_COLORS[idx]}22`, border: `2px solid ${RANK_COLORS[idx]}60` }}>
                      <div className="text-2xl mb-1">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</div>
                      <div className="font-black text-sm" style={{ color: RANK_COLORS[idx] }}>{entry.totalScore.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => router.push(`/teacher/sessions/${phase.code}/analytics`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <BarChart2 size={15} />{kh ? "មើលលទ្ធផល" : "View Results"}
            </button>
            <button
              onClick={() => setPhase({ name: "setup" })}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all"
              style={{ background: "linear-gradient(135deg,#FFD700,#f59e0b)", color: "#000" }}
            >
              <ChevronRight size={15} />{kh ? "ហ្គេមថ្មី" : "New Game"}
            </button>
          </div>

          {/* Full leaderboard */}
          {phase.leaderboard.length > 0 && (
            <GlassCard>
              <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", ...khFont }}>
                  {kh ? "ចំណាត់ថ្នាក់ចុងក្រោយ" : "Final Leaderboard"}
                </div>
              </div>
              <div className="divide-y" style={{ "--tw-divide-opacity": "0.05" } as any}>
                {phase.leaderboard.slice(0, 10).map((entry, i) => {
                  const isTop3 = i < 3;
                  return (
                    <div key={entry.userId} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0" style={{ background: isTop3 ? `${RANK_COLORS[i]}20` : "rgba(255,255,255,0.06)", color: isTop3 ? RANK_COLORS[i] : "rgba(255,255,255,0.4)" }}>
                        {isTop3 ? <Crown size={14} /> : entry.rank}
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0" style={{ background: `hsl(${(entry.userId * 47) % 360}, 70%, 45%)` }}>
                        {(entry.displayName || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-white text-sm truncate" style={khFont}>{entry.displayName}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{entry.correctAnswers} {kh ? "ត្រូវ" : "correct"}</div>
                      </div>
                      <div className="font-black text-lg tabular-nums" style={{ color: isTop3 ? RANK_COLORS[i] : "#fff" }}>
                        {entry.totalScore.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    );
  }

  return null;
}
