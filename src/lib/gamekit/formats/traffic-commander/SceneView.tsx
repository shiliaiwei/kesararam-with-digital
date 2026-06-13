"use client";

import { useRef, useState } from "react";
import { RotateCcw, Send, MousePointerClick } from "lucide-react";
import type { RoundViewProps } from "@/lib/gamekit/types";
import type { TrafficRound, TVehicle } from "./types";
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

const START_RADIUS = 16; // how near a vehicle the stroke must begin (0..100 space)
const MIN_STEP = 1.2; // min distance between sampled points

/** A flat top-down car sprite, drawn facing "up"; rotated by approach heading. */
function CarSprite({ v, drawn }: { v: TVehicle; drawn: boolean }) {
    const e = entryPoint(v.approach, v.pos);
    const color = VEHICLE_COLOR[v.kind] ?? "#3b82f6";
    return (
        <g transform={`translate(${e.x} ${e.y}) rotate(${HEADING_ANGLE[v.approach]})`}>
            <rect x={-4.6} y={-6.6} width={9.2} height={13.2} rx={2} ry={2}
                fill={drawn ? color : "#ffffff"} stroke="#000" strokeWidth={1.2} />
            <rect x={-3.1} y={-5.2} width={6.2} height={3.6} rx={1}
                fill={drawn ? "#ffffff" : "#cbd5e1"} />
        </g>
    );
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

    const svgRef = useRef<SVGSVGElement | null>(null);
    const startRef = useRef(Date.now());
    const doneRef = useRef(false);

    const [paths, setPaths] = useState<Record<string, Pt[]>>({});
    const [order, setOrder] = useState<string[]>([]);
    const [drawingId, setDrawingId] = useState<string | null>(null);
    const [live, setLive] = useState<Pt[]>([]);

    const allDrawn = order.length === vehicles.length;

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
        if (doneRef.current || drawingId || allDrawn) return;
        const p = toLocal(e);
        const id = nearestUndrawn(p);
        if (!id) return;
        setDrawingId(id);
        setLive([entryPoint(vehicles.find((v) => v.id === id)!.approach, vehicles.find((v) => v.id === id)!.pos), p]);
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
        const v = vehicles.find((x) => x.id === id)!;
        const reachedAway = pts.length >= 3 && dist(pts[0], pts[pts.length - 1]) > 12;
        if (reachedAway) {
            setPaths((prev) => ({ ...prev, [id]: pts }));
            setOrder((prev) => [...prev, id]);
        }
        setDrawingId(null);
        setLive([]);
        void v;
    }

    function undo() {
        if (!order.length || doneRef.current) return;
        const last = order[order.length - 1];
        setOrder((prev) => prev.slice(0, -1));
        setPaths((prev) => {
            const next = { ...prev };
            delete next[last];
            return next;
        });
    }

    function submit() {
        if (!allDrawn || doneRef.current) return;
        doneRef.current = true;
        onRoundComplete({
            refId: round.sceneId,
            isCorrectGuess: false, // server validates
            payload: { mode: "A", paths, drawOrder: order },
            timeTakenMs: Date.now() - startRef.current,
            difficulty: round.difficulty,
        });
    }

    const nextNumber = order.length + 1;

    return (
        <>
            {/* Prompt */}
            <div className="shrink-0 w-full bg-zinc-900 border-2 border-black p-3 text-white text-center"
                style={khFont}>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-mono text-yellow-400 bg-black/40 px-1.5 py-0.5 border border-yellow-400/40">
                        {index + 1}/{total}
                    </span>
                    <span className="font-black" style={{ fontSize: "clamp(0.95rem,3.5vw,1.2rem)" }}>
                        {kh ? "គូរផ្លូវរថយន្តតាមលំដាប់អាទិភាព" : "Draw each vehicle's path in priority order"}
                    </span>
                </div>
                <div className="text-[11px] font-bold text-zinc-400 mt-1">
                    {allDrawn
                        ? (kh ? "ល្អ! ចុច បញ្ជូន" : "Great! Tap Submit")
                        : (kh
                            ? `គូរផ្លូវរថយន្តលេខ ${nextNumber} (អ្នកដែលគួរទៅមុន)`
                            : `Draw path #${nextNumber} — the vehicle that should go next`)}
                </div>
            </div>

            {/* Junction canvas */}
            <div className="relative w-full mx-auto border-4 border-black"
                style={{ aspectRatio: "1 / 1", maxWidth: 440, boxShadow: "6px 6px 0 #000", touchAction: "none" }}>
                <svg
                    ref={svgRef}
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full"
                    style={{ touchAction: "none", background: "#3f9b4f" }}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                >
                    {/* roads */}
                    <rect x="36" y="0" width="28" height="100" fill="#3f3f46" />
                    <rect x="0" y="36" width="100" height="28" fill="#3f3f46" />
                    <line x1="50" y1="0" x2="50" y2="36" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="50" y1="64" x2="50" y2="100" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="50" x2="36" y2="50" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="64" y1="50" x2="100" y2="50" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                    <rect x="36" y="36" width="28" height="28" fill="#52525b" />

                    <defs>
                        <marker id="tc-arrow" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
                            <path d="M0,0 L5,3 L0,6 Z" fill="#000" />
                        </marker>
                    </defs>

                    {/* faint guide hints for undrawn vehicles (keeps it easy) */}
                    {vehicles.filter((v) => !order.includes(v.id)).map((v) => {
                        const e = entryPoint(v.approach, v.pos);
                        const x = exitPoint(v.approach, v.intent);
                        return (
                            <path key={`g-${v.id}`}
                                d={`M ${e.x} ${e.y} L 50 50 L ${x.x} ${x.y}`}
                                fill="none" stroke="#ffffff" strokeWidth="1.4"
                                strokeDasharray="2 3" opacity={0.35} strokeLinecap="round" />
                        );
                    })}

                    {/* committed paths */}
                    {order.map((id) => {
                        const v = vehicles.find((x) => x.id === id)!;
                        return (
                            <path key={`p-${id}`} d={toPathD(paths[id])}
                                fill="none" stroke={VEHICLE_COLOR[v.kind] ?? "#3b82f6"}
                                strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                                markerEnd="url(#tc-arrow)" opacity={0.95} />
                        );
                    })}

                    {/* live stroke */}
                    {drawingId && live.length > 1 && (
                        <path d={toPathD(live)} fill="none"
                            stroke={VEHICLE_COLOR[vehicles.find((v) => v.id === drawingId)!.kind] ?? "#3b82f6"}
                            strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
                    )}

                    {/* vehicles + order badges */}
                    {vehicles.map((v) => {
                        const drawn = order.includes(v.id);
                        const e = entryPoint(v.approach, v.pos);
                        const ord = order.indexOf(v.id) + 1;
                        return (
                            <g key={v.id}>
                                <CarSprite v={v} drawn={drawn} />
                                {drawn && (
                                    <g transform={`translate(${e.x + 6} ${e.y - 6})`}>
                                        <circle r="4.6" fill="#000" stroke="#facc15" strokeWidth="1.2" />
                                        <text x="0" y="2.4" textAnchor="middle" fontSize="6"
                                            fontWeight="700" fill="#facc15">{ord}</text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Controls */}
            <div className="shrink-0 w-full flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={undo}
                    disabled={!order.length}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white text-black font-black border-2 border-black disabled:opacity-40"
                    style={{ boxShadow: "3px 3px 0 #000", ...khFont }}
                >
                    <RotateCcw size={16} /> {kh ? "ត្រឡប់" : "Undo"}
                </button>
                <button
                    type="button"
                    onClick={submit}
                    disabled={!allDrawn}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-black border-2 border-black disabled:opacity-50"
                    style={{
                        background: allDrawn ? "#eab308" : "#e4e4e7",
                        color: "#000",
                        boxShadow: "3px 3px 0 #000",
                        ...khFont,
                    }}
                >
                    {allDrawn ? <Send size={16} /> : <MousePointerClick size={16} />}
                    {allDrawn ? (kh ? "បញ្ជូន" : "Submit") : (kh ? `គូរ ${order.length}/${vehicles.length}` : `Drawn ${order.length}/${vehicles.length}`)}
                </button>
            </div>
        </>
    );
}
