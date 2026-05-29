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
  Sparkles, Rocket, Maximize, Minimize,
} from "lucide-react";
import { UpgradeButton } from "@/components/pricing/upgrade-button";
import { UpgradeModal } from "@/components/pricing/upgrade-modal";
import { Lock } from "lucide-react";

// ── Answer color config ────────────────────────────────────────────────────
const ANSWER_STYLES = [
  { bg: "#ef4444", border: "#000000", label: "A" },
  { bg: "#3b82f6", border: "#000000", label: "B" },
  { bg: "#22c55e", border: "#000000", label: "C" },
  { bg: "#f97316", border: "#000000", label: "D" },
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
  const RANK_COLORS = ["#FFD700", "#e4e4e7", "#fed7aa"];
  const isTop3 = rank <= 3;
  const rankColor = RANK_COLORS[rank - 1] ?? "#f4f4f5";
  const initials = (entry.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 border-b border-zinc-200 ${
        isTop3 ? "bg-yellow-50" : "bg-white"
      }`}
    >
      <div
        className="w-7 h-7 border border-black flex items-center justify-center font-black text-xs flex-shrink-0"
        style={{
          borderRadius: "0px",
          background: rankColor,
          color: "#000000",
          boxShadow: isTop3 ? "1px 1px 0 #000" : "none",
        }}
      >
        {isTop3 ? <Crown size={12} /> : rank}
      </div>
      <div
        className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-xs flex-shrink-0 text-white"
        style={{ background: `hsl(${(entry.userId * 47) % 360}, 70%, 45%)`, borderRadius: "0px" }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0 text-black">
        <div className="font-bold text-xs truncate">{entry.displayName}</div>
        {entry.currentStreak > 1 && (
          <div className="text-orange-600 text-xs font-bold">🔥 ×{entry.currentStreak}</div>
        )}
      </div>
      <div className="text-right flex-shrink-0 text-black">
        {showScore ? (
          <>
            <div className="font-black text-sm tabular-nums">{entry.totalScore.toLocaleString()}</div>
            <div className="flex items-center justify-end gap-0.5">
              {entry.rankChange > 0 ? <TrendingUp size={9} className="text-green-600" /> : entry.rankChange < 0 ? <TrendingDown size={9} className="text-red-600" /> : <Minus size={9} className="text-zinc-400" />}
              <span className={`text-[10px] font-black ${entry.rankChange > 0 ? "text-green-600" : entry.rankChange < 0 ? "text-red-600" : "text-zinc-400"}`}>
                {entry.rankChange !== 0 ? `${entry.rankChange > 0 ? "+" : ""}${entry.rankChange}` : "–"}
              </span>
            </div>
          </>
        ) : (
          <div className="font-black text-zinc-300 text-sm">···</div>
        )}
      </div>
    </div>
  );
}

// ── Glass card component ───────────────────────────────────────────────────
function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`bg-white border-2 border-black shadow-[4px_4px_0_#000] ${className}`}
      style={{ borderRadius: "0px", ...style }}
    >
      {children}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────
function SectionLabel({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="text-xs font-black uppercase tracking-widest mb-3 text-black" style={style}>
      {children}
    </div>
  );
}

// ── Confetti celebration ───────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 2}s`,
    color: ["#ffd700", "#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f97316"][i % 6],
    size: `${8 + Math.random() * 12}px`,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-none border border-black"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration} ${p.delay} linear infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function HostPage() {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [phase, setPhase] = useState<HostPhase>({ name: "setup" });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };
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

  const [subPlan, setSubPlan] = useState<string>("free");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState("");

  // Fetch subscription plan info client-side
  useEffect(() => {
    fetch("/api/subscriptions/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.subscription?.plan) {
          setSubPlan(d.subscription.plan);
        }
      })
      .catch(() => {});
  }, []);

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

  const darkBase: React.CSSProperties = {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
  };

  if (phase.name === "setup" || phase.name === "creating") {
    const maxQ = difficulty === "mixed" ? 40 : 20;
    const easy = Math.round(questionCount * 0.4);
    const hard = Math.round(questionCount * 0.2);
    const medium = questionCount - easy - hard;

    return (
      <div className="min-h-screen dot-bg text-black pb-12">
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1 border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0_#000] text-xs font-black tracking-widest uppercase" style={{ borderRadius: "0px" }}>
                <Sparkles size={12} />
                {kh ? "បង្កើតហ្គេម" : "Create Game"}
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight" style={{ ...khFont }}>
              {kh ? "ហ្គេមផ្ទាល់" : "Live Game Session"}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 font-bold" style={{ ...khFont }}>
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
                  className="w-full px-4 py-3 border-2 border-black font-bold text-sm bg-white text-black placeholder:text-zinc-400 outline-none shadow-[2px_2px_0_#000] focus:shadow-[4px_4px_0_#000] transition-all"
                  style={{
                    borderRadius: "0px",
                    ...khFont,
                  }}
                />
              </GlassCard>

              {/* Game Modes */}
              <GlassCard className="p-5">
                <SectionLabel style={khFont}>{kh ? "របៀបលេង" : "Game Mode"}</SectionLabel>
                  {(() => {
                    const MODE_META: Record<string, {
                      emoji: string;
                      tagline: string;
                      taglineKm: string;
                      accentShape: string;
                      badge?: string;
                      badgeColor?: string;
                    }> = {
                      "quick-quiz": {
                        emoji: "⚡",
                        tagline: "Flexible pace, any topic",
                        taglineKm: "ល្បឿនដោយខ្លួនឯង",
                        accentShape: "polygon(0 0,100% 0,85% 100%,0 100%)",
                        badge: "Popular",
                        badgeColor: "#22c55e",
                      },
                      "speed-round": {
                        emoji: "🚀",
                        tagline: "15s rapid fire — stay sharp",
                        taglineKm: "១៥វិនាទី ឆ្លើយលឿន",
                        accentShape: "polygon(0 0,100% 0,100% 100%,15% 100%)",
                        badge: "Fast",
                        badgeColor: "#ef4444",
                      },
                      "sign-challenge": {
                        emoji: "🪧",
                        tagline: "Image-based sign recognition",
                        taglineKm: "សញ្ញាចរាចរណ៍",
                        accentShape: "polygon(0 0,85% 0,100% 100%,0 100%)",
                        badge: "Visual",
                        badgeColor: "#3b82f6",
                      },
                      "mixed-battle": {
                        emoji: "⚔️",
                        tagline: "All question types, full chaos",
                        taglineKm: "ចម្រុះសំណួរ",
                        accentShape: "polygon(0 0,100% 0,100% 100%,0 100%)",
                        badge: "Pro Only",
                        badgeColor: "#ffd700",
                      },
                      "daily-challenge": {
                        emoji: "📅",
                        tagline: "Fresh questions every day",
                        taglineKm: "ថ្មីរៀងរាល់ថ្ងៃ",
                        accentShape: "polygon(0 0,100% 0,90% 100%,0 100%)",
                        badge: "Pro Only",
                        badgeColor: "#ffd700",
                      },
                      "exam-simulation": {
                        emoji: "🎓",
                        tagline: "Simulate the real licence exam",
                        taglineKm: "ត្រាប់ប្រឡងបណ្ណ",
                        accentShape: "polygon(10% 0,100% 0,100% 100%,0 100%)",
                        badge: "Pro Only",
                        badgeColor: "#ffd700",
                      },
                    };

                    const MODE_STATS: Record<string, { xp: string; complexity: string; complexityKm: string }> = {
                      "quick-quiz": { xp: "1.0x XP", complexity: "Easy", complexityKm: "ស្រួល" },
                      "speed-round": { xp: "1.5x XP", complexity: "Hard", complexityKm: "ពិបាក" },
                      "sign-challenge": { xp: "1.2x XP", complexity: "Medium", complexityKm: "មធ្យម" },
                      "mixed-battle": { xp: "2.0x XP", complexity: "Chaos", complexityKm: "ចម្រុះ" },
                      "daily-challenge": { xp: "1.3x XP", complexity: "Dynamic", complexityKm: "ប្រែប្រួល" },
                      "exam-simulation": { xp: "2.5x XP", complexity: "Real Test", complexityKm: "ប្រឡងផ្លូវការ" },
                    };

                    return (
                      <div className="grid grid-cols-2 gap-4">
                        {GAME_MODES.map((m) => {
                          const isSelected = selectedMode === m.id;
                          const isPremium = ["mixed-battle", "daily-challenge", "exam-simulation"].includes(m.id);
                          const isLocked = isPremium && subPlan === "free";
                          const meta = MODE_META[m.id] ?? { emoji: "🎮", tagline: "", taglineKm: "", accentShape: "" };
                          const stats = MODE_STATS[m.id] ?? { xp: "1.0x XP", complexity: "Easy", complexityKm: "ស្រួល" };

                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                if (isLocked) {
                                  setUpgradeTrigger("advanced_modes");
                                  setUpgradeModalOpen(true);
                                } else {
                                  setSelectedMode(m.id);
                                  setQuestionCount(m.defaultQuestionCount);
                                }
                              }}
                              className={`relative text-left overflow-hidden transition-all duration-100 border-2 border-black p-4 flex flex-col h-full justify-between group ${
                                isSelected 
                                  ? "-translate-x-1 -translate-y-1" 
                                  : "bg-white hover:-translate-x-0.5 hover:-translate-y-0.5"
                              }`}
                              style={{
                                borderRadius: "0px",
                                backgroundColor: isSelected ? m.color : "#ffffff",
                                boxShadow: isSelected 
                                  ? "6px 6px 0px #000000" 
                                  : "3px 3px 0px #000000",
                                borderStyle: isLocked ? "dashed" : "solid",
                                opacity: isLocked ? 0.6 : 1,
                              }}
                            >
                              {/* Background accent shape */}
                              <div className="absolute top-0 right-0 w-16 h-16 opacity-10 transition-opacity group-hover:opacity-15"
                                style={{
                                  background: m.color,
                                  clipPath: meta.accentShape,
                                }} />

                              <div className="relative z-10 flex flex-col h-full justify-between w-full text-black">
                                <div>
                                  {/* Header: emoji + locks/badges */}
                                  <div className="flex items-start justify-between mb-3 w-full">
                                    <div className="text-2xl leading-none">{meta.emoji}</div>
                                    <div className="flex items-center gap-1.5">
                                      {isLocked && (
                                        <div className="bg-[#FFD700] border-2 border-black p-0.5 shadow-[1px_1px_0_#000]" style={{ borderRadius: "0px" }}>
                                          <Lock size={10} className="text-black" />
                                        </div>
                                      )}
                                      {meta.badge && (
                                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-black shrink-0"
                                          style={{
                                            borderRadius: "0px",
                                            background: isLocked ? "#FFD700" : meta.badgeColor,
                                            color: "#000",
                                            boxShadow: "1px 1px 0 #000",
                                          }}>
                                          {meta.badge}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Mode name */}
                                  <div className="font-black text-sm mb-1 leading-tight flex items-center gap-1.5 text-black" style={{ ...khFont }}>
                                    {kh ? m.labelKm : m.label}
                                  </div>

                                  {/* Tagline */}
                                  <div className="text-[10px] mb-4 leading-snug text-zinc-600 font-bold" style={{ ...khFont }}>
                                    {kh ? meta.taglineKm : meta.tagline}
                                  </div>
                                </div>

                                <div>
                                  {/* Gamified stats chips (Neo-Brutalist Inventory style) */}
                                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                                    <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 border border-black bg-[#06b6d4] text-black shadow-[1px_1px_0_#000]" style={{ borderRadius: "0px" }}>
                                      {stats.xp}
                                    </span>
                                    <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 border border-black shadow-[1px_1px_0_#000]"
                                      style={{
                                        borderRadius: "0px",
                                        background: isSelected ? "#ffffff" : "#f4f4f5",
                                        color: "#000000",
                                      }}>
                                      {kh ? stats.complexityKm : stats.complexity}
                                    </span>
                                  </div>

                                  {/* Config presets footer */}
                                  <div className="flex items-center gap-1.5 border-t border-black pt-2.5 flex-wrap">
                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-zinc-100 text-black border border-black shadow-[1px_1px_0_#000]" style={{ borderRadius: "0px" }}>
                                      {m.defaultQuestionCount}Q
                                    </span>
                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-zinc-100 text-black border border-black shadow-[1px_1px_0_#000]" style={{ borderRadius: "0px" }}>
                                      {m.timePerQuestion}s/Q
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
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
                        className={`px-3.5 py-1.5 text-sm font-bold border-2 border-black transition-all duration-100 ${
                          sel 
                            ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5" 
                            : "bg-white text-zinc-700 hover:bg-zinc-50"
                        }`}
                        style={{ borderRadius: "0px" }}
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
                  <div className="flex items-center gap-1.5 mb-3 text-zinc-600 font-bold">
                    <Zap size={12} />
                    <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "ពិន្ទុ" : "Scoring"}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {["speed", "equal"].map((s) => (
                      <button key={s} onClick={() => setScoringMode(s)}
                        className={`py-2 text-xs font-black border-2 border-black transition-all duration-100 ${
                          scoringMode === s
                            ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                            : "bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                        style={{ borderRadius: "0px" }}>
                        {s === "speed" ? (kh ? "ល្បឿន" : "Speed") : (kh ? "ស្មើ" : "Equal")}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {/* Language */}
                <GlassCard className="p-4">
                  <div className="flex items-center gap-1.5 mb-3 text-zinc-600 font-bold">
                    <Globe size={12} />
                    <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "ភាសា" : "Language"}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {["both", "en", "km"].map((l) => (
                      <button key={l} onClick={() => setLanguage(l)}
                        className={`py-2 text-xs font-black border-2 border-black transition-all duration-100 ${
                          language === l
                            ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                            : "bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                        style={{ borderRadius: "0px" }}>
                        {l === "both" ? (kh ? "ទាំងពីរ" : "Both") : l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {/* Difficulty */}
                <GlassCard className="p-4">
                  <div className="flex items-center gap-1.5 mb-3 text-zinc-600 font-bold">
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
                        className={`py-1.5 text-xs font-black border-2 border-black transition-all duration-100 ${
                          difficulty === d.id
                            ? "shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5 text-black"
                            : "bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                        style={{
                          borderRadius: "0px",
                          backgroundColor: difficulty === d.id ? d.color : "#ffffff",
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
                  <div className="px-4 py-1.5 border-2 border-black shadow-[2px_2px_0_#000] font-black text-lg bg-yellow-400 text-black animate-none" style={{ minWidth: 56, textAlign: "center", borderRadius: "0px" }}>
                    {questionCount}
                  </div>
                </div>
                {/* Range slider */}
                <input
                  type="range" min={5} max={maxQ} step={1} value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full mb-4 cursor-pointer"
                  style={{ accentColor: "#000000" }}
                />
                {/* Quick picks */}
                <div className="flex gap-2 mb-4">
                  {(difficulty === "mixed" ? [5, 10, 15, 20, 30, 40] : [5, 10, 15, 20]).map((n) => (
                    <button key={n} onClick={() => setQuestionCount(n)}
                      className={`flex-1 py-2 border-2 border-black text-xs font-black transition-all duration-100 ${
                        questionCount === n
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                          : "bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                      style={{ borderRadius: "0px" }}>
                      {n}
                    </button>
                  ))}
                </div>
                {/* Composition preview */}
                {difficulty === "mixed" && (
                  <div className="border-2 border-black bg-zinc-50 shadow-[2px_2px_0_#000] p-3" style={{ borderRadius: "0px" }}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-600" style={{ ...khFont }}>
                      {kh ? "ការបែងចែក" : "Composition"}
                    </div>
                    <div className="flex h-3 border-2 border-black bg-white overflow-hidden mb-3" style={{ borderRadius: "0px" }}>
                      <div className="h-full bg-green-500 transition-all" style={{ width: `${(easy / questionCount) * 100}%` }} />
                      <div className="h-full bg-yellow-500 transition-all" style={{ width: `${(medium / questionCount) * 100}%` }} />
                      <div className="h-full bg-red-500 transition-all" style={{ width: `${(hard / questionCount) * 100}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { label: kh ? "ងាយ" : "Easy", count: easy, color: "#22c55e" },
                        { label: kh ? "មធ្យម" : "Medium", count: medium, color: "#eab308" },
                        { label: kh ? "លំបាក" : "Hard", count: hard, color: "#ef4444" },
                      ].map((d) => (
                        <div key={d.label} className="flex items-center gap-1.5 font-bold text-zinc-600">
                          <span className="w-2.5 h-2.5 border border-black" style={{ background: d.color }} />
                          {d.label}
                          <span className="ml-auto font-black text-black">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Max Players */}
              <GlassCard className="p-5">
                <div className="flex items-center gap-1.5 mb-3 text-zinc-600 font-bold">
                  <Users size={13} />
                  <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "អ្នកលេងអតិបរមា" : "Max Players"}</span>
                </div>
                <div className="flex gap-2">
                  {[10, 20, 30, 50, 100].map((n) => (
                    <button key={n} onClick={() => setMaxPlayers(n)}
                      className={`flex-1 py-2.5 border-2 border-black text-sm font-black transition-all duration-100 ${
                        maxPlayers === n
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                          : "bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                      style={{ borderRadius: "0px" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 border-2 border-black bg-red-400 text-black font-black text-sm shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px", ...khFont }}>
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
                className="w-full py-5 border-2 border-black bg-yellow-400 text-black font-black text-xl flex items-center justify-center gap-3 transition-all duration-100 hover:bg-yellow-300 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0_#000]"
                style={{
                  borderRadius: "0px",
                  ...khFont,
                }}
              >
                {phase.name === "creating" ? <Loader2 size={22} className="animate-spin" /> : <Rocket size={22} />}
                {kh ? "ចាប់ផ្តើមហ្គេម" : "Launch Game"}
              </button>
            </div>

            {/* ── Right: Preview card ── */}
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <GlassCard className="overflow-hidden">
                  <div className="px-5 py-4 border-b-2 border-black bg-blue-400 text-black">
                    <div className="text-xs font-bold uppercase tracking-widest mb-0.5 text-black/70">
                      {kh ? "ការមើលជាមុន" : "Preview"}
                    </div>
                    <div className="font-black text-black truncate" style={khFont}>
                      {sessionName || (kh ? "ឈ្មោះវគ្គ..." : "Session name...")}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    {/* Mode preview */}
                    <div className="p-4 border-2 border-black flex items-center gap-3 bg-zinc-50" style={{ borderRadius: "0px" }}>
                      <div style={{ color: selectedModeConfig?.color }}>{MODE_ICONS[selectedMode]}</div>
                      <div>
                        <div className="font-black text-black text-sm" style={khFont}>
                          {kh ? selectedModeConfig?.labelKm : selectedModeConfig?.label}
                        </div>
                        <div className="text-xs text-zinc-600 font-bold">
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
                        <div key={item.label} className="p-3 border-2 border-black bg-zinc-50" style={{ borderRadius: "0px" }}>
                          <div className="text-xs mb-0.5 text-zinc-500 font-bold">{item.label}</div>
                          <div className="font-black text-black text-sm">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Categories */}
                    {selectedCats.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-600" style={khFont}>
                          {kh ? "ប្រភេទ" : "Categories"}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {categories.filter(c => selectedCats.includes(c.id)).map(c => (
                            <span key={c.id} className="px-2.5 py-1 text-xs font-black border-2 border-black bg-yellow-400 text-black shadow-[1px_1px_0_#000]" style={{ borderRadius: "0px" }}>
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
            <UpgradeModal
              open={upgradeModalOpen}
              onClose={() => setUpgradeModalOpen(false)}
              trigger={upgradeTrigger}
              lang={lang}
            />
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
      <div className="min-h-screen dot-bg text-black pb-12">
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 border-2 border-black bg-green-400 text-black shadow-[2px_2px_0_#000] font-black text-xs" style={{ borderRadius: "0px" }}>
                  <div className="w-1.5 h-1.5 bg-black animate-pulse" style={{ borderRadius: "0px" }} />
                  {kh ? "ហ្គេមរង់ចាំ" : "Waiting Room"}
                </div>
              </div>
              <h1 className="text-4xl font-black text-black" style={khFont}>{kh ? "រៀបចំខ្លួនលេង" : "Ready to Play"}</h1>
              <p className="mt-1 text-sm text-zinc-600 font-bold" style={{ ...khFont }}>
                {kh ? "ចែករំលែកលេខកូដជាមួយអ្នករៀន" : "Share the room code with your students"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { if (confirm(kh ? "បោះបង់ហ្គេមនេះ?" : "Cancel this game session?")) { control("terminate"); setTimeout(() => setPhase({ name: "setup" }), 500); } }}
                disabled={controlling}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-red-400 text-black font-black text-sm shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-50"
                style={{ borderRadius: "0px" }}
              >
                <Square size={14} />{kh ? "បោះបង់" : "Cancel"}
              </button>
              <button
                onClick={async () => {
                  if (!document.fullscreenElement) {
                    try {
                      await document.documentElement.requestFullscreen();
                    } catch (err) {
                      console.error("Failed to enter fullscreen:", err);
                    }
                  }
                  control("start");
                }}
                disabled={controlling || phase.participants.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 border-2 border-black bg-green-400 text-black font-black text-sm shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-50"
                style={{ borderRadius: "0px" }}
              >
                {controlling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                {kh ? "ចាប់ផ្តើម" : "Start Game"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 border-2 border-black bg-red-400 text-black font-black text-sm shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px", ...khFont }}>
              ⚠ {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* ── Room Code (big) ── */}
            <div className="lg:col-span-2">
              <div className="bg-yellow-400 border-4 border-black p-8 text-center relative shadow-[6px_6px_0_#000]" style={{ borderRadius: "0px" }}>
                <div className="relative z-10">
                  <div className="text-xs font-black uppercase tracking-widest mb-3 text-black">
                    {kh ? "លេខកូដបន្ទប់" : "Room Code"}
                  </div>
                  <div className="text-7xl font-black tracking-[0.15em] mb-2 text-black">
                    {phase.code}
                  </div>
                  <div className="text-sm mb-6 text-black/85 font-bold">
                    {kh ? "ចូលតាម:" : "Join at:"} <span className="text-black font-black underline">kesararamwithdigital.tech/play/{phase.code}</span>
                  </div>
                  <button
                    onClick={copyCode}
                    className={`flex items-center gap-2 px-5 py-2.5 border-2 border-black font-black text-sm mx-auto transition-all duration-100 shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 ${copied ? "bg-green-400 text-black" : "bg-white text-black"}`}
                    style={{ borderRadius: "0px" }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? (kh ? "បានចម្លង!" : "Copied!") : (kh ? "ចម្លងលេខកូដ" : "Copy Code")}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Game Details ── */}
            <GlassCard className="p-5">
              <div className="text-xs font-bold uppercase tracking-widest mb-4 text-zinc-600" style={{ ...khFont }}>
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
                  <div key={item.label} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-wide" style={{ ...khFont }}>{item.label}</span>
                    <span className="text-sm font-black capitalize" style={{ color: item.color || "#000" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ── Players section ── */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-black" />
                <span className="font-black text-sm uppercase tracking-widest text-black" style={khFont}>
                  {phase.participants.length} / {phase.maxPlayers} {kh ? "នាក់" : "Players"}
                </span>
              </div>
              <div className="text-xs font-bold text-zinc-600">
                {Math.round(fillPct)}% {kh ? "ពេញ" : "full"}
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-4 border-2 border-black bg-white shadow-[1px_1px_0_#000] mb-5 overflow-hidden" style={{ borderRadius: "0px" }}>
              <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${fillPct}%` }} />
            </div>

            {phase.participants.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-2 border-black bg-zinc-100 flex items-center justify-center mx-auto mb-4" style={{ borderRadius: "0px" }}>
                  <Users size={28} className="text-black" />
                </div>
                <p className="font-bold text-sm text-zinc-500" style={{ ...khFont }}>
                  {kh ? "រង់ចាំអ្នកចូលរួម..." : "Waiting for players to join..."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {phase.participants.map((p, i) => (
                  <div
                    key={p.userId}
                    className="flex items-center gap-2 p-2.5 border-2 border-black bg-zinc-50 shadow-[2px_2px_0_#000]"
                    style={{
                      borderRadius: "0px",
                      animation: "fadeIn 0.3s ease-out",
                    }}
                  >
                    <div
                      className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-sm flex-shrink-0 text-white"
                      style={{ background: `hsl(${(p.userId * 47) % 360}, 70%, 45%)`, borderRadius: "0px" }}
                    >
                      {p.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-black truncate text-black" style={{ ...khFont }}>
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
        className="fixed inset-0 z-50 flex flex-col overflow-hidden text-black bg-white"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b-4 border-black bg-yellow-400 text-black">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 border-2 border-black bg-red-500 text-black shadow-[2px_2px_0_#000] font-black text-xs tracking-widest" style={{ borderRadius: "0px" }}>
              <div className="w-2 h-2 bg-black animate-pulse" style={{ borderRadius: "0px" }} />
              <span>LIVE</span>
            </div>
            <span className="text-black font-black text-sm" style={khFont}>
              {kh ? `សំណួរ ${phase.qIndex + 1} / ${phase.total}` : `Q ${phase.qIndex + 1} / ${phase.total}`}
            </span>
          </div>

          {/* Progress */}
          <div className="flex-1 mx-8 h-4 border-2 border-black bg-white overflow-hidden" style={{ borderRadius: "0px" }}>
            <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {error && <span className="text-red-600 text-xs font-black max-w-xs truncate">{error}</span>}
            
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-2 border-2 border-black bg-white text-black font-black text-sm shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
              style={{ borderRadius: "0px" }}
            >
              {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
              {isFullscreen ? (kh ? "បង្រួម" : "Minimize") : (kh ? "ពង្រីក" : "Fullscreen")}
            </button>

            {/* Exit/End Game Button */}
            <button
              onClick={() => {
                if (confirm(kh ? "បញ្ចប់ហ្គេម និងចាកចេញ?" : "End session and exit?")) {
                  control("end");
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                  }
                }
              }}
              disabled={controlling}
              className="flex items-center gap-1.5 px-3 py-2 border-2 border-black bg-red-400 text-black font-black text-sm shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-40"
              style={{ borderRadius: "0px" }}
            >
              <Square size={13} />{kh ? "ចាកចេញ" : "Exit"}
            </button>

            <button
              onClick={() => control("advance")}
              disabled={controlling}
              className="flex items-center gap-2 px-5 py-2 border-2 border-black bg-green-400 text-black font-black text-sm shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-40"
              style={{ borderRadius: "0px" }}
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
                <div className={`px-3 py-1 border-2 border-black text-xs font-black uppercase tracking-widest shadow-[2px_2px_0_#000] ${isActive ? "bg-blue-400 text-black" : "bg-green-400 text-black"}`} style={{ borderRadius: "0px" }}>
                  {isActive ? (kh ? "សំណួរ" : "Question") : (kh ? "ចប់វគ្គ" : "Round Over")}
                </div>
                <span className="text-zinc-500 text-xs font-bold">{phase.qIndex + 1} / {phase.total}</span>
              </div>

              {/* Question text */}
              <div className="text-center mb-8">
                {question?.imageUrl && (
                  <img src={question.imageUrl} alt="question" className="w-32 h-32 object-cover border-2 border-black shadow-[3px_3px_0_#000] mx-auto mb-6" style={{ borderRadius: "0px" }} />
                )}
                <div className="font-black text-3xl xl:text-4xl text-black leading-snug" style={khFont}>
                  {kh && question?.questionKm ? question.questionKm : question?.questionEn}
                </div>
                {kh && question?.questionKm && question?.questionEn && (
                  <div className="text-zinc-500 text-base font-bold mt-2">{question.questionEn}</div>
                )}
              </div>

              {/* Answers */}
              {answers.length > 0 && (
                <div className={`grid gap-3.5 ${answers.length <= 2 ? "grid-cols-1 max-w-xl mx-auto" : "grid-cols-2"}`}>
                  {answers.map((ans, i) => {
                    const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
                    const isCorrect = correctAnswerId !== null && ans.id === correctAnswerId;
                    const isWrong = correctAnswerId !== null && ans.id !== correctAnswerId;
                    const text = kh ? (ans.answerKm || ans.answerEn) : ans.answerEn;

                    return (
                      <div
                        key={ans.id}
                        className="flex items-center gap-4 px-5 py-4 border-2 border-black transition-all duration-300"
                        style={{
                          borderRadius: "0px",
                          backgroundColor: isCorrect ? "#22c55e" : isWrong ? "#f4f4f5" : style.bg,
                          color: "#000000",
                          opacity: isWrong ? 0.3 : 1,
                          boxShadow: isWrong ? "none" : "4px 4px 0px #000000",
                        }}
                      >
                        <div className="w-9 h-9 border-2 border-black flex items-center justify-center bg-white font-black text-black text-base flex-shrink-0" style={{ borderRadius: "0px" }}>
                          {style.label}
                        </div>
                        <span className="font-black text-black text-base leading-tight flex-1" style={khFont}>{text}</span>
                        {isCorrect && <span className="text-2xl flex-shrink-0">✅</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isActive && (
                <div className="mt-6 text-center text-sm font-black text-zinc-500" style={{ ...khFont }}>
                  {kh ? "ចុច «សំណួរបន្ទាប់» ដើម្បីបន្ត" : "Click «Next Q» to continue"}
                </div>
              )}
            </div>
          </div>

          {/* Right: Leaderboard */}
          <div className="w-72 xl:w-80 flex flex-col flex-shrink-0 border-l-4 border-black bg-white">
            <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0 border-b-2 border-black bg-blue-400 text-black">
              <BarChart2 size={13} className="text-black" />
              <span className="text-black font-black text-xs uppercase tracking-widest" style={khFont}>
                {kh ? "ចំណាត់ថ្នាក់" : "Live Scores"}
              </span>
              <span className="ml-auto font-black text-xs text-black/80 bg-white border border-black px-1.5 py-0.5 shadow-[1px_1px_0_#000]" style={{ borderRadius: "0px" }}>
                {displayLeaderboard.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y-2 divide-black bg-white">
              {displayLeaderboard.length === 0 ? (
                <div className="text-center py-10 text-sm font-bold text-zinc-500" style={{ ...khFont }}>
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
    const RANK_COLORS = ["#FFD700", "#e4e4e7", "#fed7aa"];
    const leaderboardCount = phase.leaderboard.length;
    let podiumItems: { entry: LeaderboardEntry; rank: number; colStyle: string; emoji: string }[] = [];

    if (leaderboardCount === 1) {
      podiumItems = [
        {
          entry: phase.leaderboard[0],
          rank: 1,
          colStyle: "w-full h-32 border-2 border-black bg-yellow-400 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
          emoji: "🥇",
        }
      ];
    } else if (leaderboardCount === 2) {
      podiumItems = [
        {
          entry: phase.leaderboard[1],
          rank: 2,
          colStyle: "w-full h-24 border-2 border-black bg-zinc-200 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
          emoji: "🥈",
        },
        {
          entry: phase.leaderboard[0],
          rank: 1,
          colStyle: "w-full h-32 border-2 border-black bg-yellow-400 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
          emoji: "🥇",
        }
      ];
    } else if (leaderboardCount >= 3) {
      podiumItems = [
        {
          entry: phase.leaderboard[1],
          rank: 2,
          colStyle: "w-full h-24 border-2 border-black bg-zinc-200 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
          emoji: "🥈",
        },
        {
          entry: phase.leaderboard[0],
          rank: 1,
          colStyle: "w-full h-32 border-2 border-black bg-yellow-400 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
          emoji: "🥇",
        },
        {
          entry: phase.leaderboard[2],
          rank: 3,
          colStyle: "w-full h-20 border-2 border-black bg-orange-300 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
          emoji: "🥉",
        }
      ];
    }

    return (
      <div className="min-h-screen dot-bg text-black pb-12 relative overflow-hidden">
        <Confetti />
        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
          {/* Game over badge */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-yellow-400 text-black text-xs font-black uppercase tracking-widest mb-4 shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px" }}>
              <Trophy size={14} />
              {kh ? "ចប់ហ្គេម" : "Game Over"}
            </div>
            <h1 className="text-4xl font-black mb-2 text-black" style={khFont}>{kh ? "លទ្ធផលចុងក្រោយ" : "Final Results"}</h1>
            <p className="text-sm text-zinc-600 font-bold" style={{ ...khFont }}>
              {phase.leaderboard.length} {kh ? "អ្នកលេងបានចូលរួម" : "players participated"}
            </p>
          </div>

          {/* Dynamic podium */}
          {podiumItems.length > 0 && (
            <div className="flex items-end justify-center gap-3 md:gap-5 mb-10 max-w-lg mx-auto">
              {podiumItems.map((item) => {
                const entry = item.entry;
                return (
                  <div key={entry.userId} className="flex flex-col items-center gap-2 flex-1 max-w-[130px] animate-bounce-short">
                    {item.rank === 1 && (
                      <div className="animate-pulse mb-1">
                        <Crown className="text-yellow-500 fill-yellow-400" size={24} />
                      </div>
                    )}
                    <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black text-sm text-white" style={{ background: `hsl(${(entry.userId * 47) % 360}, 70%, 45%)`, borderRadius: "0px" }}>
                      {(entry.displayName || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-xs font-black text-center truncate w-full text-black" style={{ ...khFont }}>{entry.displayName}</div>
                    <div className={item.colStyle} style={{ borderRadius: "0px" }}>
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="font-black text-sm text-black">{entry.totalScore.toLocaleString()}</div>
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
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-black bg-white text-black font-black text-sm shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
              style={{ borderRadius: "0px" }}
            >
              <BarChart2 size={15} />{kh ? "មើលលទ្ធផល" : "View Results"}
            </button>
            <button
              onClick={() => setPhase({ name: "setup" })}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-black bg-yellow-400 text-black font-black text-sm shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
              style={{ borderRadius: "0px" }}
            >
              <ChevronRight size={15} />{kh ? "ហ្គេមថ្មី" : "New Game"}
            </button>
            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-black bg-red-400 text-black font-black text-sm shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
              style={{ borderRadius: "0px" }}
            >
              {kh ? "ចាកចេញ" : "Exit"}
            </button>
          </div>

          {/* Full leaderboard */}
          {phase.leaderboard.length > 0 && (
            <GlassCard>
              <div className="px-5 py-4 border-b-2 border-black bg-blue-400 text-black" style={{ borderRadius: "0px" }}>
                <div className="text-xs font-black uppercase tracking-widest text-black" style={khFont}>
                  {kh ? "ចំណាត់ថ្នាក់ចុងក្រោយ" : "Final Leaderboard"}
                </div>
              </div>
              <div className="divide-y-2 divide-black bg-white" style={{ borderRadius: "0px" }}>
                {phase.leaderboard.slice(0, 10).map((entry, i) => {
                  const isTop3 = i < 3;
                  return (
                    <div key={entry.userId} className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100 last:border-0">
                      <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-sm flex-shrink-0" style={{ background: isTop3 ? RANK_COLORS[i] : "#f4f4f5", color: "#000", borderRadius: "0px" }}>
                        {isTop3 ? <Crown size={14} /> : entry.rank}
                      </div>
                      <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-xs text-white flex-shrink-0" style={{ background: `hsl(${(entry.userId * 47) % 360}, 70%, 45%)`, borderRadius: "0px" }}>
                        {(entry.displayName || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-black text-sm truncate" style={khFont}>{entry.displayName}</div>
                        <div className="text-xs text-zinc-500 font-bold">{entry.correctAnswers} {kh ? "ត្រូវ" : "correct"}</div>
                      </div>
                      <div className="font-black text-lg text-black tabular-nums">
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
