"use client";

import { useState, useRef } from "react";
import { ShieldCheck, Check, X } from "lucide-react";
import type { GameFormat, RoundViewProps, KitCompletionResult } from "@/lib/gamekit/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface SSSChoice {
    id: string; // "A" | "B" | "C"
    en: string;
    km: string;
}

interface SSSQuestion {
    id: number;
    promptEn: string;
    promptKm: string;
    emoji: string;       // decorative emoji / icon (no image dependency)
    choices: SSSChoice[];
    correctId: string;   // which choice id is correct
}

export interface SSSRound {
    kind: "safe-street-smart";
    id: number;
    questions: SSSQuestion[];
}

function khFont(kh: boolean) {
    return kh
        ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" }
        : {};
}

// Row background palette — alternating soft colours like the worksheet image
const ROW_BG = ["#dbeafe", "#fce7f3", "#dcfce7", "#fef9c3", "#ede9fe"];

// ── Round View ────────────────────────────────────────────────────────────────

function SafeStreetSmartView({ round, lang, onRoundComplete }: RoundViewProps<SSSRound>) {
    const kh = lang === "kh";
    const startRef = useRef(Date.now());
    const picksRef = useRef<{ questionId: number; pickedId: string; correct: boolean }[]>([]);
    const doneRef = useRef(false);

    // answeredMap: questionId → { pickedId, correct }
    const [answered, setAnswered] = useState<Record<number, { pickedId: string; correct: boolean }>>({});

    // Which question index is currently active (locked to one at a time)
    const [current, setCurrent] = useState(0);

    function tap(qi: number, choiceId: string) {
        if (doneRef.current) return;
        if (qi !== current) return;
        if (answered[round.questions[qi].id] !== undefined) return;

        const q = round.questions[qi];
        const correct = choiceId === q.correctId;
        const entry = { pickedId: choiceId, correct };

        setAnswered((prev) => ({ ...prev, [q.id]: entry }));
        picksRef.current.push({ questionId: q.id, pickedId: choiceId, correct });

        const next = qi + 1;
        if (next >= round.questions.length) {
            doneRef.current = true;
            const allCorrect = picksRef.current.every((x) => x.correct);
            setTimeout(() => {
                onRoundComplete({
                    refId: round.id,
                    isCorrectGuess: allCorrect,
                    payload: { picks: picksRef.current },
                    timeTakenMs: Date.now() - startRef.current,
                    difficulty: "easy",
                });
            }, 700);
        } else {
            setTimeout(() => setCurrent(next), 350);
        }
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Header */}
            <div
                className="border-2 border-black text-center py-2 px-4 font-black text-white"
                style={{ background: "#e91e8c", boxShadow: "3px 3px 0 #000" }}
            >
                <span style={khFont(kh)}>
                    {kh ? "ធីក (✓) ចម្លើយត្រឹមត្រូវ" : "Tick (✓) the correct answer"}
                </span>
            </div>

            {/* Questions */}
            {round.questions.map((q, qi) => {
                const isActive = qi === current;
                const isFuture = qi > current;
                const ans = answered[q.id];
                const rowBg = ROW_BG[qi % ROW_BG.length];

                return (
                    <div
                        key={q.id}
                        className="border-2 border-black transition-all"
                        style={{
                            background: rowBg,
                            opacity: isFuture ? 0.45 : 1,
                            boxShadow: isActive ? "4px 4px 0 #e91e8c" : "3px 3px 0 #000",
                            pointerEvents: isActive ? "auto" : "none",
                        }}
                    >
                        {/* Question prompt row */}
                        <div className="flex items-center gap-3 px-3 pt-3 pb-1">
                            <span className="text-2xl select-none flex-shrink-0">{q.emoji}</span>
                            <p className="font-black text-black text-sm sm:text-base leading-snug flex-1" style={khFont(kh)}>
                                <span className="text-[#e91e8c] mr-1">{qi + 1}.</span>
                                {kh ? q.promptKm : q.promptEn}
                            </p>
                        </div>

                        {/* Choice buttons */}
                        <div className="flex flex-col gap-1.5 px-3 pb-3 mt-1">
                            {q.choices.map((c) => {
                                const isPicked = ans?.pickedId === c.id;
                                const isCorrectChoice = c.id === q.correctId;
                                let bg = "rgba(255,255,255,0.6)";
                                let border = "#000";
                                let textCol = "#000";
                                if (ans) {
                                    if (isCorrectChoice) { bg = "#bbf7d0"; border = "#16a34a"; textCol = "#166534"; }
                                    else if (isPicked) { bg = "#fecaca"; border = "#dc2626"; textCol = "#991b1b"; }
                                }
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => tap(qi, c.id)}
                                        disabled={!!ans}
                                        className="flex items-center gap-2.5 border-2 px-3 py-2 text-left w-full transition-all"
                                        style={{
                                            background: bg,
                                            borderColor: border,
                                            color: textCol,
                                            boxShadow: `2px 2px 0 ${border}`,
                                        }}
                                        aria-label={`Choice ${c.id}`}
                                    >
                                        {/* Radio circle */}
                                        <span
                                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                            style={{
                                                borderColor: border,
                                                background: isPicked || (ans && isCorrectChoice) ? border : "transparent",
                                            }}
                                        >
                                            {ans && isCorrectChoice && <Check size={11} className="text-white" strokeWidth={3} />}
                                            {ans && isPicked && !isCorrectChoice && <X size={11} className="text-white" strokeWidth={3} />}
                                        </span>
                                        <span className="font-bold text-sm" style={khFont(kh)}>
                                            <span className="font-black mr-1">{c.id})</span>
                                            {kh ? c.km : c.en}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Progress label */}
            <div className="text-center text-xs font-black text-zinc-400" style={khFont(kh)}>
                {kh
                    ? `សំណួរ ${Math.min(current + (doneRef.current ? 0 : 1), round.questions.length)}/${round.questions.length}`
                    : `Question ${Math.min(current + (doneRef.current ? 0 : 1), round.questions.length)}/${round.questions.length}`}
            </div>
        </div>
    );
}

// ── Format export ─────────────────────────────────────────────────────────────

export const safeStreetSmartFormat: GameFormat<SSSRound, KitCompletionResult> = {
    meta: {
        id: "safe-street-smart",
        route: "/play/safe-street-smart",
        title: { en: "Safe Street Smart", kh: "ចំណេះដឹងផ្លូវសុវត្ថិភាព" },
        description: {
            en: "Choose the correct answer about road safety rules.",
            kh: "ជ្រើសរើសចម្លើយត្រឹមត្រូវអំពីច្បាប់សុវត្ថិភាពចរាចរណ៍។",
        },
        brandColor: "#e91e8c",
        Icon: ShieldCheck,
        accessTier: "user",
        badge: { en: "KIDS", kh: "កុមារ" },
    },
    config: { timed: false, secondsPerRound: 0, scoringMode: "equal", showStreakHud: true },
    fetchRounds: async () => {
        const r = await fetch("/api/game/safe-street-smart?count=2");
        if (!r.ok) {
            const d = await r.json().catch(() => ({}));
            return { rounds: [], locked: d.locked, lockMessage: d.lockMessage };
        }
        return r.json();
    },
    completePath: "/api/game/safe-street-smart/complete",
    RoundView: SafeStreetSmartView,
};
