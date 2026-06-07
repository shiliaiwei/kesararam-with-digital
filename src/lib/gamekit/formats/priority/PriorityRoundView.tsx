"use client";

import { useState, useRef } from "react";
import { Check, Undo2, RotateCcw, ArrowUp, CornerUpLeft, CornerUpRight, Ambulance, TrafficCone } from "lucide-react";
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
    const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
    const [order, setOrder] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const startRef = useRef(Date.now());
    const vehicles = round.layout.vehicles;
    const total = vehicles.length;
    const hasAmbulance = vehicles.some((v) => v.kind === "ambulance");
    const hasLight = round.layout.hasTrafficLight;

    function tap(id: string) {
        if (submitted) return;
        setOrder((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    function undo() {
        if (submitted) return;
        setOrder((prev) => prev.slice(0, -1));
    }

    function reset() {
        if (submitted) return;
        setOrder([]);
    }

    function submit() {
        if (submitted || order.length !== total) return;
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
            {/* Title + progress */}
            <div
                className="shrink-0 w-full bg-zinc-900 border-2 border-black p-3 text-white font-black text-center"
                style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.3rem)", ...khFont }}
            >
                <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-mono text-yellow-400 bg-black/40 px-1.5 py-0.5 border border-yellow-400/40">
                        {index + 1}/{roundTotal}
                    </span>
                    <span>
                        {kh
                            ? round.titleKm || round.titleEn || "តើរថយន្តណាទៅមុនគេ?"
                            : round.titleEn || "Who goes first?"}
                    </span>
                </div>
                <div className="text-[11px] font-bold text-zinc-400 mt-1" style={khFont}>
                    {kh
                        ? "ប៉ះរថយន្តតាមលំដាប់ដែលពួកគេគួរទៅ — ទី១ មុនគេ"
                        : "Tap the vehicles in the order they should go — 1st goes first"}
                </div>
            </div>

            {/* Rule hint chips */}
            <div className="shrink-0 w-full flex flex-wrap items-center justify-center gap-2">
                {hasAmbulance && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide bg-red-50 border-2 border-red-300 text-red-600 px-2 py-1" style={khFont}>
                        <Ambulance size={12} /> {kh ? "រថយន្តសង្គ្រោះទៅមុនគេ" : "Emergency goes first"}
                    </span>
                )}
                {hasLight ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide bg-blue-50 border-2 border-blue-300 text-blue-600 px-2 py-1" style={khFont}>
                        <TrafficCone size={12} /> {kh ? "ធ្វើតាមភ្លើងសញ្ញា" : "Follow the lights"}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide bg-yellow-50 border-2 border-yellow-300 text-yellow-700 px-2 py-1" style={khFont}>
                        <CornerUpRight size={12} /> {kh ? "ផ្ដល់ផ្លូវឱ្យខាងស្ដាំ" : "Give way to the right"}
                    </span>
                )}
            </div>

            <JunctionView layout={round.layout} order={order} onTap={tap} disabled={submitted} />

            {/* Legend for turn-intent arrows */}
            <div className="shrink-0 w-full flex items-center justify-center gap-3 text-[10px] font-bold text-zinc-500" style={khFont}>
                <span className="inline-flex items-center gap-1"><ArrowUp size={12} className="text-zinc-700" /> {kh ? "ត្រង់" : "Straight"}</span>
                <span className="inline-flex items-center gap-1"><CornerUpLeft size={12} className="text-zinc-700" /> {kh ? "បត់ឆ្វេង" : "Left"}</span>
                <span className="inline-flex items-center gap-1"><CornerUpRight size={12} className="text-zinc-700" /> {kh ? "បត់ស្ដាំ" : "Right"}</span>
            </div>

            {/* Order strip — shows the sequence the player has tapped */}
            <div className="shrink-0 w-full flex items-center gap-2">
                <div className="flex-1 flex items-center gap-1.5 flex-wrap min-h-[36px] border-2 border-black bg-white px-2 py-1.5">
                    {order.length === 0 ? (
                        <span className="text-[11px] font-bold text-zinc-400" style={khFont}>
                            {kh ? "មិនទាន់ជ្រើសរើស…" : "No order yet…"}
                        </span>
                    ) : (
                        order.map((id, i) => (
                            <span key={id} className="inline-flex items-center gap-1">
                                {i > 0 && <span className="text-zinc-400">→</span>}
                                <span className="w-6 h-6 bg-black text-yellow-400 text-xs font-black flex items-center justify-center rounded-full">
                                    {i + 1}
                                </span>
                            </span>
                        ))
                    )}
                </div>
                <button
                    type="button"
                    onClick={undo}
                    disabled={order.length === 0 || submitted}
                    className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center disabled:opacity-40"
                    style={{ boxShadow: order.length > 0 ? "2px 2px 0 #000" : "none" }}
                    aria-label={kh ? "ត្រឡប់ក្រោយ" : "Undo"}
                >
                    <Undo2 size={16} className="text-black" />
                </button>
                <button
                    type="button"
                    onClick={reset}
                    disabled={order.length === 0 || submitted}
                    className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center disabled:opacity-40"
                    style={{ boxShadow: order.length > 0 ? "2px 2px 0 #000" : "none" }}
                    aria-label={kh ? "កំណត់ឡើងវិញ" : "Reset"}
                >
                    <RotateCcw size={16} className="text-black" />
                </button>
            </div>

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
