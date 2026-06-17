"use client";

import { useState, useRef } from "react";
import { ArrowUp, CornerUpLeft, CornerUpRight, Ambulance, TrafficCone, CornerUpRight as GiveWay } from "lucide-react";
import { JunctionView } from "./JunctionView";
import type { RoundViewProps } from "@/lib/gamekit/types";
import type { PriorityRound } from "./types";

export function PriorityRoundView({
    round,
    index,
    total: roundTotal,
    lang,
    onRoundComplete,
}: RoundViewProps<PriorityRound>) {
    const kh = lang === "kh";
    const khFont = { fontFamily: "var(--font-qa)" };
    const [picked, setPicked] = useState<string | null>(null);
    const startRef = useRef(Date.now());
    const doneRef = useRef(false);
    const vehicles = round.layout.vehicles;
    const hasAmbulance = vehicles.some((v) => v.kind === "ambulance");
    const hasLight = round.layout.hasTrafficLight;

    // Kid-simple: tap the ONE vehicle that goes first. No ordering, no reasoning
    // about the full sequence — just pick who goes first. The server still
    // validates against the full correct order (first element).
    function tap(id: string) {
        if (doneRef.current) return;
        doneRef.current = true;
        setPicked(id);
        setTimeout(() => {
            onRoundComplete({
                refId: round.sceneId,
                isCorrectGuess: false, // server validates: picked === correctOrder[0]
                payload: { submittedOrder: [id] },
                timeTakenMs: Date.now() - startRef.current,
                difficulty: round.difficulty,
            });
        }, 450);
    }

    return (
        <>
            {/* Title + progress */}
            <div
                className="shrink-0 w-full bg-zinc-900 border-2 border-black p-3 text-white font-black text-center"
                style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.3rem)", ...khFont }}
            >
                <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-mono text-yellow-400 bg-black/40 px-1.5 py-0.5 border border-yellow-400/40">
                        {index + 1}/{roundTotal}
                    </span>
                    <span>{kh ? "ប៉ះរថយន្តដែលទៅមុនគេ" : "Tap who goes first"}</span>
                </div>
                <div className="text-[11px] font-bold text-zinc-400 mt-1" style={khFont}>
                    {kh
                        ? "ជ្រើសរើសរថយន្ត ១ ដែលអ្នកគិតថាគួរទៅមុនគេ"
                        : "Pick the one vehicle that should go first"}
                </div>
            </div>

            {/* Rule hint chip — one simple cue for which rule applies */}
            <div className="shrink-0 w-full flex flex-wrap items-center justify-center gap-2">
                {hasAmbulance ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide bg-red-50 border-2 border-red-300 text-red-600 px-2 py-1" style={khFont}>
                        <Ambulance size={12} /> {kh ? "រថយន្តសង្គ្រោះទៅមុនគេ" : "Emergency goes first"}
                    </span>
                ) : hasLight ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide bg-blue-50 border-2 border-blue-300 text-blue-600 px-2 py-1" style={khFont}>
                        <TrafficCone size={12} /> {kh ? "ធ្វើតាមភ្លើងសញ្ញា" : "Follow the lights"}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide bg-yellow-50 border-2 border-yellow-300 text-yellow-700 px-2 py-1" style={khFont}>
                        <GiveWay size={12} /> {kh ? "ផ្ដល់ផ្លូវឱ្យខាងស្ដាំ" : "Give way to the right"}
                    </span>
                )}
            </div>

            {/* Single-tap junction: picked vehicle highlighted, others dimmed */}
            <JunctionView
                layout={round.layout}
                order={picked ? [picked] : []}
                onTap={tap}
                disabled={picked !== null}
            />

            {/* Legend for turn-intent arrows */}
            <div className="shrink-0 w-full flex items-center justify-center gap-3 text-[10px] font-bold text-zinc-500" style={khFont}>
                <span className="inline-flex items-center gap-1"><ArrowUp size={12} className="text-zinc-700" /> {kh ? "ត្រង់" : "Straight"}</span>
                <span className="inline-flex items-center gap-1"><CornerUpLeft size={12} className="text-zinc-700" /> {kh ? "បត់ឆ្វេង" : "Left"}</span>
                <span className="inline-flex items-center gap-1"><CornerUpRight size={12} className="text-zinc-700" /> {kh ? "បត់ស្ដាំ" : "Right"}</span>
            </div>

            {/* Helper line instead of a submit button — tap auto-submits */}
            <div
                className="shrink-0 w-full py-3 font-black border-2 border-black text-center bg-zinc-100 text-zinc-500"
                style={khFont}
            >
                {picked
                    ? (kh ? "បានជ្រើសរើស!" : "Picked!")
                    : (kh ? "ប៉ះរថយន្ត ១ ដើម្បីជ្រើស" : "Tap a vehicle to choose")}
            </div>
        </>
    );
}
