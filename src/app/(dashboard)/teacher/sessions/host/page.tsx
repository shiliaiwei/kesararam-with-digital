"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { useGameRealtime } from "@/hooks/use-game-realtime";
import { GAME_MODE_CONFIG } from "@/lib/game-engine";
import { getTeacherClasses } from "@/app/actions/classes";
import type { SSEEvent, ParticipantInfo, LeaderboardEntry, QuestionPayload } from "@/lib/game-event-bus";
import {
  Play, Square, Users, BarChart2,
  Copy, Check, ChevronRight, ChevronLeft, Loader2,
  SkipForward, Crown, TrendingUp, TrendingDown, Minus,
  Zap, Trophy, Target, Swords, BookOpen, GraduationCap,
  Settings2, Globe, Layers, ChevronUp, ChevronDown,
  Sparkles, Rocket, Maximize, Minimize,
  Hand, FastForward, Medal, TriangleAlert,
  Volume2, VolumeX, Languages, Timer,
} from "lucide-react";
import { UpgradeButton } from "@/components/pricing/upgrade-button";
import { Lock } from "lucide-react";
import QRCode from "react-qr-code";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import { 
  sounds, 
  setSoundsMuted, 
  getSoundsMuted, 
  startBGM, 
  stopBGM, 
  setBGMVolume, 
  getBGMVolume, 
  setSFXVolume, 
  getSFXVolume, 
  setBGMMuted, 
  getBGMMuted, 
  setSFXMuted, 
  getSFXMuted,
  getCurrentBGMTheme
} from "@/lib/game-sounds";
import { getAvatarFaceStyle } from "@/lib/utils";

// ── Answer color config ────────────────────────────────────────────────────
const ANSWER_STYLES = [
  { bg: "#ef4444", border: "#000000", label: "A", shadow: "#991b1b" },
  { bg: "#3b82f6", border: "#000000", label: "B", shadow: "#1d4ed8" },
  { bg: "#22c55e", border: "#000000", label: "C", shadow: "#15803d" },
  { bg: "#f97316", border: "#000000", label: "D", shadow: "#c2410c" },
];

// ── Mode icons map ─────────────────────────────────────────────────────────
const MODE_ICONS: Record<string, React.ReactNode> = {
  "quick-quiz": <Zap size={18} />,
  "speed-round": <Rocket size={18} />,
  "sign-challenge": <Target size={18} />,
  "mixed-practice": <Swords size={18} />,
};

type HostPhase =
  | { name: "setup" }
  | { name: "creating" }
  | { name: "lobby"; code: string; sessionId: number; participants: ParticipantInfo[]; gameMode: string; categories: string[]; difficulty: string; questionCount: number; timePerQuestion: number; scoringMode: string; maxPlayers: number }
  | { name: "active"; code: string; sessionId: number; qIndex: number; total: number; leaderboard: LeaderboardEntry[]; question: QuestionPayload; endsAt?: string }
  | { name: "round_end"; code: string; sessionId: number; leaderboard: LeaderboardEntry[]; qIndex: number; total: number; question: QuestionPayload; correctAnswerId: number | null }
  | { name: "ended"; code: string; sessionId: number; leaderboard: LeaderboardEntry[] };

interface NeubrutalistAvatarProps {
  src: string | null | undefined;
  initials: string;
  userId: number;
}

function NeubrutalistAvatar({ src, initials, userId }: NeubrutalistAvatarProps) {
  const [failed, setFailed] = useState(false);

  // Avatars are stored as JSON { face, head } composite layers.
  const parsed = (() => {
    if (!src) return null;
    try {
      const o = JSON.parse(src) as { face?: string; head?: string };
      if (o && (o.face || o.head)) return o;
    } catch { /* not JSON — treat as URL */ }
    return null;
  })();

  if (parsed) {
    return (
      <div className="relative w-full h-full rounded-full overflow-hidden" style={{ background: "#ffffff" }}>
        <div style={{ position: "absolute", inset: "6%", width: "88%", height: "88%" }}>
          {parsed.head && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/avatar/head/${encodeURIComponent(parsed.head)}`} alt="" aria-hidden
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
          )}
          {parsed.face && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/avatar/face/${encodeURIComponent(parsed.face)}`} alt="" aria-hidden
              style={getAvatarFaceStyle(parsed.head)} />
          )}
        </div>
      </div>
    );
  }

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-black font-black rounded-full"
        style={{ background: "#ffffff" }}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={initials}
      className="w-full h-full object-cover rounded-full"
      style={{ background: "#ffffff" }}
      onError={() => setFailed(true)}
    />
  );
}

function sanitizeError(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (obj.message && typeof obj.message === "string") return obj.message;
    if (obj.error && typeof obj.error === "string") return obj.error;
    try {
      return JSON.stringify(err);
    } catch {
      return "An unexpected error occurred";
    }
  }
  return String(err);
}

// ── Leaderboard row ────────────────────────────────────────────────────────
function LiveLeaderRow({ entry, rank, showScore }: { entry: LeaderboardEntry; rank: number; showScore: boolean }) {
  const RANK_COLORS = ["#FFD700", "#e4e4e7", "#fed7aa"];
  const isTop3 = rank <= 3;
  const rankColor = RANK_COLORS[rank - 1] ?? "#f4f4f5";
  const initials = (entry.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 border-b border-zinc-200 ${isTop3 ? "bg-yellow-50" : "bg-white"
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
        className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-xs flex-shrink-0 text-white overflow-hidden bg-white"
        style={{ borderRadius: "50%" }}
      >
        <NeubrutalistAvatar src={entry.avatar} initials={initials} userId={entry.userId} />
      </div>
      <div className="flex-1 min-w-0 text-black">
        <div className="font-bold text-xs truncate">{entry.displayName}</div>
        {entry.currentStreak > 1 && (
          <div className="text-orange-600 text-xs font-bold flex items-center gap-0.5">
            <span className="material-symbols-rounded text-orange-500 text-sm align-middle">local_fire_department</span>
            ×{entry.currentStreak}
          </div>
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
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};

  const [phase, setPhase] = useState<HostPhase>({ name: "setup" });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lobbyCode = phase.name === "lobby" ? phase.code : "";
  const [joinUrl, setJoinUrl] = useState<string>("");

  useEffect(() => {
    if (lobbyCode) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kesararamwithdigital.tech";
      setJoinUrl(`${baseUrl}/play/${lobbyCode}`);
    } else {
      setJoinUrl("");
    }
  }, [lobbyCode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Screen Wake Lock API to keep the screen awake during active game hosting/streaming
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    if (typeof window === "undefined" || !("wakeLock" in navigator)) {
      return;
    }
    try {
      if (!wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        console.log("Wake Lock is active");
      }
    } catch (err) {
      console.error("Failed to request wake lock:", err);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log("Wake Lock released");
      } catch (err) {
        console.error("Failed to release wake lock:", err);
      }
    }
  }, []);

  useEffect(() => {
    const shouldKeepAwake =
      phase.name === "lobby" ||
      phase.name === "active" ||
      phase.name === "round_end";

    if (shouldKeepAwake) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [phase.name, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const shouldKeepAwake =
        phase.name === "lobby" ||
        phase.name === "active" ||
        phase.name === "round_end";

      if (document.visibilityState === "visible" && shouldKeepAwake) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [phase.name, requestWakeLock]);




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
  // Scoring is a fixed rule now (+1 correct, +1 streak, max 2; no speed bonus).
  // Kept as a constant so the create-session payload/DB column shape is unchanged.
  const [scoringMode] = useState("speed");
  const [language, setLanguage] = useState("both");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [controlling, setControlling] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(50);
  const [teacherClasses, setTeacherClasses] = useState<{ id: number; name: string; status: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [lobbyParticipants, setLobbyParticipants] = useState<ParticipantInfo[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  // Seconds per question — chosen at setup, applied to every question. Can also be
  // changed live during the game (applies to the next question). Default comes from
  // the selected game mode.
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  // Host-screen display language for question/answer text (projector only — does
  // not change what students see). Defaults to the session's creation language.
  const [displayLang, setDisplayLang] = useState<"both" | "kh" | "en">("both");
  const qaFont = displayLang !== "en" ? { fontFamily: "var(--font-learning)" } : {};
  // Game audio settings
  const [muted, setMuted] = useState(false);
  const [sfxMuted, setSfxMutedState] = useState(false);
  const [bgmMuted, setBgmMutedState] = useState(false);
  const [sfxVolume, setSfxVolumeState] = useState(0.5);
  const [bgmVolume, setBgmVolumeState] = useState(0.15);
  const [showSoundOptions, setShowSoundOptions] = useState(false);
  const soundPopoverRef = useRef<HTMLDivElement>(null);
  const lastTickSecondRef = useRef<number>(-1);
  // Advance mode: "manual" = teacher clicks Next Q; "auto" = after the answer is
  // revealed, auto-jump to the next question after AUTO_ADVANCE_MS. Teacher choice,
  // persisted so it sticks across sessions.
  const [advanceMode, setAdvanceMode] = useState<"manual" | "auto">("manual");
  const [autoAdvanceIn, setAutoAdvanceIn] = useState<number | null>(null);

  const [subPlan, setSubPlan] = useState<string>("free");
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [questionCountWarning, setQuestionCountWarning] = useState<string | null>(null);
  const [actualQuestionCount, setActualQuestionCount] = useState<number | null>(null);

  // Fetch subscription plan info client-side
  useEffect(() => {
    fetch("/api/subscriptions/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.subscription) {
          setSubPlan(d.subscription.plan);
          setIsTrial(d.subscription.isTrial);
          setTrialEndsAt(d.subscription.trialEndsAt);
          setEndsAt(d.subscription.endsAt);
        }
      })
      .catch(() => { });
  }, []);

  const subDaysLeft = (() => {
    const dateStr = isTrial ? trialEndsAt : endsAt;
    if (!dateStr) return null;
    return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
  })();

  const showUpgradeBanner = subPlan === "free" || (subDaysLeft !== null && subDaysLeft <= 7);

  // Fetch categories + check for existing active session on mount
  useEffect(() => {
    fetch("/api/game/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        // Only set a default if the user hasn't already selected something
        if (d.categories?.length && selectedCats.length === 0) {
          setSelectedCats([d.categories[0].id]);
        }
      });
    // Load the teacher's classes so the game can optionally be restricted to one.
    getTeacherClasses()
      .then((rows) => {
        setTeacherClasses(
          (rows ?? []).map((c: any) => ({
            id: c.id,
            name: c.name,
            status: c.status ?? "active",
          }))
        );
      })
      .catch(() => { /* non-fatal */ });
    fetch("/api/game/sessions")
      .then((r) => r.json())
      .then(async (d) => {
        type SessionSummary = { status?: string; sessionCode?: string; id?: number };
        const active = (d.sessions ?? []).find(
              (s: SessionSummary) => s.status === "lobby" || s.status === "active" || s.status === "paused"
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
                    leaderboard: state.participants?.map((p: ParticipantInfo, i: number) => ({
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

  const activeCode = "code" in phase ? (phase as Extract<HostPhase, { code: string }>).code : "";

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.type === "lobby_update") {
      setLobbyParticipants(event.participants);
      if (event.forceLobby && activeCode) {
        fetch(`/api/game/sessions/${activeCode}/info`)
          .then((r) => r.json())
          .then((info) => {
            setPhase((p) => ({
              name: "lobby",
              code: activeCode,
              sessionId: "sessionId" in p ? (p as any).sessionId : 0,
              participants: event.participants,
              gameMode: info.gameMode ?? "quick-quiz",
              categories: [info.category?.replace(/-/g, " ") ?? "—"],
              difficulty: info.difficulty ?? "mixed",
              questionCount: info.questionCount ?? 0,
              timePerQuestion: info.timePerQuestion ?? 30,
              scoringMode: info.scoringMode ?? "speed",
              maxPlayers: info.maxPlayers ?? 50,
            }));
          })
          .catch(() => { });
      } else {
        setPhase((p) => p.name === "lobby" ? { ...p, participants: event.participants } : p);
      }
    }
    if (event.type === "question_start") {
      try { sounds.question_start(); } catch { }
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
            endsAt: event.endsAt,
          };
        }
        return p;
      });
    }
    if (event.type === "question_end") {
      try {
        sounds.question_end();
        sounds.correct();
        sounds.cheer();
        sounds.clapping();
      } catch { }
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
      try { sounds.podium(); } catch { }
      setPhase((p) => ({
        name: "ended",
        code: "code" in p ? (p as any).code : "",
        sessionId: "sessionId" in p ? (p as any).sessionId : 0,
        leaderboard: event.finalLeaderboard,
      }));
    }
  }, [activeCode]);

  useGameRealtime(activeCode, handleSSEEvent, !!activeCode);

  async function createSession() {
    if (!sessionName.trim()) { setError(kh ? "ដាក់ឈ្មោះ" : "Enter session name"); return; }
    // Click the Sign sources signs directly — no category needed.
    if (selectedMode !== "tick-sign" && !selectedCats.length) { setError(kh ? "ជ្រើសរើសប្រភេទ" : "Select at least one category"); return; }
    setError("");
    setQuestionCountWarning(null);
    setActualQuestionCount(null);
    setPhase({ name: "creating" });
    const res = await fetch("/api/game/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionName, categoryIds: selectedCats, difficulty, questionCount, timePerQuestion, scoringMode, language, gameType: selectedMode, maxPlayers, classId: selectedClassId, allowLateJoin: true }),
    });
    if (!res.ok) { const err = await res.json(); setError(sanitizeError(err.error) || "Failed"); setPhase({ name: "setup" }); return; }
    const data = await res.json();
    const catNames = categories.filter(c => selectedCats.includes(c.id)).map(c => kh ? c.titleKm : c.titleEn);
    if (data.warning) setQuestionCountWarning(data.warning);
    if (data.questionCount) setActualQuestionCount(data.questionCount);
    setPhase({
      name: "lobby", code: data.sessionCode, sessionId: data.sessionId, participants: [],
      gameMode: selectedMode, categories: catNames, difficulty,
      questionCount: data.questionCount ?? questionCount,
      timePerQuestion, scoringMode, maxPlayers,
    });
  }

  async function control(action: string, currentPhase?: string) {
    if (controlling || !("code" in phase)) return;
    setControlling(true); setError("");
    try {
      const res = await fetch(`/api/game/sessions/${(phase as any).code}/control`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, currentPhase }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({ error: "Unknown" })); setError(sanitizeError(e.details || e.error) || `Failed to ${action}`); }
    } catch (err) { setError(`Network error: ${err instanceof Error ? err.message : "Unknown"}`); }
    finally { setControlling(false); }
  }

  // ── Question countdown timer (host-driven auto-reveal) ──────────────────────
  // Drives the water-fill bar and, when it reaches 0, plays an alert and
  // auto-reveals the correct answer to every screen by hitting the reveal
  // endpoint directly (independent of the `controlling` guard so it can't be
  // blocked by an in-flight control call).
  const [qFillPct, setQFillPct] = useState(0); // 0 → 100 as time elapses
  const timeUpFiredRef = useRef(false);
  const activeEndsAt = phase.name === "active" ? phase.endsAt : undefined;
  const activeCodeRef = useRef(activeCode);
  activeCodeRef.current = activeCode;

  useEffect(() => {
    // reset whenever a new question starts
    timeUpFiredRef.current = false;
    lastTickSecondRef.current = -1;
    setQFillPct(0);
    if (phase.name !== "active" || !activeEndsAt) {
      return;
    }
    const endMs = new Date(activeEndsAt).getTime();
    // Use the moment we received the question as the window start. This avoids
    // depending on timePerQuestion and keeps the bar aligned to the real deadline.
    const startMs = Date.now();
    const totalMs = Math.max(1000, endMs - startMs);

    async function autoReveal() {
      const c = activeCodeRef.current;
      if (!c) return;
      try {
        await fetch(`/api/game/sessions/${c}/control`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reveal" }),
        });
      } catch { /* network — will retry on next tick if still active */ }
    }

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startMs;
      const pct = Math.min(100, Math.max(0, (elapsed / totalMs) * 100));
      setQFillPct(pct);

      const left = Math.max(0, Math.ceil((endMs - now) / 1000));
      if (left > 0 && left !== lastTickSecondRef.current) {
        lastTickSecondRef.current = left;
        if (left <= 5) {
          sounds.urgent_tick();
        } else {
          sounds.countdown_tick();
        }
      }

      if (now >= endMs && !timeUpFiredRef.current) {
        timeUpFiredRef.current = true;
        autoReveal();
      }
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.name, activeEndsAt]);

  // ── Advance mode: load persisted teacher choice ─────────────────────────────
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("kwd_host_advance_mode") : null;
    if (saved === "auto" || saved === "manual") setAdvanceMode(saved);
  }, []);
  function pickAdvanceMode(mode: "manual" | "auto") {
    setAdvanceMode(mode);
    try { localStorage.setItem("kwd_host_advance_mode", mode); } catch { /* ignore */ }
  }

  // ── Mute & Sound Engine Sync ─────────────────────────────────────────────────
  useEffect(() => {
    setSfxMutedState(getSFXMuted());
    setBgmMutedState(getBGMMuted());
    setSfxVolumeState(getSFXVolume());
    setBgmVolumeState(getBGMVolume());
    setMuted(getSoundsMuted());
  }, []);

  const updateSfxMuted = (val: boolean) => {
    setSFXMuted(val);
    setSfxMutedState(val);
  };
  const updateBgmMuted = (val: boolean) => {
    setBGMMuted(val);
    setBgmMutedState(val);
  };
  const updateSfxVolume = (val: number) => {
    setSFXVolume(val);
    setSfxVolumeState(val);
  };
  const updateBgmVolume = (val: number) => {
    setBGMVolume(val);
    setBgmVolumeState(val);
  };
  const updateGlobalMute = (val: boolean) => {
    setSoundsMuted(val);
    setMuted(val);
  };

  // Close sound options popover on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (soundPopoverRef.current && !soundPopoverRef.current.contains(e.target as Node)) {
        setShowSoundOptions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // BGM playback based on game phase transitions
  useEffect(() => {
    if (phase.name === "lobby") {
      startBGM("lobby");
    } else if (phase.name === "active") {
      startBGM("quiz");
    } else if (phase.name === "ended") {
      startBGM("victory");
    } else {
      stopBGM();
    }
    return () => {
      stopBGM();
    };
  }, [phase.name]);

  // Render Sound Settings Popover (reused across lobby and active screen layouts)
  const renderSoundOptions = () => {
    if (!showSoundOptions) return null;
    return (
      <div 
        ref={soundPopoverRef}
        className="fixed md:absolute inset-x-4 md:inset-x-auto md:right-16 top-1/2 md:top-14 mt-2 -translate-y-1/2 md:translate-y-0 w-auto md:w-72 bg-white border-4 border-black p-4 shadow-[6px_6px_0_#000] z-50 text-black text-left rounded-none"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black text-xs uppercase tracking-wider" style={khFont}>
              {kh ? "ជម្រើសសំឡេង" : "SOUND OPTIONS"}
            </span>
            <button 
              onClick={() => setShowSoundOptions(false)}
              className="text-xs font-black border border-black px-1.5 py-0.5 bg-zinc-100 active:bg-zinc-200"
              style={{ borderRadius: "0px" }}
            >
              ✕
            </button>
          </div>

          {/* Master Mute Toggle */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <span className="font-bold text-xs uppercase" style={khFont}>
              {kh ? "បិទសំឡេងទាំងអស់" : "MUTE ALL"}
            </span>
            <button
              onClick={() => updateGlobalMute(!muted)}
              className={`px-3 py-1 text-[11px] font-black border-2 border-black uppercase tracking-wider transition-colors ${muted ? "bg-red-400 text-black" : "bg-zinc-100 text-black hover:bg-zinc-200"}`}
              style={{ borderRadius: "0px" }}
            >
              {muted ? (kh ? "បិទ" : "ON") : (kh ? "បើក" : "OFF")}
            </button>
          </div>

          {/* SFX Controls */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase" style={khFont}>
                {kh ? "សំឡេងផលប៉ះពាល់ (SFX)" : "SOUND EFFECTS"}
              </span>
              <button
                onClick={() => updateSfxMuted(!sfxMuted)}
                disabled={muted}
                className={`px-2.5 py-0.5 text-[10px] font-black border border-black uppercase transition-colors disabled:opacity-50 ${sfxMuted ? "bg-red-300 text-black" : "bg-emerald-300 text-black"}`}
                style={{ borderRadius: "0px" }}
              >
                {sfxMuted ? (kh ? "បិទ" : "MUTED") : (kh ? "បើក" : "ACTIVE")}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-bold">0%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                disabled={muted || sfxMuted}
                onChange={(e) => updateSfxVolume(parseFloat(e.target.value))}
                className="flex-1 accent-black h-1 bg-zinc-200 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 font-mono font-bold w-8 text-right">
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>
          </div>

          {/* BGM Controls */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase" style={khFont}>
                {kh ? "តន្ត្រីផ្ទៃក្រោយ (BGM)" : "BACKGROUND MUSIC"}
              </span>
              <button
                onClick={() => updateBgmMuted(!bgmMuted)}
                disabled={muted}
                className={`px-2.5 py-0.5 text-[10px] font-black border border-black uppercase transition-colors disabled:opacity-50 ${bgmMuted ? "bg-red-300 text-black" : "bg-emerald-300 text-black"}`}
                style={{ borderRadius: "0px" }}
              >
                {bgmMuted ? (kh ? "បិទ" : "MUTED") : (kh ? "បើក" : "ACTIVE")}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-bold">0%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVolume}
                disabled={muted || bgmMuted}
                onChange={(e) => updateBgmVolume(parseFloat(e.target.value))}
                className="flex-1 accent-black h-1 bg-zinc-200 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 font-mono font-bold w-8 text-right">
                {Math.round(bgmVolume * 100)}%
              </span>
            </div>
          </div>

          {/* BGM Theme Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-xs uppercase" style={khFont}>
              {kh ? "ជ្រើសរើសតន្ត្រី" : "SELECT THEME"}
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(["lobby", "quiz", "victory"] as const).map((theme) => {
                const isCurrent = getCurrentBGMTheme() === theme;
                return (
                  <button
                    key={theme}
                    onClick={() => startBGM(theme)}
                    disabled={muted || bgmMuted}
                    className={`py-1 text-[10px] font-black border border-black uppercase transition-colors disabled:opacity-50 ${isCurrent ? "bg-black text-yellow-400" : "bg-zinc-100 text-black hover:bg-zinc-200"}`}
                    style={{ borderRadius: "0px" }}
                  >
                    {theme === "lobby" ? (kh ? "រង់ចាំ" : "Lobby") : theme === "quiz" ? (kh ? "សំណួរ" : "Quiz") : (kh ? "ជ័យជម្នះ" : "Podium")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Sound Button */}
          <button
            onClick={() => {
              sounds.correct();
            }}
            disabled={muted || sfxMuted}
            className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all disabled:opacity-50 uppercase tracking-wider"
            style={{ borderRadius: "0px", ...khFont }}
          >
            {kh ? "សាកល្បងសំឡេង" : "Test Sound Effect"}
          </button>
        </div>
      </div>
    );
  };

  // Default the per-question time to the selected mode's default when the mode
  // changes (teacher can still override in setup or live).
  useEffect(() => {
    setTimePerQuestion(GAME_MODE_CONFIG[selectedMode]?.timePerQuestion ?? 30);
  }, [selectedMode]);

  // Host-screen language follows the creation language until the teacher toggles it.
  useEffect(() => {
    setDisplayLang(language === "km" ? "kh" : language === "en" ? "en" : "both");
  }, [language]);

  // Change the per-question time mid-game — persists to the session so the NEXT
  // question's server-computed deadline uses it. Applies to all later questions.
  async function setLiveTime(seconds: number) {
    setTimePerQuestion(seconds);
    if (!("code" in phase)) return;
    try {
      await fetch(`/api/game/sessions/${(phase as any).code}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_time", timePerQuestion: seconds }),
      });
    } catch { /* best-effort; next question still uses prior value */ }
  }

  // ── Auto-advance (host-driven) ──────────────────────────────────────────────
  // In "auto" mode, once a question's answer is revealed (round_end), hold the
  // correct answer + leaderboard on screen for AUTO_ADVANCE_MS, then advance to
  // the next question. Combined with the auto-reveal timer above, this makes the
  // whole game run hands-free. Manual mode leaves advancing to the teacher.
  const AUTO_ADVANCE_MS = 5000;
  useEffect(() => {
    if (advanceMode !== "auto" || phase.name !== "round_end") { setAutoAdvanceIn(null); return; }
    const start = Date.now();
    setAutoAdvanceIn(Math.ceil(AUTO_ADVANCE_MS / 1000));
    const iv = setInterval(() => {
      const left = Math.ceil((AUTO_ADVANCE_MS - (Date.now() - start)) / 1000);
      setAutoAdvanceIn(left > 0 ? left : 0);
    }, 250);
    const to = setTimeout(() => { control("advance"); }, AUTO_ADVANCE_MS);
    return () => { clearInterval(iv); clearTimeout(to); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceMode, phase.name]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toUpperCase();
        if (tagName === "INPUT" || tagName === "TEXTAREA" || activeEl.getAttribute("contenteditable") === "true") {
          return;
        }
      }

      if (controlling) return;

      const key = event.key;

      if (key === " " || key === "Enter" || key === "ArrowRight") {
        if (phase.name === "lobby") {
          if (phase.participants && phase.participants.length > 0) {
            event.preventDefault();
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => { });
            }
            control("start");
          }
        } else if (phase.name === "active") {
          event.preventDefault();
          control("reveal");
        } else if (phase.name === "round_end") {
          event.preventDefault();
          control("advance");
        }
      }

      if (key === "ArrowLeft" || key === "Backspace") {
        if (phase.name === "active") {
          event.preventDefault();
          control("back", "active");
        } else if (phase.name === "round_end") {
          event.preventDefault();
          control("back", "round_end");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, controlling]);

  function copyCode() {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const HIDDEN_MODES = new Set([
    "survival-quiz",
    "zen-review",
    "final-practice",
  ]);

  // "Click the Sign" (tick-sign) is an official non-MCQ live game sourced from
  // sign topics (no question bank), so it lives outside GAME_MODE_CONFIG.
  const TICK_SIGN_MODE = {
    id: "tick-sign",
    defaultQuestionCount: 10,
    allowedQuestionCounts: [6, 10, 15, 20],
    timePerQuestion: 15,
    label: "Click the Sign",
    labelKm: "Click the Sign",
    color: "#14b8a6",
    description: "Click the correct road sign for each name.",
    descriptionKm: "ចុចសញ្ញាចរាចរណ៍ឱ្យត្រូវនឹងឈ្មោះ។",
  };
  const GAME_MODES = [
    ...Object.entries(GAME_MODE_CONFIG)
      .map(([id, cfg]) => ({ id, ...cfg }))
      .filter((m) => !HIDDEN_MODES.has(m.id)),
    TICK_SIGN_MODE,
  ];
  const selectedModeConfig = GAME_MODE_CONFIG[selectedMode] ?? GAME_MODES.find((m) => m.id === selectedMode);

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
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1 border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0_#000] text-xs font-black tracking-widest uppercase" style={{ borderRadius: "0px" }}>
                <Sparkles size={12} />
                {kh ? "បង្កើតហ្គេម" : "Create Game"}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ ...khFont }}>
              {kh ? "ហ្គេមផ្ទាល់" : "Live Game Session"}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 font-bold" style={{ ...khFont }}>
              {kh ? "រៀបចំ ហើយចាប់ផ្តើម" : "Configure your session and launch live"}
            </p>
          </div>

          {/* Upgrade banner */}
          {showUpgradeBanner && (
            <UpgradeButton
              variant="banner"
              trigger="session_limit"
              lang={lang}
              className="mb-8 rounded-none border-2 border-black"
              label={
                subPlan !== "free"
                  ? kh
                    ? `គម្រោងរបស់អ្នកនឹងផុតកំណត់ក្នុងរយៈពេល ${subDaysLeft} ថ្ងៃទៀត — ធ្វើឱ្យប្រសើរឡើងឥឡូវនេះ`
                    : `Your plan expires in ${subDaysLeft} days — Renew / Upgrade Now`
                  : kh
                    ? "ទទួលបានវគ្គគ្មានដែនកំណត់ + ប្រភេទទាំងអស់ — ធ្វើឱ្យប្រសើរឡើង"
                    : "Get unlimited sessions + all categories — Upgrade to Teacher Pro"
              }
            />
          )}

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
                    icon: string;
                    tagline: string;
                    taglineKm: string;
                    accentShape: string;
                    badge?: string;
                    badgeColor?: string;
                  }> = {
                    "quick-quiz": {
                      icon: "bolt",
                      tagline: "Flexible pace, any topic",
                      taglineKm: "ល្បឿនដោយខ្លួនឯង",
                      accentShape: "polygon(0 0,100% 0,85% 100%,0 100%)",
                      badge: "Popular",
                      badgeColor: "#22c55e",
                    },
                    "speed-round": {
                      icon: "rocket",
                      tagline: "15s rapid fire — stay sharp",
                      taglineKm: "១៥វិនាទី ឆ្លើយលឿន",
                      accentShape: "polygon(0 0,100% 0,100% 100%,15% 100%)",
                      badge: "Fast",
                      badgeColor: "#ef4444",
                    },
                    "sign-challenge": {
                      icon: "signpost",
                      tagline: "Image-based sign recognition",
                      taglineKm: "សញ្ញាចរាចរណ៍",
                      accentShape: "polygon(0 0,85% 0,100% 100%,0 100%)",
                      badge: "Visual",
                      badgeColor: "#3b82f6",
                    },
                    "mixed-practice": {
                      icon: "swords",
                      tagline: "All question types, full practice",
                      taglineKm: "ហ្វឹកហាត់ចម្រុះ",
                      accentShape: "polygon(0 0,100% 0,100% 100%,0 100%)",
                      badge: "Mixed",
                      badgeColor: "#a855f7",
                    },
                    "tick-sign": {
                      icon: "task_alt",
                      tagline: "Official kids game — click the sign",
                      taglineKm: "ហ្គេមផ្លូវការ — ចុចសញ្ញា",
                      accentShape: "polygon(0 0,85% 0,100% 100%,0 100%)",
                      badge: "Official",
                      badgeColor: "#14b8a6",
                    },
                  };

                  const MODE_STATS: Record<string, { xp: string; complexity: string; complexityKm: string }> = {
                    "quick-quiz": { xp: "1.0x XP", complexity: "Easy", complexityKm: "ងាយ" },
                    "speed-round": { xp: "1.5x XP", complexity: "Hard", complexityKm: "ពិបាក" },
                    "sign-challenge": { xp: "1.2x XP", complexity: "Medium", complexityKm: "មធ្យម" },
                    "mixed-practice": { xp: "2.0x XP", complexity: "Mixed", complexityKm: "ចម្រុះ" },
                    "tick-sign": { xp: "1.0x XP", complexity: "Easy", complexityKm: "ងាយ" },
                  };

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {GAME_MODES.map((m) => {
                        const isSelected = selectedMode === m.id;
                        const isPremium = false; // All modes are now free
                        const isLocked = false;
                        const meta = MODE_META[m.id] ?? { icon: "sports_esports", tagline: "", taglineKm: "", accentShape: "" };
                        const stats = MODE_STATS[m.id] ?? { xp: "1.0x XP", complexity: "Easy", complexityKm: "ងាយ" };

                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              if (isLocked) {
                                window.location.href = "https://www.kesararamwithdigital.tech/pricing";
                              } else {
                                setSelectedMode(m.id);
                                setQuestionCount(m.defaultQuestionCount);
                              }
                            }}
                            className={`relative text-left overflow-hidden transition-all duration-100 border-2 border-black p-4 flex flex-col h-full justify-between group ${isSelected
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
                                {/* Header: icon + locks/badges */}
                                <div className="flex items-start justify-between mb-3 w-full">
                                  <span className="material-symbols-rounded text-2xl leading-none text-black">{meta.icon}</span>
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
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-black text-sm leading-tight text-black" style={{ ...khFont }}>
                                    {kh ? m.labelKm : m.label}
                                  </span>
                                  <span className="text-[8px] font-black uppercase tracking-wider px-1 border border-black bg-zinc-100" style={{ borderRadius: "0px" }}>
                                    {kh ? stats.complexityKm : stats.complexity}
                                  </span>
                                </div>

                                {/* Tagline */}
                                <div className="text-[10px] mb-4 leading-snug text-zinc-600 font-bold" style={{ ...khFont }}>
                                  {kh ? meta.taglineKm : meta.tagline}
                                </div>
                              </div>

                              <div className="mt-auto pt-2 border-t border-black/15 flex items-center justify-between text-[10px] font-bold text-zinc-700 w-full">
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-rounded text-xs leading-none text-zinc-500">list_alt</span>
                                  <span>{m.defaultQuestionCount}{kh ? "សំណួរ" : "Q"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-rounded text-xs leading-none text-zinc-500">schedule</span>
                                  <span>{m.timePerQuestion}{kh ? "វិ" : "s"}</span>
                                </div>
                                <div className="px-1.5 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest animate-none" style={{ borderRadius: "0px" }}>
                                  {stats.xp}
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
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel style={khFont}>{kh ? "ប្រភេទ" : "Categories"}</SectionLabel>
                  <button
                    onClick={() => {
                      if (selectedCats.length === categories.length) {
                        setSelectedCats([]);
                      } else {
                        setSelectedCats(categories.map(c => c.id));
                      }
                    }}
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-black bg-zinc-100 hover:bg-yellow-400 transition-all"
                    style={{ borderRadius: "0px" }}
                  >
                    {selectedCats.length === categories.length
                      ? (kh ? "ដកជ្រើសទាំងអស់" : "Deselect All")
                      : (kh ? "ជ្រើសទាំងអស់" : "Select All")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const sel = selectedCats.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCats((p) => sel ? p.filter((id) => id !== cat.id) : [...p, cat.id])}
                        className={`px-3.5 py-1.5 text-sm font-bold border-2 border-black transition-all duration-100 ${sel
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
                {selectedCats.length === 0 && (
                  <div className="mt-3 text-xs font-black text-red-600 flex items-center gap-1.5">
                    <span className="material-symbols-rounded text-sm">warning</span>
                    {kh ? "ជ្រើសរើសប្រភេទយ៉ាងហោចណាស់មួយ" : "Please select at least one category"}
                  </div>
                )}
              </GlassCard>

              {/* Settings row — Scoring toggle removed: scoring is now a fixed rule
                  (+1 correct, +1 streak, max 2) with no speed bonus, so there is no
                  speed/equal choice to make. */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Advance mode — Manual vs Auto */}
                <GlassCard className="p-4">
                  <div className="flex items-center gap-1.5 mb-3 text-zinc-600 font-bold">
                    <FastForward size={12} />
                    <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "ការបន្ត" : "Advance"}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {(["manual", "auto"] as const).map((m) => (
                      <button key={m} onClick={() => pickAdvanceMode(m)}
                        className={`flex items-center justify-center gap-1.5 py-2 text-xs font-black border-2 border-black transition-all duration-100 ${advanceMode === m
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                          : "bg-white text-zinc-600 hover:bg-zinc-50"
                          }`}
                        style={{ borderRadius: "0px" }}>
                        {m === "manual" ? <Hand size={11} /> : <FastForward size={11} />}
                        {m === "manual" ? (kh ? "ដោយដៃ" : "Manual") : (kh ? "ស្វ័យ" : "Auto")}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 mt-2 leading-snug" style={khFont}>
                    {advanceMode === "auto"
                      ? (kh ? "បង្ហាញចម្លើយ ៥វិ រួចបន្តដោយស្វ័យប្រវត្តិ" : "Shows answer 5s, then auto next")
                      : (kh ? "គ្រូចុច «បន្ទាប់» ដោយខ្លួនឯង" : "Teacher clicks Next each time")}
                  </p>
                </GlassCard>

                {/* Time per question */}
                <GlassCard className="p-4">
                  <div className="flex items-center gap-1.5 mb-3 text-zinc-600 font-bold">
                    <Timer size={12} />
                    <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "ពេល/សំណួរ" : "Time / Question"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[10, 20, 30, 45, 60].map((s) => (
                      <button key={s} onClick={() => setTimePerQuestion(s)}
                        className={`py-2 text-xs font-black border-2 border-black transition-all duration-100 ${timePerQuestion === s
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                          : "bg-white text-zinc-600 hover:bg-zinc-50"
                          }`}
                        style={{ borderRadius: "0px" }}>
                        {s}{kh ? "វិ" : "s"}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 mt-2 leading-snug" style={khFont}>
                    {kh ? "អនុវត្តគ្រប់សំណួរ · ប្ដូរបានពេលលេងផ្ទាល់" : "All questions · adjustable live"}
                  </p>
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
                        className={`py-2 text-xs font-black border-2 border-black transition-all duration-100 ${language === l
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
                        className={`py-1.5 text-xs font-black border-2 border-black transition-all duration-100 ${difficulty === d.id
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
                      className={`flex-1 py-2 border-2 border-black text-xs font-black transition-all duration-100 ${questionCount === n
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
                      className={`flex-1 py-2.5 border-2 border-black text-sm font-black transition-all duration-100 ${maxPlayers === n
                        ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                        : "bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      style={{ borderRadius: "0px" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Class Restriction */}
              <GlassCard className="p-5">
                <div className="flex items-center gap-1.5 mb-1 text-zinc-600 font-bold">
                  <Users size={13} />
                  <span className="text-xs font-black uppercase tracking-widest" style={khFont}>{kh ? "កំណត់ថ្នាក់" : "Restrict to Class"}</span>
                </div>
                <p className="text-[11px] font-bold text-zinc-500 mb-3" style={khFont}>
                  {kh
                    ? "ជ្រើសរើសថ្នាក់ ដើម្បីឲ្យតែសិស្សក្នុងថ្នាក់នោះអាចចូលរួមបាន។"
                    : "Pick a class so only its enrolled students can join."}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedClassId(null)}
                    className={`w-full text-left px-3 py-2.5 border-2 border-black text-sm font-black transition-all duration-100 ${selectedClassId === null
                      ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                      : "bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                    style={{ borderRadius: "0px", ...khFont }}>
                    {kh ? "បើកសម្រាប់សិស្សគ្រប់រូបដែលមានថ្នាក់" : "Open to any student with a class"}
                  </button>
                  {teacherClasses
                    .filter((c) => c.status !== "archived")
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedClassId(c.id)}
                        className={`w-full text-left px-3 py-2.5 border-2 border-black text-sm font-black transition-all duration-100 ${selectedClassId === c.id
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                          : "bg-white text-zinc-600 hover:bg-zinc-50"
                          }`}
                        style={{ borderRadius: "0px", ...khFont }}>
                        {c.name}
                      </button>
                    ))}
                  {teacherClasses.filter((c) => c.status !== "archived").length === 0 && (
                    <p className="text-[11px] font-bold text-zinc-400" style={khFont}>
                      {kh ? "មិនទាន់មានថ្នាក់" : "No classes yet."}
                    </p>
                  )}
                </div>
              </GlassCard>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 border-2 border-black bg-red-400 text-black font-black text-sm shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px", ...khFont }}>
                  <span className="material-symbols-rounded text-black mr-1 text-sm align-middle">warning</span> {error}
                  {(error.toLowerCase().includes("session") || error.toLowerCase().includes("limit") || error.toLowerCase().includes("upgrade")) && subPlan === "free" && (
                    <div className="mt-2"><UpgradeButton variant="banner" trigger="session_limit" lang={lang} /></div>
                  )}
                </div>
              )}

              {/* Question count warning */}
              {questionCountWarning && (
                <div className="px-4 py-3 border-2 border-black bg-amber-300 text-black font-black text-sm shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px", ...khFont }}>
                  <span className="material-symbols-rounded text-black mr-1 text-sm align-middle">info</span> {questionCountWarning}
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
                      {kh ? "ការមើលមុនការរៀបចំ" : "Session Preview"}
                    </div>
                    <div className="font-black text-black truncate text-sm" style={khFont}>
                      {sessionName || (kh ? "មិនទាន់ដាក់ឈ្មោះវគ្គ..." : "Untitled Session")}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-4 bg-white">
                    {/* Mode header */}
                    <div className="p-4 border-2 border-black flex items-center gap-3 bg-zinc-50" style={{ borderRadius: "0px" }}>
                      <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0_#000]" style={{ color: selectedModeConfig?.color, borderRadius: "0px" }}>
                        <span className="material-symbols-rounded text-2xl leading-none">
                          {
                            {
                              "quick-quiz": "bolt",
                              "speed-round": "rocket",
                              "sign-challenge": "signpost",
                              "mixed-practice": "swords"
                            }[selectedMode] || "sports_esports"
                          }
                        </span>
                      </div>
                      <div>
                        <div className="font-black text-black text-base leading-tight" style={khFont}>
                          {kh ? selectedModeConfig?.labelKm : selectedModeConfig?.label}
                        </div>
                        <div className="text-xs text-zinc-500 font-bold mt-0.5">
                          {kh ? `ល្បឿនលំនាំដើម ${selectedModeConfig?.timePerQuestion} វិនាទី` : `Default speed: ${selectedModeConfig?.timePerQuestion}s / question`}
                        </div>
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="border-2 border-black divide-y-2 divide-black bg-white" style={{ borderRadius: "0px" }}>
                      {[
                        {
                          icon: "quiz",
                          label: kh ? "សំណួរសរុប" : "Total Questions",
                          value: `${questionCount} Questions`
                        },
                        {
                          icon: "schedule",
                          label: kh ? "ពេលវេលាឆ្លើយ" : "Time Per Question",
                          value: `${selectedModeConfig?.timePerQuestion} seconds`
                        },
                        {
                          icon: "groups",
                          label: kh ? "អ្នកលេងអតិបរមា" : "Player Capacity",
                          value: `Max ${maxPlayers} Players`
                        },
                        {
                          icon: "stars",
                          label: kh ? "ការគណនាពិន្ទុ" : "Scoring Rule",
                          value: kh ? "ត្រូវ +1 · ស្ទ្រីក +1 (អតិបរមា ២)" : "+1 correct · +1 streak (max 2)"
                        },
                        {
                          icon: "translate",
                          label: kh ? "ភាសាសំណួរ" : "Language",
                          value: language === "both" ? "English & Khmer" : language === "en" ? "English Only" : "Khmer Only"
                        },
                        {
                          icon: "signal_cellular_alt",
                          label: kh ? "កម្រិតសំណួរ" : "Difficulty",
                          value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
                          valueColor: { mixed: "#a855f7", easy: "#22c55e", medium: "#eab308", hard: "#ef4444" }[difficulty]
                        },
                      ].map((item) => (
                        <div key={item.label} className="p-3.5 flex items-center justify-between gap-4 text-black bg-white">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="material-symbols-rounded text-xl leading-none text-zinc-700 shrink-0">
                              {item.icon}
                            </span>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide truncate" style={khFont}>
                              {item.label}
                            </span>
                          </div>
                          <span
                            className="text-xs font-black text-right shrink-0"
                            style={{ color: item.valueColor || "#000000", ...khFont }}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Selected Categories */}
                    {selectedCats.length > 0 && (
                      <div className="border-2 border-black bg-zinc-50 p-4" style={{ borderRadius: "0px" }}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2.5" style={khFont}>
                          {kh ? "ប្រភេទសំណួរដែលបានជ្រើសរើស" : "Selected Categories"}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {categories.filter(c => selectedCats.includes(c.id)).map(c => (
                            <span
                              key={c.id}
                              className="px-2.5 py-1 text-[10px] font-black border border-black bg-yellow-400 text-black shadow-[1.5px_1.5px_0_#000]"
                              style={{ borderRadius: "0px", ...khFont }}
                            >
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
      <div className="min-h-screen text-black pb-12"
        style={{
          backgroundColor: "#faf9f6",
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px"
        }}>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-8 border-b-4 border-black pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-emerald-400 text-black shadow-[2px_2px_0_#000] font-black text-xs rounded-none animate-pulse">
                  <div className="w-1.5 h-1.5 bg-black" style={{ borderRadius: "0px" }} />
                  {kh ? "ហ្គេមរង់ចាំ" : "Waiting Room"}
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight" style={khFont}>{kh ? "រៀបចំខ្លួនលេង" : "Ready to Play"}</h1>
              <p className="mt-1 text-sm text-zinc-600 font-bold" style={{ ...khFont }}>
                {kh ? "ចែករំលែកលេខកូដជាមួយអ្នករៀន" : "Share the room code with your students"}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              {/* Sound settings button in lobby */}
              <button
                onClick={() => setShowSoundOptions(!showSoundOptions)}
                className={`flex items-center justify-center gap-2 px-4 py-3 border-4 border-black font-black text-sm shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all duration-100 rounded-none cursor-pointer ${muted ? "bg-red-400 text-black" : "bg-white text-black"}`}
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span className="hidden sm:inline" style={khFont}>{kh ? "សំឡេង" : "Sound"}</span>
              </button>

              <button
                onClick={() => { if (confirm(kh ? "បោះបង់ហ្គេមនេះ?" : "Cancel this game session?")) { control("terminate"); setTimeout(() => setPhase({ name: "setup" }), 500); } }}
                disabled={controlling}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 border-4 border-black bg-red-400 text-black font-black text-sm shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all duration-100 disabled:opacity-50 rounded-none cursor-pointer"
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
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-7 py-3 border-4 border-black bg-emerald-400 text-black font-black text-sm shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all duration-100 disabled:opacity-50 rounded-none cursor-pointer"
              >
                {controlling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                {kh ? "ចាប់ផ្តើម" : "Start Game"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 border-4 border-black bg-red-400 text-black font-black text-sm shadow-[3px_3px_0_#000] rounded-none flex items-center gap-2" style={khFont}>
              <TriangleAlert size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* ── Room Code (big) & QR Code ── */}
            <div className="lg:col-span-2">
              <div className="bg-yellow-400 border-4 border-black p-8 relative shadow-[8px_8px_0_#000] rounded-none">
                {/* Diagonal warning stripes pattern bar on top */}
                <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none"
                  style={{ backgroundImage: "repeating-linear-gradient(-45deg, #000, #000 8px, #eab308 8px, #eab308 16px)" }} />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
                  {/* Left Column: Room Code Details */}
                  <div className="md:col-span-8 text-center md:text-left w-full">
                    <div className="text-xs font-black uppercase tracking-widest mb-2.5 text-black">
                      {kh ? "លេខកូដបន្ទប់" : "Room Code"}
                    </div>
                    <div className="text-4xl sm:text-5xl md:text-6xl font-mono font-black tracking-[0.1em] sm:tracking-[0.18em] pl-[0.1em] sm:pl-[0.18em] mb-2.5 text-black text-center md:text-left whitespace-nowrap select-all" style={{ overflowWrap: "normal", wordBreak: "keep-all" }}>
                      {phase.code}
                    </div>
                    <div className="text-sm mb-6 text-black font-bold text-center md:text-left break-words">
                      {kh ? "ចូលតាម:" : "Join at:"} <span className="text-black font-black underline block sm:inline break-all">{joinUrl.replace(/^https?:\/\//, "")}</span>
                    </div>
                    <button
                      onClick={copyCode}
                      className={`flex items-center gap-2 px-5 py-3 border-4 border-black font-black text-sm mx-auto md:mx-0 transition-all duration-100 shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000] rounded-none cursor-pointer ${copied ? "bg-emerald-400 text-black" : "bg-white text-black"}`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? (kh ? "បានចម្លង!" : "Copied!") : (kh ? "ចម្លងតំណភ្ជាប់" : "Copy Link")}
                    </button>
                  </div>

                  {/* Right Column: QR Code scanning */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-5 bg-white border-4 border-black shadow-[4px_4px_0_#000] rounded-none">
                    <div className="text-[10px] font-black uppercase tracking-widest mb-3.5 text-black text-center" style={khFont}>
                      {kh ? "ស្កេនដើម្បីចូលរួម" : "Scan to Join Q&A"}
                    </div>
                    <div className="p-2 bg-white flex items-center justify-center border-2 border-black">
                      {joinUrl ? (
                        <QRCode
                          value={joinUrl}
                          size={120}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 256 256`}
                        />
                      ) : (
                        <div className="w-[120px] h-[120px] bg-zinc-100 animate-pulse border border-zinc-200" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Game Details ── */}
            <div className="border-4 border-black bg-white p-6 rounded-none shadow-[6px_6px_0_#000]">
              <div className="text-xs font-black uppercase tracking-widest mb-4.5 text-zinc-500" style={{ ...khFont }}>
                {kh ? "ព័ត៌មានហ្គេម" : "Game Details"}
              </div>
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: kh ? "របៀប" : "Mode",
                    customValue: (
                      <span className="text-xs font-black px-2 py-0.5 border-2 border-black rounded-none shadow-[1.5px_1.5px_0_#000] text-black" style={{ backgroundColor: modeConfig?.color || "#fbbf24" }}>
                        {kh ? modeConfig?.labelKm : modeConfig?.label}
                      </span>
                    )
                  },
                  { label: kh ? "ប្រភេទ" : "Category", value: catNames },
                  {
                    label: kh ? "កម្រិត" : "Difficulty",
                    customValue: (
                      <span className="text-xs font-black px-2 py-0.5 border-2 border-black rounded-none shadow-[1.5px_1.5px_0_#000] text-white"
                        style={{ backgroundColor: { mixed: "#a855f7", easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" }[phase.difficulty] || "#000" }}>
                        {phase.difficulty.charAt(0).toUpperCase() + phase.difficulty.slice(1)}
                      </span>
                    )
                  },
                  { label: kh ? "សំណួរ" : "Questions", value: `${phase.questionCount}Q` },
                  { label: kh ? "ពេល/Q" : "Time/Q", value: `${phase.timePerQuestion}s` },
                ].map((item) => {
                  const isCategory = item.label === (kh ? "ប្រភេទ" : "Category");
                  return (
                    <div key={item.label} className={`border-b-2 border-zinc-100 pb-3 last:border-0 last:pb-0 flex ${isCategory ? "flex-col items-start gap-1 text-left" : "items-center justify-between"}`}>
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-wider" style={{ ...khFont }}>{item.label}</span>
                      {item.customValue ? (
                        item.customValue
                      ) : (
                        <span className={`text-sm font-black capitalize text-black ${isCategory ? "text-left leading-normal" : "text-right"}`}>
                          {item.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Players section ── */}
          <div className="border-4 border-black bg-white p-6 rounded-none shadow-[6px_6px_0_#000]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-black" />
                <span className="font-black text-sm uppercase tracking-widest text-black" style={khFont}>
                  {phase.participants.length} / {phase.maxPlayers} {kh ? "នាក់" : "Players"}
                </span>
              </div>
              <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                {Math.round(fillPct)}% {kh ? "ពេញ" : "full"}
              </div>
            </div>

            {/* Neubrutalist Progress bar */}
            <div className="h-6 border-4 border-black bg-white shadow-[2px_2px_0_#000] mb-6 overflow-hidden rounded-none">
              <div className="h-full bg-emerald-400 border-r-4 border-black transition-all duration-500 animate-pulse" style={{ width: `${fillPct}%` }} />
            </div>

            {phase.participants.length === 0 ? (
              <div className="text-center py-12 border-4 border-dashed border-zinc-300">
                <div className="w-16 h-16 border-4 border-black bg-zinc-50 flex items-center justify-center mx-auto mb-4 rounded-none shadow-[3px_3px_0_#000]">
                  <Users size={28} className="text-black" />
                </div>
                <p className="font-black text-sm text-zinc-400 uppercase tracking-wider" style={{ ...khFont }}>
                  {kh ? "រង់ចាំអ្នកចូលរួម..." : "Waiting for players to join..."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {phase.participants.map((p, i) => {
                  // Newest 3 joiners get a "NEW" flash; others show READY.
                  const isNew = i >= phase.participants.length - 3;
                  return (
                    <div
                      key={p.userId}
                      className="relative flex items-center gap-3 p-3 border-4 border-black bg-white shadow-[4px_4px_0_#000] rounded-none hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#000] transition-all"
                      style={{ animation: "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                    >
                      {/* player number badge */}
                      <span className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-black text-yellow-400 text-[10px] font-black flex items-center justify-center border-2 border-yellow-400 z-10">
                        {i + 1}
                      </span>

                      {/* avatar */}
                      <div className="w-11 h-11 border-2 border-black flex items-center justify-center font-black text-sm flex-shrink-0 text-white rounded-none shadow-[2px_2px_0_#000] overflow-hidden bg-white">
                        <NeubrutalistAvatar src={p.avatar} initials={p.displayName.charAt(0).toUpperCase()} userId={p.userId} />
                      </div>

                      {/* name + status labels */}
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-black truncate text-black" style={{ ...khFont }}>
                          {p.displayName}
                        </span>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {/* connection dot + label */}
                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-black"
                            style={{ background: p.isConnected ? "#22c55e" : "#e4e4e7", color: "#000" }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.isConnected ? "#000" : "#a1a1aa" }} />
                            {p.isConnected ? (kh ? "រួចរាល់" : "READY") : (kh ? "ផ្ដាច់" : "OFF")}
                          </span>
                          {isNew && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-black bg-yellow-400 text-black animate-pulse">
                              {kh ? "ថ្មី" : "NEW"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-once { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        .animate-pulse-once { animation: pulse-once 0.6s ease-in-out; }`}</style>
        
        {/* Sound settings overlay popover (centered modal on mobile, absolute below top bar on desktop) */}
        {renderSoundOptions()}
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
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2 sm:py-3 flex-shrink-0 border-b-4 border-black bg-yellow-400 text-black">
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="text-black font-black text-xs sm:text-sm whitespace-nowrap" style={khFont}>
              {kh ? `សំណួរ ${phase.qIndex + 1} / ${phase.total}` : `Q ${phase.qIndex + 1} / ${phase.total}`}
            </span>
          </div>

          {/* Question progress + time water-fill */}
          <div className="flex-1 min-w-0 mx-2 sm:mx-8 flex flex-col gap-1.5">
            {/* question position */}
            <div className="h-2 border-2 border-black bg-white overflow-hidden" style={{ borderRadius: "0px" }}>
              <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            {/* time water-fill — fills left→right as time elapses; red in final 20% */}
            {isActive && (
              <div className="h-4 border-2 border-black bg-white overflow-hidden relative" style={{ borderRadius: "0px" }}>
                <div
                  className="h-full transition-[width] duration-200 ease-linear"
                  style={{
                    width: `${qFillPct}%`,
                    backgroundColor: qFillPct >= 80 ? "#ef4444" : "#22c55e",
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black/70 select-none">
                  {kh ? "ពេលវេលា" : "TIME"}
                </span>
              </div>
            )}
          </div>

          {/* Controls — desktop only; phones use the bottom dock below */}
          <div className="hidden md:flex items-center gap-2">
            {error && <span className="text-red-600 text-xs font-black max-w-xs truncate">{error}</span>}

            {/* Manual / Auto advance toggle (flip live) */}
            <div className="flex border-2 border-black shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px" }} title={kh ? "របៀបបន្ត" : "Advance mode"}>
              {(["manual", "auto"] as const).map((m) => (
                <button key={m} onClick={() => pickAdvanceMode(m)}
                  className={`flex items-center gap-1 px-2.5 py-2 text-xs font-black uppercase tracking-wider transition-colors ${m === "auto" ? "border-l-2 border-black" : ""} ${advanceMode === m ? "bg-black text-yellow-400" : "bg-white text-black hover:bg-zinc-100"}`}
                  style={{ borderRadius: "0px" }}>
                  {m === "manual" ? <Hand size={12} /> : <FastForward size={12} />}
                  {m === "manual" ? (kh ? "ដៃ" : "Man") : (kh ? "ស្វ័យ" : "Auto")}
                </button>
              ))}
            </div>

            {/* Time per question (live — applies to the next question) */}
            <div className="flex border-2 border-black shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px" }} title={kh ? "ពេល/សំណួរ (បន្ទាប់)" : "Time per question (next)"}>
              <span className="flex items-center px-1.5 bg-white text-black"><Timer size={12} /></span>
              {[10, 20, 30, 45, 60].map((s) => (
                <button key={s} onClick={() => setLiveTime(s)}
                  className={`px-1.5 py-2 text-[11px] font-black border-l-2 border-black transition-colors ${timePerQuestion === s ? "bg-black text-yellow-400" : "bg-white text-black hover:bg-zinc-100"}`}
                  style={{ borderRadius: "0px" }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Host-screen language (projector only — does not change student devices) */}
            <div className="flex border-2 border-black shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px" }} title={kh ? "ភាសាអេក្រង់គ្រូ" : "Screen language"}>
              {(["both", "kh", "en"] as const).map((l, i) => (
                <button key={l} onClick={() => setDisplayLang(l)}
                  className={`flex items-center px-2 py-2 text-xs font-black uppercase transition-colors ${i > 0 ? "border-l-2 border-black" : ""} ${displayLang === l ? "bg-black text-yellow-400" : "bg-white text-black hover:bg-zinc-100"}`}
                  style={{ borderRadius: "0px" }}>
                  {l === "both" ? <Languages size={12} /> : l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Sound options button */}
            <button
              onClick={() => setShowSoundOptions(!showSoundOptions)}
              title={kh ? "ជម្រើសសំឡេង" : "Sound Options"}
              className={`flex items-center px-3 py-2 border-2 border-black font-black text-sm shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 ${muted ? "bg-red-400 text-black" : "bg-white text-black"}`}
              style={{ borderRadius: "0px" }}
            >
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>

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
                    document.exitFullscreen().catch(() => { });
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
              className={`flex items-center gap-2 px-5 py-2 border-2 border-black text-black font-black text-sm shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-40 ${!isActive && advanceMode === "auto" ? "bg-yellow-400" : "bg-green-400"}`}
              style={{ borderRadius: "0px" }}
            >
              {controlling ? <Loader2 size={15} className="animate-spin" /> : (!isActive && advanceMode === "auto") ? <FastForward size={15} /> : <SkipForward size={15} />}
              {!isActive && advanceMode === "auto" && autoAdvanceIn !== null
                ? (kh ? `បន្ទាប់ (${autoAdvanceIn})` : `Auto · ${autoAdvanceIn}s`)
                : (kh ? "សំណួរបន្ទាប់" : "Next Q")}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Question area */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 md:px-8 md:py-6 overflow-y-auto">
            <div className="w-full max-w-3xl">
              {/* Round label */}
              <div className="flex items-center justify-center gap-3 mb-3 md:mb-6">
                <div className={`px-3 py-1 border-2 border-black text-xs font-black uppercase tracking-widest shadow-[2px_2px_0_#000] ${isActive ? "bg-blue-400 text-black" : "bg-green-400 text-black"}`} style={{ borderRadius: "0px" }}>
                  {isActive ? (kh ? "សំណួរ" : "Question") : (kh ? "ចប់វគ្គ" : "Round Over")}
                </div>
                <span className="text-zinc-500 text-xs font-bold">{phase.qIndex + 1} / {phase.total}</span>
              </div>

              {/* Question image — white background, bigger */}
              <div className="w-full h-44 sm:h-60 md:h-72 border-4 border-black bg-white flex items-center justify-center mb-4 md:mb-6 relative overflow-hidden shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000]" style={{ borderRadius: "0px" }}>
                {question?.imageUrl ? (
                  <img src={cloudinaryOptimize(question.imageUrl, 900)} alt="question" className="h-full w-auto object-contain" style={{ maxHeight: "100%", maxWidth: "100%" }} fetchPriority="high" decoding="async" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <BookOpen size={48} className="text-zinc-500" />
                    <span className="font-black text-[10px] tracking-wider uppercase text-zinc-500">Kesararam Quiz</span>
                  </div>
                )}
              </div>

              {/* Question text — bigger, high contrast */}
              <div className="text-center mb-4 md:mb-8 min-h-[4rem] md:min-h-[8rem] flex flex-col items-center justify-center px-2">
                <div className="font-black text-xl sm:text-2xl md:text-3xl xl:text-4xl text-black leading-snug" style={{ overflowWrap: "break-word", wordBreak: "normal", hyphens: "auto", ...qaFont }}>
                  {displayLang === "en" ? question?.questionEn : (question?.questionKm || question?.questionEn)}
                </div>
                {displayLang === "both" && question?.questionKm && question?.questionEn && (
                  <div className="text-zinc-600 text-sm sm:text-lg font-bold mt-2 md:mt-3">{question.questionEn}</div>
                )}
              </div>

              {/* Answers — bigger, better contrast */}
              {answers.length > 0 && (
                <div className={`grid gap-2 sm:gap-4 ${answers.length <= 2 ? "grid-cols-1 max-w-2xl mx-auto" : "grid-cols-2"}`}>
                  {answers.map((ans, i) => {
                    const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
                    const isCorrect = correctAnswerId !== null && ans.id === correctAnswerId;
                    const isWrong = correctAnswerId !== null && ans.id !== correctAnswerId;
                    const text = displayLang === "en" ? ans.answerEn : (ans.answerKm || ans.answerEn);
                    const isImagePick = question?.gameType === "image_pick";

                    // Calculate contrast text color
                    const textColor = isCorrect ? "#000000" : isWrong ? "#52525b" : "#ffffff";

                    if (isImagePick && ans.imageUrl) {
                      return (
                        <div
                          key={ans.id}
                          className={`relative border-4 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${isCorrect ? 'animate-pulse-once' : ''}`}
                          style={{
                            borderRadius: "0px",
                            backgroundColor: isCorrect ? "#22c55e" : isWrong ? "#fafafa" : "#ffffff",
                            borderColor: isCorrect ? "#15803d" : isWrong ? "#d4d4d8" : style.bg,
                            opacity: isWrong ? 0.4 : 1,
                            boxShadow: isWrong ? "none" : `4px 4px 0px ${isCorrect ? '#15803d' : style.shadow ?? "#000"}`,
                            height: "160px",
                          }}
                        >
                          {/* Color top strip */}
                          <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: isCorrect ? "#15803d" : style.bg }} />
                          <img
                            src={cloudinaryOptimize(ans.imageUrl, 400)}
                            alt={text}
                            className="object-contain"
                            style={{ height: "100px", width: "auto", maxWidth: "90%", padding: "4px 8px" }}
                            decoding="async"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                          {isCorrect && <span className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white border-2 border-black text-green-600 shadow-[2px_2px_0_#000]"><Check size={16} strokeWidth={3} /></span>}
                          <div className="absolute bottom-0 left-0 right-0 text-center text-xs font-black text-white py-1.5 px-2 truncate" style={{ backgroundColor: isCorrect ? '#15803d' : style.bg }}>{style.label}</div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={ans.id}
                        className={`flex items-center gap-3 sm:gap-5 px-3 py-3 sm:px-6 sm:py-5 border-4 transition-all duration-300 ${isCorrect ? 'animate-pulse-once' : ''}`}
                        style={{
                          borderRadius: "0px",
                          backgroundColor: isCorrect ? "#22c55e" : isWrong ? "#e4e4e7" : style.bg,
                          borderColor: isCorrect ? "#15803d" : "#000000",
                          opacity: isWrong ? 0.3 : 1,
                          boxShadow: isWrong ? "none" : `5px 5px 0px ${isCorrect ? '#15803d' : '#000000'}`,
                          minHeight: "56px",
                        }}
                      >
                        <div className="w-9 h-9 sm:w-12 sm:h-12 border-2 sm:border-[3px] border-black flex items-center justify-center bg-white font-black text-black text-lg sm:text-2xl flex-shrink-0" style={{ borderRadius: "0px" }}>
                          {style.label}
                        </div>
                        <span className="font-black text-sm sm:text-lg xl:text-xl leading-snug flex-1" style={{ color: textColor, overflowWrap: "break-word", wordBreak: "normal", hyphens: "auto", ...qaFont }}>{text}</span>
                        {isCorrect && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white border-2 sm:border-[3px] border-black text-green-600 flex-shrink-0" style={{ borderRadius: "0px" }}>
                            <Check size={18} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isActive && (
                <div className="mt-6 text-center text-sm font-black text-zinc-500 flex items-center justify-center gap-1.5" style={{ ...khFont }}>
                  {advanceMode === "auto" ? (
                    <>
                      <FastForward size={14} className="text-yellow-500" />
                      {autoAdvanceIn !== null && autoAdvanceIn > 0
                        ? (kh ? `បន្តដោយស្វ័យក្នុង ${autoAdvanceIn} វិនាទី…` : `Auto-advancing in ${autoAdvanceIn}s…`)
                        : (kh ? "កំពុងបន្ត…" : "Advancing…")}
                    </>
                  ) : (
                    kh ? "ចុច «សំណួរបន្ទាប់» ដើម្បីបន្ត" : "Click «Next Q» to continue"
                  )}
                </div>
              )}
            </div>
          </div>


        </div>

        {/* ── Mobile control dock (thumb zone) — phones only ── */}
        <div
          className="md:hidden flex-shrink-0 border-t-4 border-black bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {error && (
            <div className="px-3 py-1.5 bg-red-400 border-b-2 border-black text-black text-[11px] font-black truncate" style={khFont}>
              {error}
            </div>
          )}

          {/* Secondary controls row */}
          <div className="grid grid-cols-4 gap-2 px-3 pt-3">
            {/* Back */}
            <button
              onClick={() => control("back", isActive ? "active" : "round_end")}
              disabled={controlling}
              className="flex flex-col items-center justify-center gap-0.5 py-2 border-2 border-black bg-white text-black font-black text-[9px] uppercase tracking-wider shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40"
              style={{ borderRadius: "0px" }}
            >
              <ChevronLeft size={16} />
              {kh ? "ថយ" : "Back"}
            </button>

            {/* Advance mode toggle */}
            <button
              onClick={() => pickAdvanceMode(advanceMode === "auto" ? "manual" : "auto")}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 border-2 border-black font-black text-[9px] uppercase tracking-wider shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${advanceMode === "auto" ? "bg-black text-yellow-400" : "bg-white text-black"}`}
              style={{ borderRadius: "0px" }}
            >
              {advanceMode === "auto" ? <FastForward size={16} /> : <Hand size={16} />}
              {advanceMode === "auto" ? (kh ? "ស្វ័យ" : "Auto") : (kh ? "ដៃ" : "Manual")}
            </button>

            {/* Sound Settings */}
            <button
              onClick={() => setShowSoundOptions(!showSoundOptions)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 border-2 border-black font-black text-[9px] uppercase tracking-wider shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${muted ? "bg-red-400 text-black" : "bg-white text-black"}`}
              style={{ borderRadius: "0px" }}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {kh ? "សំឡេង" : "Sound"}
            </button>

            {/* Exit (STOP) */}
            <button
              onClick={() => {
                if (confirm(kh ? "បញ្ចប់ហ្គេម និងចាកចេញ?" : "End session and exit?")) {
                  control("end");
                  if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
                }
              }}
              disabled={controlling}
              className="flex flex-col items-center justify-center gap-0.5 py-2 border-2 border-black bg-red-400 text-black font-black text-[9px] uppercase tracking-wider shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40"
              style={{ borderRadius: "0px" }}
            >
              <Square size={16} />
              {kh ? "ចេញ" : "Exit"}
            </button>
          </div>

          {/* Primary action — big, contextual */}
          <div className="px-3 py-3">
            <button
              onClick={() => control(isActive ? "reveal" : "advance")}
              disabled={controlling}
              className={`w-full flex items-center justify-center gap-2.5 py-4 border-4 border-black text-black font-black text-lg shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000] transition-all disabled:opacity-50 ${!isActive && advanceMode === "auto" ? "bg-yellow-400" : "bg-green-400"}`}
              style={{ borderRadius: "0px", ...khFont }}
            >
              {controlling ? (
                <Loader2 size={22} className="animate-spin" />
              ) : isActive ? (
                <Check size={22} strokeWidth={3} />
              ) : !isActive && advanceMode === "auto" ? (
                <FastForward size={22} />
              ) : (
                <SkipForward size={22} />
              )}
              {isActive
                ? (kh ? "បង្ហាញចម្លើយ" : "Reveal Answer")
                : !isActive && advanceMode === "auto" && autoAdvanceIn !== null
                  ? (kh ? `បន្ត (${autoAdvanceIn})` : `Auto · ${autoAdvanceIn}s`)
                  : (kh ? "សំណួរបន្ទាប់" : "Next Question")}
            </button>
          </div>
        </div>

        {/* Sound settings overlay popover (centered modal on mobile, absolute below top bar on desktop) */}
        {renderSoundOptions()}
      </div>
    );
  }

  // ── ENDED ──────────────────────────────────────────────────────────────────
  if (phase.name === "ended") {
    const RANK_COLORS = ["#FFD700", "#e4e4e7", "#fed7aa"];
    const leaderboardCount = phase.leaderboard.length;
    let podiumItems: { entry: LeaderboardEntry; rank: number; colStyle: string }[] = [];

    if (leaderboardCount === 1) {
      podiumItems = [
        {
          entry: phase.leaderboard[0],
          rank: 1,
          colStyle: "w-full h-32 border-2 border-black bg-yellow-400 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
        }
      ];
    } else if (leaderboardCount === 2) {
      podiumItems = [
        {
          entry: phase.leaderboard[1],
          rank: 2,
          colStyle: "w-full h-24 border-2 border-black bg-zinc-200 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
        },
        {
          entry: phase.leaderboard[0],
          rank: 1,
          colStyle: "w-full h-32 border-2 border-black bg-yellow-400 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
        }
      ];
    } else if (leaderboardCount >= 3) {
      podiumItems = [
        {
          entry: phase.leaderboard[1],
          rank: 2,
          colStyle: "w-full h-24 border-2 border-black bg-zinc-200 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
        },
        {
          entry: phase.leaderboard[0],
          rank: 1,
          colStyle: "w-full h-32 border-2 border-black bg-yellow-400 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
        },
        {
          entry: phase.leaderboard[2],
          rank: 3,
          colStyle: "w-full h-20 border-2 border-black bg-orange-300 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]",
        }
      ];
    }

    return (
      <div className="min-h-screen dot-bg text-black pb-12 relative overflow-hidden">
        <Confetti />
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
                    <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black text-sm text-white overflow-hidden bg-white shadow-[1px_1px_0_#000]" style={{ borderRadius: "0px" }}>
                      <NeubrutalistAvatar src={entry.avatar} initials={(entry.displayName || "?").slice(0, 2).toUpperCase()} userId={entry.userId} />
                    </div>
                    <div className="text-xs font-black text-center truncate w-full text-black" style={{ ...khFont }}>{entry.displayName}</div>
                    <div className={item.colStyle} style={{ borderRadius: "0px" }}>
                      <Medal
                        size={26}
                        strokeWidth={2.5}
                        className="mb-1"
                        style={{ color: item.rank === 1 ? "#eab308" : item.rank === 2 ? "#71717a" : "#c2410c" }}
                      />
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
              onClick={() => router.push("/teacher/sessions")}
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
                      <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-xs text-white flex-shrink-0 overflow-hidden bg-white shadow-[1px_1px_0_#000]" style={{ borderRadius: "0px" }}>
                        <NeubrutalistAvatar src={entry.avatar} initials={(entry.displayName || "?").slice(0, 2).toUpperCase()} userId={entry.userId} />
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
