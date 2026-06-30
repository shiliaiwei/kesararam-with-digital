"use client";

/**
 * KWD /videoads — 9:16 vertical short-video promo generator (admin only).
 *
 * A self-contained reel that demos the real Road-Safety Online Challenge:
 * hook → learning-video preview → a REAL question (read aloud via TTS) →
 * tap answer → correct/wrong reveal → explanation → live stats HUD →
 * challenge CTA → outro tagline. Built for clean screen recording.
 *
 * Brand: Brutalist + traffic-sign palette (white / black / yellow #eab308 /
 * green #22c55e / red #ef4444), caution-tape accents, Google Sans Khmer.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Flame,
  RotateCcw,
  Circle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Globe,
} from "lucide-react";
import { CautionTape } from "@/components/brand/brand-kit";
import "./videoads.css";

/* ───────────────────────────  data types  ─────────────────────────── */

type Answer = {
  id: number | string;
  answer_en: string | null;
  answer_km: string | null;
  is_correct: boolean;
  image_url: string | null;
};

type Question = {
  id: number | string;
  topic_id: number | string;
  question_en: string | null;
  question_km: string | null;
  hint_en: string | null;
  hint_km: string | null;
  image_url: string | null;
  audio_url_km: string | null;
  audio_url_en: string | null;
  answers: Answer[];
  topic_name_en?: string | null;
  /* recorded English reading audio for the topic — same source the /learn pages play */
  topic_audio_en?: string | null;
};

/* ───────────────────────────  scene machine  ─────────────────────────── */

type Stage =
  | "idle"
  | "hook"
  | "video"
  | "question"
  | "auto"
  | "reveal"
  | "explain"
  | "stats"
  | "challenge"
  | "outro";

/* Auto-run timeline (ms). The `question` scene ignores its `ms` and instead
   waits for the recorded voice to FINISH reading (see playQuestion). */
const TIMELINE: { stage: Stage; ms: number }[] = [
  { stage: "hook", ms: 2600 },
  { stage: "video", ms: 3400 },
  { stage: "question", ms: 5200 },
  { stage: "auto", ms: 1600 },
  { stage: "reveal", ms: 3000 },
  { stage: "explain", ms: 3600 },
  { stage: "stats", ms: 3600 },
  { stage: "challenge", ms: 3000 },
  { stage: "outro", ms: 4200 },
];

/* Answer window: a visible countdown shown while the question is read.
   The scene still advances as soon as the voice finishes (capped at this). */
const ANSWER_SECONDS = 30;
/* Safety cap so a long/looping audio file can't stall the reel (= countdown). */
const QUESTION_MAX_MS = ANSWER_SECONDS * 1000;
/* Beat after the voice ends before the auto-answer fires. */
const QUESTION_TAIL_MS = 700;

const Y = "#eab308";
const GREEN = "#22c55e";
const RED = "#ef4444";

const CHOICE_LETTERS = ["A", "B", "C", "D", "E"];

/* ───────────────────────────  component  ─────────────────────────── */

export default function VideoAdsClient() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [playing, setPlaying] = useState(false);
  const stageIndexRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* The "correct" answer is what the demo auto-selects — a success story sells. */
  const correct = question?.answers.find((a) => a.is_correct) ?? null;
  const choices = question?.answers.slice(0, 4) ?? [];

  /* ── fetch a random published question with km text + answers ── */
  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const tRes = await fetch("/api/public/topics?limit=200", { cache: "no-store" });
      const tJson = await tRes.json();
      const topics: {
        id: number | string;
        name_en?: string | null;
        audio_url_en?: string | null;
      }[] = tJson.topics ?? [];
      if (!topics.length) throw new Error("no topics");

      // Prefer topics that have recorded English reading audio (same as /learn),
      // so the question is always read aloud with a real voice — never TTS.
      const withAudio = topics.filter((t) => t.audio_url_en);
      const ordered = [
        ...withAudio.sort(() => Math.random() - 0.5),
        ...topics.filter((t) => !t.audio_url_en).sort(() => Math.random() - 0.5),
      ];

      for (const t of ordered.slice(0, 12)) {
        const qRes = await fetch(`/api/public/topics/${t.id}/questions`, { cache: "no-store" });
        const qJson = await qRes.json();
        const qs: Question[] = (qJson.questions ?? []).filter(
          (q: Question) =>
            q.question_en &&
            Array.isArray(q.answers) &&
            q.answers.length >= 2 &&
            q.answers.some((a) => a.is_correct) &&
            q.answers.every((a) => a.answer_en),
        );
        // Reading audio must exist (question-level OR the topic recording).
        const playable = qs.filter((q) => q.audio_url_en || t.audio_url_en);
        if (playable.length) {
          const pick = playable[Math.floor(Math.random() * playable.length)];
          pick.topic_name_en = t.name_en ?? null;
          pick.topic_audio_en = t.audio_url_en ?? null;
          setQuestion(pick);
          setLoading(false);
          return;
        }
      }
      throw new Error("no question with reading audio found");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "load failed");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  /* ── timer helpers (track every pending timeout so we can cancel cleanly) ── */
  const after = useCallback((ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  /* Read the question aloud with the RECORDED voice (same source as /learn),
     then call onDone when the voice FINISHES — so the full question is heard. */
  const playQuestion = useCallback(
    (onDone: () => void) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        onDone();
      };
      const src = question?.audio_url_en || question?.topic_audio_en;
      // No recording → fall back to the fixed scene length.
      if (!src) {
        after(TIMELINE[2].ms, finish);
        return;
      }
      const a = new Audio(src);
      audioRef.current = a;
      a.onended = () => after(QUESTION_TAIL_MS, finish); // small beat, then advance
      a.onerror = () => after(TIMELINE[2].ms, finish);
      a.play().catch(() => after(TIMELINE[2].ms, finish)); // autoplay blocked
      after(QUESTION_MAX_MS, finish); // hard safety cap
    },
    [question, after],
  );

  /* ── auto-run scene scheduler ── */
  const runStage = useCallback(
    (index: number) => {
      if (index >= TIMELINE.length) {
        setPlaying(false);
        return;
      }
      stageIndexRef.current = index;
      const { stage: s, ms } = TIMELINE[index];
      setStage(s);
      const next = () => runStage(index + 1);
      if (s === "question") {
        // Hold this scene until the recorded question has been fully read.
        playQuestion(next);
        return;
      }
      after(ms, next);
    },
    [after, playQuestion],
  );

  const start = useCallback(() => {
    clearTimers();
    stopAudio();
    setPlaying(true);
    runStage(0);
  }, [runStage, stopAudio, clearTimers]);

  const restart = useCallback(() => {
    clearTimers();
    stopAudio();
    setStage("idle");
    setPlaying(false);
    after(60, start); // next tick → start fresh
  }, [start, stopAudio, clearTimers, after]);

  const reroll = useCallback(async () => {
    clearTimers();
    stopAudio();
    setStage("idle");
    setPlaying(false);
    await loadQuestion();
  }, [loadQuestion, stopAudio, clearTimers]);

  useEffect(() => () => {
    clearTimers();
    stopAudio();
  }, [stopAudio, clearTimers]);

  /* ── derived demo stats (single correct answer answered) ── */
  const stats = { qIndex: 1, total: 10, correctN: 1, wrongN: 0, score: 2, accuracy: 100 };

  /* ──────────────────────────  render  ────────────────────────── */

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-black flex flex-col items-center justify-center gap-5 p-4 font-system">
      {/* control bar — NOT part of the recordable frame */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={start}
          disabled={loading || !question}
          className="nb-btn inline-flex items-center gap-2 bg-[#eab308] px-5 py-2.5 text-sm font-black uppercase tracking-wide text-black disabled:opacity-40"
        >
          <Play className="h-4 w-4" fill="currentColor" /> Record
        </button>
        <button
          onClick={restart}
          disabled={loading || !question}
          className="nb-btn inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-black uppercase tracking-wide text-black disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
        <button
          onClick={reroll}
          disabled={loading}
          className="nb-btn inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-black uppercase tracking-wide text-black disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4" /> Reroll Q
        </button>
      </div>

      {/* 9:16 recordable frame */}
      <div
        className="relative overflow-hidden bg-white"
        style={{
          width: "min(380px, 92vw)",
          aspectRatio: "9 / 16",
          border: "4px solid #000",
          boxShadow: "10px 10px 0 #000",
        }}
      >
        {loading && <CenterMsg text="Loading…" />}
        {err && !loading && <CenterMsg text="Load failed — press Reroll" tone="red" />}

        {!loading && !err && question && (
          <>
            {stage === "idle" && <IdleScene />}
            {stage === "hook" && <HookScene />}
            {stage === "video" && <VideoScene topicEn={question.topic_name_en} />}
            {(stage === "question" || stage === "auto") && (
              <QuestionScene
                question={question}
                choices={choices}
                correctId={correct?.id}
                tapped={stage === "auto"}
                stats={stats}
              />
            )}
            {(stage === "reveal" || stage === "explain") && (
              <RevealScene
                question={question}
                correct={correct}
                showExplain={stage === "explain"}
                stats={stats}
              />
            )}
            {stage === "stats" && <StatsScene stats={stats} />}
            {stage === "challenge" && <ChallengeScene />}
            {stage === "outro" && <OutroScene />}

            {/* persistent top progress dots while a reel is playing */}
            {playing && stage !== "idle" && <SceneProgress stage={stage} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════  SCENES  ════════════════════════════ */

function FrameBase({
  children,
  bg = "#ffffff",
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: bg }}>
      {children}
    </div>
  );
}

function CenterMsg({ text, tone }: { text: string; tone?: "red" }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white">
      <p
        className="text-lg font-black"
        style={{ color: tone === "red" ? RED : "#000" }}
      >
        {text}
      </p>
    </div>
  );
}

/* ── idle / poster ── */
function IdleScene() {
  return (
    <FrameBase bg="#eab308">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-black"
          style={{ boxShadow: "5px 5px 0 rgba(0,0,0,0.25)" }}
        >
          <Play className="h-9 w-9 text-[#eab308]" fill="currentColor" />
        </div>
        <h1 className="text-3xl font-black leading-tight text-black">
          THE WAY
          <br />
          OF SAFETY
        </h1>
      </div>
      <CautionTape variant="caution" height={26} className="w-full" />
    </FrameBase>
  );
}

/* ── 1. HOOK — pattern-interrupt scroll-stopper ── */
function HookScene() {
  return (
    <FrameBase bg="#000000">
      <CautionTape variant="chevron" height={24} className="w-full" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center anim-pop">
        <span className="rounded-full bg-[#ef4444] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
          Quick Test
        </span>
        <h1 className="text-[2.6rem] font-black leading-[1.05] text-white">
          HOW WELL
          <br />
          DO YOU KNOW
          <br />
          <span className="text-[#eab308]">ROAD RULES?</span>
        </h1>
        <p className="mt-1 text-lg font-bold text-white/80">
          90% get this wrong
        </p>
      </div>
      <CautionTape variant="chevron" height={24} className="w-full rotate-180" />
    </FrameBase>
  );
}

/* ── 2. learning-video preview ── */
function VideoScene({ topicEn }: { topicEn?: string | null }) {
  return (
    <FrameBase bg="#000000">
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-sm font-black uppercase tracking-wide text-white">
          THE WAY OF SAFETY
        </span>
        <span className="rounded bg-[#ef4444] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
          ● LIVE
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
        <div
          className="relative flex aspect-video w-full items-center justify-center bg-[#eab308]"
          style={{ border: "4px solid #fff" }}
        >
          {/* play button */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-black anim-pulse"
            style={{ boxShadow: "4px 4px 0 rgba(255,255,255,0.4)" }}
          >
            <Play className="h-7 w-7 text-[#eab308]" fill="currentColor" />
          </div>
          <ShieldCheck className="absolute left-3 top-3 h-6 w-6 text-black" />
          {/* faux scrubber */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
            <div className="h-full w-1/3 bg-black anim-scrub" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-black leading-tight text-white">
          ROAD SAFETY
          <br />
          LESSONS
        </h2>
        {topicEn && (
          <p className="text-center text-sm font-bold text-white/70">{topicEn}</p>
        )}
      </div>
      <CautionTape variant="caution" height={22} className="w-full" />
    </FrameBase>
  );
}

/* ── 3 & 4. question (TTS) + tap ── */
function QuestionScene({
  question,
  choices,
  correctId,
  tapped,
  stats,
}: {
  question: Question;
  choices: Answer[];
  correctId?: number | string;
  tapped: boolean;
  stats: { qIndex: number; total: number };
}) {
  // Answer countdown — ticks down while the voice reads; freezes once auto-answered.
  const [secs, setSecs] = useState(ANSWER_SECONDS);
  useEffect(() => {
    if (tapped || secs <= 0) return;
    const id = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secs, tapped]);

  const lowTime = secs <= 5;
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <FrameBase bg="#ffffff">
      <HudBar qIndex={stats.qIndex} total={stats.total} />

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-4 pt-2">
        {question.image_url && (
          <div
            className="mx-auto flex h-24 w-full items-center justify-center overflow-hidden bg-zinc-100"
            style={{ border: "3px solid #000" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.image_url}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        )}

        {/* question text + speaking indicator + answer countdown */}
        <div
          className="relative bg-[#eab308] px-3 py-3"
          style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}
        >
          <div className="mb-1 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/70">
              <Volume2 className="h-3.5 w-3.5 anim-pulse" /> Reading…
            </div>
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-black tabular-nums text-white"
              style={{ background: lowTime ? RED : "#000" }}
            >
              <Clock className="h-3.5 w-3.5" />
              {mm}:{ss}
            </div>
          </div>
          <p className="text-[1.02rem] font-black leading-snug text-black">
            {question.question_en}
          </p>
        </div>

        {/* silent choices */}
        <div className="flex flex-col gap-2">
          {choices.map((c, i) => {
            const isTappedCorrect = tapped && c.id === correctId;
            return (
              <div
                key={c.id}
                className="flex items-center gap-2.5 bg-white px-3 py-2 anim-rise"
                style={{
                  border: "3px solid #000",
                  boxShadow: isTappedCorrect ? `4px 4px 0 ${GREEN}` : "3px 3px 0 #000",
                  background: isTappedCorrect ? "#dcfce7" : "#fff",
                  animationDelay: `${i * 90}ms`,
                  transform: isTappedCorrect ? "translate(-1px,-1px)" : undefined,
                }}
              >
                <span
                  className="flex h-7 w-7 flex-none items-center justify-center text-sm font-black text-white"
                  style={{ background: isTappedCorrect ? GREEN : "#000" }}
                >
                  {CHOICE_LETTERS[i]}
                </span>
                <span className="text-sm font-bold leading-tight text-black">
                  {c.answer_en}
                </span>
                {isTappedCorrect && (
                  <CheckCircle2 className="ml-auto h-5 w-5 flex-none text-[#22c55e]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FrameBase>
  );
}

/* ── 5 & 6. correct/wrong reveal + explanation ── */
function RevealScene({
  question,
  correct,
  showExplain,
  stats,
}: {
  question: Question;
  correct: Answer | null;
  showExplain: boolean;
  stats: { qIndex: number; total: number };
}) {
  return (
    <FrameBase bg="#ffffff">
      <HudBar qIndex={stats.qIndex} total={stats.total} />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pb-5 pt-2 text-center">
        {/* CORRECT banner */}
        <div
          className="flex w-full items-center justify-center gap-2 py-3 anim-pop"
          style={{ background: GREEN, border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}
        >
          <CheckCircle2 className="h-8 w-8 text-white" />
          <span className="text-3xl font-black uppercase tracking-wide text-white">
            CORRECT!
          </span>
        </div>

        {/* the correct answer, stated clearly */}
        <div className="w-full">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Correct answer
          </p>
          <div
            className="flex items-center gap-2.5 bg-[#dcfce7] px-3 py-3"
            style={{ border: "3px solid #000" }}
          >
            <CheckCircle2 className="h-6 w-6 flex-none text-[#22c55e]" />
            <span className="text-left text-base font-black leading-tight text-black">
              {correct?.answer_en}
            </span>
          </div>
        </div>

        {/* explanation */}
        {showExplain && (question.hint_en || correct?.answer_en) && (
          <div
            className="w-full bg-zinc-50 px-3 py-3 anim-rise"
            style={{ border: "3px solid #000" }}
          >
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Explanation
            </p>
            <p className="text-left text-sm font-bold leading-snug text-zinc-800">
              {question.hint_en ||
                `The correct answer is “${correct?.answer_en}” — remember it to drive safely.`}
            </p>
          </div>
        )}
      </div>
    </FrameBase>
  );
}

/* ── 7. live stats HUD ── */
function StatsScene({
  stats,
}: {
  stats: {
    qIndex: number;
    total: number;
    correctN: number;
    wrongN: number;
    score: number;
    accuracy: number;
  };
}) {
  const cells = [
    { icon: Circle, label: "Question", value: `${stats.qIndex}/${stats.total}`, color: "#000" },
    { icon: CheckCircle2, label: "Correct", value: `${stats.correctN}`, color: GREEN },
    { icon: XCircle, label: "Wrong", value: `${stats.wrongN}`, color: RED },
    { icon: Trophy, label: "Score", value: `${stats.score}`, color: Y },
    { icon: Target, label: "Accuracy", value: `${stats.accuracy}%`, color: GREEN },
    { icon: Flame, label: "Streak", value: "1", color: "#f97316" },
  ];
  return (
    <FrameBase bg="#000000">
      <div className="flex flex-1 flex-col justify-center gap-5 p-5">
        <h2 className="text-center text-2xl font-black uppercase tracking-wide text-white">
          Live Results
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {cells.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="flex flex-col items-center gap-1 bg-white px-3 py-4 anim-rise"
                style={{
                  border: "3px solid #000",
                  boxShadow: `4px 4px 0 ${c.color}`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <Icon className="h-6 w-6" style={{ color: c.color }} />
                <span className="text-2xl font-black text-black">{c.value}</span>
                <span className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <CautionTape variant="caution" height={22} className="w-full" />
    </FrameBase>
  );
}

/* ── 8. challenge CTA ── */
function ChallengeScene() {
  return (
    <FrameBase bg="#eab308">
      <CautionTape variant="chevron" height={24} className="w-full" />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center anim-pop">
        <Trophy className="h-14 w-14 text-black" />
        <h2 className="text-[2rem] font-black leading-tight text-black">
          JOIN THE
          <br />
          Road Safety
          <br />
          Online Challenge
        </h2>
        <div
          className="inline-flex items-center gap-2 bg-black px-6 py-3 text-lg font-black uppercase tracking-wide text-[#eab308] anim-pulse"
          style={{ boxShadow: "5px 5px 0 rgba(0,0,0,0.25)" }}
        >
          Start Now <ArrowRight className="h-5 w-5" />
        </div>
      </div>
      <CautionTape variant="chevron" height={24} className="w-full rotate-180" />
    </FrameBase>
  );
}

/* ── 9. outro — logo, brand, tagline + website call-to-action ── */
function OutroScene() {
  const words = ["LEARN", "PRACTICE", "COMPETE", "IMPROVE"];
  return (
    <FrameBase bg="#000000">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        {/* high, prominent logo */}
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-white anim-pop"
          style={{ border: "4px solid #eab308", boxShadow: "6px 6px 0 rgba(234,179,8,0.45)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="KWD" className="h-16 w-16 object-contain" />
        </div>

        {/* brand name — Khmer (primary) + English */}
        <div className="flex flex-col items-center gap-0.5">
          <h1 className="text-[2.3rem] font-black leading-none text-[#eab308] anim-pop">
            វិថីសុវត្ថិភាព
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            The Way of Safety
          </p>
        </div>

        {/* tagline — English + Khmer */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-wrap items-center justify-center gap-x-1.5">
            {words.map((w, i) => (
              <span key={w} className="flex items-center gap-1.5">
                <span
                  className="text-sm font-black text-white anim-rise"
                  style={{ animationDelay: `${i * 140}ms` }}
                >
                  {w}
                </span>
                {i < words.length - 1 && <span className="text-[#eab308]">·</span>}
              </span>
            ))}
          </div>
          <p className="text-sm font-black text-white/80">
            រៀន · អនុវត្ត · ប្រកួតប្រជែង · កែលម្អ
          </p>
        </div>

        {/* encouraging call-to-action — come learn on the website */}
        <p className="mt-1 text-base font-black leading-snug text-white">
          Start learning road safety today
        </p>
        <div
          className="inline-flex items-center gap-2 bg-[#eab308] px-4 py-2.5 text-sm font-black text-black anim-pulse"
          style={{ boxShadow: "4px 4px 0 rgba(255,255,255,0.25)" }}
        >
          <Globe className="h-4 w-4" />
          kesararamwithdigital.tech
        </div>
      </div>
      <CautionTape variant="caution" height={24} className="w-full" />
    </FrameBase>
  );
}

/* ════════════════════════════  HUD bits  ════════════════════════════ */

function HudBar({ qIndex, total }: { qIndex: number; total: number }) {
  return (
    <>
      <div className="flex items-center justify-between bg-black px-4 py-2.5">
        <span className="text-sm font-black uppercase tracking-wide text-white">
          THE WAY OF SAFETY
        </span>
        <span className="rounded bg-[#eab308] px-2.5 py-0.5 text-xs font-black text-black">
          Question {qIndex}/{total}
        </span>
      </div>
      <div className="h-1.5 w-full bg-zinc-200">
        <div
          className="h-full bg-[#eab308]"
          style={{ width: `${(qIndex / total) * 100}%` }}
        />
      </div>
    </>
  );
}

function SceneProgress({ stage }: { stage: Stage }) {
  const order = TIMELINE.map((t) => t.stage);
  const idx = order.indexOf(stage);
  return (
    <div className="pointer-events-none absolute left-3 right-3 top-2 flex gap-1">
      {order.map((s, i) => (
        <div
          key={s}
          className="h-1 flex-1 rounded-full"
          style={{ background: i <= idx ? Y : "rgba(0,0,0,0.18)" }}
        />
      ))}
    </div>
  );
}
