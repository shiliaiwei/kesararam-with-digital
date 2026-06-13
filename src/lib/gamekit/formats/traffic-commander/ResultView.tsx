"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import type { Lang } from "@/lib/gamekit/types";
import type { TrafficCompletionResult, TrafficSceneResult } from "./types";
import { entryPoint, toPathD } from "./geometry";

const VEHICLE_COLOR: Record<string, string> = {
    car: "#3b82f6",
    truck: "#f97316",
    moto: "#22c55e",
    ambulance: "#ef4444",
    bus: "#a855f7",
};

const STEP_S = 1.1; // seconds between each vehicle starting
const MOVE_S = 1.5; // seconds for one vehicle to cross

function Student({ x, y, kh }: { x: number; y: number; kh: boolean }) {
    const khStyle = kh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), sans-serif" } : { fontFamily: "monospace" };
    return (
        <g transform={`translate(${x} ${y})`} style={{ pointerEvents: "none" }} aria-hidden>
            <ellipse cx={0} cy={3.4} rx={2.4} ry={1} fill="rgba(0,0,0,0.25)" />
            <rect x={-2.3} y={-0.6} width={1} height={3.4} rx={0.5} fill="#2563eb" />
            <rect x={1.3} y={-0.6} width={1} height={3.4} rx={0.5} fill="#2563eb" />
            <rect x={-1.9} y={-1} width={3.8} height={4} rx={1.4} fill="#e91e8c" stroke="#000" strokeWidth={0.3} />
            <rect x={-1.3} y={0.8} width={2.6} height={1.6} rx={0.4} fill="#fbbf24" stroke="#000" strokeWidth={0.3} />
            <circle cx={0} cy={-2.4} r={1.7} fill="#f1c27d" stroke="#000" strokeWidth={0.4} />
            <path d="M-1.5 -3.4 Q0 -4.8 1.5 -3.4" fill="none" stroke="#3b2a1a" strokeWidth={1} />
            <path d="M 0 -1.5 L 0 -4.5" stroke="#000" strokeWidth="0.4" strokeDasharray="1 1" />
            <g transform="translate(0, -7)">
                <rect x={-8} y={-2.2} width={16} height={4.4} fill="#fff" stroke="#000" strokeWidth="0.4" rx={0.8} />
                <text x={0} y={0.8} textAnchor="middle" fontSize="2.5" fontWeight="900" fill="#000" style={khStyle}>
                    {kh ? "សិស្ស" : "STUDENT"}
                </text>
            </g>
        </g>
    );
}

function TrafficLightSprite({ x, y, rotation }: { x: number; y: number; rotation: number }) {
    return (
        <g transform={`translate(${x} ${y}) rotate(${rotation})`} style={{ pointerEvents: "none" }} aria-hidden>
            <line x1={0} y1={0} x2={0} y2={6} stroke="#374151" strokeWidth="1" />
            <rect x={-1.5} y={-5} width={3} height={5} fill="#1f2937" stroke="#000" strokeWidth="0.4" rx={0.5} />
            <circle cx={0} cy={-4.1} r={0.7} fill="#ef4444" />
            <circle cx={0} cy={-2.5} r={0.7} fill="#facc15" />
            <circle cx={0} cy={-0.9} r={0.7} fill="#22c55e" />
        </g>
    );
}

function Landmarks({ kh }: { kh: boolean }) {
    const khStyle = kh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), sans-serif" } : { fontFamily: "monospace" };
    return (
        <g style={{ pointerEvents: "none" }} aria-hidden>
            {/* HOSPITAL (Top-Left) */}
            <rect x={5} y={5} width={26} height={24} fill="#000" rx={2} />
            <rect x={3} y={3} width={26} height={24} fill="#fff" stroke="#000" strokeWidth="0.8" rx={2} />
            <rect x={8} y={11} width={16} height={10} fill="#f1f5f9" stroke="#000" strokeWidth="0.5" />
            <rect x={12} y={7} width={8} height={4} fill="#f1f5f9" stroke="#000" strokeWidth="0.5" />
            <rect x={15.2} y={8} width={1.6} height={4} fill="#ef4444" />
            <rect x={14} y={9.2} width={4} height={1.6} fill="#ef4444" />
            <rect x={10} y={13} width={2.5} height={2} fill="#93c5fd" stroke="#000" strokeWidth="0.4" />
            <rect x={19.5} y={13} width={2.5} height={2} fill="#93c5fd" stroke="#000" strokeWidth="0.4" />
            <rect x={14.5} y={17} width={3} height={4} fill="#64748b" stroke="#000" strokeWidth="0.4" />
            <text x={16} y={24.5} textAnchor="middle" fontSize="2.8" fontWeight="900" fill="#000" style={khStyle}>
                {kh ? "មន្ទីរពេទ្យ" : "HOSPITAL"}
            </text>

            {/* SCHOOL (Top-Right) */}
            <rect x={71} y={5} width={26} height={24} fill="#000" rx={2} />
            <rect x={69} y={3} width={26} height={24} fill="#fff" stroke="#000" strokeWidth="0.8" rx={2} />
            <rect x={74} y={11} width={16} height={10} fill="#fef3c7" stroke="#000" strokeWidth="0.5" />
            <polygon points="72,11 82,6 92,11" fill="#f59e0b" stroke="#000" strokeWidth="0.5" />
            <circle cx={82} cy={14} r={2} fill="#fff" stroke="#000" strokeWidth="0.4" />
            <line x1={82} y1={14} x2={82} y2={13} stroke="#000" strokeWidth="0.3" />
            <line x1={82} y1={14} x2={83} y2={14} stroke="#000" strokeWidth="0.3" />
            <rect x={80.5} y={17} width={3} height={4} fill="#b45309" stroke="#000" strokeWidth="0.4" />
            <text x={82} y={24.5} textAnchor="middle" fontSize="2.8" fontWeight="900" fill="#000" style={khStyle}>
                {kh ? "សាលារៀន" : "SCHOOL"}
            </text>

            {/* MARKET (Bottom-Left) */}
            <rect x={5} y={74} width={26} height={24} fill="#000" rx={2} />
            <rect x={3} y={72} width={26} height={24} fill="#fff" stroke="#000" strokeWidth="0.8" rx={2} />
            <rect x={6} y={79} width={20} height={11} fill="#e0f2fe" stroke="#000" strokeWidth="0.5" />
            <path d="M 5,79 L 27,79 L 25,76 L 7,76 Z" fill="#ef4444" stroke="#000" strokeWidth="0.5" />
            <polygon points="9,79 12,79 11,76 8,76" fill="#fff" />
            <polygon points="15,79 18,79 17,76 14,76" fill="#fff" />
            <polygon points="21,79 24,79 23,76 20,76" fill="#fff" />
            <rect x={12} y={84} width={8} height={6} fill="#fff" stroke="#000" strokeWidth="0.4" />
            <text x={16} y={93.5} textAnchor="middle" fontSize="2.8" fontWeight="900" fill="#000" style={khStyle}>
                {kh ? "ផ្សារ" : "MARKET"}
            </text>

            {/* HOUSE (Bottom-Right) */}
            <rect x={71} y={74} width={26} height={24} fill="#000" rx={2} />
            <rect x={69} y={72} width={26} height={24} fill="#fff" stroke="#000" strokeWidth="0.8" rx={2} />
            <polygon points="72,80 82,74 92,80" fill="#f87171" stroke="#000" strokeWidth="0.5" />
            <rect x={75} y={80} width={14} height={10} fill="#fef08a" stroke="#000" strokeWidth="0.5" />
            <rect x={78} y={82} width={3} height={3} fill="#cbd5e1" stroke="#000" strokeWidth="0.4" />
            <rect x={84} y={84} width={3} height={6} fill="#b45309" stroke="#000" strokeWidth="0.4" />
            <text x={82} y={93.5} textAnchor="middle" fontSize="2.8" fontWeight="900" fill="#000" style={khStyle}>
                {kh ? "ផ្ទះ" : "HOUSE"}
            </text>
        </g>
    );
}

/** Mini junction that animates vehicles along their CORRECT paths, in order. */
function SceneReplay({ scene, replayKey, kh }: { scene: TrafficSceneResult; replayKey: number; kh: boolean }) {
    const total = scene.correctOrder.length * STEP_S + MOVE_S;
    return (
        <svg viewBox="0 0 100 100" className="w-full border-2 border-black"
            style={{ aspectRatio: "1 / 1", background: "#3f9b4f" }} key={replayKey}>
            <rect x="36" y="0" width="28" height="100" fill="#3f3f46" />
            <rect x="0" y="36" width="100" height="28" fill="#3f3f46" />
            <line x1="50" y1="0" x2="50" y2="36" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="64" x2="50" y2="100" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="36" y2="50" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="64" y1="50" x2="100" y2="50" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
            <rect x="36" y="36" width="28" height="28" fill="#52525b" />

            {/* Landmarks backdrop */}
            <Landmarks kh={kh} />

            {/* Student figure at bottom right */}
            <Student x={67} y={67} kh={kh} />

            {/* Traffic Lights if the intersection is controlled */}
            {scene.hasTrafficLight && (
                <>
                    <TrafficLightSprite x={31} y={35} rotation={0} />
                    <TrafficLightSprite x={65} y={31} rotation={90} />
                    <TrafficLightSprite x={69} y={65} rotation={180} />
                    <TrafficLightSprite x={35} y={69} rotation={270} />
                </>
            )}

            {/* faint correct routes */}
            {scene.vehicles.map((v) => (
                <path key={`r-${v.id}`} d={toPathD(scene.correctPaths[v.id] ?? [])}
                    fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.4} />
            ))}

            {/* animated discs in correct order */}
            {scene.correctOrder.map((id, i) => {
                const v = scene.vehicles.find((x) => x.id === id);
                if (!v) return null;
                const start = scene.correctPaths[id]?.[0] ?? entryPoint(v.approach, v.pos);
                const d = toPathD(scene.correctPaths[id] ?? []);
                return (
                    <g key={`a-${id}`} transform={`translate(${start.x} ${start.y})`}>
                        <animateMotion dur={`${MOVE_S}s`} begin={`${i * STEP_S}s`}
                            fill="freeze" path={d} rotate="auto" />
                        <circle r="5" fill={VEHICLE_COLOR[v.kind] ?? "#3b82f6"}
                            stroke="#000" strokeWidth="1.4" />
                        <text x="0" y="2.2" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">
                            {i + 1}
                        </text>
                    </g>
                );
            })}
            <title>{`Correct order replay (${total.toFixed(1)}s)`}</title>
        </svg>
    );
}

export function TrafficResultView({
    result,
    lang,
}: {
    result: TrafficCompletionResult;
    lang: Lang;
}) {
    const kh = lang === "kh";
    const khFont = kh
        ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" }
        : {};
    const [replayKey, setReplayKey] = useState(0);

    return (
        <div className="flex flex-col gap-4">
            {result.scenes.map((s, i) => (
                <div key={s.sceneId} className="border-2 border-black bg-white p-3"
                    style={{ boxShadow: "3px 3px 0 #000" }}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {s.isCorrect
                                ? <CheckCircle2 size={18} className="text-green-600" />
                                : <XCircle size={18} className="text-red-500" />}
                            <span className="font-black text-sm" style={khFont}>
                                {kh ? `ឆាក ${i + 1}` : `Scene ${i + 1}`}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setReplayKey((k) => k + 1)}
                            className="flex items-center gap-1 text-[11px] font-black border-2 border-black px-2 py-1 bg-yellow-400"
                            style={khFont}
                        >
                            <RotateCcw size={12} /> {kh ? "មើលឡើងវិញ" : "Replay"}
                        </button>
                    </div>

                    <div className="max-w-[260px] mx-auto">
                        <SceneReplay scene={s} replayKey={replayKey} kh={kh} />
                    </div>

                    <p className="text-sm font-bold text-zinc-800 mt-3" style={khFont}>
                        {kh ? s.explanationKm || s.explanationEn : s.explanationEn}
                    </p>
                </div>
            ))}
        </div>
    );
}
