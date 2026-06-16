"use client";

import { useState, useRef } from "react";
import { Map as MapIcon } from "lucide-react";
import type { GameFormat, RoundViewProps, KitCompletionResult } from "@/lib/gamekit/types";

interface AdventureRound {
    kind: "safety-adventure";
    promptEn: string;
    promptKm: string;
    choices: { id: number; en: string; km: string; correct: boolean }[];
}

function SafetyAdventureView({ round, lang, onRoundComplete }: RoundViewProps<AdventureRound>) {
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "var(--font-learning)" } : {};
    const [picked, setPicked] = useState<number | null>(null);
    const startRef = useRef(Date.now());
    const doneRef = useRef(false);

    function pick(choice: AdventureRound["choices"][number]) {
        if (doneRef.current) return;
        doneRef.current = true;
        setPicked(choice.id);
        setTimeout(() => {
            onRoundComplete({
                refId: choice.id,
                isCorrectGuess: choice.correct,
                payload: { picked: choice.id },
                timeTakenMs: Date.now() - startRef.current,
                difficulty: "medium",
            });
        }, 550);
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="bg-zinc-900 border-2 border-black p-5 text-center text-white font-black" style={{ fontSize: "clamp(1rem,3.8vw,1.4rem)", ...khFont }}>
                {kh ? round.promptKm || round.promptEn : round.promptEn}
            </div>
            <div className="flex flex-col gap-3">
                {round.choices.map((c) => {
                    const reveal = picked !== null;
                    const isPicked = picked === c.id;
                    return (
                        <button
                            key={c.id}
                            onClick={() => pick(c)}
                            disabled={picked !== null}
                            className="w-full text-left px-5 py-4 border-4 border-black font-black transition-all"
                            style={{
                                background: reveal ? (c.correct ? "#bbf7d0" : isPicked ? "#fecaca" : "#fff") : "#fff",
                                boxShadow: "4px 4px 0 #000",
                                minHeight: 44,
                                ...khFont,
                            }}
                        >
                            {kh ? c.km : c.en}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export const safetyAdventureFormat: GameFormat<AdventureRound, KitCompletionResult> = {
    meta: {
        id: "safety-adventure",
        route: "/play/safety-adventure",
        title: { en: "Road Safety", kh: "Road Safety" },
        description: { en: "Make the safe choices on your journey to school.", kh: "ធ្វើការសម្រេចចិត្តប្រកបដោយសុវត្ថិភាពក្នុងដំណើរទៅសាលា។" },
        brandColor: "#a855f7",
        Icon: MapIcon,
        accessTier: "user",
        badge: { en: "KIDS", kh: "កុមារ" },
    },
    config: { timed: false, secondsPerRound: 0, scoringMode: "equal", showStreakHud: true },
    fetchRounds: async () => {
        const r = await fetch("/api/game/safety-adventure?count=8");
        if (!r.ok) { const d = await r.json().catch(() => ({})); return { rounds: [], locked: d.locked ?? true, lockMessage: d.lockMessage }; }
        return r.json();
    },
    completePath: "/api/game/safety-adventure/complete",
    RoundView: SafetyAdventureView,
};
