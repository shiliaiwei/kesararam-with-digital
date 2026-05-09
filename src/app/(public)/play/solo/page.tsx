"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { sounds } from "@/lib/game-sounds";
import { GAME_MODE_CONFIG } from "@/lib/game-engine";
import { Zap, Flame, ChevronRight, RotateCcw } from "lucide-react";

interface SoloQuestion {
  id: number;
  questionEn: string;
  questionKm: string;
  imageUrl: string | null;
  audioUrlEn: string | null;
  audioUrlKm: string | null;
  gameType: "mcq" | "true_false" | "image_pick";
  difficulty: string | null;
  answers: { id: number; answerEn: string; answerKm: string; imageUrl: string | null; isCorrect: boolean }[];
}

interface SoloSession {
  sessionId: number;
  sessionCode: string;
  questions: SoloQuestion[];
  timePerQuestion: number;
  gameMode: string;
}

interface AnswerRecord {
  questionId: number;
  answerId: number | null;
  isCorrect: boolean;
  timeTakenMs: number;
}

type Phase =
  | { name: "setup" }
  | { name: "loading" }
  | { name: "playing"; session: SoloSession; qIndex: number; endsAt: string; startedAt: number }
  | { name: "results"; result: ResultData };

interface ResultData {
  totalScore: number;
  accuracyPercentage: number;
  timeTakenSeconds: number;
  correctAnswers: number;
  totalQuestions: number;
  personalBest: number;
  isNewPersonalBest: boolean;
  perQuestion: { questionId: number; isCorrect: boolean; pointsEarned: number; timeTakenMs: number }[];
}

const GAME_MODES = Object.entries(GAME_MODE_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

export default function SoloPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [phase, setPhase] = useState<Phase>({ name: "setup" });
  const [selectedMode, setSelectedMode] = useState(searchParams.get("mode") ?? "quick-quiz");
  const [categories, setCategories] = useState<{ id: number; titleEn: string; titleKm: string }[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState("mixed");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // In-game state
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [muted, setMuted] = useState(false);
  const answersRef = useRef<AnswerRecord[]>([]);
  const sessionStartRef = useRef(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check authentication status
    fetch("/api/auth/me")
      .then((r) => {
        setIsAuthenticated(r.ok);
      })
      .catch(() => setIsAuthenticated(false));

    fetch("/api/game/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        if (d.categories?.length) setSelectedCats([d.categories[0].id]);
      })
      .catch(() => { });
  }, []);

  async function startGame() {
    if (!selectedCats.length) { setError(kh ? "ជ្រើសរើសប្រភេទ" : "Select a category"); return; }
    setError("");

    // Clear ALL in-game state before starting — prevents stale state from previous game
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setSelectedId(null);
    setShowCorrect(false);
    setMyScore(0);
    setMyStreak(0);
    answersRef.current = [];

    setPhase({ name: "loading" });

    try {
      const res = await fetch("/api/game/solo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryIds: selectedCats,
          difficulty,
          questionCount: GAME_MODE_CONFIG[selectedMode]?.questionCount ?? 10,
          timePerQuestion: GAME_MODE_CONFIG[selectedMode]?.timePerQuestion ?? 30,
          gameMode: selectedMode,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to start");
        setPhase({ name: "setup" });
        return;
      }
      const session: SoloSession = await res.json();
      sessionStartRef.current = Date.now();
      const endsAt = new Date(Date.now() + session.timePerQuestion * 1000).toISOString();
      setPhase({ name: "playing", session, qIndex: 0, endsAt, startedAt: Date.now() });
      if (!muted) sounds.question_start();
    } catch {
      setError(kh ? "មានបញ្ហា" : "Something went wrong");
      setPhase({ name: "setup" });
    }
  }

  const completeGameRef = useRef<((session: SoloSession, timeTakenSeconds: number) => Promise<void>) | null>(null);

  const advanceQuestion = useCallback((session: SoloSession, qIndex: number, answerId: number | null, isCorrect: boolean, timeTakenMs: number) => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

    answersRef.current.push({ questionId: session.questions[qIndex].id, answerId, isCorrect, timeTakenMs });

    const nextIdx = qIndex + 1;
    if (nextIdx >= session.questions.length) {
      const totalTime = Math.round((Date.now() - sessionStartRef.current) / 1000);
      completeGameRef.current?.(session, totalTime);
      return;
    }

    advanceTimerRef.current = setTimeout(() => {
      setSelectedId(null);
      setShowCorrect(false);
      const endsAt = new Date(Date.now() + session.timePerQuestion * 1000).toISOString();
      setPhase({ name: "playing", session, qIndex: nextIdx, endsAt, startedAt: Date.now() });
      if (!muted) sounds.question_start();
    }, 1500);
  }, [muted]);

  function handleSelect(answerId: number) {
    if (phase.name !== "playing" || selectedId !== null) return;
    const q = phase.session.questions[phase.qIndex];
    const ans = q.answers.find((a) => a.id === answerId);
    const isCorrect = ans?.isCorrect ?? false;
    const timeTakenMs = Date.now() - phase.startedAt;

    setSelectedId(answerId);
    setShowCorrect(true);

    if (isCorrect) {
      const newStreak = myStreak + 1;
      setMyStreak(newStreak);
      const pts = 1000 + Math.floor(1000 * Math.max(0, (phase.session.timePerQuestion * 1000 - timeTakenMs) / (phase.session.timePerQuestion * 1000)));
      const bonus = Math.floor(1000 * Math.min(Math.max(newStreak - 1, 0), 5) * 0.1);
      setMyScore((s) => s + pts + bonus);
      if (!muted) { if (newStreak > 2) sounds.streak(); else sounds.correct(); }
    } else {
      setMyStreak(0);
      if (!muted) sounds.incorrect();
    }

    advanceQuestion(phase.session, phase.qIndex, answerId, isCorrect, timeTakenMs);
  }

  function handleTimeout() {
    if (phase.name !== "playing" || selectedId !== null) return;
    // Guard: question must have been active for at least 1 second
    const activeMs = Date.now() - phase.startedAt;
    if (activeMs < 1000) return;
    setSelectedId(-1); // sentinel for timeout
    setShowCorrect(true);
    setMyStreak(0);
    if (!muted) sounds.incorrect();
    advanceQuestion(phase.session, phase.qIndex, null, false, phase.session.timePerQuestion * 1000);
  }

  async function completeGame(session: SoloSession, timeTakenSeconds: number) {
    const finalScore = myScore; // capture before async
    try {
      const res = await fetch("/api/game/solo/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          answers: answersRef.current,
          timeTakenSeconds,
          gameMode: session.gameMode,
          difficulty,
        }),
      });
      const result = await res.json();
      // Always show the score the player saw during the game (client-tracked)
      // Server score is used only for DB persistence with its own formula
      setPhase({ name: "results", result: { ...result, totalScore: finalScore, personalBest: Math.max(result.personalBest ?? 0, finalScore) } });
      if (!muted) sounds.podium();
    } catch {
      setPhase({ name: "results", result: { totalScore: finalScore, accuracyPercentage: 0, timeTakenSeconds, correctAnswers: 0, totalQuestions: session.questions.length, personalBest: finalScore, isNewPersonalBest: false, perQuestion: [] } });
    }
  }
  completeGameRef.current = completeGame;
  // ── Render ─────────────────────────────────────────────────────────────────

  if (phase.name === "setup") {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-yellow-400 border-b-2 border-black py-10 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
              {kh ? "ហ្វឹកហាត់តែម្នាក់ឯង" : "Solo Practice"}
            </div>
            <h1 className="text-4xl font-black text-black" style={khFont}>
              {kh ? "ជ្រើសរើសរបៀបលេង" : "Choose Your Mode"}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">
          {/* Guest warning */}
          {isAuthenticated === false && (
            <div className="border-2 border-orange-500 bg-orange-50 p-4 flex items-start gap-3">
              <div className="text-orange-600 flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-black text-sm text-orange-900 mb-1" style={khFont}>
                  {kh ? "ការជូនដំណឹង" : "Guest Mode"}
                </div>
                <div className="text-xs text-orange-800" style={khFont}>
                  {kh
                    ? "អ្នកកំពុងលេងក្នុងរបៀបភ្ញៀវ។ ពិន្ទុរបស់អ្នកនឹងមិនត្រូវបានរក្សាទុក។ សូមចូលគណនីដើម្បីរក្សាពិន្ទុនិងប្រវត្តិរបស់អ្នក។"
                    : "You're playing in guest mode. Your scores won't be saved. Please log in to save your scores and track your progress."}
                </div>
              </div>
            </div>
          )}

          {/* Game mode */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>
              {kh ? "របៀបលេង" : "Game Mode"}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GAME_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className="p-4 border-2 border-black text-left transition-all duration-100"
                  style={{
                    backgroundColor: selectedMode === m.id ? m.color : "#fff",
                    boxShadow: selectedMode === m.id ? "4px 4px 0 #000" : "2px 2px 0 #000",
                    transform: selectedMode === m.id ? "translate(-2px,-2px)" : undefined,
                  }}
                >
                  <div className="font-black text-sm text-black" style={khFont}>
                    {kh ? m.labelKm : m.label}
                  </div>
                  <div className="text-xs text-black/60 mt-0.5">
                    {m.questionCount}Q · {m.timePerQuestion}s
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>
              {kh ? "ប្រភេទ" : "Categories"}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const sel = selectedCats.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setSelectedCats((prev) =>
                        sel ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                      )
                    }
                    className="px-3 py-1.5 border-2 border-black text-sm font-bold transition-all duration-100"
                    style={{
                      backgroundColor: sel ? "#000" : "#fff",
                      color: sel ? "#ffd700" : "#000",
                      boxShadow: sel ? "2px 2px 0 #ffd700" : "2px 2px 0 #000",
                    }}
                  >
                    <span style={khFont}>{kh ? cat.titleKm : cat.titleEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>
              {kh ? "កម្រិត" : "Difficulty"}
            </div>
            <div className="flex gap-2">
              {[
                { id: "mixed", en: "Mixed", km: "ចម្រុះ" },
                { id: "easy", en: "Easy", km: "ងាយ" },
                { id: "medium", en: "Medium", km: "មធ្យម" },
                { id: "hard", en: "Hard", km: "លំបាក" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className="flex-1 py-2 border-2 border-black text-sm font-black transition-all duration-100"
                  style={{
                    backgroundColor: difficulty === d.id ? "#000" : "#fff",
                    color: difficulty === d.id ? "#ffd700" : "#000",
                    boxShadow: "2px 2px 0 #000",
                  }}
                >
                  <span style={khFont}>{kh ? d.km : d.en}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-600 font-bold text-sm border-2 border-red-500 px-3 py-2" style={khFont}>{error}</p>
          )}

          <button
            onClick={startGame}
            className="w-full py-5 bg-black text-yellow-400 font-black text-xl border-2 border-black transition-all duration-100 hover:-translate-y-0.5"
            style={{ boxShadow: "5px 5px 0 #ffd700", ...khFont }}
          >
            {kh ? "ចាប់ផ្តើម" : "Start Game"}
            <ChevronRight className="inline ml-2" size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (phase.name === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-black text-xl" style={khFont}>
            {kh ? "កំពុងរៀបចំ..." : "Loading questions..."}
          </p>
        </div>
      </div>
    );
  }

  if (phase.name === "results") {
    const r = phase.result;
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-yellow-400 border-b-2 border-black py-8 px-6 text-center">
          <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
            {kh ? "ចប់ហ្គេម" : "Game Over"}
          </div>
          {r.isNewPersonalBest && (
            <div className="inline-block bg-black text-yellow-400 text-xs font-black px-3 py-1.5 mb-3 ml-2 border-2 border-black" style={{ boxShadow: "2px 2px 0 #000", ...khFont }}>
              {kh ? "ពិន្ទុខ្ពស់បំផុតថ្មី!" : "New Personal Best!"}
            </div>
          )}
          <div className="text-6xl font-black text-black tabular-nums">{r.totalScore.toLocaleString()}</div>
          <div className="text-black/60 font-bold mt-1" style={khFont}>{kh ? "ពិន្ទុ" : "points"}</div>
        </div>

        <div className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: kh ? "ភាពត្រឹមត្រូវ" : "Accuracy", value: `${r.accuracyPercentage}%`, color: "#22c55e" },
              { label: kh ? "ត្រូវ" : "Correct", value: `${r.correctAnswers}/${r.totalQuestions}`, color: "#3b82f6" },
              { label: kh ? "ពេលវេលា" : "Time", value: `${r.timeTakenSeconds}s`, color: "#f97316" },
            ].map((s) => (
              <div key={s.label} className="border-2 border-black p-4 text-center" style={{ boxShadow: "3px 3px 0 #000" }}>
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-bold text-zinc-500 mt-1" style={khFont}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Per-question breakdown */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>
              {kh ? "លទ្ធផលម្តងៗ" : "Question Breakdown"}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {r.perQuestion.map((q, i) => (
                <div
                  key={q.questionId}
                  className="w-8 h-8 border-2 border-black flex items-center justify-center text-xs font-black text-white"
                  style={{ backgroundColor: q.isCorrect ? "#22c55e" : "#ef4444" }}
                  title={`Q${i + 1}: ${q.isCorrect ? "+" + q.pointsEarned : "0"}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                // Clear ALL stale state before going back to setup
                if (advanceTimerRef.current) {
                  clearTimeout(advanceTimerRef.current);
                  advanceTimerRef.current = null;
                }
                setSelectedId(null);
                setShowCorrect(false);
                setMyScore(0);
                setMyStreak(0);
                answersRef.current = [];
                setPhase({ name: "setup" });
              }}
              className="flex-1 py-4 bg-white text-black font-black border-2 border-black flex items-center justify-center gap-2"
              style={{ boxShadow: "3px 3px 0 #000", ...khFont }}
            >
              <RotateCcw size={16} />
              {kh ? "លេងម្តងទៀត" : "Play Again"}
            </button>
            <button
              onClick={() => router.push("/play")}
              className="flex-1 py-4 bg-black text-yellow-400 font-black border-2 border-black"
              style={{ boxShadow: "3px 3px 0 #ffd700", ...khFont }}
            >
              {kh ? "ជ្រើសរើសរបៀបផ្សេង" : "Change Mode"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING
  const q = phase.session.questions[phase.qIndex];
  const correctId = showCorrect ? (q.answers.find((a) => a.isCorrect)?.id ?? null) : null;
  const effectiveLang = lang as "en" | "kh";

  return (
    <div className="game-dot-bg min-h-screen flex flex-col" style={{ userSelect: "none" }}>
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm border-b-2 border-yellow-400">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-black text-xs uppercase tracking-widest" style={khFont}>
            {kh ? GAME_MODE_CONFIG[phase.session.gameMode]?.labelKm : GAME_MODE_CONFIG[phase.session.gameMode]?.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-yellow-400 border-2 border-black px-3 py-1" style={{ boxShadow: "2px 2px 0 #000" }}>
            <Zap size={12} className="text-black" />
            <span className="font-black text-black text-sm tabular-nums">{myScore.toLocaleString()}</span>
          </div>
          {myStreak > 1 && (
            <div className="flex items-center gap-1 bg-orange-500 border-2 border-black px-2 py-1" style={{ boxShadow: "2px 2px 0 #000" }}>
              <Flame size={12} className="text-white" />
              <span className="font-black text-white text-xs">x{myStreak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-zinc-800">
        <div
          className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${((phase.qIndex + 1) / phase.session.questions.length) * 100}%` }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-4 gap-4 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-xs font-black uppercase tracking-widest" style={khFont}>
            {kh ? `${phase.qIndex + 1}/${phase.session.questions.length}` : `Q ${phase.qIndex + 1} / ${phase.session.questions.length}`}
          </span>
          <CountdownTimer
            endsAt={phase.endsAt}
            totalSeconds={phase.session.timePerQuestion}
            onExpire={handleTimeout}
            muted={muted}
          />
        </div>

        {/* Image */}
        {q.imageUrl && (
          <div className="border-2 border-black bg-white flex items-center justify-center p-4" style={{ minHeight: 180 }}>
            <img src={q.imageUrl} alt="question" className="max-h-44 w-auto object-contain" />
          </div>
        )}

        {/* Question */}
        <div
          className="bg-zinc-900/80 backdrop-blur-sm border-2 border-zinc-700 p-4 text-white font-black text-base sm:text-lg leading-snug break-words"
          style={{ boxShadow: "3px 3px 0 #ffd700", ...khFont }}
        >
          {effectiveLang === "kh" ? q.questionKm || q.questionEn : q.questionEn}
        </div>

        {/* Answers */}
        <AnswerGrid
          answers={q.answers}
          selectedId={selectedId === -1 ? null : selectedId}
          correctId={correctId}
          disabled={selectedId !== null}
          lang={effectiveLang}
          gameType={q.gameType}
          onSelect={handleSelect}
        />
      </div>

      <div className="relative z-10 px-4 py-2 bg-black/80 border-t border-zinc-800 flex justify-end">
        <button onClick={() => setMuted((m) => !m)} className="text-zinc-500 hover:text-white text-xs font-bold transition-colors" style={khFont}>
          {muted ? (kh ? "បើកសំឡេង" : "Unmute") : (kh ? "បិទសំឡេង" : "Mute")}
        </button>
      </div>
    </div>
  );
}
