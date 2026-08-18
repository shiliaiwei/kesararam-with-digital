"use client";

/**
 * KWD /videoads — 9:16 vertical short-video promo generator (admin only).
 *
 * A self-contained reel that demos the real Road-Safety challenge:
 * hook → a REAL question (read aloud with recorded audio) → answer-pick
 * countdown → auto correct/wrong reveal → explanation → outro (brand +
 * website CTA). Tick + chime SFX. Built for clean screen recording.
 *
 * Brand: Brutalist + traffic-sign palette (white / black / yellow #eab308 /
 * green #22c55e / red #ef4444), caution-tape accents, Google Sans Khmer.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Volume2,
  CheckCircle2,
  RotateCcw,
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
  /* the topic's road-sign image — questions rarely carry their own image_url */
  topic_image_url?: string | null;
};

/* ───────────────────────────  scene machine  ─────────────────────────── */

type Stage =
  | "idle"
  | "hook"
  | "question"
  | "auto"
  | "reveal"
  | "explain"
  | "outro";

/* Auto-run timeline (ms). The `question` scene ignores its `ms` and instead
   waits for the recorded voice to FINISH reading (see playQuestion). */
const TIMELINE: { stage: Stage; ms: number }[] = [
  { stage: "hook", ms: 2600 },
  { stage: "question", ms: 5200 },
  { stage: "auto", ms: 1600 },
  { stage: "reveal", ms: 3000 },
  { stage: "explain", ms: 3600 },
  { stage: "outro", ms: 5200 },
];

/* Answer window (seconds): the question scene reads the voice, then waits for
   this whole countdown to elapse before auto-picking the correct answer. */
const ANSWER_SECONDS = 30;

const GREEN = "#22c55e";
const RED = "#ef4444";

const CHOICE_LETTERS = ["A", "B", "C", "D", "E"];

/* ───────────────────────────  component  ─────────────────────────── */

export default function VideoAdsClient() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>("idle");
  /* `reading` = the recorded voice is still speaking the question.
     `countdown` = seconds left on the answer clock (drives the auto-pick). */
  const [reading, setReading] = useState(false);
  const [countdown, setCountdown] = useState(ANSWER_SECONDS);
  const stageIndexRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /* Mirrors `reading` for use inside timer closures (state is stale there). */
  const readingRef = useRef(false);

  /* ── Web-Audio SFX (generated — no asset files): clock tick + reveal chime ── */
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    ctxRef.current?.resume().catch(() => {});
    return ctxRef.current;
  }, []);

  const beep = useCallback(
    (freq: number, dur: number, type: OscillatorType, gain: number, when = 0) => {
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },
    [getCtx],
  );

  // short "tik" each second while the answer clock runs (urgent when low)
  const playTick = useCallback(
    (low: boolean) => beep(low ? 2000 : 1500, 0.045, "square", low ? 0.12 : 0.07),
    [beep],
  );
  // bright two-note chime on the answer reveal
  const playReveal = useCallback(() => {
    beep(660, 0.14, "triangle", 0.2, 0);
    beep(990, 0.22, "triangle", 0.2, 0.13);
  }, [beep]);

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
        primary_image_url?: string | null;
        category_id?: number | string | null;
      }[] = tJson.topics ?? [];
      if (!topics.length) throw new Error("no topics");

      // 80% of the time draw from category 1 (Traffic Signs / road signs),
      // 20% from the other categories. Within each pool, topics WITH recorded
      // English audio come first so the question is always voiced (never TTS).
      const isRoadSign = (t: { category_id?: number | string | null }) =>
        Number(t.category_id) === 1;
      const preferRoadSign = Math.random() < 0.8;
      const audioFirst = (arr: typeof topics) => [
        ...arr.filter((t) => t.audio_url_en).sort(() => Math.random() - 0.5),
        ...arr.filter((t) => !t.audio_url_en).sort(() => Math.random() - 0.5),
      ];
      const primaryPool = topics.filter((t) =>
        preferRoadSign ? isRoadSign(t) : !isRoadSign(t),
      );
      const fallbackPool = topics.filter((t) =>
        preferRoadSign ? !isRoadSign(t) : isRoadSign(t),
      );
      // Primary pool drives the 80/20 weight; fallback guarantees we still find
      // a playable question if the weighted pool has none.
      const ordered = [...audioFirst(primaryPool), ...audioFirst(fallbackPool)];

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
          pick.topic_image_url = t.primary_image_url ?? null;
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

  /* Read the question aloud with the RECORDED voice (same source as /learn).
     While the voice speaks → show the question. When it ends → hide the
     question and show the answer choices to pick. The scene advances only
     when the ANSWER CLOCK runs out, then onDone() triggers the auto-pick. */
  const playQuestion = useCallback(
    (onDone: () => void) => {
      const stopReading = () => {
        readingRef.current = false;
        setReading(false);
      };
      readingRef.current = true;
      setReading(true);
      setCountdown(ANSWER_SECONDS);

      const src = question?.audio_url_en || question?.topic_audio_en;
      if (src) {
        const a = new Audio(src);
        audioRef.current = a;
        a.onended = stopReading; // reading sound done → reveal choices
        a.onerror = stopReading;
        a.play().catch(stopReading); // autoplay blocked
      } else {
        stopReading();
      }

      // Tick the clock down once per second; advance when it hits 0.
      let left = ANSWER_SECONDS;
      const tick = () => {
        left -= 1;
        setCountdown(left);
        if (left <= 0) {
          onDone();
          return;
        }
        // "tik" only once we're in the answer-picking phase (voice finished)
        if (!readingRef.current) playTick(left <= 5);
        after(1000, tick);
      };
      after(1000, tick);
    },
    [question, after, playTick],
  );

  /* ── auto-run scene scheduler ── */
  const runStage = useCallback(
    (index: number) => {
      if (index >= TIMELINE.length) return; // reel finished
      stageIndexRef.current = index;
      const { stage: s, ms } = TIMELINE[index];
      setStage(s);
      if (s === "reveal") playReveal(); // chime on the answer reveal
      const next = () => runStage(index + 1);
      if (s === "question") {
        // Hold this scene until the recorded question has been fully read.
        playQuestion(next);
        return;
      }
      after(ms, next);
    },
    [after, playQuestion, playReveal],
  );

  const start = useCallback(() => {
    clearTimers();
    stopAudio();
    getCtx(); // unlock/resume Web-Audio on this user gesture
    readingRef.current = false;
    runStage(0);
  }, [runStage, stopAudio, clearTimers, getCtx]);

  const restart = useCallback(() => {
    clearTimers();
    stopAudio();
    setStage("idle");
    after(60, start); // next tick → start fresh
  }, [start, stopAudio, clearTimers, after]);

  const reroll = useCallback(async () => {
    clearTimers();
    stopAudio();
    setStage("idle");
    await loadQuestion();
  }, [loadQuestion, stopAudio, clearTimers]);

  useEffect(() => () => {
    clearTimers();
    stopAudio();
  }, [stopAudio, clearTimers]);

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
            {(stage === "question" || stage === "auto") && (
              <QuestionScene
                question={question}
                choices={choices}
                correctId={correct?.id}
                tapped={stage === "auto"}
                reading={reading}
                countdown={countdown}
              />
            )}
            {(stage === "reveal" || stage === "explain") && (
              <RevealScene
                question={question}
                correct={correct}
                showExplain={stage === "explain"}
              />
            )}
            {stage === "outro" && <OutroScene />}
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

/* ── question read-aloud, then answer-picking (clock-driven) ── */
function QuestionScene({
  question,
  choices,
  correctId,
  tapped,
  reading,
  countdown,
}: {
  question: Question;
  choices: Answer[];
  correctId?: number | string;
  tapped: boolean;
  reading: boolean;
  countdown: number;
}) {
  const lowTime = countdown <= 5;
  const mm = Math.floor(Math.max(0, countdown) / 60);
  const ss = String(Math.max(0, countdown) % 60).padStart(2, "0");

  const clock = (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-black tabular-nums text-white"
      style={{ background: lowTime ? RED : "#000" }}
    >
      <Clock className="h-3.5 w-3.5" />
      {mm}:{ss}
    </div>
  );

  // questions almost never carry their own image → use the topic's road sign
  const signUrl = question.image_url || question.topic_image_url;

  return (
    <FrameBase bg="#ffffff">
      <HudBar />

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-4 pt-2">
        {signUrl && (
          <div
            className="mx-auto flex h-28 w-full items-center justify-center overflow-hidden bg-zinc-100"
            style={{ border: "3px solid #000" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        )}

        {reading ? (
          /* WHILE the voice reads → show the question only */
          <div
            className="relative bg-[#eab308] px-3 py-3"
            style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/70">
                <Volume2 className="h-3.5 w-3.5 anim-pulse" /> Reading…
              </div>
              {clock}
            </div>
            <p className="text-[1.02rem] font-black leading-snug text-black">
              {question.question_en}
            </p>
          </div>
        ) : (
          /* AFTER the voice ends → hide the question, show choices to pick */
          <>
            <div
              className="flex items-center justify-between bg-black px-3 py-2"
              style={{ border: "3px solid #000" }}
            >
              <span className="text-xs font-black uppercase tracking-widest text-[#eab308]">
                Pick your answer
              </span>
              {clock}
            </div>

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
          </>
        )}
      </div>
    </FrameBase>
  );
}

/* ── 5 & 6. correct/wrong reveal + explanation ── */
function RevealScene({
  question,
  correct,
  showExplain,
}: {
  question: Question;
  correct: Answer | null;
  showExplain: boolean;
}) {
  const signUrl = question.image_url || question.topic_image_url;
  return (
    <FrameBase bg="#ffffff">
      <HudBar />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 pb-5 pt-2 text-center">
        {signUrl && (
          <div
            className="mx-auto flex h-20 w-full items-center justify-center overflow-hidden bg-zinc-100"
            style={{ border: "3px solid #000" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signUrl} alt="" className="h-full w-full object-contain" />
          </div>
        )}

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

/* ── 7. outro — logo, brand, slogan + website call-to-action ── */
function OutroScene() {
  return (
    <FrameBase bg="#000000">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        {/* high, prominent logo */}
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-white anim-pop"
          style={{ border: "4px solid #eab308" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="Kesararam With Digital" className="h-16 w-16 object-contain" />
        </div>

        {/* brand name — Khmer (primary) + English */}
        <div className="flex flex-col items-center gap-0.5">
          <h1 className="text-[2.3rem] font-black leading-none text-[#eab308] anim-pop">
            វិថី សុវត្ថិភាព
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            The Way of Safety
          </p>
        </div>

        {/* slogan + one-line platform description */}
        <p className="text-base font-black leading-snug text-white anim-rise">
          ចំណេះដឹងថ្ងៃនេះ ការពារជីវិតថ្ងៃស្អែក
        </p>
        <p className="max-w-[19rem] text-[0.72rem] font-bold leading-snug text-white/70">
          ថ្នាលរៀនសុវត្ថិភាពចរាចរណ៍ឌីជីថល សម្រាប់យុវជន និងប្រជាពលរដ្ឋកម្ពុជា។
        </p>

        {/* website call-to-action — come learn on the site */}
        <div
          className="mt-1 inline-flex items-center gap-2 bg-[#eab308] px-4 py-2.5 text-sm font-black text-black anim-pulse"
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

function HudBar() {
  return (
    <div className="flex items-center justify-center bg-black px-4 py-2.5">
      <span className="text-sm font-black uppercase tracking-wide text-white">
        THE WAY OF SAFETY
      </span>
    </div>
  );
}
