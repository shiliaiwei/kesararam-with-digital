"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { sounds } from "@/lib/game-sounds";
import { calculateScore } from "@/lib/game-engine";
import { Zap, Flame, RotateCcw, ChevronRight, ArrowLeft, BookOpen } from "lucide-react";
import { cloudinaryOptimize } from "@/lib/cloudinary";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  slug: string;
  titleEn: string;
  titleKm: string;
  sortOrder: number;
  isActive: boolean;
}

interface SoloAnswer {
  id: number;
  answerEn: string;
  answerKm: string;
  imageUrl: string | null;
  isCorrect: boolean;
}

interface SoloQuestion {
  id: number;
  questionEn: string;
  questionKm: string;
  imageUrl: string | null;
  audioUrlEn: string | null;
  audioUrlKm: string | null;
  gameType: "mcq" | "true_false" | "image_pick";
  difficulty: string | null;
  answers: SoloAnswer[];
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
  categoryName: string;
  perQuestion: { questionId: number; isCorrect: boolean; pointsEarned: number; timeTakenMs: number }[];
}

type Phase =
  | { name: "select" }
  | { name: "loading"; category: Category }
  | { name: "playing"; session: SoloSession; category: Category; qIndex: number; endsAt: string; startedAt: number }
  | { name: "results"; session: SoloSession; result: ResultData; answers: AnswerRecord[] };

// ─── Category icons by slug ──────────────────────────────────────────────────

const CAT_META: Record<string, { icon: string; color: string; accent: string; descEn: string; descKm: string }> = {
  driving: {
    icon: "🚗",
    color: "#3b82f6",
    accent: "#1d4ed8",
    descEn: "Rules, lanes, and everyday driving",
    descKm: "ច្បាប់ ផ្លូវវិថី និងការបើករថយន្ត",
  },
  emergency: {
    icon: "🚨",
    color: "#ef4444",
    accent: "#b91c1c",
    descEn: "Emergency protocols and first response",
    descKm: "ការឆ្លើយតបបន្ទាន់ និងស្ថានការណ៍អាសន្ន",
  },
  "general-knowledge": {
    icon: "📚",
    color: "#8b5cf6",
    accent: "#6d28d9",
    descEn: "General road law and traffic knowledge",
    descKm: "ចំណេះដឹងទូទៅអំពីច្បាប់ចរាចរ",
  },
  "loading-people-goods": {
    icon: "📦",
    color: "#f97316",
    accent: "#c2410c",
    descEn: "Loading passengers and freight rules",
    descKm: "ការដឹកអ្នកដំណើរ និងទំនិញ",
  },
  priority: {
    icon: "⚡",
    color: "#eab308",
    accent: "#a16207",
    descEn: "Right of way and priority at junctions",
    descKm: "សិទ្ធិឆ្លងកាត់ និងអាទិភាព",
  },
  "road-sign": {
    icon: "🚦",
    color: "#22c55e",
    accent: "#15803d",
    descEn: "Traffic signs and road markings",
    descKm: "សញ្ញាផ្លូវវិថី និងសញ្ញាសម្គាល់",
  },
  "road-traffic": {
    icon: "🛣️",
    color: "#06b6d4",
    accent: "#0e7490",
    descEn: "Traffic rules and road management",
    descKm: "ច្បាប់ចរាចរ និងការគ្រប់គ្រងផ្លូវវិថី",
  },
  technical: {
    icon: "🔧",
    color: "#a855f7",
    accent: "#7e22ce",
    descEn: "Vehicle mechanics and technical requirements",
    descKm: "ម៉ាស៊ីន និងតម្រូវការបច្ចេកទេស",
  },
};

function getCatMeta(slug: string) {
  return CAT_META[slug] ?? { icon: "📋", color: "#6b7280", accent: "#374151", descEn: "", descKm: "" };
}

// ─── Category Card ───────────────────────────────────────────────────────────

function CategoryCard({
  cat,
  onSelect,
  kh,
  khFont,
}: {
  cat: Category;
  onSelect: (cat: Category) => void;
  kh: boolean;
  khFont: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const meta = getCatMeta(cat.slug);

  return (
    <button
      onClick={() => onSelect(cat)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col items-start border-2 border-black text-left overflow-hidden transition-all duration-200"
      style={{
        background: "#fff",
        boxShadow: hovered ? `8px 8px 0 ${meta.accent}` : "4px 4px 0 #000",
        transform: hovered ? "translate(-4px,-4px)" : "translate(0,0)",
      }}
    >
      {/* Top stripe */}
      <div className="h-1.5 w-full" style={{ backgroundColor: meta.color }} />

      {/* Icon area */}
      <div
        className="w-full flex items-center justify-center py-8 transition-colors duration-300"
        style={{ backgroundColor: hovered ? meta.color : `${meta.color}18` }}
      >
        <span
          className="text-5xl transition-transform duration-300"
          style={{ transform: hovered ? "scale(1.2) rotate(5deg)" : "scale(1) rotate(0deg)" }}
        >
          {meta.icon}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1 border-t-2 border-black w-full">
        <div className="font-black text-base text-black leading-tight" style={khFont}>
          {kh ? cat.titleKm : cat.titleEn}
        </div>
        <div className="text-xs text-zinc-500 leading-snug" style={khFont}>
          {kh ? meta.descKm : meta.descEn}
        </div>
        <div
          className="mt-3 py-2.5 font-black text-sm border-2 border-black text-center transition-all duration-200"
          style={{
            backgroundColor: hovered ? "#000" : meta.color,
            color: hovered ? meta.color : "#000",
          }}
        >
          <span style={khFont}>{kh ? "ចាប់ផ្តើម →" : "Start →"}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CategoryQuizPage() {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};
  const qaFont = kh ? { fontFamily: "var(--font-learning)" } : {};

  const [phase, setPhase] = useState<Phase>({ name: "select" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // In-game state
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const answersRef = useRef<AnswerRecord[]>([]);
  const sessionStartRef = useRef(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => setIsAuthenticated(r.ok)).catch(() => setIsAuthenticated(false));
    fetch("/api/game/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => { });
  }, []);

  async function handleCategorySelect(cat: Category) {
    setError("");
    setPhase({ name: "loading", category: cat });
    answersRef.current = [];
    setMyScore(0);
    setMyStreak(0);
    setSelectedId(null);
    setShowCorrect(false);

    try {
      const res = await fetch("/api/game/solo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryIds: [cat.id],
          difficulty: "mixed",
          questionCount: 20,
          timePerQuestion: 60,
          gameMode: "category-quiz",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to load questions");
        setPhase({ name: "select" });
        return;
      }

      const session: SoloSession = await res.json();
      sessionStartRef.current = Date.now();
      const endsAt = new Date(Date.now() + session.timePerQuestion * 1000).toISOString();
      setPhase({ name: "playing", session, category: cat, qIndex: 0, endsAt, startedAt: Date.now() });
      if (!muted) sounds.question_start();
    } catch {
      setError(kh ? "មានបញ្ហា" : "Something went wrong");
      setPhase({ name: "select" });
    }
  }

  const completeGameRef = useRef<((session: SoloSession, category: Category, timeTakenSeconds: number) => void) | null>(null);

  const advanceQuestion = useCallback(
    (session: SoloSession, category: Category, qIndex: number, answerId: number | null, isCorrect: boolean, timeTakenMs: number) => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      const q = session.questions[qIndex];
      answersRef.current.push({ questionId: q.id, answerId, isCorrect, timeTakenMs, difficulty: q.difficulty ?? null });

      const nextIdx = qIndex + 1;
      if (nextIdx >= session.questions.length) {
        const totalTime = Math.round((Date.now() - sessionStartRef.current) / 1000);
        completeGameRef.current?.(session, category, totalTime);
        return;
      }

      advanceTimerRef.current = setTimeout(() => {
        setSelectedId(null);
        setShowCorrect(false);
        const endsAt = new Date(Date.now() + session.timePerQuestion * 1000).toISOString();
        setPhase({ name: "playing", session, category, qIndex: nextIdx, endsAt, startedAt: Date.now() });
        if (!muted) sounds.question_start();
      }, 1600);
    },
    [muted]
  );

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
      const totalMs = phase.session.timePerQuestion * 1000;
      const score = calculateScore({
        isCorrect: true,
        difficulty: q.difficulty ?? "medium",
        scoringMode: "speed",
        remainingTimeMs: Math.max(0, totalMs - timeTakenMs),
        totalTimeMs: totalMs,
        currentStreak: newStreak,
      });
      setMyScore((s) => s + score.totalPoints);
      if (!muted) { if (newStreak > 2) sounds.streak(); else sounds.correct(); }
    } else {
      setMyStreak(0);
      if (!muted) sounds.incorrect();
    }

    advanceQuestion(phase.session, phase.category, phase.qIndex, answerId, isCorrect, timeTakenMs);
  }

  function handleTimeout() {
    if (phase.name !== "playing" || selectedId !== null) return;
    setSelectedId(-1);
    setShowCorrect(true);
    setMyStreak(0);
    if (!muted) sounds.incorrect();
    advanceQuestion(phase.session, phase.category, phase.qIndex, null, false, phase.session.timePerQuestion * 1000);
  }

  async function completeGame(session: SoloSession, category: Category, timeTakenSeconds: number) {
    const correct = answersRef.current.filter((a) => a.isCorrect).length;
    const total = session.questions.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    try {
      const res = await fetch("/api/game/solo/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          answers: answersRef.current,
          timeTakenSeconds,
          gameMode: "category-quiz",
          difficulty: "mixed",
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
      setPhase({
        name: "results",
        session,
        result: {
          ...result,
          categoryName: kh ? category.titleKm : category.titleEn,
        },
        answers: answersRef.current,
      });
    } catch {
      // Fallback to local cosmetic score if server fails
      setPhase({
        name: "results",
        session,
        result: {
          totalScore: myScore,
          accuracyPercentage: accuracy,
          timeTakenSeconds,
          correctAnswers: correct,
          totalQuestions: total,
          personalBest: myScore,
          isNewPersonalBest: false,
          categoryName: kh ? category.titleKm : category.titleEn,
          perQuestion: answersRef.current.map((a) => ({
            questionId: a.questionId,
            isCorrect: a.isCorrect,
            pointsEarned: a.isCorrect ? 2 : 0,
            timeTakenMs: a.timeTakenMs,
          })),
        },
        answers: answersRef.current,
      });
    }
    if (!muted) sounds.podium();
  }
  completeGameRef.current = completeGame;

  // ── SELECT SCREEN ──────────────────────────────────────────────────────────

  if (phase.name === "select") {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero */}
        <div
          className="border-b-4 border-black py-12 px-6"
          style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0a0a0a 70%)" }}
        >
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => router.push("/play")}
              className="flex items-center gap-2 text-cyan-400 text-sm font-black mb-6 hover:text-white transition-colors"
              style={khFont}
            >
              <ArrowLeft size={14} />
              {kh ? "ត្រឡប់ទៅ" : "Back to Play"}
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 border-2 border-cyan-400 bg-cyan-400/10 flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: "4px 4px 0 #0e7490" }}
              >
                <BookOpen size={20} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-cyan-400 text-xs font-black tracking-widest uppercase" style={khFont}>
                  {kh ? "ប្រភេទ" : "Category Quiz"}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-none" style={khFont}>
                  {kh ? "ជ្រើស​ប្រភេទ" : "Pick a Category"}
                </h1>
              </div>
            </div>

            <p className="text-white/50 text-sm max-w-lg" style={khFont}>
              {kh
                ? "ជ្រើសរើសប្រភេទ ហើយឆ្លើយសំណួររហូត ២០ ដើម្បីរៀនចំណេះដឹងបើកបររបស់អ្នក"
                : "Select a category and answer up to 20 questions to master your driving knowledge."}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-b-2 border-black bg-cyan-50 py-4 px-6">
          <div className="max-w-5xl mx-auto flex items-center gap-6 flex-wrap">
            {[
              { label: kh ? "ប្រភេទ" : "Categories", value: categories.length || "8", color: "#06b6d4" },
              { label: kh ? "សំណួរ" : "Questions / Cat", value: "Up to 20", color: "#8b5cf6" },
              { label: kh ? "ម៉ោង" : "Time / Question", value: "60s", color: "#f97316" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="font-black text-lg" style={{ color: s.color }}>{s.value}</span>
                <span className="text-xs text-zinc-500 font-bold" style={khFont}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category grid */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          {error && (
            <p className="mb-6 text-red-600 font-bold text-sm border-2 border-red-400 px-3 py-2" style={khFont}>
              {error}
            </p>
          )}

          {categories.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  onSelect={handleCategorySelect}
                  kh={kh}
                  khFont={khFont}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LOADING ────────────────────────────────────────────────────────────────

  if (phase.name === "loading") {
    const meta = getCatMeta(phase.category.slug);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">{meta.icon}</div>
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-5"
            style={{ borderColor: `${meta.color} transparent transparent transparent` }}
          />
          <p className="text-white font-black text-xl" style={khFont}>
            {kh
              ? `កំពុងរៀបចំ ${phase.category.titleKm}...`
              : `Loading ${phase.category.titleEn}...`}
          </p>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────

  if (phase.name === "results") {
    const r = phase.result;
    const meta = categories.length
      ? getCatMeta(categories.find((c) => (kh ? c.titleKm : c.titleEn) === r.categoryName)?.slug ?? "")
      : { color: "#06b6d4", icon: "📋" };

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div
          className="border-b-2 border-black py-10 px-6 text-center"
          style={{ backgroundColor: meta.color }}
        >
          <div className="text-5xl mb-3">{meta.icon}</div>
          <div
            className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3"
            style={khFont}
          >
            {kh ? "ចប់ហ្គេម" : "Game Over"} — {r.categoryName}
          </div>
          <div className="text-6xl font-black text-black tabular-nums">{r.totalScore.toLocaleString()}</div>
          <div className="text-black/60 font-bold mt-1" style={khFont}>{kh ? "ពិន្ទុ" : "points"}</div>
        </div>

        <div className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">
          {/* Stats grid */}
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
                  title={`Q${i + 1}: ${q.isCorrect ? "Correct" : "Wrong"}`}
                >
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
                    <div className="font-bold text-sm leading-snug" style={qaFont}>
                      {kh ? (q.questionKm || q.questionEn) : q.questionEn}
                    </div>
                  </div>

                  {/* Hide images if image_pick, else show */}
                  {q.imageUrl && q.gameType !== "image_pick" && (
                    <div className="mb-3 border-2 border-zinc-200 p-2 flex justify-center bg-zinc-50">
                      <img src={cloudinaryOptimize(q.imageUrl, 300)} alt="Question" className="max-h-24 w-auto object-contain" />
                    </div>
                  )}

                  <div className="space-y-2 ml-9">
                    {/* Selected Answer */}
                    <div className={`p-2 border-2 border-black text-sm flex gap-2 items-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`} style={qaFont}>
                      <span className="font-black shrink-0">{isCorrect ? '✓' : '✗'}</span>
                      <span className="font-bold">
                        {kh ? "អ្នកជ្រើសរើស:" : "You chose:"}
                      </span>
                      {selectedAnswer ? (
                        <>
                          {selectedAnswer.imageUrl && <img src={cloudinaryOptimize(selectedAnswer.imageUrl, 120)} className="h-6 w-auto" alt="Answer" />}
                          <span className="flex-1 line-clamp-2">{kh ? (selectedAnswer.answerKm || selectedAnswer.answerEn) : selectedAnswer.answerEn}</span>
                        </>
                      ) : (
                        <span className="text-zinc-500 italic">{kh ? "អស់ម៉ោង" : "Time out"}</span>
                      )}
                    </div>

                    {/* Show Correct Answer if they were wrong */}
                    {!isCorrect && correctAnswer && (
                      <div className={`p-2 border-2 border-black bg-green-100 text-sm flex gap-2 items-center`} style={qaFont}>
                        <span className="font-black shrink-0 text-green-600">✓</span>
                        <span className="font-bold">
                          {kh ? "ចម្លើយត្រូវ:" : "Correct answer:"}
                        </span>
                        {correctAnswer.imageUrl && <img src={cloudinaryOptimize(correctAnswer.imageUrl, 120)} className="h-6 w-auto" alt="Answer" />}
                        <span className="flex-1 line-clamp-2">{kh ? (correctAnswer.answerKm || correctAnswer.answerEn) : correctAnswer.answerEn}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance message */}
          <div
            className="border-2 border-black p-4 text-center"
            style={{
              backgroundColor:
                r.accuracyPercentage >= 80 ? "#bbf7d0" : r.accuracyPercentage >= 50 ? "#fef9c3" : "#fee2e2",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            <div className="font-black text-lg" style={khFont}>
              {r.accuracyPercentage >= 80
                ? kh ? "🏆 អស្ចារ្យណាស់!" : "🏆 Excellent work!"
                : r.accuracyPercentage >= 50
                  ? kh ? "👍 ល្អ! រៀនបន្ថែម" : "👍 Good effort! Keep studying."
                  : kh ? "📖 សូមច្រើនស្តាប់ MORE" : "📖 Review this category more."}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPhase({ name: "select" });
                setMyScore(0);
                setMyStreak(0);
              }}
              className="flex-1 py-4 bg-white text-black font-black border-2 border-black flex items-center justify-center gap-2"
              style={{ boxShadow: "3px 3px 0 #000", ...khFont }}
            >
              <RotateCcw size={16} />
              {kh ? "ប្តូរប្រភេទ" : "Change Category"}
            </button>
            <button
              onClick={() => router.push("/play")}
              className="flex-1 py-4 bg-black text-yellow-400 font-black border-2 border-black"
              style={{ boxShadow: "3px 3px 0 #ffd700", ...khFont }}
            >
              {kh ? "ជ្រើសរើសរបៀបផ្សេង" : "Other Modes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────

  const q = phase.session.questions[phase.qIndex];
  const correctId = showCorrect ? (q.answers.find((a) => a.isCorrect)?.id ?? null) : null;
  const effectiveLang = lang as "en" | "kh";
  const catMeta = getCatMeta(phase.category.slug);

  return (
    <div className="game-dot-bg min-h-screen flex flex-col" style={{ userSelect: "none" }}>
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm border-b-2 border-cyan-400">
        <div className="flex items-center gap-2">
          <span className="text-xl">{catMeta.icon}</span>
          <span className="text-cyan-400 font-black text-xs uppercase tracking-widest" style={khFont}>
            {kh ? phase.category.titleKm : phase.category.titleEn}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 bg-cyan-400 border-2 border-black px-3 py-1"
            style={{ boxShadow: "2px 2px 0 #000" }}
          >
            <Zap size={12} className="text-black" />
            <span className="font-black text-black text-sm tabular-nums">{myScore.toLocaleString()}</span>
          </div>
          {myStreak > 1 && (
            <div
              className="flex items-center gap-1 bg-orange-500 border-2 border-black px-2 py-1"
              style={{ boxShadow: "2px 2px 0 #000" }}
            >
              <Flame size={12} className="text-white" />
              <span className="font-black text-white text-xs">x{myStreak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-zinc-800">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${((phase.qIndex + 1) / phase.session.questions.length) * 100}%`,
            backgroundColor: catMeta.color,
          }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-4 gap-4 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-xs font-black uppercase tracking-widest" style={khFont}>
            {kh
              ? `${phase.qIndex + 1}/${phase.session.questions.length}`
              : `Q ${phase.qIndex + 1} / ${phase.session.questions.length}`}
          </span>
          <CountdownTimer
            endsAt={phase.endsAt}
            totalSeconds={phase.session.timePerQuestion}
            onExpire={handleTimeout}
            muted={muted}
          />
        </div>

        {/* Image */}
        {q.imageUrl && q.gameType !== "image_pick" && (
          <div className="border-2 border-black bg-white flex items-center justify-center p-4" style={{ minHeight: 180 }}>
            <img src={cloudinaryOptimize(q.imageUrl, 500)} alt="question" className="max-h-44 w-auto object-contain" />
          </div>
        )}

        {/* Question */}
        <div
          className="bg-zinc-900/80 backdrop-blur-sm border-2 border-zinc-700 p-4 text-white font-black text-base sm:text-lg leading-snug break-words"
          style={{ boxShadow: `3px 3px 0 ${catMeta.color}`, ...qaFont }}
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

      {/* Bottom bar */}
      <div className="relative z-10 px-4 py-2 bg-black/80 border-t border-zinc-800 flex items-center justify-between">
        <button
          onClick={() => {
            if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
            setPhase({ name: "select" });
            setMyScore(0);
            setMyStreak(0);
          }}
          className="text-zinc-500 hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
          style={khFont}
        >
          <ArrowLeft size={12} />
          {kh ? "ចេញ" : "Exit"}
        </button>
        <button
          onClick={() => setMuted((m) => !m)}
          className="text-zinc-500 hover:text-white text-xs font-bold transition-colors"
          style={khFont}
        >
          {muted ? (kh ? "បើកសំឡេង" : "Unmute") : (kh ? "បិទសំឡេង" : "Mute")}
        </button>
      </div>
    </div>
  );
}
