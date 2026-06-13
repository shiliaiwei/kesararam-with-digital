"use client";

import { useRef, useState } from "react";
import { RotateCcw, Send, MousePointerClick, CheckCircle2, XCircle, ChevronRight, Trophy, Loader2 } from "lucide-react";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import type { RoundViewProps } from "@/lib/gamekit/types";
import type { TrafficRound, TVehicle, TrafficSceneResult } from "./types";
import {
    entryPoint,
    exitPoint,
    dist,
    toPathD,
    HEADING_ANGLE,
    type Pt,
} from "./geometry";

const VEHICLE_COLOR: Record<string, string> = {
    car: "#3b82f6",
    truck: "#f97316",
    moto: "#22c55e",
    ambulance: "#ef4444",
    bus: "#a855f7",
};

const VEHICLE_LABEL: Record<string, { en: string; kh: string }> = {
    car: { en: "Car", kh: "ឡាន" },
    truck: { en: "Truck", kh: "ឡានដឹកទំនិញ" },
    moto: { en: "Moto", kh: "ម៉ូតូ" },
    ambulance: { en: "Ambulance", kh: "រថយន្តសង្គ្រោះ" },
    bus: { en: "Bus", kh: "ឡានក្រុង" },
};

const START_RADIUS = 16;
const MIN_STEP = 1.2;

/** Inner shapes of a vehicle, drawn facing "up" (front = -y), centred at origin. */
function VehicleBody({ kind }: { kind: string }) {
    const color = VEHICLE_COLOR[kind] ?? "#3b82f6";
    const wheel = "#18181b";
    switch (kind) {
        case "truck":
            return (
                <>
                    <rect x={-5.4} y={-5} width={1.8} height={3.4} rx={0.6} fill={wheel} />
                    <rect x={3.6} y={-5} width={1.8} height={3.4} rx={0.6} fill={wheel} />
                    <rect x={-5.4} y={2} width={1.8} height={3.4} rx={0.6} fill={wheel} />
                    <rect x={3.6} y={2} width={1.8} height={3.4} rx={0.6} fill={wheel} />
                    <rect x={-4.3} y={-1.5} width={8.6} height={8.5} rx={1} fill={color} stroke="#000" strokeWidth={1} />
                    <rect x={-4} y={-7.5} width={8} height={6} rx={1} fill="#fb923c" stroke="#000" strokeWidth={1} />
                    <rect x={-2.6} y={-6.8} width={5.2} height={2.3} rx={0.5} fill="#1e293b" />
                </>
            );
        case "moto":
            return (
                <>
                    <circle cx={0} cy={-5} r={1.7} fill={wheel} />
                    <circle cx={0} cy={5} r={1.7} fill={wheel} />
                    <rect x={-1.7} y={-3.6} width={3.4} height={7.4} rx={1.2} fill={color} stroke="#000" strokeWidth={0.9} />
                    <rect x={-3} y={-3.8} width={6} height={1.4} rx={0.7} fill="#111" />
                    <rect x={-2.4} y={-0.6} width={4.8} height={3.2} rx={1.4} fill="#1d4ed8" stroke="#000" strokeWidth={0.4} />
                    <circle cx={0} cy={-1.6} r={1.7} fill="#16a34a" stroke="#000" strokeWidth={0.5} />
                </>
            );
        case "ambulance":
            return (
                <>
                    <rect x={-5.6} y={-5} width={1.8} height={3.4} rx={0.6} fill={wheel} />
                    <rect x={3.8} y={-5} width={1.8} height={3.4} rx={0.6} fill={wheel} />
                    <rect x={-5.6} y={2} width={1.8} height={3.4} rx={0.6} fill={wheel} />
                    <rect x={3.8} y={2} width={1.8} height={3.4} rx={0.6} fill={wheel} />
                    <rect x={-5} y={-7.2} width={10} height={14.4} rx={2} fill="#fff" stroke="#000" strokeWidth={1} />
                    <rect x={-3.1} y={-6.2} width={6.2} height={2.5} rx={0.5} fill="#94a3b8" />
                    <rect x={-3} y={-6.6} width={3} height={1.4} fill="#ef4444" />
                    <rect x={0} y={-6.6} width={3} height={1.4} fill="#2563eb" />
                    <rect x={-0.9} y={1.4} width={1.8} height={4.4} fill="#ef4444" />
                    <rect x={-2.2} y={2.7} width={4.4} height={1.8} fill="#ef4444" />
                </>
            );
        case "bus":
            return (
                <>
                    <rect x={-5.4} y={-5.5} width={1.7} height={3.2} rx={0.6} fill={wheel} />
                    <rect x={3.7} y={-5.5} width={1.7} height={3.2} rx={0.6} fill={wheel} />
                    <rect x={-5.4} y={2.5} width={1.7} height={3.2} rx={0.6} fill={wheel} />
                    <rect x={3.7} y={2.5} width={1.7} height={3.2} rx={0.6} fill={wheel} />
                    <rect x={-4.5} y={-8} width={9} height={16} rx={2} fill={color} stroke="#000" strokeWidth={1} />
                    <rect x={-3.3} y={-6.8} width={6.6} height={2.4} rx={0.5} fill="#ddd6fe" />
                    <rect x={-3.6} y={-3} width={7.2} height={1.8} fill="#ddd6fe" />
                    <rect x={-3.6} y={0.4} width={7.2} height={1.8} fill="#ddd6fe" />
                </>
            );
        default: // car
            return (
                <>
                    <rect x={-5.5} y={-5} width={1.7} height={3.2} rx={0.6} fill={wheel} />
                    <rect x={3.8} y={-5} width={1.7} height={3.2} rx={0.6} fill={wheel} />
                    <rect x={-5.5} y={1.8} width={1.7} height={3.2} rx={0.6} fill={wheel} />
                    <rect x={3.8} y={1.8} width={1.7} height={3.2} rx={0.6} fill={wheel} />
                    <rect x={-4.5} y={-7} width={9} height={14} rx={2.2} fill={color} stroke="#000" strokeWidth={1} />
                    <rect x={-3.2} y={-5.6} width={6.4} height={3} rx={0.7} fill="#bfdbfe" />
                    <rect x={-3.2} y={2} width={6.4} height={2.6} rx={0.7} fill="#bfdbfe" />
                    <circle cx={-2.6} cy={-6.4} r={0.8} fill="#fde68a" />
                    <circle cx={2.6} cy={-6.4} r={0.8} fill="#fde68a" />
                </>
            );
    }
}

/** Realistic top-down pedestrian (head + shoulders + arms). */
function Pedestrian({ x, y }: { x: number; y: number }) {
    return (
        <g transform={`translate(${x} ${y})`} style={{ pointerEvents: "none" }} aria-hidden>
            <ellipse cx={0} cy={3.4} rx={2.4} ry={1} fill="rgba(0,0,0,0.25)" />
            <rect x={-2.3} y={-0.6} width={1} height={3.4} rx={0.5} fill="#1d4ed8" />
            <rect x={1.3} y={-0.6} width={1} height={3.4} rx={0.5} fill="#1d4ed8" />
            <rect x={-1.9} y={-1} width={3.8} height={4} rx={1.4} fill="#ef4444" stroke="#000" strokeWidth={0.3} />
            <circle cx={0} cy={-2.4} r={1.7} fill="#f1c27d" stroke="#000" strokeWidth={0.4} />
            <path d="M-1.5 -3.4 Q0 -4.8 1.5 -3.4" fill="none" stroke="#3b2a1a" strokeWidth={1} />
        </g>
    );
}

function OrderDots({ ids, vehicles }: { ids: string[]; vehicles: TVehicle[] }) {
    return (
        <span className="inline-flex items-center gap-1 align-middle">
            {ids.map((id, i) => {
                const v = vehicles.find((x) => x.id === id);
                return (
                    <span key={`${id}-${i}`} className="inline-flex items-center gap-1">
                        {i > 0 && <ChevronRight size={11} className="text-zinc-400" />}
                        <span className="w-5 h-5 text-[11px] font-black flex items-center justify-center rounded-full text-white border border-black"
                            style={{ background: VEHICLE_COLOR[v?.kind ?? "car"] ?? "#3b82f6" }}>
                            {i + 1}
                        </span>
                    </span>
                );
            })}
        </span>
    );
}

interface Feedback {
    isCorrect: boolean;
    points: number;
    scene: TrafficSceneResult;
}

export function SceneView({
    round,
    index,
    total,
    lang,
    onRoundComplete,
}: RoundViewProps<TrafficRound>) {
    const kh = lang === "kh";
    const khFont = kh
        ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" }
        : {};
    const vehicles = round.layout.vehicles;
    const signs = round.signs ?? [];
    const isLast = index + 1 >= total;

    const svgRef = useRef<SVGSVGElement | null>(null);
    const startRef = useRef(Date.now());
    const elapsedRef = useRef(0);
    const doneRef = useRef(false);

    const [paths, setPaths] = useState<Record<string, Pt[]>>({});
    const [order, setOrder] = useState<string[]>([]);
    const [drawingId, setDrawingId] = useState<string | null>(null);
    const [live, setLive] = useState<Pt[]>([]);
    const [checking, setChecking] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const allDrawn = order.length === vehicles.length;
    const locked = checking || feedback !== null;

    function toLocal(e: React.PointerEvent): Pt {
        const svg = svgRef.current!;
        const r = svg.getBoundingClientRect();
        return {
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
        };
    }

    function nearestUndrawn(p: Pt): string | null {
        let best: string | null = null;
        let bestD = START_RADIUS;
        for (const v of vehicles) {
            if (order.includes(v.id)) continue;
            const d = dist(p, entryPoint(v.approach, v.pos));
            if (d < bestD) {
                bestD = d;
                best = v.id;
            }
        }
        return best;
    }

    function onDown(e: React.PointerEvent) {
        if (doneRef.current || drawingId || allDrawn || locked) return;
        const p = toLocal(e);
        const id = nearestUndrawn(p);
        if (!id) return;
        const v = vehicles.find((x) => x.id === id)!;
        setDrawingId(id);
        setLive([entryPoint(v.approach, v.pos), p]);
        svgRef.current?.setPointerCapture(e.pointerId);
    }

    function onMove(e: React.PointerEvent) {
        if (!drawingId) return;
        const p = toLocal(e);
        setLive((prev) => {
            const last = prev[prev.length - 1];
            if (last && dist(last, p) < MIN_STEP) return prev;
            return [...prev, p];
        });
    }

    function onUp() {
        if (!drawingId) return;
        const id = drawingId;
        const pts = live;
        const reachedAway = pts.length >= 3 && dist(pts[0], pts[pts.length - 1]) > 12;
        if (reachedAway) {
            setPaths((prev) => ({ ...prev, [id]: pts }));
            setOrder((prev) => [...prev, id]);
        }
        setDrawingId(null);
        setLive([]);
    }

    function undo() {
        if (!order.length || locked) return;
        const last = order[order.length - 1];
        setOrder((prev) => prev.slice(0, -1));
        setPaths((prev) => {
            const next = { ...prev };
            delete next[last];
            return next;
        });
    }

    async function submit() {
        if (!allDrawn || locked) return;
        elapsedRef.current = Date.now() - startRef.current;
        setChecking(true);
        try {
            const res = await fetch("/api/game/traffic-commander/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    round: {
                        refId: round.sceneId,
                        timeTakenMs: elapsedRef.current,
                        payload: { mode: "A", paths, drawOrder: order },
                    },
                }),
            });
            const data = await res.json();
            if (data?.scene) {
                setFeedback({ isCorrect: !!data.isCorrect, points: data.points ?? 0, scene: data.scene });
            } else {
                next(false, 0);
            }
        } catch {
            next(false, 0);
        } finally {
            setChecking(false);
        }
    }

    function next(isCorrect: boolean, points: number) {
        if (doneRef.current) return;
        doneRef.current = true;
        onRoundComplete({
            refId: round.sceneId,
            isCorrectGuess: isCorrect,
            payload: { mode: "A", paths, drawOrder: order, points },
            timeTakenMs: elapsedRef.current || Date.now() - startRef.current,
            difficulty: round.difficulty,
        });
    }

    // Real signs placed on posts in the two top corners.
    const signSlots = [{ x: 17, y: 15 }, { x: 83, y: 15 }];

    return (
        <>
            {/* Prompt — short + clear */}
            <div className="shrink-0 w-full bg-zinc-900 border-2 border-black p-3 text-white text-center" style={khFont}>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-mono text-yellow-400 bg-black/40 px-1.5 py-0.5 border border-yellow-400/40">
                        {index + 1}/{total}
                    </span>
                    <span className="font-black" style={{ fontSize: "clamp(0.95rem,3.5vw,1.2rem)" }}>
                        {kh ? "គូរផ្លូវរថយន្ត តាមលំដាប់អ្នកទៅមុន" : "Draw each vehicle's path — first to go first"}
                    </span>
                </div>
                <div className="text-[11px] font-bold text-zinc-400 mt-1">
                    {allDrawn
                        ? (kh ? "ល្អ! ចុច បញ្ជូន" : "Great! Tap Submit")
                        : (kh ? `គូរផ្លូវរថយន្តលេខ ${order.length + 1}` : `Now draw vehicle #${order.length + 1}`)}
                </div>
            </div>

            {/* Junction canvas */}
            <div className="relative w-full mx-auto border-4 border-black"
                style={{ aspectRatio: "1 / 1", maxWidth: 440, boxShadow: "6px 6px 0 #000", touchAction: "none" }}>
                <svg
                    ref={svgRef}
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full"
                    style={{ touchAction: "none", background: "#5aa84f" }}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                >
                    {/* grass texture dots */}
                    <defs>
                        <pattern id="tc-grass" width="6" height="6" patternUnits="userSpaceOnUse">
                            <rect width="6" height="6" fill="#5aa84f" />
                            <circle cx="2" cy="2" r="0.5" fill="#4f9a45" />
                        </pattern>
                        <marker id="tc-arrow" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
                            <path d="M0,0 L5,3 L0,6 Z" fill="#000" />
                        </marker>
                    </defs>
                    <rect x="0" y="0" width="100" height="100" fill="url(#tc-grass)" />

                    {/* sidewalks (curbed) flanking each road */}
                    <g style={{ pointerEvents: "none" }}>
                        <rect x="32" y="0" width="4" height="100" fill="#cbd2d9" />
                        <rect x="64" y="0" width="4" height="100" fill="#cbd2d9" />
                        <rect x="0" y="32" width="100" height="4" fill="#cbd2d9" />
                        <rect x="0" y="64" width="100" height="4" fill="#cbd2d9" />
                    </g>

                    {/* asphalt */}
                    <rect x="36" y="0" width="28" height="100" fill="#43474d" />
                    <rect x="0" y="36" width="100" height="28" fill="#43474d" />
                    <rect x="36" y="36" width="28" height="28" fill="#4b4f55" />

                    {/* white edge lines */}
                    <g stroke="#e5e7eb" strokeWidth="0.6" style={{ pointerEvents: "none" }}>
                        <line x1="36.5" y1="0" x2="36.5" y2="36" /><line x1="36.5" y1="64" x2="36.5" y2="100" />
                        <line x1="63.5" y1="0" x2="63.5" y2="36" /><line x1="63.5" y1="64" x2="63.5" y2="100" />
                        <line x1="0" y1="36.5" x2="36" y2="36.5" /><line x1="64" y1="36.5" x2="100" y2="36.5" />
                        <line x1="0" y1="63.5" x2="36" y2="63.5" /><line x1="64" y1="63.5" x2="100" y2="63.5" />
                    </g>

                    {/* yellow dashed centre lines */}
                    <g stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" style={{ pointerEvents: "none" }}>
                        <line x1="50" y1="0" x2="50" y2="34" /><line x1="50" y1="66" x2="50" y2="100" />
                        <line x1="0" y1="50" x2="34" y2="50" /><line x1="66" y1="50" x2="100" y2="50" />
                    </g>

                    {/* zebra crosswalks */}
                    <g fill="#eef2f5" style={{ pointerEvents: "none" }}>
                        {[38, 42, 46, 50, 54, 58].map((x) => (<rect key={`ct${x}`} x={x - 1.1} y={30.5} width={2.2} height={4.5} />))}
                        {[38, 42, 46, 50, 54, 58].map((x) => (<rect key={`cb${x}`} x={x - 1.1} y={65} width={2.2} height={4.5} />))}
                        {[38, 42, 46, 50, 54, 58].map((y) => (<rect key={`cl${y}`} x={30.5} y={y - 1.1} width={4.5} height={2.2} />))}
                        {[38, 42, 46, 50, 54, 58].map((y) => (<rect key={`cr${y}`} x={65} y={y - 1.1} width={4.5} height={2.2} />))}
                    </g>

                    {/* REAL road signs (from DB) on posts */}
                    {signs.slice(0, 2).map((s, i) => {
                        const slot = signSlots[i];
                        return (
                            <g key={`sign-${i}`} style={{ pointerEvents: "none" }}>
                                <title>{kh ? s.nameKm || s.nameEn : s.nameEn}</title>
                                <line x1={slot.x} y1={slot.y + 6} x2={slot.x} y2={slot.y + 12} stroke="#6b7280" strokeWidth="1" />
                                <rect x={slot.x - 7} y={slot.y - 7} width={14} height={14} fill="#ffffff" stroke="#000" strokeWidth="0.6" rx={1} />
                                <image
                                    href={cloudinaryOptimize(s.imageUrl, 120)}
                                    x={slot.x - 6.2} y={slot.y - 6.2} width={12.4} height={12.4}
                                    preserveAspectRatio="xMidYMid meet"
                                />
                            </g>
                        );
                    })}

                    {/* pedestrian on the corner sidewalk */}
                    <Pedestrian x={30} y={30} />

                    {/* faint guide hints for undrawn vehicles */}
                    {vehicles.filter((v) => !order.includes(v.id)).map((v) => {
                        const e = entryPoint(v.approach, v.pos);
                        const x = exitPoint(v.approach, v.intent);
                        return (
                            <path key={`g-${v.id}`} d={`M ${e.x} ${e.y} L 50 50 L ${x.x} ${x.y}`}
                                fill="none" stroke="#ffffff" strokeWidth="1.4" strokeDasharray="2 3"
                                opacity={0.3} strokeLinecap="round" style={{ pointerEvents: "none" }} />
                        );
                    })}

                    {/* committed paths */}
                    {order.map((id) => {
                        const v = vehicles.find((x) => x.id === id)!;
                        return (
                            <path key={`p-${id}`} d={toPathD(paths[id])} fill="none"
                                stroke={VEHICLE_COLOR[v.kind] ?? "#3b82f6"} strokeWidth="2.6"
                                strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#tc-arrow)"
                                opacity={0.95} style={{ pointerEvents: "none" }} />
                        );
                    })}

                    {/* live stroke */}
                    {drawingId && live.length > 1 && (
                        <path d={toPathD(live)} fill="none"
                            stroke={VEHICLE_COLOR[vehicles.find((v) => v.id === drawingId)!.kind] ?? "#3b82f6"}
                            strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity={0.8}
                            style={{ pointerEvents: "none" }} />
                    )}

                    {/* vehicles + order badges */}
                    {vehicles.map((v) => {
                        const drawn = order.includes(v.id);
                        const e = entryPoint(v.approach, v.pos);
                        const ord = order.indexOf(v.id) + 1;
                        return (
                            <g key={v.id} style={{ pointerEvents: "none" }}>
                                <g transform={`translate(${e.x} ${e.y})`}>
                                    {drawn && <circle r={9.5} fill="none" stroke="#facc15" strokeWidth={1.6} opacity={0.9} />}
                                    <g transform={`rotate(${HEADING_ANGLE[v.approach]})`}><VehicleBody kind={v.kind} /></g>
                                </g>
                                {drawn && (
                                    <g transform={`translate(${e.x + 6.5} ${e.y - 6.5})`}>
                                        <circle r="4.6" fill="#000" stroke="#facc15" strokeWidth="1.2" />
                                        <text x="0" y="2.4" textAnchor="middle" fontSize="6" fontWeight="700" fill="#facc15">{ord}</text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Vehicle legend — type names (no clutter in the scene) */}
            <div className="shrink-0 w-full flex flex-wrap items-center justify-center gap-2">
                {vehicles.map((v) => {
                    const ord = order.indexOf(v.id) + 1;
                    const label = VEHICLE_LABEL[v.kind] ?? VEHICLE_LABEL.car;
                    return (
                        <span key={v.id} className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-2 py-1"
                            style={{ boxShadow: "2px 2px 0 #000" }}>
                            <svg viewBox="-7 -9 14 18" width="16" height="20"><VehicleBody kind={v.kind} /></svg>
                            <span className="text-[11px] font-black text-black" style={khFont}>{kh ? label.kh : label.en}</span>
                            {ord > 0 && (
                                <span className="w-4 h-4 text-[9px] font-black flex items-center justify-center rounded-full text-yellow-400 bg-black">{ord}</span>
                            )}
                        </span>
                    );
                })}
            </div>

            {/* Feedback OR controls */}
            {feedback ? (
                <div className="shrink-0 w-full border-2 border-black p-3"
                    style={{ background: feedback.isCorrect ? "#dcfce7" : "#fee2e2", boxShadow: "3px 3px 0 #000" }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {feedback.isCorrect
                                ? <CheckCircle2 size={22} className="text-green-600" />
                                : <XCircle size={22} className="text-red-500" />}
                            <span className="font-black text-base" style={khFont}>
                                {feedback.isCorrect ? (kh ? "ត្រឹមត្រូវ!" : "Correct!") : (kh ? "មិនទាន់ត្រូវ" : "Not quite")}
                            </span>
                        </div>
                        <span className="font-black text-lg tabular-nums" style={{ color: feedback.isCorrect ? "#16a34a" : "#a16207" }}>
                            +{feedback.points}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-700 mt-2" style={khFont}>
                        <span className="font-bold">{kh ? "លំដាប់ត្រឹមត្រូវ:" : "Correct order:"}</span>
                        <OrderDots ids={feedback.scene.correctOrder} vehicles={feedback.scene.vehicles} />
                    </div>
                    <p className="text-xs font-bold text-zinc-800 mt-2" style={khFont}>
                        {kh ? feedback.scene.explanationKm || feedback.scene.explanationEn : feedback.scene.explanationEn}
                    </p>
                    <button
                        type="button"
                        onClick={() => next(feedback.isCorrect, feedback.points)}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-yellow-400 font-black border-2 border-black"
                        style={khFont}
                    >
                        {isLast ? <Trophy size={16} /> : <ChevronRight size={16} />}
                        {isLast ? (kh ? "មើលលទ្ធផល" : "See results") : (kh ? "បន្ទាប់" : "Next")}
                    </button>
                </div>
            ) : (
                <div className="shrink-0 w-full flex items-center gap-2.5">
                    <button type="button" onClick={undo} disabled={!order.length || locked}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white text-black font-black border-2 border-black disabled:opacity-40"
                        style={{ boxShadow: "3px 3px 0 #000", ...khFont }}>
                        <RotateCcw size={16} /> {kh ? "ត្រឡប់" : "Undo"}
                    </button>
                    <button type="button" onClick={submit} disabled={!allDrawn || locked}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-black border-2 border-black disabled:opacity-50"
                        style={{ background: allDrawn ? "#eab308" : "#e4e4e7", color: "#000", boxShadow: "3px 3px 0 #000", ...khFont }}>
                        {checking ? <Loader2 size={16} className="animate-spin" /> : allDrawn ? <Send size={16} /> : <MousePointerClick size={16} />}
                        {checking ? (kh ? "កំពុងពិនិត្យ..." : "Checking...") : allDrawn ? (kh ? "បញ្ជូន" : "Submit") : (kh ? `គូរ ${order.length}/${vehicles.length}` : `Drawn ${order.length}/${vehicles.length}`)}
                    </button>
                </div>
            )}
        </>
    );
}
