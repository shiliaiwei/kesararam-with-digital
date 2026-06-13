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

/** Mini junction that animates vehicles along their CORRECT paths, in order. */
function SceneReplay({ scene, replayKey }: { scene: TrafficSceneResult; replayKey: number }) {
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
                        <SceneReplay scene={s} replayKey={replayKey} />
                    </div>

                    <p className="text-sm font-bold text-zinc-800 mt-3" style={khFont}>
                        {kh ? s.explanationKm || s.explanationEn : s.explanationEn}
                    </p>
                </div>
            ))}
        </div>
    );
}
