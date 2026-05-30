"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { useGameSSE } from "@/hooks/use-game-sse";
import type { SSEEvent, QuestionPayload, LeaderboardEntry, ParticipantInfo } from "@/lib/game-event-bus";
import { logError } from "@/lib/error-logger";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { Podium } from "@/components/game/Podium";
import { ErrorBoundary } from "@/components/game/ErrorBoundary";
import {
  Zap, Trophy, Users, Clock, CheckCircle, XCircle,
  Loader2, Wifi, WifiOff, BookOpen, Target, Timer, Star,
  Maximize, Minimize, Flame, Volume2, VolumeX, Crown
} from "lucide-react";

type GamePhase = "lobby" | "question" | "results" | "leaderboard" | "podium";

interface SessionInfo {
  status: string;
  gameMode: string;
  category: string | null;
  difficulty: string | null;
  scoringMode: string;
  timePerQuestion: number;
  maxPlayers: number;
  questionCount: number;
  hostName: string;
  language: string;
}

const MODE_LABELS: Record<string, string> = {
  "quick-quiz": "Quick Quiz",
  "speed-round": "Speed Round",
  "sign-challenge": "Sign Challenge",
  "mixed-battle": "Mixed Battle",
  "daily-challenge": "Daily Challenge",
  "exam-simulation": "Exam Simulation",
};

const MODE_COLORS: Record<string, string> = {
  "quick-quiz": "#eab308",
  "speed-round": "#ef4444",
  "sign-challenge": "#3b82f6",
  "mixed-battle": "#a855f7",
  "daily-challenge": "#22c55e",
  "exam-simulation": "#f97316",
};

const DIFF_COLORS: Record<string, string> = {
  easy: "#22c55e", medium: "#eab308", hard: "#ef4444", mixed: "#a855f7",
};

export default function StudentGamePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const { lang, setLang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [joining, setJoining] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; pointsEarned: number } | null>(null);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [podium, setPodium] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (phase === "question" && typeof window !== "undefined") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen request blocked or failed:", err);
        });
      }
    }
  }, [phase]);

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

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    try {
      if (event.type === "lobby_update") {
        setParticipants(event.participants || []);
        // Only reset to lobby if we're not already in an active game phase
        setPhase(prev => (prev === "lobby" ? "lobby" : prev));
      } else if (event.type === "question_start") {
        if (!event.question?.answers?.length) {
          logError("Invalid question data", undefined, { event });
          return;
        }
        setCurrentQuestion(event.question);
        setQuestionIndex(event.index);
        setTotalQuestions(event.total);
        setEndsAt(event.endsAt);
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
        setAnswerResult(null);
        setCorrectAnswerId(null);
        setPhase("question");
      } else if (event.type === "question_end") {
        setCorrectAnswerId(event.correctAnswerId);
        setLeaderboard(event.leaderboard || []);
        setPhase("results");
      } else if (event.type === "leaderboard") {
        setLeaderboard(event.entries || []);
        setPhase("leaderboard");
      } else if (event.type === "session_end") {
        setPodium(event.podium || []);
        setLeaderboard(event.finalLeaderboard || []);
        setPhase("podium");
        // Play rank-specific sound after a short delay (podium reveal handles the rest)
        // The Podium component handles staggered rank sounds internally
      }
    } catch (error) {
      logError("SSE event handler error", error as Error, { event });
    }
  }, []);

  useEffect(() => {
    if (!code) { router.push("/play"); return; }

    async function joinSession() {
      try {
        // Fetch session info in parallel with join
        const [joinRes, infoRes] = await Promise.all([
          fetch(`/api/game/sessions/${code}/join`, { method: "POST", headers: { "Content-Type": "application/json" } }),
          fetch(`/api/game/sessions/${code}/info`),
        ]);

        if (infoRes.ok) {
          const info = await infoRes.json();
          setSessionInfo(info);
          if (info.language === "km") {
            setLang("kh");
          } else if (info.language === "en") {
            setLang("en");
          }
        }

        if (!joinRes.ok) {
          const data = await joinRes.json();
          if (joinRes.status === 401) { router.push(`/login?redirect=/play/${code}`); return; }
          if (joinRes.status === 403 || joinRes.status === 409) { setJoining(false); return; }
          setJoinError(data.error || "Failed to join session");
          setJoining(false);
          return;
        }
        // Capture userId from join response
        try {
          const joinData = await joinRes.json();
          if (joinData.userId) setCurrentUserId(joinData.userId);
        } catch { /* ignore */ }
        setJoining(false);
      } catch {
        setJoinError("Network error. Please try again.");
        setJoining(false);
      }
    }

    joinSession();
  }, [code, router]);

  const { connected, error } = useGameSSE(code, handleSSEEvent, !joining && !joinError);

  const unifiedHeader = (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md text-white w-full flex-shrink-0 z-40 relative">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
        <span className="text-zinc-500 text-[10px] font-black tracking-widest uppercase hidden sm:inline">STUDENT</span>
      </div>

      <div className="text-center">
        <span className="text-white text-sm font-black tracking-widest bg-zinc-900 border border-zinc-800 px-4 py-1 rounded-lg">ROOM: {code}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setMuted(m => !m)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-black transition-all ${
            muted
              ? "bg-red-950/40 border-red-500/60 text-red-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
          }`}
          title={muted ? "Unmute" : "Mute audio"}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          <span className="hidden sm:inline">{muted ? (kh ? "បើកសំឡេង" : "Unmuted") : (kh ? "បិទសំឡេង" : "Muted")}</span>
        </button>

        <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${connected ? "text-green-400" : "text-yellow-400"}`}>
          {connected ? <Wifi size={12} /> : <Loader2 size={12} className="animate-spin" />}
          <span className="hidden sm:inline">{connected ? (kh ? "ភ្ជាប់" : "Live") : (kh ? ".." : "...")}</span>
        </div>
      </div>
    </div>
  );

  const submitAnswer = useCallback(async (answerId: number) => {
    if (answerSubmitted || !currentQuestion || !code) return;
    setSelectedAnswer(answerId);
    setAnswerSubmitted(true);
    try {
      const res = await fetch(`/api/game/sessions/${code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestion.id, answerId, answeredAt: new Date().toISOString() }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnswerResult({ isCorrect: data.isCorrect, pointsEarned: data.pointsEarned });
      }
    } catch { /* silent */ }
  }, [answerSubmitted, currentQuestion, code]);

  const handleAnswerSelect = useCallback((answerId: number) => submitAnswer(answerId), [submitAnswer]);

  const DotBg = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#0d0d14", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
      {children}
    </div>
  );

  if (joining) {
    return (
      <DotBg>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-yellow-400 mb-4" />
          <p className="text-white font-black text-lg" style={khFont}>{kh ? "កំពុងចូល..." : "Joining game..."}</p>
        </div>
      </DotBg>
    );
  }

  if (joinError) {
    return (
      <DotBg>
        <div className="border-2 border-white/20 bg-white/5 p-8 max-w-md w-full text-center" style={{ boxShadow: "0 0 40px rgba(239,68,68,0.2)" }}>
          <XCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h1 className="text-xl font-black text-white mb-3" style={khFont}>{kh ? "មិនអាចចូលបាន" : "Cannot Join Game"}</h1>
          <p className="text-white/60 mb-6 text-sm" style={khFont}>{joinError}</p>
          <button onClick={() => router.push("/play")}
            className="w-full py-3 bg-yellow-400 text-black font-black border-2 border-yellow-300 transition-all hover:bg-yellow-300"
            style={{ boxShadow: "0 0 16px rgba(250,204,21,0.3)" }}>
            {kh ? "ត្រឡប់" : "Back to Play"}
          </button>
        </div>
      </DotBg>
    );
  }

  if (error || (!connected && phase === "lobby")) {
    return (
      <DotBg>
        <div className="border-2 border-white/20 bg-white/5 p-8 max-w-md w-full text-center">
          {error ? <WifiOff className="mx-auto text-red-400 mb-4" size={48} /> : <Loader2 className="animate-spin mx-auto text-yellow-400 mb-4" size={48} />}
          <h1 className="text-xl font-black text-white mb-3" style={khFont}>
            {error ? (kh ? "បាត់ការតភ្ជាប់" : "Connection Error") : (kh ? "កំពុងភ្ជាប់..." : "Connecting...")}
          </h1>
          {error && (
            <>
              <p className="text-white/50 text-sm mb-6">{error}</p>
              <button onClick={() => window.location.reload()}
                className="w-full py-3 bg-yellow-400 text-black font-black border-2 border-yellow-300">
                {kh ? "ព្យាយាមម្ដងទៀត" : "Retry"}
              </button>
            </>
          )}
        </div>
      </DotBg>
    );
  }

  if (phase === "lobby") {
    const modeColor = MODE_COLORS[sessionInfo?.gameMode ?? ""] ?? "#eab308";
    const modeLabel = MODE_LABELS[sessionInfo?.gameMode ?? ""] ?? sessionInfo?.gameMode ?? "—";
    const diffColor = DIFF_COLORS[sessionInfo?.difficulty ?? "mixed"] ?? "#a855f7";

    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden"
        style={{ backgroundColor: "#0b0b0f" }}>
        
        {/* Animated Background Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[40%] rounded-full blur-[140px] opacity-[0.06] animate-pulse pointer-events-none" style={{ backgroundColor: modeColor, animationDuration: "8s" }} />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[40%] rounded-full blur-[140px] opacity-[0.06] animate-pulse pointer-events-none" style={{ backgroundColor: "#a855f7", animationDuration: "12s" }} />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[30%] rounded-full blur-[160px] opacity-[0.04] pointer-events-none" style={{ backgroundColor: "#3b82f6" }} />

        {/* Dynamic Dot Pattern Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.35] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 w-full flex-shrink-0">
          {unifiedHeader}
        </div>

        {/* Scrollable container with glassmorphic cards */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 py-6 flex flex-col items-center justify-start gap-6 max-w-lg mx-auto w-full">
          
          {/* Header Status Badge */}
          <div className="flex items-center gap-2.5 px-4.5 py-2 rounded-full border border-red-500/30 bg-red-950/30 text-red-400 text-[10px] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(239,68,68,0.15)] select-none">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute" />
            <span style={khFont}>{kh ? "វគ្គផ្សាយផ្ទាល់" : "Live Session"}</span>
          </div>

          {/* Hosted by & Game Code VIP Card */}
          <div className="w-full border-2 border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl text-center relative overflow-hidden shadow-2xl transition-all hover:border-zinc-700/50"
            style={{ boxShadow: `0 20px 40px -15px rgba(0,0,0,0.8), 0 0 35px ${modeColor}10` }}>
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px]" style={{ backgroundColor: modeColor, opacity: 0.12 }} />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[80px]" style={{ backgroundColor: modeColor, opacity: 0.12 }} />
            
            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1.5" style={khFont}>
              {kh ? "ម្ចាស់បន្ទប់" : "Hosted by"}
            </div>
            
            <div className="text-white font-black text-3xl mb-6 tracking-wide drop-shadow-md flex items-center justify-center gap-1.5" style={khFont}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">{sessionInfo?.hostName ?? "—"}</span>
              <Crown size={16} className="text-yellow-400 fill-yellow-400/20" />
            </div>

            {/* Glowing Big Game Code Container */}
            <div className="inline-block px-8 py-4 border-2 border-zinc-800 bg-zinc-950/90 rounded-2xl mb-4.5 relative group cursor-pointer transition-all hover:border-zinc-700 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
              {/* Pulsing Backglow */}
              <div className="absolute inset-0 rounded-2xl blur-lg opacity-25 transition-opacity group-hover:opacity-40" style={{ backgroundColor: modeColor }} />
              
              <div className="relative font-black text-5xl tracking-[0.25em] pl-[0.25em] select-all select-none group-active:scale-[0.98] transition-transform" 
                style={{ color: modeColor, textShadow: `0 0 15px ${modeColor}90` }}>
                {code}
              </div>
            </div>
            
            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest" style={khFont}>
              {kh ? "លេខកូដចូលរួមហ្គេម" : "Game Room Code"}
            </div>
          </div>

          {/* Settings Grid Panel */}
          {sessionInfo && (
            <div className="w-full grid grid-cols-2 gap-3 animate-fade-in">
              {/* Game Mode */}
              <div className="border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 transition-all hover:border-zinc-700/60 hover:-translate-y-0.5 shadow-md">
                <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded-lg flex-shrink-0">
                  <BookOpen size={16} style={{ color: modeColor }} />
                </div>
                <div className="min-w-0">
                  <div className="text-zinc-500 text-[9px] font-black uppercase tracking-wider" style={khFont}>{kh ? "របៀបលេង" : "Game Mode"}</div>
                  <div className="text-white font-black text-sm truncate" style={{ color: modeColor }}>{modeLabel}</div>
                </div>
              </div>
              
              {/* Category */}
              <div className="border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 transition-all hover:border-zinc-700/60 hover:-translate-y-0.5 shadow-md">
                <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded-lg flex-shrink-0">
                  <Target size={16} className="text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-zinc-500 text-[9px] font-black uppercase tracking-wider" style={khFont}>{kh ? "ប្រភេទ" : "Category"}</div>
                  <div className="text-white font-black text-sm capitalize truncate">{sessionInfo.category?.replace(/-/g, " ") ?? "—"}</div>
                </div>
              </div>
              
              {/* Difficulty */}
              <div className="border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 transition-all hover:border-zinc-700/60 hover:-translate-y-0.5 shadow-md">
                <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded-lg flex-shrink-0">
                  <Star size={16} style={{ color: diffColor }} />
                </div>
                <div className="min-w-0">
                  <div className="text-zinc-500 text-[9px] font-black uppercase tracking-wider" style={khFont}>{kh ? "កម្រិត" : "Difficulty"}</div>
                  <div className="font-black text-sm capitalize truncate" style={{ color: diffColor }}>
                    {sessionInfo.difficulty ?? "Mixed"}
                  </div>
                </div>
              </div>
              
              {/* Time per Question */}
              <div className="border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 transition-all hover:border-zinc-700/60 hover:-translate-y-0.5 shadow-md">
                <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded-lg flex-shrink-0">
                  <Timer size={16} className="text-green-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-zinc-500 text-[9px] font-black uppercase tracking-wider" style={khFont}>{kh ? "ពេលវេលា" : "Time / Q"}</div>
                  <div className="text-white font-black text-sm">{sessionInfo.timePerQuestion}s</div>
                </div>
              </div>
              
              {/* Scoring */}
              <div className="border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 transition-all hover:border-zinc-700/60 hover:-translate-y-0.5 shadow-md">
                <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded-lg flex-shrink-0">
                  <Trophy size={16} className="text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-zinc-500 text-[9px] font-black uppercase tracking-wider" style={khFont}>{kh ? "ពិន្ទុ" : "Scoring"}</div>
                  <div className="text-white font-black text-sm capitalize">{sessionInfo.scoringMode}</div>
                </div>
              </div>
              
              {/* Questions count */}
              <div className="border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 transition-all hover:border-zinc-700/60 hover:-translate-y-0.5 shadow-md">
                <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded-lg flex-shrink-0">
                  <Zap size={16} className="text-orange-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-zinc-500 text-[9px] font-black uppercase tracking-wider" style={khFont}>{kh ? "សំណួរ" : "Questions"}</div>
                  <div className="text-white font-black text-sm">{sessionInfo.questionCount}Q</div>
                </div>
              </div>
            </div>
          )}

          {/* Language Selection Card */}
          {sessionInfo && (
            <div className="w-full border-2 border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-5 rounded-2xl shadow-xl transition-all hover:border-zinc-700/50">
              <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3.5 text-center" style={khFont}>
                {kh ? "ជ្រើសរើសភាសាក្នុងហ្គេម" : "Game Language Selection"}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { if (sessionInfo.language === "both") setLang("kh"); }}
                  disabled={sessionInfo.language !== "both"}
                  className={`flex-1 py-3 px-4 border rounded-xl font-black text-xs transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 ${
                    lang === "kh"
                      ? "bg-yellow-400 border-yellow-400 text-black shadow-[0_4px_12px_rgba(250,204,21,0.25)] scale-[1.02]"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/40"
                  } ${sessionInfo.language !== "both" ? "cursor-not-allowed opacity-50" : ""}`}
                  style={{ fontFamily: "Siemreap, sans-serif" }}
                >
                  ខ្មែរ (Khmer)
                  {sessionInfo.language === "km" && <span className="text-[9px] opacity-60 font-bold">({kh ? "គ្រូកំណត់" : "Forced"})</span>}
                </button>
                <button
                  onClick={() => { if (sessionInfo.language === "both") setLang("en"); }}
                  disabled={sessionInfo.language !== "both"}
                  className={`flex-1 py-3 px-4 border rounded-xl font-black text-xs transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 ${
                    lang === "en"
                      ? "bg-yellow-400 border-yellow-400 text-black shadow-[0_4px_12px_rgba(250,204,21,0.25)] scale-[1.02]"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/40"
                  } ${sessionInfo.language !== "both" ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  English
                  {sessionInfo.language === "en" && <span className="text-[9px] opacity-60 font-bold">({kh ? "គ្រូកំណត់" : "Forced"})</span>}
                </button>
              </div>
            </div>
          )}

          {/* Active Players Roster */}
          <div className="w-full border-2 border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-5 rounded-2xl shadow-xl transition-all hover:border-zinc-700/50">
            <div className="flex items-center gap-2.5 mb-4">
              <Users size={14} className="text-zinc-500" />
              <span className="text-zinc-400 text-xs font-black uppercase tracking-widest" style={khFont}>
                {kh ? "អ្នកចូលរួម" : "Players Joined"} · {participants.length}{sessionInfo ? ` / ${sessionInfo.maxPlayers}` : ""}
              </span>
              <div className="flex-1 h-px bg-zinc-800/80" />
            </div>
            
            {participants.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 max-h-40 overflow-y-auto pr-1 no-scrollbar w-full justify-start">
                {participants.map((p) => (
                  <div key={p.userId}
                    className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 bg-zinc-950/80 rounded-xl transition-all duration-300 hover:border-zinc-700">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] text-white flex-shrink-0 relative group"
                      style={{ background: `hsl(${(p.userId * 61) % 360}, 60%, 45%)` }}>
                      {p.displayName.charAt(0).toUpperCase()}
                      {p.isConnected && (
                        <span className="absolute inset-0 rounded-full border border-green-400 animate-ping opacity-60 pointer-events-none" />
                      )}
                    </div>
                    <span className="text-zinc-300 text-xs font-black truncate max-w-[90px]" style={khFont}>{p.displayName}</span>
                    <div className="relative flex h-2 w-2 flex-shrink-0">
                      {p.isConnected ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-xs font-bold animate-pulse" style={khFont}>
                {kh ? "អ្នកគឺគ្រាប់ពូជដំបូង! កំពុងរង់ចាំអ្នកដទៃ..." : "You're the first one here! Waiting for others..."}
              </div>
            )}
          </div>

          {/* Footer Waiting Banner */}
          <div className="flex items-center gap-3 px-5 py-3 border border-yellow-400/20 bg-yellow-400/5 rounded-full text-yellow-400/90 text-sm font-black tracking-wide animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.05)] w-full justify-center select-none" style={khFont}>
            <Loader2 size={16} className="animate-spin text-yellow-400 flex-shrink-0" />
            <span>{kh ? "រង់ចាំគ្រូចាប់ផ្តើមល្បែង..." : "Waiting for host to start..."}</span>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "question" && currentQuestion) {
    if (!currentQuestion.answers?.length) {
      return (
        <div className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "#0d0d14" }}>
          <Loader2 className="animate-spin h-10 w-10 text-yellow-400" />
        </div>
      );
    }

    const timePerQuestion = endsAt
      ? Math.max(5, Math.round((new Date(endsAt).getTime() - Date.now()) / 1000))
      : sessionInfo?.timePerQuestion ?? 30;

    const myScore = leaderboard.find(e => e.userId === currentUserId)?.totalScore ?? 0;
    const myStreak = leaderboard.find(e => e.userId === currentUserId)?.currentStreak ?? 0;

    return (
      <div className="game-dot-bg fixed inset-0 z-50 flex flex-col" style={{ userSelect: "none" }}>
        <div className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex-shrink-0 h-14">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/40 border border-red-500 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-black text-[9px] tracking-widest uppercase">LIVE</span>
            </div>
            <span className="text-zinc-400 font-black text-xs uppercase tracking-widest hidden sm:inline" style={khFont}>
              {sessionInfo ? (MODE_LABELS[sessionInfo.gameMode] ?? sessionInfo.gameMode) : code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-yellow-400 border border-zinc-950 px-3 py-1 rounded-lg shadow-md">
              <Zap size={12} className="text-black" />
              <span className="font-black text-black text-sm tabular-nums">{myScore.toLocaleString()}</span>
            </div>
            {myStreak > 1 && (
              <div className="flex items-center gap-1 bg-orange-500 border border-zinc-950 px-2.5 py-1 rounded-lg shadow-md">
                <Flame size={12} className="text-white animate-pulse" />
                <span className="font-black text-white text-xs">x{myStreak}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setMuted(m => !m)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-black transition-all ${
              muted
                ? "bg-red-950/40 border-red-500/60 text-red-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
            }`}
            title={muted ? (kh ? "បើកសំឡេង" : "Unmute") : (kh ? "បិទសំឡេង" : "Mute")}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span className="hidden sm:inline text-[10px] uppercase tracking-wider">{muted ? "Unmute" : "Mute"}</span>
          </button>
        </div>

        <div className="h-1.5 bg-zinc-800 flex-shrink-0">
          <div
            className="h-full bg-yellow-400 transition-all duration-500"
            style={{ width: `${totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0}%` }}
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col p-4 gap-4 max-w-2xl mx-auto w-full justify-center overflow-y-auto min-h-0">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl h-14 flex-shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap">
              <span className="shrink-0 text-zinc-300 text-xs font-black uppercase tracking-widest bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700/80" style={khFont}>
                {kh ? `${questionIndex + 1}/${totalQuestions}` : `Q ${questionIndex + 1} / ${totalQuestions}`}
              </span>
              <span className="shrink-0 text-yellow-400 font-black text-xs uppercase bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/30" style={khFont}>
                {currentQuestion.difficulty || "Mixed"}
              </span>
              {(currentQuestion as any).topicCode && (
                <span className="shrink-0 text-zinc-400 font-mono text-xs bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700/80 tracking-wider">
                  {(currentQuestion as any).topicCode.trim()}
                </span>
              )}
            </div>
            {endsAt && (
              <div className="shrink-0 scale-90 origin-right">
                <CountdownTimer
                  endsAt={endsAt}
                  totalSeconds={timePerQuestion}
                  onExpire={() => {}}
                  muted={muted}
                />
              </div>
            )}
          </div>

          <div className="shrink-0 w-full h-48 border border-zinc-800 bg-zinc-950/40 rounded-xl flex items-center justify-center p-3 relative overflow-hidden backdrop-blur-sm">
            {currentQuestion.imageUrl && currentQuestion.gameType !== "image_pick" ? (
              <img src={currentQuestion.imageUrl} alt="question" className="h-full w-auto object-contain select-none pointer-events-none rounded" />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-15">
                <BookOpen size={48} className="text-zinc-400" />
                <span className="font-black text-[10px] tracking-wider uppercase text-zinc-400">Kesararam Quiz</span>
              </div>
            )}
          </div>

          <div
            className="shrink-0 w-full h-32 bg-zinc-900/90 backdrop-blur-md border-2 border-zinc-750/85 p-4 rounded-xl text-white font-black flex items-center justify-center text-center shadow-lg overflow-y-auto select-text animate-fade-in"
            style={{
              boxShadow: "0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
              fontSize: "clamp(1.1rem, 4vw, 1.75rem)",
              lineHeight: "1.3",
              ...khFont
            }}
          >
            <div className="w-full max-h-full py-1">
              {kh ? (currentQuestion.questionKm || currentQuestion.questionEn) : currentQuestion.questionEn}
            </div>
          </div>

          <div className="shrink-0 min-h-[176px]">
            <ErrorBoundary fallback={
              <div className="text-center p-8 border border-red-500/30 bg-red-500/10 rounded-xl">
                <XCircle className="mx-auto text-red-400 mb-3" size={32} />
                <p className="text-white font-bold text-sm">Failed to load answers</p>
                <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-500 text-white font-bold text-sm rounded">Reload</button>
              </div>
            }>
              <AnswerGrid
                answers={currentQuestion.answers}
                selectedId={selectedAnswer}
                correctId={correctAnswerId}
                disabled={answerSubmitted}
                lang={lang}
                gameType={currentQuestion.gameType}
                onSelect={handleAnswerSelect}
              />
            </ErrorBoundary>
          </div>

          <div className="shrink-0 h-24 flex items-center justify-center w-full">
            {answerResult ? (
              <div
                className={`w-full border-2 p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  answerResult.isCorrect
                    ? "border-green-400 bg-green-500/10"
                    : "border-red-400 bg-red-500/10"
                }`}
                style={{
                  boxShadow: answerResult.isCorrect
                    ? "0 0 20px rgba(74,222,128,0.15), 2px 2px 0 rgba(74,222,128,0.3)"
                    : "0 0 20px rgba(239,68,68,0.15), 2px 2px 0 rgba(239,68,68,0.3)",
                }}
              >
                <div className="flex items-center gap-2">
                  {answerResult.isCorrect
                    ? <CheckCircle className="text-green-400" size={20} />
                    : <XCircle className="text-red-400" size={20} />}
                  <span className="text-white font-black text-base" style={khFont}>
                    {answerResult.isCorrect ? (kh ? "ត្រូវ!" : "Correct!") : (kh ? "មិនត្រូវ" : "Incorrect")}
                  </span>
                </div>
                {answerResult.pointsEarned > 0 && (
                  <div
                    className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 border border-black rounded-lg animate-bounce"
                    style={{ boxShadow: "2px 2px 0 #000" }}
                  >
                    <Zap size={12} className="text-black" />
                    <span className="text-black font-black text-xs">+{answerResult.pointsEarned} pts</span>
                  </div>
                )}
              </div>
            ) : answerSubmitted ? (
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm font-bold animate-pulse" style={khFont}>
                <Loader2 size={16} className="animate-spin text-yellow-400" />
                {kh ? "រង់ចាំ..." : "Waiting for result..."}
              </div>
            ) : (
              <div className="text-zinc-600 text-xs font-medium tracking-wide uppercase select-none opacity-40" style={khFont}>
                {kh ? "ជ្រើសរើសចម្លើយរបស់អ្នក" : "Choose your answer"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results" || phase === "leaderboard") {
    return (
      <div className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#0d0d14", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
        {unifiedHeader}
        <div className="flex-1 p-4 max-w-lg mx-auto w-full pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-yellow-400" />
            <span className="text-white font-black text-sm uppercase tracking-widest" style={khFont}>
              {kh ? "ចំណាត់ថ្នាក់" : "Leaderboard"}
            </span>
          </div>
          <LeaderboardPanel entries={leaderboard} lang={lang} />
        </div>
      </div>
    );
  }

  // ── Podium ─────────────────────────────────────────────────────────────────
  if (phase === "podium") {
    return (
      <div className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#0d0d14", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
        {unifiedHeader}
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full pt-6">
          <Podium podium={podium} finalLeaderboard={leaderboard} lang={lang} currentUserId={currentUserId} onPlayAgain={() => router.push("/play")} sessionCode={code} totalQuestions={totalQuestions} />
        </div>
      </div>
    );
  }

  return null;
}
