"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { sounds } from "@/lib/game-sounds";
import { GAME_MODE_CONFIG } from "@/lib/game-engine";
import { Zap, Flame, ChevronRight, RotateCcw, Volume2, VolumeX, X } from "lucide-react";

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
    answersRef.current.push({ questionId: session.questions[qIndex].id, answerId, isCorrect, timeTakenMs });

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
      const pts = 1000 + Math.floor(1000 * Math.max(0, (phase.session.timePerQuestion * 1000 - timeTakenMs) / (phase.session.timePerQuestion * 1000)));
      const bonus = Math.floor(1000 * Math.min(Math.max(newStreak - 1, 0), 5) * 0.1);
      setMyScore(s => s + pts + bonus);
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
    const finalScore = myScore;
    try {
      const res = await fetch("/api/game/solo/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId, answers: answersRef.current, timeTakenSeconds, gameMode: session.gameMode, difficulty }),
      });
      const result = await res.json();
      setPhase({ name: "results", session, answers: answersRef.current, result: { ...result, totalScore: finalScore, personalBest: Math.max(result.personalBest ?? 0, finalScore) } });
      if (!muted) sounds.podium();
    } catch {
      setPhase({ name: "results", session, answers: answersRef.current, result: { totalScore: finalScore, accuracyPercentage: 0, timeTakenSeconds, correctAnswers: 0, totalQuestions: session.questions.length, personalBest: finalScore, isNewPersonalBest: false, perQuestion: [] } });
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
                }} className="p-4 border-2 border-black text-left transition-all duration-100"
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
                  className="w-14 h-14 border-2 border-black font-black text-lg transition-all duration-100"
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
                    className="px-3 py-1.5 border-2 border-black text-sm font-bold transition-all duration-100"
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
                <button key={d.id} onClick={() => setDifficulty(d.id)} className="flex-1 py-2 border-2 border-black text-sm font-black transition-all duration-100"
                  style={{ backgroundColor: difficulty === d.id ? "#000" : "#fff", color: difficulty === d.id ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}>
                  <span style={khFont}>{kh ? d.km : d.en}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 font-bold text-sm border-2 border-red-500 px-3 py-2" style={khFont}>{error}</p>}

          <button onClick={startGame} className="w-full py-5 bg-black text-yellow-400 font-black text-xl border-2 border-black transition-all duration-100 hover:-translate-y-0.5"
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
      <div className="min-h-screen bg-white">
        <div className="bg-yellow-400 border-b-2 border-black py-8 px-6 text-center">
          <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>{kh ? "ចប់ហ្គេម" : "Game Over"}</div>
          {r.isNewPersonalBest && <div className="inline-block bg-black text-yellow-400 text-xs font-black px-3 py-1.5 mb-3 ml-2 border-2 border-black" style={{ boxShadow: "2px 2px 0 #000", ...khFont }}>{kh ? "ពិន្ទុខ្ពស់បំផុតថ្មី!" : "New Personal Best!"}</div>}
          <div className="text-6xl font-black text-black tabular-nums">{r.totalScore.toLocaleString()}</div>
          <div className="text-black/60 font-bold mt-1" style={khFont}>{kh ? "ពិន្ទុ" : "points"}</div>
        </div>
        <div className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: kh ? "ភាពត្រឹមត្រូវ" : "Accuracy", value: `${r.accuracyPercentage}%`, color: "#22c55e" },
              { label: kh ? "ត្រូវ" : "Correct", value: `${r.correctAnswers}/${r.totalQuestions}`, color: "#3b82f6" },
              { label: kh ? "ពេលវេលា" : "Time", value: `${r.timeTakenSeconds}s`, color: "#f97316" },
            ].map(s => (
              <div key={s.label} className="border-2 border-black p-4 text-center" style={{ boxShadow: "3px 3px 0 #000" }}>
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-bold text-zinc-500 mt-1" style={khFont}>{s.label}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>{kh ? "លទ្ធផលម្តងៗ" : "Question Breakdown"}</div>
            <div className="flex gap-1.5 flex-wrap">
              {r.perQuestion.map((q, i) => (
                <div key={q.questionId} className="w-8 h-8 border-2 border-black flex items-center justify-center text-xs font-black text-white"
                  style={{ backgroundColor: q.isCorrect ? "#22c55e" : "#ef4444" }} title={`Q${i + 1}: ${q.isCorrect ? "+" + q.pointsEarned : "0"}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="mt-2 space-y-4">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
              {kh ? "ពិនិត្យមើលចម្លើយរបស់អ្នកឡើងវិញ" : "Review Your Answers"}
            </div>

            {phase.session.questions.map((q, i) => {
              const record = phase.answers.find((a) => a.questionId === q.id);
              if (!record) return null;

              const isCorrect = record.isCorrect;
              const selectedAnswer = q.answers.find(a => a.id === record.answerId);
              const correctAnswer = q.answers.find(a => a.isCorrect);

              return (
                <div key={q.id} className={`border-2 border-black p-4 bg-white`} style={{ boxShadow: "3px 3px 0 #000" }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="shrink-0 w-6 h-6 flex items-center justify-center text-white font-black text-xs border-2 border-black"
                      style={{ backgroundColor: isCorrect ? "#22c55e" : "#ef4444" }}
                    >
                      {i + 1}
                    </div>
                    <div className="font-bold text-sm leading-snug" style={khFont}>
                      {kh ? (q.questionKm || q.questionEn) : q.questionEn}
                    </div>
                  </div>

                  {/* Hide images if image_pick, else show */}
                  {q.imageUrl && q.gameType !== "image_pick" && (
                    <div className="mb-3 border-2 border-zinc-200 p-2 flex justify-center bg-zinc-50">
                      <img src={q.imageUrl} alt="Question" className="max-h-24 w-auto object-contain" />
                    </div>
                  )}

                  <div className="space-y-2 ml-9">
                    {/* Selected Answer */}
                    <div className={`p-2 border-2 border-black text-sm flex gap-2 items-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`} style={khFont}>
                      <span className="font-black shrink-0">{isCorrect ? '✓' : '✗'}</span>
                      <span className="font-bold">
                        {kh ? "អ្នកជ្រើសរើស:" : "You chose:"}
                      </span>
                      {selectedAnswer ? (
                        <>
                          {selectedAnswer.imageUrl && <img src={selectedAnswer.imageUrl} className="h-6 w-auto" alt="Answer" />}
                          <span className="flex-1 line-clamp-2">{kh ? (selectedAnswer.answerKm || selectedAnswer.answerEn) : selectedAnswer.answerEn}</span>
                        </>
                      ) : (
                        <span className="text-zinc-500 italic">{kh ? "អស់ម៉ោង" : "Time out"}</span>
                      )}
                    </div>

                    {/* Show Correct Answer if they were wrong */}
                    {!isCorrect && correctAnswer && (
                      <div className={`p-2 border-2 border-black bg-green-100 text-sm flex gap-2 items-center`} style={khFont}>
                        <span className="font-black shrink-0 text-green-600">✓</span>
                        <span className="font-bold">
                          {kh ? "ចម្លើយត្រូវ:" : "Correct answer:"}
                        </span>
                        {correctAnswer.imageUrl && <img src={correctAnswer.imageUrl} className="h-6 w-auto" alt="Answer" />}
                        <span className="flex-1 line-clamp-2">{kh ? (correctAnswer.answerKm || correctAnswer.answerEn) : correctAnswer.answerEn}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { resetGameState(); setPhase({ name: "setup" }); }}
              className="flex-1 py-4 bg-white text-black font-black border-2 border-black flex items-center justify-center gap-2"
              style={{ boxShadow: "3px 3px 0 #000", ...khFont }}>
              <RotateCcw size={16} />{kh ? "លេងម្តងទៀត" : "Play Again"}
            </button>
            <button onClick={() => router.push("/play")} className="flex-1 py-4 bg-black text-yellow-400 font-black border-2 border-black"
              style={{ boxShadow: "3px 3px 0 #ffd700", ...khFont }}>
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

  return (
    <div className="game-dot-bg fixed inset-0 z-50 flex flex-col" style={{ userSelect: "none" }}>
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm border-b-2 border-yellow-400">
        <span className="text-yellow-400 font-black text-xs uppercase tracking-widest" style={khFont}>
          {kh ? GAME_MODE_CONFIG[phase.session.gameMode]?.labelKm : GAME_MODE_CONFIG[phase.session.gameMode]?.label}
        </span>
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
          <button onClick={() => { resetGameState(); setPhase({ name: "setup" }); }} className="ml-2 text-zinc-500 hover:text-red-500 transition-colors" title={kh ? "បោះបង់" : "Quit Game"}>
            <X size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="h-1.5 bg-zinc-800">
        <div className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${((phase.qIndex + 1) / phase.session.questions.length) * 100}%` }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-4 gap-4 max-w-2xl mx-auto w-full justify-center overflow-y-auto min-h-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 text-sm font-black uppercase tracking-widest bg-zinc-800/80 px-2 py-1 rounded border border-zinc-700" style={khFont}>
              {kh ? `${phase.qIndex + 1}/${phase.session.questions.length}` : `Q ${phase.qIndex + 1} / ${phase.session.questions.length}`}
            </span>
            <span className="text-yellow-500 font-black text-xs uppercase bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30 shadow-sm" style={khFont}>
              {q.difficulty || "mixed"}
            </span>
            {q.topicCode && (
              <a
                href={`/admin/questions?topicCode=${encodeURIComponent(q.topicCode.trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 font-mono text-[10px] bg-zinc-800/80 px-2 py-1 rounded border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all tracking-wider"
                title={`Topic: ${q.topicCode.trim()} — click to view in admin`}
              >
                {q.topicCode.trim()}
              </a>
            )}
            <button onClick={() => setMuted(m => !m)} className="p-1.5 rounded bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all" title={muted ? (kh ? "បើកសំឡេង" : "Unmute") : (kh ? "បិទសំឡេង" : "Mute")}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
          <CountdownTimer
            endsAt={phase.endsAt}
            totalSeconds={phase.session.timePerQuestion}
            onExpire={handleTimeout}
            muted={muted}
          />
        </div>

        {q.imageUrl && q.gameType !== "image_pick" && (
          <div className="border-2 border-black bg-white flex items-center justify-center p-4" style={{ minHeight: 180 }}>
            <img src={q.imageUrl} alt="question" className="max-h-44 w-auto object-contain" />
          </div>
        )}

        <div className="bg-zinc-900/90 backdrop-blur-md border-2 border-zinc-600 p-6 sm:p-8 rounded-lg text-white font-black text-xl sm:text-2xl md:text-3xl leading-snug break-words text-center shadow-lg"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)", ...khFont }}>
          {effectiveLang === "kh" ? q.questionKm || q.questionEn : q.questionEn}
        </div>

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
    </div>
  );
}
