"use client";

import { useState, useRef } from "react";
import { Target } from "lucide-react";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import type { GameFormat, RoundViewProps, KitCompletionResult } from "@/lib/gamekit/types";

interface CatchSignRound {
    kind: "catch-sign";
    targetId: number;
    promptEn: string;
    promptKm: string;
    choices: { id: number; imageUrl: string }[];
}

function CatchSignView({ round, lang, onRoundComplete }: RoundViewProps<CatchSignRound>) {
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
    const [picked, setPicked] = useState<number | null>(null);
    const startRef = useRef(Date.now());
    const doneRef = useRef(false);

    function pick(id: number) {
        if (doneRef.current) return;
        doneRef.current = true;
        setPicked(id);
        const isCorrect = id === round.targetId;
        setTimeout(() => {
            onRoundComplete({
                refId: round.targetId,
                isCorrectGuess: isCorrect,
                payload: { picked: id },
                timeTakenMs: Date.now() - startRef.current,
                difficulty: "easy",
            });
        }, 500);
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="bg-zinc-900 border-2 border-black p-4 text-center text-white font-black" style={{ fontSize: "clamp(1rem,4vw,1.4rem)", ...khFont }}>
                {kh ? "ប៉ះ: " : "Tap: "}
                <span className="text-yellow-400">{kh ? round.promptKm || round.promptEn : round.promptEn}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {round.choices.map((c) => {
                    const isPicked = picked === c.id;
                    const isTarget = c.id === round.targetId;
                    const reveal = picked !== null;
                    return (
                        <button
                            key={c.id}
                            onClick={() => pick(c.id)}
                            disabled={picked !== null}
                            className="aspect-square border-4 border-black bg-white flex items-center justify-center p-3 transition-all"
                            style={{
                                boxShadow: "4px 4px 0 #000",
                                background: reveal ? (isTarget ? "#bbf7d0" : isPicked ? "#fecaca" : "#fff") : "#fff",
                                minHeight: 44,
                            }}
                            aria-label="sign choice"
                        >
                            <img src={cloudinaryOptimize(c.imageUrl, 250)} alt="" className="max-h-full max-w-full object-contain pointer-events-none" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export const catchSignFormat: GameFormat<CatchSignRound, KitCompletionResult> = {
    meta: {
        id: "catch-sign",
        route: "/play/catch-sign",
        title: { en: "Catch the Sign", kh: "ចាប់សញ្ញា" },
        description: { en: "Tap the correct road sign as fast as you can.", kh: "ប៉ះសញ្ញាចរាចរណ៍ឱ្យបានត្រឹមត្រូវ និងលឿន។" },
        brandColor: "#f97316",
        Icon: Target,
        accessTier: "user",
        badge: { en: "KIDS", kh: "កុមារ" },
    },
    config: { timed: false, secondsPerRound: 0, scoringMode: "speed", showStreakHud: true },
    fetchRounds: async () => {
        const r = await fetch("/api/game/catch-sign?count=8");
        if (!r.ok) { const d = await r.json().catch(() => ({})); return { rounds: [], locked: d.locked, lockMessage: d.lockMessage }; }
        return r.json();
    },
    completePath: "/api/game/catch-sign/complete",
    RoundView: CatchSignView,
};
