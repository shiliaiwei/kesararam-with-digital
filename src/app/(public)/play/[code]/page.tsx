"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { useGameRealtime } from "@/hooks/use-game-realtime";
import type { SSEEvent, QuestionPayload, LeaderboardEntry, ParticipantInfo } from "@/lib/game-event-bus";
import { logError } from "@/lib/error-logger";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { Podium } from "@/components/game/Podium";
import { ErrorBoundary } from "@/components/game/ErrorBoundary";
import { sounds } from "@/lib/game-sounds";
import { RankBadge as TierBadge } from "@/components/shared/rank-label";
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
  hostAvatar: string | null;
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

interface NeubrutalistAvatarProps {
  src: string | null | undefined;
  initials: string;
  userId: number;
}

function NeubrutalistAvatar({ src, initials, userId }: NeubrutalistAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white font-black"
        style={{ 
          background: `linear-gradient(135deg, hsl(${(userId * 61) % 360}, 70%, 45%) 0%, hsl(${(userId * 61 + 45) % 360}, 70%, 35%) 100%)`,
        }}>
        {initials}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={initials} 
      className="w-full h-full object-cover" 
      onError={() => setFailed(true)} 
    />
  );
}

function TeacherAvatar({ src, name }: { src: string | null | undefined; name: string }) {
  const [failed, setFailed] = useState(false);
  
  if (!src || failed) {
    return (
      <div className="w-16 h-16 border-4 border-black mx-auto mb-3 shadow-[4px_4px_0_#000] bg-black rounded-none flex items-center justify-center text-yellow-400">
        <Crown size={28} className="fill-yellow-400" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 border-4 border-black mx-auto mb-3 shadow-[4px_4px_0_#000] overflow-hidden bg-white rounded-none">
      <img 
        src={src} 
        alt={name} 
        className="w-full h-full object-cover" 
        onError={() => setFailed(true)} 
      />
    </div>
  );
}

function sanitizeError(err: any): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    if (err.message && typeof err.message === "string") return err.message;
    if (err.error && typeof err.error === "string") return err.error;
    try {
      return JSON.stringify(err);
    } catch {
      return "An unexpected error occurred";
    }
  }
  return String(err);
}

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

  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const [currentUserPoints, setCurrentUserPoints] = useState<number>(0);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string>("");

  useEffect(() => {
    fetch("/api/user/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats?.lifetimePoints) {
          setCurrentUserPoints(data.stats.lifetimePoints);
        }
        if (data?.user?.displayName) {
          setCurrentUserDisplayName(data.user.displayName);
        } else if (data?.user?.name) {
          setCurrentUserDisplayName(data.user.name);
        }
      })
      .catch(() => {});
  }, []);
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
  const [resultsTab, setResultsTab] = useState<"result" | "leaderboard">("result");

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
        if (event.forceLobby) {
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
          setAnswerResult(null);
          setCorrectAnswerId(null);
          setPhase("lobby");
        } else {
          setPhase(prev => (prev === "lobby" ? "lobby" : prev));
        }
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
        setResultsTab("result");
        setPhase("question");
        if (!mutedRef.current) sounds.question_start();
      } else if (event.type === "question_end") {
        setCorrectAnswerId(event.correctAnswerId);
        setLeaderboard(event.leaderboard || []);
        setResultsTab("result");
        setPhase("results");
        if (!mutedRef.current) sounds.question_end();
      } else if (event.type === "leaderboard") {
        setLeaderboard(event.entries || []);
        setPhase("leaderboard");
      } else if (event.type === "session_end") {
        setPodium(event.podium || []);
        setLeaderboard(event.finalLeaderboard || []);
        setPhase("podium");
        if (!mutedRef.current) sounds.podium();
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
          setJoinError(sanitizeError(data.error) || "Failed to join session");
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

  const { connected, error } = useGameRealtime(code, handleSSEEvent, !joining && !joinError);

  const unifiedHeader = (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md text-white w-full flex-shrink-0 z-40 relative">
      <div className="flex items-center gap-2 max-w-[160px] sm:max-w-xs overflow-hidden">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
        <span className="text-zinc-200 text-xs font-black truncate hidden sm:inline" style={khFont}>
          {currentUserDisplayName || "STUDENT"}
        </span>
        {currentUserPoints > 0 && (
          <span className="shrink-0 flex items-center">
            <TierBadge lifetimePoints={currentUserPoints} size="xs" lang={kh ? "kh" : "en"} />
          </span>
        )}
      </div>

      <div className="text-center">
        {phase === "lobby" ? (
          <span className="text-zinc-400 text-xs font-black tracking-widest bg-zinc-900 border border-zinc-850 px-4 py-1 rounded-none uppercase" style={khFont}>
            {kh ? "បន្ទប់រង់ចាំ" : "Lobby Room"}
          </span>
        ) : (
          <span className="text-white text-sm font-black tracking-widest bg-zinc-900 border border-zinc-800 px-4 py-1 rounded-none">ROOM: {code}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setMuted(m => !m)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-none border text-xs font-black transition-all ${
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
        if (!mutedRef.current) {
          if (data.isCorrect) {
            sounds.correct();
          } else {
            sounds.incorrect();
          }
        }
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
    const modeColor = "#fbbf24"; // Always high-contrast Neo-Brutalist Amber Yellow
    const modeLabel = MODE_LABELS[sessionInfo?.gameMode ?? ""] ?? sessionInfo?.gameMode ?? "—";
    const diffColor = DIFF_COLORS[sessionInfo?.difficulty ?? "mixed"] ?? "#a855f7";

    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden animate-fade-in"
        style={{ 
          backgroundColor: "#0d0d10",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}>
        
        {/* Neon Ambient Grid Backglows */}
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[40%] rounded-none blur-[150px] opacity-[0.1] pointer-events-none" style={{ backgroundColor: "#fbbf24" }} />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[40%] rounded-none blur-[150px] opacity-[0.1] pointer-events-none" style={{ backgroundColor: "#f43f5e" }} />

        <div className="relative z-10 w-full flex-shrink-0">
          {unifiedHeader}
        </div>

        {/* Scrollable container with high-impact neubrutalist cards */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4.5 py-6 flex flex-col items-center justify-start gap-5 max-w-lg mx-auto w-full">
          
          {/* Header Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-red-500 text-black text-[10px] font-black tracking-widest uppercase shadow-[3px_3px_0_#000] select-none rounded-none animate-pulse">
            <span className="w-1.5 h-1.5 bg-black animate-ping" />
            <span className="w-1.5 h-1.5 bg-black absolute" />
            <span style={khFont}>{kh ? "បន្ទប់រង់ចាំត្រៀមលេង" : "PREPARATION LOBBY"}</span>
          </div>

          {/* Hosted by & Game Code Console Card */}
          <div className="w-full border-4 border-black bg-yellow-400 p-6 rounded-none text-center relative overflow-hidden shadow-[8px_8px_0_#000] transition-all duration-300">
            {/* Retro grid accent on the card itself */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: "linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)", backgroundSize: "20px 20px" }} />
            
            <div className="text-black text-[10px] font-black uppercase tracking-widest mb-3.5" style={khFont}>
              {kh ? "គ្រូបង្វឹក" : "INSTRUCTOR"}
            </div>

            <TeacherAvatar src={sessionInfo?.hostAvatar} name={sessionInfo?.hostName ?? "Teacher"} />
            
            <div className="text-black font-black text-3xl mb-5 tracking-wide flex items-center justify-center gap-2 flex-wrap" style={khFont}>
              <span>{sessionInfo?.hostName ?? "—"}</span>
              <span className="bg-black text-yellow-400 px-2 py-0.5 border-2 border-black rounded-none text-[9px] font-black tracking-widest uppercase flex items-center gap-1 shrink-0">
                <Crown size={8} className="fill-yellow-400 shrink-0 text-yellow-400" />
                {kh ? "គ្រូ" : "TEACHER"}
              </span>
            </div>

            {/* Glowing Big Game Code Container */}
            <div className="block w-full px-6 py-4 border-4 border-black bg-white rounded-none shadow-[5px_5px_0_#000] mb-4 relative group cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000] text-center select-all">
              <div className="font-mono font-black text-3xl sm:text-5xl tracking-[0.25em] pl-[0.25em] text-black text-center break-all select-none">
                {code}
              </div>
            </div>
            
            <div className="text-black text-[9px] font-black uppercase tracking-widest" style={khFont}>
              {kh ? "លេខកូដចូលបន្ទប់លេង" : "GAME JOIN CODE"}
            </div>
          </div>

          {/* Settings HUD Panel */}
          {sessionInfo && (
            <div className="w-full grid grid-cols-2 gap-3.5 animate-fade-in">
              {/* Game Mode */}
              <div className="border-4 border-black bg-amber-400 shadow-[4px_4px_0_#000] p-4 rounded-none flex items-center gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]">
                <div className="p-2 bg-white border-2 border-black rounded-none flex-shrink-0 shadow-[1px_1px_0_#000]">
                  <BookOpen size={14} className="text-black" />
                </div>
                <div className="min-w-0 text-black">
                  <div className="text-black/60 text-[8px] font-black uppercase tracking-wider" style={khFont}>{kh ? "របៀបលេង" : "GAME MODE"}</div>
                  <div className="font-black text-xs truncate" style={khFont}>{modeLabel}</div>
                </div>
              </div>
              
              {/* Category */}
              <div className="border-4 border-black bg-blue-400 shadow-[4px_4px_0_#000] p-4 rounded-none flex items-center gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]">
                <div className="p-2 bg-white border-2 border-black rounded-none flex-shrink-0 shadow-[1px_1px_0_#000]">
                  <Target size={14} className="text-black" />
                </div>
                <div className="min-w-0 text-black">
                  <div className="text-black/60 text-[8px] font-black uppercase tracking-wider" style={khFont}>{kh ? "ប្រភេទ" : "CATEGORY"}</div>
                  <div className="font-black text-xs capitalize truncate" style={khFont}>{sessionInfo.category?.replace(/-/g, " ") ?? "—"}</div>
                </div>
              </div>
              
              {/* Difficulty */}
              <div className="border-4 border-black bg-purple-400 shadow-[4px_4px_0_#000] p-4 rounded-none flex items-center gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]">
                <div className="p-2 bg-white border-2 border-black rounded-none flex-shrink-0 shadow-[1px_1px_0_#000]">
                  <Star size={14} className="text-black" />
                </div>
                <div className="min-w-0 text-black">
                  <div className="text-black/60 text-[8px] font-black uppercase tracking-wider" style={khFont}>{kh ? "កម្រិត" : "DIFFICULTY"}</div>
                  <div className="font-black text-xs capitalize truncate" style={khFont}>
                    {sessionInfo.difficulty ?? "Mixed"}
                  </div>
                </div>
              </div>
              
              {/* Time per Question */}
              <div className="border-4 border-black bg-emerald-400 shadow-[4px_4px_0_#000] p-4 rounded-none flex items-center gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]">
                <div className="p-2 bg-white border-2 border-black rounded-none flex-shrink-0 shadow-[1px_1px_0_#000]">
                  <Timer size={14} className="text-black" />
                </div>
                <div className="min-w-0 text-black">
                  <div className="text-black/60 text-[8px] font-black uppercase tracking-wider" style={khFont}>{kh ? "ពេលវេលា" : "TIME / Q"}</div>
                  <div className="font-black text-xs">{sessionInfo.timePerQuestion}s</div>
                </div>
              </div>
              
              {/* Scoring */}
              <div className="border-4 border-black bg-orange-400 shadow-[4px_4px_0_#000] p-4 rounded-none flex items-center gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]">
                <div className="p-2 bg-white border-2 border-black rounded-none flex-shrink-0 shadow-[1px_1px_0_#000]">
                  <Trophy size={14} className="text-black" />
                </div>
                <div className="min-w-0 text-black">
                  <div className="text-black/60 text-[8px] font-black uppercase tracking-wider" style={khFont}>{kh ? "ពិន្ទុ" : "SCORING"}</div>
                  <div className="font-black text-xs capitalize" style={khFont}>{sessionInfo.scoringMode}</div>
                </div>
              </div>
              
              {/* Questions count */}
              <div className="border-4 border-black bg-pink-400 shadow-[4px_4px_0_#000] p-4 rounded-none flex items-center gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]">
                <div className="p-2 bg-white border-2 border-black rounded-none flex-shrink-0 shadow-[1px_1px_0_#000]">
                  <Zap size={14} className="text-black" />
                </div>
                <div className="min-w-0 text-black">
                  <div className="text-black/60 text-[8px] font-black uppercase tracking-wider" style={khFont}>{kh ? "សំណួរ" : "QUESTIONS"}</div>
                  <div className="font-black text-xs">{sessionInfo.questionCount}Q</div>
                </div>
              </div>
            </div>
          )}

          {/* Language Selection Card */}
          {sessionInfo && (
            <div className="w-full border-4 border-black bg-zinc-900 p-5 rounded-none shadow-[6px_6px_0_#000] text-white">
              <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3.5 text-center" style={khFont}>
                {kh ? "ជ្រើសរើសភាសាក្នុងហ្គេម" : "GAME LANGUAGE SELECTION"}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { if (sessionInfo.language === "both") setLang("kh"); }}
                  disabled={sessionInfo.language !== "both"}
                  className={`flex-1 py-3 px-4 border-2 border-black rounded-none font-black text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    lang === "kh"
                      ? "bg-yellow-400 border-yellow-400 text-black shadow-[4px_4px_0_#000] -translate-x-0.5 -translate-y-0.5"
                      : "bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-850"
                  } ${sessionInfo.language !== "both" ? "cursor-not-allowed opacity-50" : ""}`}
                  style={{ fontFamily: "Siemreap, sans-serif" }}
                >
                  ខ្មែរ (Khmer)
                  {sessionInfo.language === "km" && <span className="text-[8px] opacity-60 font-bold">({kh ? "គ្រូ" : "Locked"})</span>}
                </button>
                <button
                  onClick={() => { if (sessionInfo.language === "both") setLang("en"); }}
                  disabled={sessionInfo.language !== "both"}
                  className={`flex-1 py-3 px-4 border-2 border-black rounded-none font-black text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    lang === "en"
                      ? "bg-yellow-400 border-yellow-400 text-black shadow-[4px_4px_0_#000] -translate-x-0.5 -translate-y-0.5"
                      : "bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-850"
                  } ${sessionInfo.language !== "both" ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  English
                  {sessionInfo.language === "en" && <span className="text-[8px] opacity-60 font-bold">({kh ? "គ្រូ" : "Locked"})</span>}
                </button>
              </div>
            </div>
          )}

          {/* Active Players Multiplayer HUD Card */}
          <div className="w-full border-4 border-black bg-zinc-900 p-5 rounded-none shadow-[6px_6px_0_#000] text-white">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-zinc-400" />
              <span className="text-zinc-300 text-[10px] font-black uppercase tracking-widest" style={khFont}>
                {kh ? "អ្នកចូលរួមលេង" : "ACTIVE PARTICIPANTS"} · {participants.length}{sessionInfo ? ` / ${sessionInfo.maxPlayers}` : ""}
              </span>
              <div className="flex-1 h-[2px] bg-zinc-800 ml-2" />
            </div>
            
            {participants.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-h-48 overflow-y-auto no-scrollbar">
                {participants.map((p) => {
                  const isMe = p.userId === currentUserId;
                  return (
                    <div key={p.userId}
                      className={`flex items-center gap-2.5 p-2.5 border-2 border-black transition-all duration-300 rounded-none shadow-[2px_2px_0_#000] ${
                        isMe 
                          ? "bg-yellow-400 border-yellow-400 text-black shadow-[4px_4px_0_#000] -translate-x-0.5 -translate-y-0.5" 
                          : "bg-black border-zinc-800 hover:border-zinc-750"
                      }`}>
                      {/* Neubrutalist Avatar */}
                      <div className="w-8 h-8 rounded-none border-2 border-black flex items-center justify-center font-black text-xs text-white flex-shrink-0 relative shadow-[1px_1px_0_#000] overflow-hidden bg-white">
                        <NeubrutalistAvatar src={p.avatar} initials={p.displayName.charAt(0).toUpperCase()} userId={p.userId} />
                        {p.isConnected && (
                          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-xs font-black truncate ${isMe ? "text-black" : "text-zinc-200"}`} style={khFont}>
                            {p.displayName}
                          </span>
                          {isMe && currentUserPoints > 0 && (
                            <TierBadge lifetimePoints={currentUserPoints} size="xs" lang={lang} />
                          )}
                        </div>
                        <div className={`text-[7.5px] font-black uppercase tracking-widest ${isMe ? "text-black/60" : "text-zinc-500"}`}>
                          {isMe ? (kh ? "រូបអ្នក" : "YOU") : (kh ? "បានចូល" : "READY")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-xs font-black animate-pulse" style={khFont}>
                {kh ? "អ្នកគឺគ្រាប់ពូជដំបូង! កំពុងរង់ចាំអ្នកដទៃ..." : "You're the first one here! Waiting for others..."}
              </div>
            )}
          </div>

          {/* Holographic Breathing Wave Loader waiting panel */}
          <div className="w-full border-4 border-black bg-zinc-900 p-5 rounded-none shadow-[6px_6px_0_#000] text-center relative overflow-hidden">
            <div className="w-10 h-10 border-2 border-yellow-400 rounded-none flex items-center justify-center mx-auto mb-3 relative bg-black shadow-[2px_2px_0_#000]">
              <Loader2 size={16} className="animate-spin text-yellow-400" />
            </div>
            <div className="text-zinc-200 text-xs font-black tracking-wide uppercase mb-0.5 animate-pulse" style={khFont}>
              {kh ? "កំពុងរង់ចាំអ្នករៀបចំ..." : "Waiting for Host to Launch"}
            </div>
            <div className="text-zinc-500 text-[9px] font-bold tracking-widest uppercase">
              {kh ? "ហ្គេមនឹងចាប់ផ្តើមភ្លាមៗ" : "Game will commence momentarily"}
            </div>

            {/* Premium Retro Warning Stripes Strip on loader */}
            <div className="absolute bottom-0 left-0 right-0 h-2" 
              style={{
                backgroundImage: "repeating-linear-gradient(-45deg, #fbbf24, #fbbf24 10px, #000 10px, #000 20px)"
              }} />
          </div>
        </div>
      </div>
    );
  }

  if ((phase === "question" || phase === "results" || phase === "leaderboard") && currentQuestion) {
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
      <div className="game-dot-bg fixed inset-0 z-50 flex flex-col rounded-none" style={{ userSelect: "none" }}>
        <div className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex-shrink-0 h-14 rounded-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/40 border border-red-500 rounded-none">
              <span className="w-1.5 h-1.5 rounded-none bg-red-500 animate-pulse" />
              <span className="text-red-400 font-black text-[9px] tracking-widest uppercase">LIVE</span>
            </div>
            <span className="text-zinc-400 font-black text-xs uppercase tracking-widest hidden sm:inline" style={khFont}>
              {sessionInfo ? (MODE_LABELS[sessionInfo.gameMode] ?? sessionInfo.gameMode) : code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-yellow-400 border border-zinc-950 px-3 py-1 rounded-none">
              <Zap size={12} className="text-black" />
              <span className="font-black text-black text-sm tabular-nums">{myScore.toLocaleString()}</span>
            </div>
            {myStreak > 1 && (
              <div className="flex items-center gap-1 bg-orange-500 border border-zinc-950 px-2.5 py-1 rounded-none">
                <Flame size={12} className="text-white animate-pulse" />
                <span className="font-black text-white text-xs">x{myStreak}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setMuted(m => !m)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-none border text-xs font-black transition-all ${
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

        <div className="relative z-10 flex-1 flex flex-col p-2.5 sm:p-4 gap-2 max-w-2xl mx-auto w-full justify-start sm:justify-center overflow-hidden min-h-0">
          {/* Subtle Stats Row (Low Capacity) */}
          <div className="flex items-center justify-between gap-2 px-1 w-full bg-transparent border-0 flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap">
              <span className="shrink-0 text-zinc-300 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-zinc-850 px-2.5 py-1 rounded-none border border-zinc-800" style={khFont}>
                {kh ? `${questionIndex + 1}/${totalQuestions}` : `Q ${questionIndex + 1} / ${totalQuestions}`}
              </span>
              <span className="shrink-0 text-yellow-400 text-[10px] sm:text-xs font-black uppercase bg-yellow-400/10 px-2.5 py-1 rounded-none border border-yellow-400/30" style={khFont}>
                {currentQuestion.difficulty || "Mixed"}
              </span>
              {(currentQuestion as any).topicCode && (
                <span className="shrink-0 text-zinc-400 font-mono text-[10px] sm:text-xs bg-zinc-850 px-2.5 py-1 rounded-none border border-zinc-800 tracking-wider">
                  {(currentQuestion as any).topicCode.trim()}
                </span>
              )}
            </div>
            {endsAt && (
              <div className="shrink-0 scale-75 sm:scale-85 origin-right">
                <CountdownTimer
                  endsAt={endsAt}
                  totalSeconds={timePerQuestion}
                  onExpire={() => {}}
                  muted={muted}
                />
              </div>
            )}
          </div>

          {phase === "results" && (
            <div className="flex gap-2 w-full bg-zinc-900 border-2 border-black p-1.5 rounded-none flex-shrink-0">
              <button
                type="button"
                onClick={() => setResultsTab("result")}
                className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider transition-all rounded-none ${
                  resultsTab === "result"
                    ? "bg-yellow-400 text-black border border-black"
                    : "bg-transparent text-zinc-400 hover:text-white"
                }`}
                style={khFont}
              >
                {kh ? "លទ្ធផលខ្ញុំ" : "My Result"}
              </button>
              <button
                type="button"
                onClick={() => setResultsTab("leaderboard")}
                className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider transition-all rounded-none ${
                  resultsTab === "leaderboard"
                    ? "bg-blue-400 text-black border border-black"
                    : "bg-transparent text-zinc-400 hover:text-white"
                }`}
                style={khFont}
              >
                {kh ? "ចំណាត់ថ្នាក់" : "Rankings"}
              </button>
            </div>
          )}

          {/* Question image (compact stable wrapper) */}
          <div className={`shrink-0 w-full h-32 flex items-center justify-center p-2 relative overflow-hidden rounded-none ${
            currentQuestion.imageUrl
              ? "border-2 border-black bg-zinc-950"
              : "border-2 border-transparent bg-transparent"
          }`}>
            {currentQuestion.imageUrl ? (
              <>
                <img src={currentQuestion.imageUrl} alt="question" className="h-full w-auto object-contain select-none pointer-events-none rounded-none" />
                {/* Image reference label inside the box border at the bottom */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "rgba(0,0,0,0.85)",
                  color: "#e4e4e7",
                  fontSize: "7.5px",
                  fontWeight: 900,
                  padding: "2px 6px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  borderLeft: "2px solid #000",
                  borderTop: "2px solid #000",
                }}>
                  Ref: {currentQuestion.topicCode ? currentQuestion.topicCode.trim() : `KWD-Q${currentQuestion.id}`}
                </div>
              </>
            ) : null}
          </div>

          {/* Question text card (compact) */}
          <div
            className="shrink-0 w-full min-h-[5rem] h-auto bg-zinc-900 border-2 border-black p-4 rounded-none text-white font-black flex items-center justify-center text-center select-text animate-fade-in"
            style={{
              fontSize: "clamp(1.1rem, 4vw, 1.75rem)",
              lineHeight: "1.3",
              ...khFont
            }}
          >
            <div className="w-full py-1">
              {kh ? (currentQuestion.questionKm || currentQuestion.questionEn) : currentQuestion.questionEn}
            </div>
          </div>

          <div className="shrink-0 min-h-[176px]">
            <ErrorBoundary fallback={
              <div className="text-center p-8 border-2 border-red-500 bg-red-500/10 rounded-none">
                <XCircle className="mx-auto text-red-400 mb-3" size={32} />
                <p className="text-white font-bold text-sm">Failed to load answers</p>
                <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-500 text-white font-bold text-sm rounded-none">Reload</button>
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

          {/* Bottom result slot — compact, no layout shift */}
          <div className="shrink-0 h-14 flex items-center justify-center w-full">
            {phase === "results" ? (
              answerResult ? (
                <div className="flex items-center gap-2">
                  {answerResult.isCorrect ? (
                    <>
                      <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                      <span className="text-green-400 font-black text-sm uppercase tracking-wider" style={khFont}>
                        {kh ? "ត្រឹមត្រូវ!" : "Correct!"}
                      </span>
                      {answerResult.pointsEarned > 0 && (
                        <div
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-400 border-2 border-black rounded-none animate-bounce"
                        >
                          <Zap size={11} className="text-black" />
                          <span className="text-black font-black text-xs">+{answerResult.pointsEarned} pts</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-400 flex-shrink-0" size={16} />
                      <span className="text-red-400 font-black text-sm uppercase tracking-wider" style={khFont}>
                        {kh ? "មិនត្រឹមត្រូវ" : "Incorrect"}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-400">
                  <XCircle size={16} className="flex-shrink-0" />
                  <span className="font-black text-sm uppercase tracking-wider" style={khFont}>
                    {kh ? "អស់ម៉ោង!" : "Time's Up!"}
                  </span>
                </div>
              )
            ) : answerSubmitted ? (
              <div className="flex items-center gap-2 text-zinc-400 animate-pulse">
                <Loader2 size={13} className="animate-spin text-yellow-400" />
                <span className="font-bold text-[11px] uppercase tracking-wider" style={khFont}>
                  {kh ? "បានបញ្ជូនចម្លើយ! រង់ចាំ..." : "Answer submitted! Waiting..."}
                </span>
              </div>
            ) : null}
          </div>

          {/* Round leaderboard overlay — shown during results (if rankings tab active) AND leaderboard phases */}
          {(phase === "leaderboard" || (phase === "results" && resultsTab === "leaderboard")) && (
            <div className="absolute inset-0 z-20 flex flex-col" style={{ backgroundColor: "rgba(13,13,20,0.97)" }}>
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 flex-shrink-0">
                <Trophy size={14} className="text-yellow-400" />
                <span className="text-white font-black text-xs uppercase tracking-widest" style={khFont}>
                  {kh ? "ចំណាត់ថ្នាក់" : "Round Rankings"}
                </span>

                {phase === "results" && (
                  <button
                    type="button"
                    onClick={() => setResultsTab("result")}
                    className="ml-auto px-2.5 py-1 bg-yellow-400 text-black border border-black font-black text-[9px] uppercase tracking-wider hover:bg-yellow-300 transition-colors"
                    style={{ borderRadius: "0px" }}
                  >
                    {kh ? "មើលសំណួរ" : "View Question"}
                  </button>
                )}

                {phase !== "results" && (
                  <span className="ml-auto text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                    {kh ? `${questionIndex + 1}/${totalQuestions}` : `Q ${questionIndex + 1} / ${totalQuestions}`}
                  </span>
                )}
              </div>

              {/* Leaderboard — no scroll, centered on current user */}
              <div className="flex-1 overflow-hidden flex flex-col justify-center px-3 py-2 gap-1.5">
                {leaderboard.slice(0, 8).map((entry, i) => {
                  const isMe = entry.userId === currentUserId;
                  const isTop3 = i < 3;
                  const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32"];
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-none transition-all duration-300 ${
                        isMe ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-zinc-950" : ""
                      }`}
                      style={{
                        backgroundColor: isMe ? "#ffd700" : isTop3 ? "#ffffff" : "#1c1c28",
                        boxShadow: isMe ? "3px 3px 0 #000" : "2px 2px 0 #000",
                        transform: isMe ? "scale(1.02)" : undefined,
                        color: isMe || isTop3 ? "#000" : "#fff",
                      }}
                    >
                      {/* Rank badge */}
                      <div
                        className="w-7 h-7 flex items-center justify-center border-2 border-black font-black text-xs flex-shrink-0"
                        style={{ backgroundColor: isTop3 ? rankColors[i] : "#3f3f56", color: isTop3 ? "#000" : "#fff" }}
                      >
                        {entry.rank}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-xs truncate" style={khFont}>
                          {entry.displayName}{isMe && <span className="ml-1 opacity-60 text-[10px]">({kh ? "អ្នក" : "you"})</span>}
                        </div>
                        {entry.currentStreak > 1 && (
                          <div className="text-orange-500 text-[9px] font-bold">Streak x{entry.currentStreak}</div>
                        )}
                      </div>

                      {/* Score + rank change */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-sm tabular-nums">{entry.totalScore.toLocaleString()}</div>
                        <div className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${
                          entry.rankChange > 0 ? "text-green-500" : entry.rankChange < 0 ? "text-red-400" : "text-zinc-500"
                        }`}>
                          {entry.rankChange > 0 ? "▲" : entry.rankChange < 0 ? "▼" : "—"}
                          {entry.rankChange !== 0 && Math.abs(entry.rankChange)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Waiting for next question */}
              <div className="flex-shrink-0 py-3 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-black rounded-none">
                  <Loader2 size={12} className="animate-spin text-yellow-400" />
                  <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest" style={khFont}>
                    {kh ? "រង់ចាំសំណួរបន្ទាប់..." : "Waiting for next question..."}
                  </span>
                </div>
              </div>
            </div>
          )}
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
          <Podium podium={podium} finalLeaderboard={leaderboard} lang={lang} currentUserId={currentUserId} onPlayAgain={() => router.push("/play")} sessionCode={code} totalQuestions={totalQuestions} currentUserPoints={currentUserPoints} />
        </div>
      </div>
    );
  }

  return null;
}
