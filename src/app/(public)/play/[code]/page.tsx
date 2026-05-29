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
  Loader2, Wifi, WifiOff, BookOpen, Target, Timer, Star
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
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [joining, setJoining] = useState(true);
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

  // ── Loading / Error states ─────────────────────────────────────────────────
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

  // ── Lobby ──────────────────────────────────────────────────────────────────
  if (phase === "lobby") {
    const modeColor = MODE_COLORS[sessionInfo?.gameMode ?? ""] ?? "#eab308";
    const modeLabel = MODE_LABELS[sessionInfo?.gameMode ?? ""] ?? sessionInfo?.gameMode ?? "—";
    const diffColor = DIFF_COLORS[sessionInfo?.difficulty ?? "mixed"] ?? "#a855f7";

    return (
      <div className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#0d0d14", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>

        {/* Connection indicator */}
        <div className="flex justify-end px-4 pt-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold ${connected ? "text-green-400" : "text-yellow-400"}`}>
            {connected ? <Wifi size={12} /> : <Loader2 size={12} className="animate-spin" />}
            {connected ? (kh ? "ភ្ជាប់" : "Connected") : (kh ? "កំពុងភ្ជាប់..." : "Connecting...")}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-5 max-w-lg mx-auto w-full">

          {/* Live badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-red-600 border border-red-400">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white font-black text-xs tracking-widest">LIVE SESSION</span>
          </div>

          {/* Host + Session card */}
          <div className="w-full border-2 border-white/15 bg-white/5 p-6 text-center"
            style={{ boxShadow: `0 0 40px ${modeColor}22` }}>
            <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1" style={khFont}>
              {kh ? "គ្រូបង្រៀន" : "Hosted by"}
            </div>
            <div className="text-white font-black text-2xl mb-4" style={khFont}>
              {sessionInfo?.hostName ?? "—"}
            </div>

            {/* Room code */}
            <div className="inline-block px-6 py-3 border-2 mb-4"
              style={{ backgroundColor: modeColor, borderColor: modeColor, boxShadow: `0 0 24px ${modeColor}66` }}>
              <div className="text-black font-black text-5xl tracking-[0.2em]">{code}</div>
            </div>

            <div className="text-white/40 text-xs font-bold" style={khFont}>
              {kh ? "លេខកូដចូលរួម" : "Game Code"}
            </div>
          </div>

          {/* Session details grid */}
          {sessionInfo && (
            <div className="w-full grid grid-cols-2 gap-2">
              <div className="border border-white/10 bg-white/5 p-3 flex items-center gap-2">
                <BookOpen size={14} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-white/40 text-xs" style={khFont}>{kh ? "របៀបលេង" : "Game Mode"}</div>
                  <div className="text-white font-black text-sm" style={{ color: modeColor }}>{modeLabel}</div>
                </div>
              </div>
              <div className="border border-white/10 bg-white/5 p-3 flex items-center gap-2">
                <Target size={14} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-white/40 text-xs" style={khFont}>{kh ? "ប្រភេទ" : "Category"}</div>
                  <div className="text-white font-black text-sm capitalize">{sessionInfo.category?.replace(/-/g, " ") ?? "—"}</div>
                </div>
              </div>
              <div className="border border-white/10 bg-white/5 p-3 flex items-center gap-2">
                <Star size={14} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-white/40 text-xs" style={khFont}>{kh ? "កម្រិត" : "Difficulty"}</div>
                  <div className="font-black text-sm capitalize" style={{ color: diffColor }}>
                    {sessionInfo.difficulty ?? "Mixed"}
                  </div>
                </div>
              </div>
              <div className="border border-white/10 bg-white/5 p-3 flex items-center gap-2">
                <Timer size={14} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-white/40 text-xs" style={khFont}>{kh ? "ពេលវេលា" : "Time / Q"}</div>
                  <div className="text-white font-black text-sm">{sessionInfo.timePerQuestion}s</div>
                </div>
              </div>
              <div className="border border-white/10 bg-white/5 p-3 flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-white/40 text-xs" style={khFont}>{kh ? "ពិន្ទុ" : "Scoring"}</div>
                  <div className="text-white font-black text-sm capitalize">{sessionInfo.scoringMode}</div>
                </div>
              </div>
              <div className="border border-white/10 bg-white/5 p-3 flex items-center gap-2">
                <Zap size={14} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-white/40 text-xs" style={khFont}>{kh ? "សំណួរ" : "Questions"}</div>
                  <div className="text-white font-black text-sm">{sessionInfo.questionCount}Q</div>
                </div>
              </div>
            </div>
          )}

          {/* Players joined */}
          <div className="w-full border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={13} className="text-white/50" />
              <span className="text-white/50 text-xs font-bold uppercase tracking-widest" style={khFont}>
                {kh ? "អ្នកចូលរួម" : "Players"} · {participants.length}{sessionInfo ? ` / ${sessionInfo.maxPlayers}` : ""}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            {participants.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                  <div key={p.userId}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 border border-white/15 bg-white/5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                      style={{ background: `hsl(${(p.userId * 47) % 360}, 55%, 45%)` }}>
                      {p.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-xs font-bold truncate max-w-[80px]" style={khFont}>{p.displayName}</span>
                    {p.isConnected && <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-white/20 text-sm font-bold" style={khFont}>
                {kh ? "អ្នកទីមួយ!" : "You're the first one here!"}
              </div>
            )}
          </div>

          {/* Waiting pulse */}
          <div className="flex items-center gap-2 text-white/40 text-sm font-bold" style={khFont}>
            <Clock size={14} className="animate-pulse" />
            {kh ? "រង់ចាំគ្រូចាប់ផ្តើម..." : "Waiting for host to start..."}
          </div>
        </div>
      </div>
    );
  }

  // ── Question ───────────────────────────────────────────────────────────────
  if (phase === "question" && currentQuestion) {
    if (!currentQuestion.answers?.length) {
      return (
        <div className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#0d0d14" }}>
          <Loader2 className="animate-spin h-10 w-10 text-yellow-400" />
        </div>
      );
    }

    const timePerQuestion = endsAt
      ? Math.max(5, Math.round((new Date(endsAt).getTime() - Date.now()) / 1000))
      : 30;

    return (
      <div className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#0d0d14", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-red-600">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white font-black text-xs tracking-widest">LIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy size={13} className="text-yellow-400" />
            <span className="text-white font-black text-sm">
              {questionIndex + 1} / {totalQuestions}
            </span>
          </div>
          {endsAt && (
            <CountdownTimer
              endsAt={endsAt}
              totalSeconds={timePerQuestion}
              onExpire={() => {}}
            />
          )}
        </div>

        <div className="flex-1 flex flex-col p-4 gap-4 max-w-2xl mx-auto w-full">
          {/* Question card */}
          <div className="border-2 border-white/15 bg-white/5 p-4 sm:p-6 flex-shrink-0">
            {currentQuestion.imageUrl && (
              <div className="mb-4 bg-white border-2 border-black flex items-center justify-center p-4" style={{ minHeight: 180 }}>
                <img src={currentQuestion.imageUrl} alt="Question" className="max-h-44 w-auto object-contain" />
              </div>
            )}
            <h2 className="text-white font-black text-base sm:text-xl md:text-2xl text-center leading-snug break-words hyphens-auto" style={khFont}>
              {kh ? (currentQuestion.questionKm || currentQuestion.questionEn) : currentQuestion.questionEn}
            </h2>
          </div>

          {/* Answers */}
          <ErrorBoundary fallback={
            <div className="text-center p-8 border border-red-500/30 bg-red-500/10">
              <XCircle className="mx-auto text-red-400 mb-3" size={32} />
              <p className="text-white font-bold text-sm">Failed to load answers</p>
              <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-500 text-white font-bold text-sm">Reload</button>
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

          {/* Answer feedback */}
          {answerResult && (
            <div className={`p-5 border-2 text-center ${answerResult.isCorrect ? "border-green-400 bg-green-500/20" : "border-red-400 bg-red-500/20"}`}
              style={{ boxShadow: answerResult.isCorrect ? "0 0 24px rgba(74,222,128,0.3)" : "0 0 24px rgba(239,68,68,0.3)" }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {answerResult.isCorrect
                  ? <CheckCircle className="text-green-400" size={28} />
                  : <XCircle className="text-red-400" size={28} />}
                <span className="text-white font-black text-xl" style={khFont}>
                  {answerResult.isCorrect ? (kh ? "ត្រូវ!" : "Correct!") : (kh ? "មិនត្រូវ" : "Incorrect")}
                </span>
              </div>
              {answerResult.pointsEarned > 0 && (
                <div className="inline-block px-4 py-1.5 bg-yellow-400 border border-yellow-300">
                  <span className="text-black font-black text-lg">+{answerResult.pointsEarned} pts</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Results / Leaderboard ──────────────────────────────────────────────────
  if (phase === "results" || phase === "leaderboard") {
    return (
      <div className="min-h-screen p-4"
        style={{ backgroundColor: "#0d0d14", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
        <div className="max-w-lg mx-auto pt-8">
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
      <div className="min-h-screen p-4"
        style={{ backgroundColor: "#0d0d14", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
        <div className="max-w-2xl mx-auto pt-6">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-1.5 bg-yellow-400 text-black font-black text-xs uppercase tracking-widest mb-3">
              {kh ? "ហ្គេមចប់" : "Game Over"}
            </div>
            <h1 className="text-white font-black text-3xl" style={khFont}>{kh ? "លទ្ធផលចុងក្រោយ" : "Final Results"}</h1>
          </div>
          <Podium podium={podium} finalLeaderboard={leaderboard} lang={lang} currentUserId={currentUserId} onPlayAgain={() => router.push("/play")} />
        </div>
      </div>
    );
  }

  return null;
}
