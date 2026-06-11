"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { sounds } from "@/lib/game-sounds";
import { GAME_MODE_CONFIG } from "@/lib/game-engine";
import { Zap, Flame, ChevronRight, RotateCcw, Volume2, VolumeX, X, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { cloudinaryOptimize } from "@/lib/cloudinary";

interface SoloQuestion {
  id: number;
  questionEn: string;
  questionKm: string;
  topicCode: string | null;
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
  difficulty: string | null;
}

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

// selectedId and showCorrect live INSIDE the playing phase
// so they reset atomically when the question changes — no bleed between questions
type Phase =
  | { name: "setup" }
  | { name: "loading" }
  | { name: "playing"; session: SoloSession; qIndex: number; endsAt: string; startedAt: number; selectedId: number | null; showCorrect: boolean }
  | { name: "results"; session: SoloSession; result: ResultData; answers: AnswerRecord[] };

const HIDDEN_MODES = new Set([
  "survival-quiz",
  "zen-review",
  "final-practice",
]);

const GAME_MODES = Object.entries(GAME_MODE_CONFIG)
  .map(([id, cfg]) => ({ id, ...cfg }))
  .filter((m) => !HIDDEN_MODES.has(m.id));

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
  const [questionCount, setQuestionCount] = useState<number>(
    GAME_MODE_CONFIG[searchParams.get("mode") ?? "quick-quiz"]?.defaultQuestionCount ?? 10
  );
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [muted, setMuted] = useState(false);

  const answersRef = useRef<AnswerRecord[]>([]);
  const sessionStartRef = useRef(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => setIsAuthenticated(r.ok)).catch(() => setIsAuthenticated(false));
    fetch("/api/game/categories").then(r => r.json()).then(d => {
      setCategories(d.categories ?? []);
      if (d.categories?.length) setSelectedCats([d.categories[0].id]);
    }).catch(() => { });
  }, []);

  function resetGameState() {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    answersRef.current = [];
    setMyScore(0);
    setMyStreak(0);
  }

  async function startGame() {
    if (!selectedCats.length) { setError(kh ? "ជ្រើសរើសប្រភេទ" : "Select a category"); return; }
    setError("");
    resetGameState();
    setPhase({ name: "loading" });

    try {
      const res = await fetch("/api/game/solo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryIds: selectedCats,
          difficulty,
          questionCount,
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
      // selectedId: null, showCorrect: false — clean state for first question
      setPhase({ name: "playing", session, qIndex: 0, endsAt, startedAt: Date.now(), selectedId: null, showCorrect: false });
      if (!muted) sounds.question_start();
    } catch {
      setError(kh ? "មានបញ្ហា" : "Something went wrong");
      setPhase({ name: "setup" });
    }
  }

  const completeGameRef = useRef<((session: SoloSession, timeTakenSeconds: number) => Promise<void>) | null>(null);

  const advanceQuestion = useCallback((session: SoloSession, qIndex: number, answerId: number | null, isCorrect: boolean, timeTakenMs: number) => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    const q = session.questions[qIndex];
    answersRef.current.push({ questionId: q.id, answerId, isCorrect, timeTakenMs, difficulty: q.difficulty ?? null });

    const nextIdx = qIndex + 1;
    if (nextIdx >= session.questions.length) {
      const totalTime = Math.round((Date.now() - sessionStartRef.current) / 1000);
      completeGameRef.current?.(session, totalTime);
      return;
    }

    advanceTimerRef.current = setTimeout(() => {
      const endsAt = new Date(Date.now() + session.timePerQuestion * 1000).toISOString();
      // selectedId: null, showCorrect: false — atomically reset with new question
      setPhase({ name: "playing", session, qIndex: nextIdx, endsAt, startedAt: Date.now(), selectedId: null, showCorrect: false });
      if (!muted) sounds.question_start();
    }, 1500);
  }, [muted]);

  function handleSelect(answerId: number) {
    if (phase.name !== "playing" || phase.selectedId !== null) return;
    const q = phase.session.questions[phase.qIndex];
    const ans = q.answers.find(a => a.id === answerId);
    const isCorrect = ans?.isCorrect ?? false;
    const timeTakenMs = Date.now() - phase.startedAt;

    // Update selectedId and showCorrect inside the phase object — atomic update
    setPhase(prev => prev.name === "playing" ? { ...prev, selectedId: answerId, showCorrect: true } : prev);

    if (isCorrect) {
      const newStreak = myStreak + 1;
      setMyStreak(newStreak);
      // Cosmetic display score uses same difficulty-based rules as server:
      // base = easy:1 medium:2 hard:3, speedBonus = +1 if answered in first half, streakBonus = +1 or +2
      const diffMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
      const base = diffMap[q.difficulty?.toLowerCase() ?? "medium"] ?? 2;
      const totalMs = phase.session.timePerQuestion * 1000;
      const isSuspicious = timeTakenMs < 500;
      const speedBonus = (!isSuspicious && (totalMs - timeTakenMs) / totalMs >= 0.5) ? 1 : 0;
      const streakBonus = isSuspicious ? 0 : newStreak >= 5 ? 2 : newStreak >= 2 ? 1 : 0;
      setMyScore(s => s + base + speedBonus + streakBonus);
      if (!muted) { if (newStreak > 2) sounds.streak(); else sounds.correct(); }
    } else {
      setMyStreak(0);
      if (!muted) sounds.incorrect();
    }

    advanceQuestion(phase.session, phase.qIndex, answerId, isCorrect, timeTakenMs);
  }

  function handleTimeout() {
    if (phase.name !== "playing" || phase.selectedId !== null) return;
    const activeMs = Date.now() - phase.startedAt;
    if (activeMs < 1000) return; // guard: must be active at least 1s
    setPhase(prev => prev.name === "playing" ? { ...prev, selectedId: -1, showCorrect: true } : prev);
    setMyStreak(0);
    if (!muted) sounds.incorrect();
    advanceQuestion(phase.session, phase.qIndex, null, false, phase.session.timePerQuestion * 1000);
  }

  async function completeGame(session: SoloSession, timeTakenSeconds: number) {
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
          // Pass actual game timing so server can score correctly
          timePerQuestion: session.timePerQuestion,
          scoringMode: "speed",
        }),
      });
      const result = await res.json();
      if (isAuthenticated === false) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const key = `kwd_solo_plays_${todayStr}`;
        const current = localStorage.getItem(key);
        const count = current ? parseInt(current, 10) : 0;
        localStorage.setItem(key, (count + 1).toString());
      }
      // Always use the server-authoritative totalScore
      setPhase({ name: "results", session, answers: answersRef.current, result });
      if (!muted) sounds.podium();
    } catch {
      // Fallback: use cosmetic display score if server fails
      const correctCount = answersRef.current.filter(a => a.isCorrect).length;
      const accuracy = answersRef.current.length > 0 ? Math.round((correctCount / answersRef.current.length) * 100) : 0;
      setPhase({ name: "results", session, answers: answersRef.current, result: { totalScore: myScore, accuracyPercentage: accuracy, timeTakenSeconds, correctAnswers: correctCount, totalQuestions: session.questions.length, personalBest: myScore, isNewPersonalBest: false, perQuestion: [] } });
    }
  }
  completeGameRef.current = completeGame;

  // ── SETUP ──────────────────────────────────────────────────────────────────
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
          {isAuthenticated === false && (
            <div className="border-2 border-orange-500 bg-orange-50 p-4 flex items-start gap-3">
              <div className="text-orange-600 flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-black text-sm text-orange-900 mb-1" style={khFont}>{kh ? "ការជូនដំណឹង" : "Guest Mode"}</div>
                <div className="text-xs text-orange-800" style={khFont}>
                  {kh ? "អ្នកកំពុងលេងក្នុងរបៀបភ្ញៀវ។ ពិន្ទុរបស់អ្នកនឹងមិនត្រូវបានរក្សាទុក។" : "You're playing in guest mode. Your scores won't be saved. Please log in to track your progress."}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>{kh ? "របៀបលេង" : "Game Mode"}</div>
            <div className="grid grid-cols-2 gap-3">
              {GAME_MODES.map(m => (
                <button key={m.id} onClick={() => {
                  setSelectedMode(m.id);
                  setQuestionCount(m.defaultQuestionCount);
                }} className="p-4 border-2 border-black text-left transition-all duration-100 rounded-none"
                  style={{ backgroundColor: selectedMode === m.id ? m.color : "#fff", boxShadow: selectedMode === m.id ? "4px 4px 0 #000" : "2px 2px 0 #000", transform: selectedMode === m.id ? "translate(-2px,-2px)" : undefined }}>
                  <div className="font-black text-sm text-black" style={khFont}>{kh ? m.labelKm : m.label}</div>
                  <div className="text-xs text-black/60 mt-0.5" style={khFont}>{kh ? m.descriptionKm : m.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
              {kh ? "ចំនួនសំណួរ" : "Number of Questions"}
            </div>
            <div className="text-xs text-zinc-400 mb-3" style={khFont}>
              {kh ? `ជ្រើស ${(GAME_MODE_CONFIG[selectedMode]?.allowedQuestionCounts ?? [10]).join(", ")} សំណួរ` : `Choose from ${(GAME_MODE_CONFIG[selectedMode]?.allowedQuestionCounts ?? [10]).join(", ")} questions`}
            </div>
            <div className="flex gap-2 flex-wrap">
              {(GAME_MODE_CONFIG[selectedMode]?.allowedQuestionCounts ?? [10]).map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className="w-14 h-14 border-2 border-black font-black text-lg transition-all duration-100 rounded-none"
                  style={{
                    backgroundColor: questionCount === n ? "#000" : "#fff",
                    color: questionCount === n ? "#ffd700" : "#000",
                    boxShadow: questionCount === n ? "3px 3px 0 #ffd700" : "2px 2px 0 #000",
                    transform: questionCount === n ? "translate(-1px,-1px)" : undefined,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-zinc-500" style={khFont}>
              {kh
                ? `ជ្រើស: ${questionCount} សំណួរ · ${GAME_MODE_CONFIG[selectedMode]?.timePerQuestion ?? 30}វិ/សំណួរ`
                : `Selected: ${questionCount} questions · ${GAME_MODE_CONFIG[selectedMode]?.timePerQuestion ?? 30}s per question`
              }
            </div>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>{kh ? "ប្រភេទ" : "Categories"}</div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const sel = selectedCats.includes(cat.id);
                return (
                  <button key={cat.id} onClick={() => setSelectedCats(prev => sel ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                    className="px-3 py-1.5 border-2 border-black text-sm font-bold transition-all duration-100 rounded-none"
                    style={{ backgroundColor: sel ? "#000" : "#fff", color: sel ? "#ffd700" : "#000", boxShadow: sel ? "2px 2px 0 #ffd700" : "2px 2px 0 #000" }}>
                    <span style={khFont}>{kh ? cat.titleKm : cat.titleEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>{kh ? "កម្រិត" : "Difficulty"}</div>
            <div className="flex gap-2">
              {[{ id: "mixed", en: "Mixed", km: "ចម្រុះ" }, { id: "easy", en: "Easy", km: "ងាយ" }, { id: "medium", en: "Medium", km: "មធ្យម" }, { id: "hard", en: "Hard", km: "លំបាក" }].map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)} className="flex-1 py-2 border-2 border-black text-sm font-black transition-all duration-100 rounded-none"
                  style={{ backgroundColor: difficulty === d.id ? "#000" : "#fff", color: difficulty === d.id ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}>
                  <span style={khFont}>{kh ? d.km : d.en}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 font-bold text-sm border-2 border-red-500 px-3 py-2" style={khFont}>{error}</p>}

          <button onClick={startGame} className="w-full py-5 bg-black text-yellow-400 font-black text-xl border-2 border-black transition-all duration-100 hover:-translate-y-0.5 rounded-none"
            style={{ boxShadow: "5px 5px 0 #ffd700", ...khFont }}>
            {kh ? "ចាប់ផ្តើម" : "Start Game"}<ChevronRight className="inline ml-2" size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (phase.name === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-black text-xl" style={khFont}>{kh ? "កំពុងរៀបចំ..." : "Loading questions..."}</p>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (phase.name === "results") {
    const r = phase.result;
    return (
      <div className="min-h-screen bg-white rounded-none">
        <div className="bg-yellow-400 border-b-4 border-black py-8 px-6 text-center rounded-none">
          <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-4 py-2 mb-4 shadow-[3px_3px_0_#000]" style={{ borderRadius: "0px", ...khFont }}>
            {kh ? "ចប់ហ្គេម" : "Game Over"}
          </div>
          {r.isNewPersonalBest && (
            <div className="inline-block bg-black text-yellow-400 text-xs font-black px-4 py-2 mb-4 ml-2 border-2 border-black shadow-[3px_3px_0_#000]" style={{ borderRadius: "0px", ...khFont }}>
              {kh ? "ពិន្ទុខ្ពស់បំផុតថ្មី!" : "New Personal Best!"}
            </div>
          )}
          <div className="text-7xl font-black text-black tabular-nums mb-2">{r.totalScore.toLocaleString()}</div>
          <div className="text-black/60 font-bold text-lg" style={khFont}>{kh ? "ពិន្ទុ" : "points"}</div>
        </div>

        <div className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">
          {/* Simple Statistics - Brutalist Style */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: kh ? "ភាពត្រឹមត្រូវ" : "Accuracy", value: `${r.accuracyPercentage}%`, color: "#22c55e", icon: "✓" },
              { label: kh ? "ត្រូវ" : "Correct", value: `${r.correctAnswers}/${r.totalQuestions}`, color: "#3b82f6", icon: "Q" },
              { label: kh ? "ពេលវេលា" : "Time", value: `${r.timeTakenSeconds}s`, color: "#f97316", icon: "⏱" },
            ].map(s => (
              <div key={s.label} className="border-4 border-black p-5 text-center shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
                <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-black text-zinc-600 uppercase tracking-wider" style={khFont}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Question Overview - Simple Grid */}
          <div className="border-4 border-black p-5 bg-zinc-50 shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
            <div className="text-sm font-black uppercase tracking-widest text-black mb-4" style={khFont}>
              {kh ? "សង្ខេបលទ្ធផល" : "Results Overview"}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {r.perQuestion.map((q, i) => (
                <div
                  key={q.questionId}
                  className="w-10 h-10 border-3 border-black flex items-center justify-center text-sm font-black text-white shadow-[2px_2px_0_#000]"
                  style={{
                    backgroundColor: q.isCorrect ? "#22c55e" : "#ef4444",
                    borderRadius: "0px",
                    borderWidth: "3px"
                  }}
                  title={`Q${i + 1}: ${q.isCorrect ? "+" + q.pointsEarned : "0"} pts`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Locked Statistics Message - For Students */}
          <div className="border-4 border-yellow-400 bg-black p-6 text-center shadow-[6px_6px_0_#eab308]" style={{ borderRadius: "0px" }}>
            <div className="text-yellow-400 text-4xl mb-3">🔒</div>
            <div className="text-white font-black text-lg mb-2" style={khFont}>
              {kh ? "ស្ថិតិលម្អិតត្រូវបានចាក់សោ" : "Detailed Statistics Locked"}
            </div>
            <div className="text-zinc-400 text-sm mb-4 font-bold" style={khFont}>
              {kh
                ? "សូមស្នើឱ្យគ្រូរបស់អ្នកដើម្បីដោះសោរស្ថិតិលម្អិត និងការវិភាគ"
                : "Ask your teacher to unlock detailed statistics and analysis"}
            </div>
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-xs font-black px-4 py-2 border-2 border-yellow-400" style={{ borderRadius: "0px" }}>
              <span style={khFont}>{kh ? "🎓 តម្រូវអោយមាន Teacher Pro" : "🎓 Requires Teacher Pro"}</span>
            </div>
          </div>

          {/* Action Buttons - Brutalist */}
          <div className="flex gap-4">
            <button
              onClick={() => { resetGameState(); setPhase({ name: "setup" }); }}
              className="flex-1 py-4 bg-yellow-400 text-black font-black border-4 border-black flex items-center justify-center gap-2 shadow-[4px_4px_0_#000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all"
              style={{ borderRadius: "0px", ...khFont }}
            >
              <RotateCcw size={18} />{kh ? "លេងម្តងទៀត" : "Play Again"}
            </button>
            <button
              onClick={() => router.push("/play")}
              className="flex-1 py-4 bg-black text-yellow-400 font-black border-4 border-black shadow-[4px_4px_0_#eab308] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#eab308] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#eab308] transition-all"
              style={{ borderRadius: "0px", ...khFont }}
            >
              {kh ? "ជ្រើសរើសរបៀបផ្សេង" : "Change Mode"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────
  const q = phase.session.questions[phase.qIndex];
  // correctId only shown after user selects or time runs out
  const correctId = phase.showCorrect ? (q.answers.find(a => a.isCorrect)?.id ?? null) : null;
  const effectiveLang = lang as "en" | "kh";

  const isSelected = phase.selectedId !== null;
  const selectedAns = q.answers.find(a => a.id === phase.selectedId);
  const isCorrect = selectedAns?.isCorrect ?? false;
  const isTimeout = phase.selectedId === -1;

  return (
    <div className="game-dot-bg fixed inset-0 z-50 flex flex-col rounded-none" style={{ userSelect: "none" }}>
      <div className="relative z-10 flex items-center justify-between px-6 py-3 bg-zinc-950 border-b border-zinc-800 flex-shrink-0 h-14 rounded-none">
        <span className="text-zinc-400 font-black text-xs uppercase tracking-widest" style={khFont}>
          {kh ? GAME_MODE_CONFIG[phase.session.gameMode]?.labelKm : GAME_MODE_CONFIG[phase.session.gameMode]?.label}
        </span>
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
      </div>

      <div className="h-1.5 bg-zinc-800 flex-shrink-0">
        <div className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${((phase.qIndex + 1) / phase.session.questions.length) * 100}%` }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-4 gap-4 max-w-2xl mx-auto w-full justify-start sm:justify-center overflow-y-auto min-h-0">
        {/* Q-index + difficulty + timer row (Stable row) - Smaller labels */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 w-full bg-zinc-900 border-2 border-black rounded-none h-16 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap py-1">
            <span className="shrink-0 text-zinc-300 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-zinc-850 px-2 py-1 rounded-none border border-zinc-800" style={khFont}>
              {kh ? `${phase.qIndex + 1}/${phase.session.questions.length}` : `Q ${phase.qIndex + 1} / ${phase.session.questions.length}`}
            </span>
            <span className="shrink-0 text-yellow-400 font-black text-[9px] sm:text-[10px] uppercase bg-yellow-400/10 px-2 py-1 rounded-none border border-yellow-400/30" style={khFont}>
              {q.difficulty || "Mixed"}
            </span>
            {q.topicCode && (
              <span className="shrink-0 text-zinc-400 font-mono text-[9px] sm:text-[10px] bg-zinc-850 px-2 py-1 rounded-none border border-zinc-800 tracking-wider">
                {q.topicCode.trim()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Mute icon button */}
            <button
              onClick={() => setMuted(m => !m)}
              className={`shrink-0 p-1.5 rounded-none border transition-all ${muted
                ? "bg-red-950/40 border-red-500/60 text-red-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                }`}
              title={muted ? (kh ? "បើកសំឡេង" : "Unmute") : (kh ? "បិទសំឡេង" : "Mute")}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <div className="shrink-0 scale-90 origin-right">
              <CountdownTimer
                endsAt={phase.endsAt}
                totalSeconds={phase.session.timePerQuestion}
                onExpire={handleTimeout}
                muted={muted}
              />
            </div>
          </div>
        </div>

        {/* Question image (Stable height wrapper - white background for signs) */}
        <div className={`shrink-0 w-full h-48 flex items-center justify-center p-3 relative overflow-hidden rounded-none ${q.imageUrl
          ? "border-4 border-black bg-white shadow-[6px_6px_0_#000]"
          : "border-2 border-transparent bg-transparent"
          }`}>
          {q.imageUrl ? (
            <img src={cloudinaryOptimize(q.imageUrl, 800)} alt="question" className="h-full w-auto object-contain select-none pointer-events-none rounded-none" />
          ) : null}
        </div>

        {/* Question text card (compact & smaller) */}
        <div
          className="shrink-0 w-full min-h-[4rem] h-auto bg-zinc-900 border-2 border-black p-3 rounded-none text-white font-black flex items-center justify-center text-center select-text animate-fade-in"
          style={{
            fontSize: "clamp(0.95rem, 3.5vw, 1.4rem)",
            lineHeight: "1.3",
            ...khFont
          }}
        >
          <div className="w-full py-1">
            {effectiveLang === "kh" ? q.questionKm || q.questionEn : q.questionEn}
          </div>
        </div>

        {/* Answer grid (Stable min-height wrapper) */}
        <div className="shrink-0 min-h-[176px]">
          <AnswerGrid
            answers={q.answers}
            selectedId={phase.selectedId === -1 ? null : phase.selectedId}
            correctId={correctId}
            disabled={phase.selectedId !== null}
            lang={effectiveLang}
            gameType={q.gameType}
            onSelect={handleSelect}
          />
        </div>

        {/* Stable Feedback / Status slot */}
        <div className="shrink-0 h-24 flex items-center justify-center w-full">
          {isSelected ? (
            <div
              className={`w-full border-2 p-3 rounded-none flex flex-col items-center justify-center gap-1 transition-all ${!isTimeout && isCorrect
                ? "border-green-400 bg-green-500/10"
                : "border-red-400 bg-red-500/10"
                }`}
            >
              <div className="flex items-center gap-2">
                {!isTimeout && isCorrect
                  ? <CheckCircle className="text-green-400" size={20} />
                  : <XCircle className="text-red-400" size={20} />}
                <span className="text-white font-black text-base" style={khFont}>
                  {isTimeout
                    ? (kh ? "អស់ម៉ោង!" : "Time out!")
                    : isCorrect
                      ? (kh ? "ត្រូវ!" : "Correct!")
                      : (kh ? "មិនត្រូវ" : "Incorrect")}
                </span>
              </div>
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
