"use client";

import { useState, useRef } from "react";
import { ListChecks, Check, X } from "lucide-react";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import type { GameFormat, RoundViewProps, KitCompletionResult } from "@/lib/gamekit/types";

interface TickChoice {
    id: number;
    imageUrl: string;
}
interface TickRow {
    promptId: number;
    promptEn: string;
    promptKm: string;
    choices: TickChoice[];
}
interface TickSignRound {
    kind: "tick-sign";
    id: number; // page number
    rows: TickRow[];
}

function TickSignView({ round, lang, onRoundComplete }: RoundViewProps<TickSignRound>) {
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" } : {};

    const startRef = useRef(Date.now());
    const rowStartRef = useRef(Date.now());
    const doneRef = useRef(false);
    const picksRef = useRef<{ promptId: number; pickedId: number; tMs: number }[]>([]);

    const [current, setCurrent] = useState(0); // active row index (rows fill top-down)
    // per-row recorded pick for rendering (undefined = not yet answered)
    const [picked, setPicked] = useState<Record<number, number>>({});

    function tap(rowIndex: number, choiceId: number) {
        if (doneRef.current) return;
        if (rowIndex !== current) return; // only the active row is tappable
        if (picked[rowIndex] !== undefined) return;

        const row = round.rows[rowIndex];
        const tMs = Date.now() - rowStartRef.current;
        picksRef.current.push({ promptId: row.promptId, pickedId: choiceId, tMs });
        setPicked((p) => ({ ...p, [rowIndex]: choiceId }));

        const next = rowIndex + 1;
        rowStartRef.current = Date.now();

        if (next >= round.rows.length) {
            doneRef.current = true;
            const allCorrect = picksRef.current.every((x) => x.promptId === x.pickedId);
            setTimeout(() => {
                onRoundComplete({
                    refId: round.id,
                    isCorrectGuess: allCorrect,
                    payload: { picks: picksRef.current },
                    timeTakenMs: Date.now() - startRef.current,
                    difficulty: "easy",
                });
            }, 650);
        } else {
            setTimeout(() => setCurrent(next), 280);
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="bg-zinc-900 border-2 border-black p-3 text-center text-white font-black" style={{ ...khFont }}>
                <span className="text-yellow-400">{kh ? "ធីកសញ្ញាដែលត្រឹមត្រូវ" : "Tick the correct safety sign"}</span>
            </div>

            {round.rows.map((row, ri) => {
                const answered = picked[ri] !== undefined;
                const isActive = ri === current;
                const isFuture = ri > current;
                return (
                    <div
                        key={ri}
                        className="flex items-center gap-3 border-2 border-black bg-white p-2.5 transition-all"
                        style={{
                            boxShadow: isActive ? "4px 4px 0 #eab308" : "3px 3px 0 #000",
                            opacity: isFuture ? 0.4 : 1,
                            pointerEvents: isActive ? "auto" : "none",
                        }}
                    >
                        <div className="w-20 sm:w-28 shrink-0 leading-tight" style={khFont}>
                            <div className="font-black text-black text-xs sm:text-sm">{row.promptEn}</div>
                            <div className="text-[10px] sm:text-xs text-zinc-500">{row.promptKm}</div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 flex-1">
                            {row.choices.map((c) => {
                                const isPicked = picked[ri] === c.id;
                                const isCorrectChoice = c.id === row.promptId;
                                let bg = "#fff";
                                if (answered) {
                                    if (isCorrectChoice) bg = "#bbf7d0";
                                    else if (isPicked) bg = "#fecaca";
                                }
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => tap(ri, c.id)}
                                        disabled={!isActive || answered}
                                        className="relative aspect-square border-2 border-black flex items-center justify-center p-1 transition-all"
                                        style={{ background: bg, boxShadow: "2px 2px 0 #000", minHeight: 44 }}
                                        aria-label="sign choice"
                                    >
                                        <img
                                            src={cloudinaryOptimize(c.imageUrl, 160)}
                                            alt=""
                                            className="max-h-full max-w-full object-contain pointer-events-none"
                                        />
                                        {answered && isCorrectChoice && (
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-600 border-2 border-black flex items-center justify-center">
                                                <Check size={11} className="text-white" strokeWidth={3} />
                                            </span>
                                        )}
                                        {answered && isPicked && !isCorrectChoice && (
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 border-2 border-black flex items-center justify-center">
                                                <X size={11} className="text-white" strokeWidth={3} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            <div className="text-center text-xs font-black text-zinc-400" style={khFont}>
                {kh
                    ? `ជួរ ${Math.min(current + (doneRef.current ? 0 : 1), round.rows.length)}/${round.rows.length}`
                    : `Row ${Math.min(current + (doneRef.current ? 0 : 1), round.rows.length)}/${round.rows.length}`}
            </div>
        </div>
    );
}

export const tickSignFormat: GameFormat<TickSignRound, KitCompletionResult> = {
    meta: {
        id: "tick-sign",
        route: "/play/tick-sign",
        title: { en: "Tick the Sign", kh: "ធីកសញ្ញា" },
        description: {
            en: "Tick the correct road sign for each name.",
            kh: "ធីកសញ្ញាចរាចរណ៍ឱ្យត្រូវនឹងឈ្មោះនីមួយៗ។",
        },
        brandColor: "#14b8a6",
        Icon: ListChecks,
        accessTier: "user",
        badge: { en: "KIDS", kh: "កុមារ" },
    },
    config: { timed: false, secondsPerRound: 0, scoringMode: "speed", showStreakHud: true },
    fetchRounds: async () => {
        const r = await fetch("/api/game/tick-sign?count=2");
        if (!r.ok) {
            const d = await r.json().catch(() => ({}));
            return { rounds: [], locked: d.locked, lockMessage: d.lockMessage };
        }
        return r.json();
    },
    completePath: "/api/game/tick-sign/complete",
    RoundView: TickSignView,
};
