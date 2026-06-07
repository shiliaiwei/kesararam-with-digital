"use client";

import { useState, useRef } from "react";
import { Check } from "lucide-react";
import { JunctionView } from "./JunctionView";
import type { RoundViewProps } from "@/lib/gamekit/types";
import type { PriorityRound } from "./types";

export function PriorityRoundView({
    round,
    lang,
    onRoundComplete,
}: RoundViewProps<PriorityRound>) {
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
    const [order, setOrder] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const startRef = useRef(Date.now());
    const total = round.layout.vehicles.length;

    function submit() {
        if (submitted) return;
        setSubmitted(true);
        onRoundComplete({
            refId: round.sceneId,
            isCorrectGuess: false, // server validates exact order
            payload: { submittedOrder: order },
            timeTakenMs: Date.now() - startRef.current,
            difficulty: round.difficulty,
        });
    }

    return (
        <>
            <div
                className="shrink-0 w-full bg-zinc-900 border-2 border-black p-3 text-white font-black text-center"
                style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.3rem)", ...khFont }}
            >
                {kh
                    ? round.titleKm || round.titleEn || "តើរថយន្តណាទៅមុនគេ?"
                    : round.titleEn || "Who goes first?"}
                <div className="text-[11px] font-bold text-zinc-400 mt-1" style={khFont}>
                    {kh ? "ប៉ះរថយន្តតាមលំដាប់សិទ្ធិទៅមុន" : "Tap the vehicles in right-of-way order"}
                </div>
            </div>

            <JunctionView layout={round.layout} onOrderChange={setOrder} disabled={submitted} />

            <button
                onClick={submit}
                disabled={order.length !== total || submitted}
                className="shrink-0 w-full py-4 font-black border-2 border-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{
                    background: order.length === total ? "#eab308" : "#e4e4e7",
                    color: "#000",
                    boxShadow: order.length === total ? "4px 4px 0 #000" : "none",
                    ...khFont,
                }}
            >
                <Check size={18} />
                {kh ? `បញ្ជូន (${order.length}/${total})` : `Submit (${order.length}/${total})`}
            </button>
        </>
    );
}
