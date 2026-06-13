"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { Zap, Flame, Volume2, VolumeX, Lock, RotateCcw, ChevronRight, Trophy, ArrowLeft, X } from "lucide-react";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import type { GameFormat, KitPhase, KitCompletionResult, RoundResult, I18nText } from "./types";

const BRAND = { yellow: "#eab308", black: "#000", white: "#fff" };

function t(text: I18nText, kh: boolean) {
    return kh ? text.kh : text.en;
}

export function GameKitShell<TRound, TResult extends KitCompletionResult>({
    format,
}: {
    format: GameFormat<TRound, TResult>;
}) {
    const { lang } = useLang();
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" } : {};
    const router = useRouter();

    const [phase, setPhase] = useState<KitPhase<TRound, TResult>>({ name: "setup" });
    const [muted, setMuted] = useState(true);
    const answersRef = useRef<RoundResult[]>([]);

    // Countdown end time for shell-driven timers (set per round)
    const [currentEndsAt, setCurrentEndsAt] = useState<string>("");

    const { meta, config } = format;

    // Reset countdown on new round
    useEffect(() => {
        if (phase.name === "playing" && phase.secondsLimit) {
            setCurrentEndsAt(new Date(Date.now() + phase.secondsLimit * 1000).toISOString());
        }
    }, [phase.name === "playing" ? phase.index : -1]);

    async function start() {
        setPhase({ name: "loading" });
        try {
            const data = await format.fetchRounds();
            if (data.locked) {
                setPhase({
                    name: "locked",
                    message: data.lockMessage ?? { en: "This game is locked.", kh: "ហ្គេមនេះត្រូវបានចាក់សោ។" },
                });
                return;
            }
            if (data.alreadyPlayed) {
                setPhase({ name: "alreadyPlayed" });
                return;
            }
            if (!data.rounds?.length) {
                setPhase({ name: "locked", message: { en: "No rounds available right now.", kh: "មិនមានជុំលេងនៅពេលនេះ។" } });
                return;
            }

            const secondsLimit: number | null = format.config.timed
                ? (format.config.secondsPerRound || 30)
                : null;

            answersRef.current = [];
            setPhase({
                name: "playing",
                rounds: data.rounds,
                index: 0,
                cosmeticScore: 0,
                streak: 0,
                secondsLimit,
            });
        } catch {
            setPhase({ name: "locked", message: { en: "Could not load the game.", kh: "មិនអាចផ្ទុកហ្គេមបានទេ។" } });
        }
    }

    function handleTimeExpire() {
        if (phase.name !== "playing") return;
        const currentRound = phase.rounds[phase.index];
        onRoundComplete({
            refId: (currentRound as any).sceneId || (currentRound as any).questionId || 0,
            isCorrectGuess: false,
            payload: {},
            timeTakenMs: phase.secondsLimit ? phase.secondsLimit * 1000 : 30000,
            difficulty: (currentRound as any).difficulty || "medium",
        });
    }

    function onRoundComplete(result: RoundResult) {
        if (phase.name !== "playing") return;
        answersRef.current.push(result);

        // cosmetic-only HUD update
        const newStreak = result.isCorrectGuess ? phase.streak + 1 : 0;
        const cosmeticGain = result.isCorrectGuess ? 1 + (newStreak >= 2 ? 1 : 0) : 0;

        const next = phase.index + 1;
        if (next >= phase.rounds.length) {
            void complete();
            return;
        }
        setPhase({
            ...phase,
            index: next,
            cosmeticScore: phase.cosmeticScore + cosmeticGain,
            streak: newStreak,
        });
    }

    async function complete() {
        try {
            const res = await fetch(format.completePath, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rounds: answersRef.current }),
            });
            const result = (await res.json()) as TResult;
            setPhase({ name: "results", result });
        } catch {
            // Fallback: cosmetic result, not persisted (Req 15.1)
            const cosmetic = phase.name === "playing" ? phase.cosmeticScore : 0;
            setPhase({
                name: "results",
                result: {
                    totalScore: cosmetic,
                    correctAnswers: 0,
                    totalRounds: answersRef.current.length,
                    perRound: [],
                    persisted: false,
                } as TResult,
            });
        }
    }

    function reset() {
        answersRef.current = [];
        setPhase({ name: "setup" });
    }

    // ── SETUP ──
    if (phase.name === "setup") {
        return (
            <div className="min-h-screen bg-white">
                <div className="border-b-2 border-black py-10 px-6" style={{ background: meta.brandColor }}>
                    <div className="max-w-2xl mx-auto">
                        <div className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
                            {meta.badge ? t(meta.badge, kh) : t({ en: "GAME", kh: "ហ្គេម" }, kh)}
                        </div>
                        <h1 className="text-4xl font-black text-black" style={khFont}>{t(meta.title, kh)}</h1>
                        <p className="text-black/70 font-bold mt-2" style={khFont}>{t(meta.description, kh)}</p>
                    </div>
                </div>
                <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
                    <button
                        onClick={start}
                        className="w-full py-5 bg-black text-yellow-400 font-black text-xl border-2 border-black transition-all hover:-translate-y-0.5"
                        style={{ boxShadow: "5px 5px 0 #eab308", ...khFont }}
                    >
                        {kh ? "ចាប់ផ្ដើម" : "Start"} <ChevronRight className="inline ml-2" size={20} />
                    </button>
                    <Link href="/play" className="text-center text-sm font-bold text-zinc-500 hover:text-black" style={khFont}>
                        {kh ? "← ត្រឡប់ទៅ Play" : "← Back to Play"}
                    </Link>
                </div>
            </div>
        );
    }

    // ── LOADING ──
    if (phase.name === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ── LOCKED ──
    if (phase.name === "locked") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <div className="max-w-md w-full border-4 border-black bg-yellow-400 p-8 text-center" style={{ boxShadow: "8px 8px 0 #000" }}>
                    <div className="w-14 h-14 mx-auto mb-4 border-2 border-black bg-white flex items-center justify-center" style={{ boxShadow: "3px 3px 0 #000" }}>
                        <Lock size={26} className="text-black" />
                    </div>
                    <h2 className="text-2xl font-black text-black mb-2" style={khFont}>{kh ? "ត្រូវបានចាក់សោ" : "Locked"}</h2>
                    <p className="text-black/80 font-bold mb-6" style={khFont}>{t(phase.message, kh)}</p>
                    <Link href="/play" className="inline-block px-6 py-3 bg-black text-yellow-400 font-black border-2 border-black" style={khFont}>
                        {kh ? "ត្រឡប់ទៅ Play" : "Back to Play"}
                    </Link>
                </div>
            </div>
        );
    }

    // ── ALREADY PLAYED ──
    if (phase.name === "alreadyPlayed") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <div className="max-w-md w-full border-4 border-black bg-white p-8 text-center" style={{ boxShadow: "8px 8px 0 #000" }}>
                    <h2 className="text-2xl font-black text-black mb-2" style={khFont}>{kh ? "បានលេងរួចហើយ!" : "Already played!"}</h2>
                    <p className="text-zinc-600 font-bold mb-6" style={khFont}>
                        {kh ? "ត្រឡប់មកម្ដងទៀតថ្ងៃស្អែក សម្រាប់បញ្ហាថ្មី។" : "Come back tomorrow for a new challenge."}
                    </p>
                    <Link href="/play" className="inline-block px-6 py-3 bg-yellow-400 text-black font-black border-2 border-black" style={{ boxShadow: "3px 3px 0 #000", ...khFont }}>
                        {kh ? "ត្រឡប់ទៅ Play" : "Back to Play"}
                    </Link>
                </div>
            </div>
        );
    }

    // ── RESULTS ──
    if (phase.name === "results") {
        const r = phase.result;
        const ResultView = format.ResultView;
        return (
            <div className="min-h-screen bg-white">
                <div className="border-b-4 border-black py-8 px-6 text-center" style={{ background: meta.brandColor }}>
                    <div className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-4 py-2 mb-4" style={khFont}>
                        {kh ? "ចប់ហ្គេម" : "Game Over"}
                    </div>
                    <div className="text-7xl font-black text-black tabular-nums">{r.totalScore.toLocaleString()}</div>
                    <div className="text-black/60 font-bold mt-1" style={khFont}>{kh ? "ពិន្ទុ" : "points"}</div>
                    {!r.persisted && (
                        <p className="text-xs font-bold text-black/60 mt-3" style={khFont}>
                            {kh ? "ពិន្ទុមិនត្រូវបានរក្សាទុក (សូមចូលគណនី)។" : "Score not saved (sign in to record)."}
                        </p>
                    )}
                </div>
                <div className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">
                    {ResultView ? <ResultView result={r} lang={lang} /> : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-4 border-black p-5 text-center" style={{ boxShadow: "4px 4px 0 #000" }}>
                                <div className="text-3xl font-black" style={{ color: "#22c55e" }}>{r.correctAnswers}/{r.totalRounds}</div>
                                <div className="text-xs font-black text-zinc-600 uppercase mt-1" style={khFont}>{kh ? "ត្រូវ" : "Correct"}</div>
                            </div>
                            <div className="border-4 border-black p-5 text-center" style={{ boxShadow: "4px 4px 0 #000" }}>
                                <div className="text-3xl font-black" style={{ color: "#eab308" }}>{r.totalScore}</div>
                                <div className="text-xs font-black text-zinc-600 uppercase mt-1" style={khFont}>{kh ? "ពិន្ទុ" : "Points"}</div>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-4">
                        <button onClick={reset} className="flex-1 py-4 bg-yellow-400 text-black font-black border-4 border-black flex items-center justify-center gap-2" style={{ boxShadow: "4px 4px 0 #000", ...khFont }}>
                            <RotateCcw size={18} />{kh ? "លេងម្ដងទៀត" : "Play Again"}
                        </button>
                        <Link href="/leaderboard" className="flex-1 py-4 bg-black text-yellow-400 font-black border-4 border-black flex items-center justify-center gap-2" style={{ boxShadow: "4px 4px 0 #eab308", ...khFont }}>
                            <Trophy size={18} />{kh ? "ពិន្ទុ" : "Ranks"}
                        </Link>
                    </div>
                    {/* Back to the activity hub (recent activity) */}
                    <Link href="/play" className="mt-3 w-full py-3 bg-white text-black font-black border-4 border-black flex items-center justify-center gap-2" style={{ boxShadow: "4px 4px 0 #000", ...khFont }}>
                        <ArrowLeft size={18} />{kh ? "ត្រឡប់ទៅសកម្មភាព" : "Back to Activities"}
                    </Link>
                </div>
            </div>
        );
    }

    // ── PLAYING ──
    const RoundView = format.RoundView;
    return (
        <div className="game-dot-bg fixed inset-0 z-50 flex flex-col" style={{ userSelect: "none" }}>
            {/* HUD */}
            <div className="flex items-center justify-between px-6 py-3 bg-zinc-950 border-b border-zinc-800 flex-shrink-0 h-14">
                <div className="flex items-center gap-3">
                    {/* Escape — exit the game (confirm to avoid losing progress) */}
                    <button
                        onClick={() => { if (confirm(kh ? "ចាកចេញពីហ្គេម? ការរីកចម្រើននឹងបាត់បង់។" : "Exit the game? Your progress will be lost.")) router.push("/play"); }}
                        aria-label={kh ? "ចាកចេញ" : "Exit"}
                        className="flex items-center justify-center w-8 h-8 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white flex-shrink-0"
                    >
                        <X size={16} />
                    </button>
                    <span className="text-zinc-400 font-black text-xs uppercase tracking-widest" style={khFont}>{t(meta.title, kh)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-yellow-400 border border-zinc-950 px-3 py-1">
                        <Zap size={12} className="text-black" />
                        <span className="font-black text-black text-sm tabular-nums">{phase.cosmeticScore}</span>
                    </div>
                    {config.showStreakHud && phase.streak > 1 && (
                        <div className="flex items-center gap-1 bg-orange-500 border border-zinc-950 px-2.5 py-1">
                            <Flame size={12} className="text-white" />
                            <span className="font-black text-white text-xs">x{phase.streak}</span>
                        </div>
                    )}
                    <button
                        onClick={() => setMuted((m) => !m)}
                        className="p-1.5 border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
                        aria-label={muted ? "Unmute" : "Mute"}
                    >
                        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="h-1.5 bg-zinc-800 flex-shrink-0">
                <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${((phase.index + 1) / phase.rounds.length) * 100}%` }} />
            </div>

            {/* Timer if shell-driven */}
            {phase.name === "playing" && phase.secondsLimit && !config.timed && currentEndsAt && (
                <div className="shrink-0 flex justify-center py-2 bg-zinc-950/20 border-b border-zinc-800/10">
                    <CountdownTimer
                        endsAt={currentEndsAt}
                        totalSeconds={phase.secondsLimit}
                        muted={muted}
                        onExpire={handleTimeExpire}
                    />
                </div>
            )}

            {/* Round */}
            <div className="relative z-10 flex-1 flex flex-col p-4 gap-4 max-w-2xl mx-auto w-full overflow-y-auto min-h-0 no-scrollbar">
                <RoundView
                    key={phase.index}
                    round={phase.rounds[phase.index]}
                    index={phase.index}
                    total={phase.rounds.length}
                    lang={lang}
                    muted={muted}
                    onRoundComplete={onRoundComplete}
                    timerSeconds={phase.secondsLimit}
                />
            </div>
        </div>
    );
}
