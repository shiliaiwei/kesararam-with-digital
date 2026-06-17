"use client";

import { useState, useMemo, useRef, useCallback, useLayoutEffect } from "react";
import { Spline } from "lucide-react";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import type { GameFormat, RoundViewProps, KitCompletionResult } from "@/lib/gamekit/types";

interface Pair {
    id: number;
    nameEn: string;
    nameKm: string;
    imageUrl: string;
}
interface SignConnectRound {
    kind: "sign-connect";
    id: number;
    pairs: Pair[];
}

type ItemState = "neutral" | "correct" | "wrong";
interface DrawnLine {
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    state: Exclude<ItemState, "neutral">;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const COLORS: Record<ItemState, { bg: string; border: string }> = {
    neutral: { bg: "#fff", border: "#000" },
    correct: { bg: "#bbf7d0", border: "#16a34a" },
    wrong: { bg: "#fecaca", border: "#dc2626" },
};

function SignConnectView({ round, lang, onRoundComplete }: RoundViewProps<SignConnectRound>) {
    const kh = lang === "kh";
    const khFont = { fontFamily: "var(--font-qa)" };

    const startRef = useRef(Date.now());
    const doneRef = useRef(false);
    const picksRef = useRef<{ signId: number; meaningId: number }[]>([]);

    const signs = round.pairs; // left column, given order
    const meanings = useMemo(() => shuffle(round.pairs), [round]); // right column, shuffled

    const [selected, setSelected] = useState<number | null>(null);
    const [leftState, setLeftState] = useState<Record<number, ItemState>>({});
    const [rightState, setRightState] = useState<Record<number, ItemState>>({});
    const [lines, setLines] = useState<DrawnLine[]>([]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const leftRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
    const rightRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    const coordsFor = useCallback((signId: number, meaningId: number) => {
        const cont = containerRef.current?.getBoundingClientRect();
        const l = leftRefs.current.get(signId)?.getBoundingClientRect();
        const r = rightRefs.current.get(meaningId)?.getBoundingClientRect();
        if (!cont || !l || !r) return { x1: 0, y1: 0, x2: 0, y2: 0 };
        return {
            x1: l.right - cont.left,
            y1: l.top - cont.top + l.height / 2,
            x2: r.left - cont.left,
            y2: r.top - cont.top + r.height / 2,
        };
    }, []);

    // Keep lines pinned to the tiles if the layout reflows (orientation / resize).
    const recompute = useCallback(() => {
        setLines(
            picksRef.current.map((p) => ({
                key: `${p.signId}-${p.meaningId}`,
                ...coordsFor(p.signId, p.meaningId),
                state: p.signId === p.meaningId ? "correct" : "wrong",
            }))
        );
    }, [coordsFor]);

    useLayoutEffect(() => {
        window.addEventListener("resize", recompute);
        return () => window.removeEventListener("resize", recompute);
    }, [recompute]);

    function tapSign(id: number) {
        if (leftState[id] === "correct" || leftState[id] === "wrong") return;
        setSelected((cur) => (cur === id ? null : id));
    }

    function tapMeaning(meaningId: number) {
        if (selected === null) return;
        if (rightState[meaningId] === "correct" || rightState[meaningId] === "wrong") return;
        const signId = selected;
        const ok = signId === meaningId; // server re-checks this exact equality
        const result: Exclude<ItemState, "neutral"> = ok ? "correct" : "wrong";

        setLeftState((s) => ({ ...s, [signId]: result }));
        setRightState((s) => ({ ...s, [meaningId]: result }));
        setLines((ls) => [...ls, { key: `${signId}-${meaningId}`, ...coordsFor(signId, meaningId), state: result }]);
        picksRef.current.push({ signId, meaningId });
        setSelected(null);

        if (picksRef.current.length === signs.length && !doneRef.current) {
            doneRef.current = true;
            const allCorrect = picksRef.current.every((p) => p.signId === p.meaningId);
            const correctUnits = picksRef.current.filter((p) => p.signId === p.meaningId).length;
            setTimeout(() => {
                onRoundComplete({
                    refId: round.id,
                    isCorrectGuess: allCorrect,
                    correctUnits,
                    unitCount: picksRef.current.length,
                    payload: { picks: picksRef.current },
                    timeTakenMs: Date.now() - startRef.current,
                    difficulty: "easy",
                });
            }, 480);
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <style>{`@keyframes scLineDraw{to{stroke-dashoffset:0}}`}</style>

            <div className="text-center">
                <div className="text-sm font-black text-zinc-300" style={khFont}>
                    {kh
                        ? `ភ្ជាប់សញ្ញា · ${lines.length}/${signs.length}`
                        : `Connect the signs · ${lines.length}/${signs.length}`}
                </div>
                <div className="text-xs font-bold text-zinc-500 mt-0.5" style={khFont}>
                    {kh ? "ប៉ះសញ្ញា រួចប៉ះអត្ថន័យរបស់វា" : "Tap a sign, then tap its meaning"}
                </div>
            </div>

            <div ref={containerRef} className="relative w-full">
                {/* connecting-line layer (cosmetic; server validates pairs) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} aria-hidden="true">
                    {lines.map((ln) => {
                        const len = Math.hypot(ln.x2 - ln.x1, ln.y2 - ln.y1);
                        return (
                            <line
                                key={ln.key}
                                x1={ln.x1}
                                y1={ln.y1}
                                x2={ln.x2}
                                y2={ln.y2}
                                stroke={ln.state === "correct" ? "#16a34a" : "#dc2626"}
                                strokeWidth={3}
                                strokeLinecap="round"
                                style={{ strokeDasharray: len, strokeDashoffset: len, animation: "scLineDraw 0.35s ease forwards" }}
                            />
                        );
                    })}
                </svg>

                <div className="relative flex justify-between gap-6 sm:gap-10" style={{ zIndex: 2 }}>
                    {/* LEFT — sign images */}
                    <div className="flex flex-col gap-3" style={{ width: 84 }}>
                        {signs.map((p) => {
                            const st = leftState[p.id] ?? "neutral";
                            const isSel = selected === p.id && st === "neutral";
                            const c = isSel ? { bg: "#fef9c3", border: "#eab308" } : COLORS[st];
                            const locked = st !== "neutral";
                            return (
                                <button
                                    key={p.id}
                                    ref={(el) => { if (el) leftRefs.current.set(p.id, el); }}
                                    onClick={() => tapSign(p.id)}
                                    disabled={locked}
                                    className="aspect-square flex items-center justify-center p-2 transition-all"
                                    style={{
                                        background: c.bg,
                                        border: `3px solid ${c.border}`,
                                        boxShadow: `3px 3px 0 ${c.border}`,
                                        minHeight: 44,
                                    }}
                                    aria-label="sign"
                                >
                                    <img
                                        src={cloudinaryOptimize(p.imageUrl, 200)}
                                        alt=""
                                        className="max-h-full max-w-full object-contain pointer-events-none"
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {/* RIGHT — shuffled meanings */}
                    <div className="flex flex-col gap-3 flex-1">
                        {meanings.map((p) => {
                            const st = rightState[p.id] ?? "neutral";
                            const c = COLORS[st];
                            const locked = st !== "neutral";
                            const armed = selected !== null && !locked;
                            return (
                                <button
                                    key={p.id}
                                    ref={(el) => { if (el) rightRefs.current.set(p.id, el); }}
                                    onClick={() => tapMeaning(p.id)}
                                    disabled={locked}
                                    className="flex items-center px-3 transition-all text-left"
                                    style={{
                                        background: c.bg,
                                        border: `3px solid ${c.border}`,
                                        boxShadow: armed ? "3px 3px 0 #eab308" : `3px 3px 0 ${c.border}`,
                                        minHeight: 60,
                                    }}
                                    aria-label="meaning"
                                >
                                    <span className="text-sm font-black text-black leading-tight" style={khFont}>
                                        {kh ? p.nameKm || p.nameEn : p.nameEn}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export const signConnectFormat: GameFormat<SignConnectRound, KitCompletionResult> = {
    meta: {
        id: "sign-connect",
        route: "/play/sign-connect",
        title: { en: "Connect the Signs", kh: "Connect the Signs" },
        description: {
            en: "Tap a sign, then tap its meaning to connect them.",
            kh: "ប៉ះសញ្ញា រួចប៉ះអត្ថន័យរបស់វា ដើម្បីភ្ជាប់គ្នា។",
        },
        brandColor: "#2563eb",
        Icon: Spline,
        accessTier: "user",
        badge: { en: "KIDS", kh: "កុមារ" },
    },
    config: { timed: false, secondsPerRound: 0, scoringMode: "equal", showStreakHud: false },
    fetchRounds: async () => {
        const r = await fetch("/api/game/sign-connect?count=5");
        if (!r.ok) {
            const d = await r.json().catch(() => ({}));
            return { rounds: [], locked: d.locked, lockMessage: d.lockMessage };
        }
        return r.json();
    },
    completePath: "/api/game/sign-connect/complete",
    RoundView: SignConnectView,
};
